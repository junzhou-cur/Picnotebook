#!/usr/bin/env node

/**
 * PicNotebook Enhanced Configuration Watcher
 * Proactively detects and fixes ALL configuration mismatches:
 * - CORS issues
 * - URL mismatches (localhost vs 127.0.0.1)
 * - Port conflicts
 * - Environment variable inconsistencies
 * - API endpoint misconfigurations
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

class EnhancedConfigWatcher {
    constructor() {
        this.configFile = path.join(__dirname, 'local-dev-config.json');
        this.isFixing = false;
        this.checkInterval = 5000; // Check every 5 seconds
        this.logFile = path.join(__dirname, 'config-watcher.log');
        this.lastFixedIssues = new Set(); // Track what we've fixed to avoid loops
        
        // Standard configurations
        this.standardHost = '127.0.0.1'; // Standardize on 127.0.0.1
        this.frontendPort = 3002;
        this.apiPort = 5005;
        
        // Load current configuration
        this.loadConfig();
        
        // Start monitoring
        console.log('🔍 Enhanced Configuration Watcher Started');
        console.log(`📊 Frontend: http://${this.standardHost}:${this.frontendPort}`);
        console.log(`🔧 API: http://${this.standardHost}:${this.apiPort}`);
        console.log('✨ Auto-fixing: CORS, URLs, Ports, Environment variables');
        this.log('Enhanced Configuration Watcher started');
        
        // Initial comprehensive check
        setTimeout(() => this.performComprehensiveCheck(), 2000);
        
        // Start regular monitoring
        this.startWatching();
    }
    
    loadConfig() {
        try {
            if (!fs.existsSync(this.configFile)) {
                // Create default config if doesn't exist
                const defaultConfig = {
                    urls: {
                        frontend: `http://${this.standardHost}:${this.frontendPort}`,
                        api: `http://${this.standardHost}:${this.apiPort}`
                    },
                    ports: {
                        frontend: this.frontendPort,
                        api: this.apiPort
                    }
                };
                fs.writeFileSync(this.configFile, JSON.stringify(defaultConfig, null, 2));
            }
            
            const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
            this.expectedFrontendUrl = config.urls.frontend;
            this.expectedApiUrl = config.urls.api;
            this.frontendPort = config.ports.frontend;
            this.apiPort = config.ports.api;
        } catch (error) {
            console.error('❌ Failed to load config:', error.message);
            this.log(`ERROR: Failed to load config - ${error.message}`);
        }
    }
    
    log(message) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} - ${message}\n`;
        fs.appendFileSync(this.logFile, logEntry);
    }
    
    async performComprehensiveCheck() {
        console.log('🔎 Performing comprehensive configuration check...');
        const issues = [];
        
        // 1. Check CORS configuration in API
        const corsIssues = await this.checkCorsConfiguration();
        issues.push(...corsIssues);
        
        // 2. Check URL consistency (localhost vs 127.0.0.1)
        const urlIssues = await this.checkUrlConsistency();
        issues.push(...urlIssues);
        
        // 3. Check environment variables
        const envIssues = await this.checkEnvironmentVariables();
        issues.push(...envIssues);
        
        // 4. Check port availability and conflicts
        const portIssues = await this.checkPortConfiguration();
        issues.push(...portIssues);
        
        // 5. Check for hardcoded URLs in source code
        const hardcodedIssues = await this.scanForHardcodedUrls();
        issues.push(...hardcodedIssues);
        
        // Fix all detected issues
        if (issues.length > 0) {
            console.log(`⚠️  Found ${issues.length} configuration issue(s)`);
            await this.fixAllIssues(issues);
        } else {
            console.log('✅ All configurations are correct!');
        }
        
        return issues;
    }
    
    async checkCorsConfiguration() {
        const issues = [];
        const apiFile = path.join(__dirname, 'mock_experiment_api.py');
        
        if (fs.existsSync(apiFile)) {
            const content = fs.readFileSync(apiFile, 'utf8');
            const corsLine = content.match(/CORS\(app.*?\]/);
            
            if (corsLine) {
                const requiredOrigins = [
                    `http://localhost:${this.frontendPort}`,
                    `http://127.0.0.1:${this.frontendPort}`,
                    `http://0.0.0.0:${this.frontendPort}`
                ];
                
                const missingOrigins = [];
                for (const origin of requiredOrigins) {
                    if (!corsLine[0].includes(origin)) {
                        missingOrigins.push(origin);
                    }
                }
                
                if (missingOrigins.length > 0) {
                    issues.push({
                        type: 'cors_missing_origins',
                        file: apiFile,
                        missingOrigins,
                        description: `CORS missing origins: ${missingOrigins.join(', ')}`
                    });
                }
            }
        }
        
        return issues;
    }
    
    async checkUrlConsistency() {
        const issues = [];
        
        // Check .env.local file
        const envFile = path.join(__dirname, 'frontend', '.env.local');
        if (fs.existsSync(envFile)) {
            const content = fs.readFileSync(envFile, 'utf8');
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // Check if using localhost instead of 127.0.0.1
                if (line.includes('http://localhost:')) {
                    issues.push({
                        type: 'env_url_inconsistency',
                        file: envFile,
                        line: i + 1,
                        current: 'localhost',
                        expected: this.standardHost,
                        description: 'Environment variable using localhost instead of 127.0.0.1'
                    });
                }
                // Check for wrong port numbers
                if (line.includes('URL=')) {
                    const portMatch = line.match(/:(\d+)/);
                    if (portMatch) {
                        const port = parseInt(portMatch[1]);
                        if (port !== this.apiPort && port !== this.frontendPort) {
                            issues.push({
                                type: 'env_port_mismatch',
                                file: envFile,
                                line: i + 1,
                                current: port,
                                expected: this.apiPort,
                                description: `Wrong port in environment variable: ${port}`
                            });
                        }
                    }
                }
            }
        }
        
        return issues;
    }
    
    async checkEnvironmentVariables() {
        const issues = [];
        const envFile = path.join(__dirname, 'frontend', '.env.local');
        
        // Required environment variables
        const requiredVars = [
            'NEXT_PUBLIC_AUTH_SERVICE_URL',
            'NEXT_PUBLIC_API_URL',
            'NEXT_PUBLIC_CORE_SERVICE_URL',
            'NEXT_PUBLIC_LEGACY_API_URL',
            'NEXT_PUBLIC_CHART_API_URL'
        ];
        
        if (fs.existsSync(envFile)) {
            const content = fs.readFileSync(envFile, 'utf8');
            
            for (const varName of requiredVars) {
                const regex = new RegExp(`^${varName}=(.*)$`, 'm');
                const match = content.match(regex);
                
                if (!match) {
                    issues.push({
                        type: 'env_missing_variable',
                        file: envFile,
                        variable: varName,
                        description: `Missing required environment variable: ${varName}`
                    });
                } else {
                    const value = match[1];
                    const expectedValue = `http://${this.standardHost}:${this.apiPort}`;
                    
                    if (value !== expectedValue) {
                        issues.push({
                            type: 'env_wrong_value',
                            file: envFile,
                            variable: varName,
                            current: value,
                            expected: expectedValue,
                            description: `Wrong value for ${varName}`
                        });
                    }
                }
            }
        } else {
            issues.push({
                type: 'env_file_missing',
                file: envFile,
                description: 'Frontend .env.local file is missing'
            });
        }
        
        return issues;
    }
    
    async checkPortConfiguration() {
        const issues = [];
        
        // Check if ports are actually available
        const checkPort = (port) => {
            try {
                const result = execSync(`lsof -i :${port} 2>/dev/null | grep LISTEN`, { encoding: 'utf8' });
                return result.includes('LISTEN');
            } catch {
                return false;
            }
        };
        
        const frontendInUse = checkPort(this.frontendPort);
        const apiInUse = checkPort(this.apiPort);
        
        // Test actual connectivity
        try {
            const fetch = require('node-fetch');
            
            // Test API
            try {
                const apiResponse = await fetch(`http://${this.standardHost}:${this.apiPort}/health`, { timeout: 2000 });
                if (!apiResponse.ok) {
                    issues.push({
                        type: 'api_not_healthy',
                        description: `API not responding correctly on ${this.standardHost}:${this.apiPort}`
                    });
                }
            } catch (error) {
                if (apiInUse) {
                    issues.push({
                        type: 'api_connection_failed',
                        description: `API port ${this.apiPort} is in use but not responding`
                    });
                } else {
                    issues.push({
                        type: 'api_not_running',
                        description: `API is not running on port ${this.apiPort}`
                    });
                }
            }
            
            // Test Frontend
            try {
                const frontendResponse = await fetch(`http://${this.standardHost}:${this.frontendPort}`, { timeout: 2000 });
                if (!frontendResponse.ok && frontendResponse.status !== 404) {
                    issues.push({
                        type: 'frontend_not_healthy',
                        description: `Frontend not responding correctly on ${this.standardHost}:${this.frontendPort}`
                    });
                }
            } catch (error) {
                if (frontendInUse) {
                    issues.push({
                        type: 'frontend_connection_failed',
                        description: `Frontend port ${this.frontendPort} is in use but not responding`
                    });
                } else {
                    issues.push({
                        type: 'frontend_not_running',
                        description: `Frontend is not running on port ${this.frontendPort}`
                    });
                }
            }
        } catch (error) {
            console.log('⚠️  Error checking port configuration:', error.message);
        }
        
        return issues;
    }
    
    async scanForHardcodedUrls() {
        const issues = [];
        const glob = require('glob');
        
        try {
            // Find all TypeScript/TSX files
            const files = glob.sync('frontend/src/**/*.{ts,tsx,js,jsx}', { cwd: __dirname });
            
            for (const filePath of files) {
                try {
                    const fullPath = path.join(__dirname, filePath);
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const lines = content.split('\n');
                    
                    lines.forEach((line, index) => {
                        // Check for hardcoded localhost URLs (ignore placeholders and examples)
                        if (line.includes('http://localhost:') && 
                            !line.includes('process.env') && 
                            !line.includes('placeholder') && 
                            !line.includes('e.g.') && 
                            !line.includes('example')) {
                            issues.push({
                                type: 'hardcoded_url',
                                file: fullPath,
                                line: index + 1,
                                content: line.trim(),
                                description: 'Hardcoded localhost URL found'
                            });
                        }
                        
                        // Check for wrong ports (ignore placeholders and examples)
                        const portMatch = line.match(/http:\/\/[^:]+:(\d+)/);
                        if (portMatch && 
                            !line.includes('process.env') && 
                            !line.includes('placeholder') && 
                            !line.includes('e.g.') && 
                            !line.includes('example')) {
                            const port = parseInt(portMatch[1]);
                            if (port !== this.apiPort && port !== this.frontendPort && port !== 3000 && port !== 5001) {
                                issues.push({
                                    type: 'hardcoded_wrong_port',
                                    file: fullPath,
                                    line: index + 1,
                                    port,
                                    description: `Hardcoded URL with wrong port: ${port}`
                                });
                            }
                        }
                    });
                } catch (error) {
                    // Skip files that can't be read
                }
            }
        } catch (error) {
            console.log('⚠️  Error scanning for hardcoded URLs:', error.message);
        }
        
        return issues;
    }
    
    async fixAllIssues(issues) {
        if (this.isFixing) return;
        this.isFixing = true;
        
        console.log(`🔧 Fixing ${issues.length} configuration issue(s)...`);
        this.log(`FIXING: ${issues.length} issues detected`);
        
        for (const issue of issues) {
            // Skip if we've already fixed this exact issue recently
            const issueKey = JSON.stringify(issue);
            if (this.lastFixedIssues.has(issueKey)) {
                continue;
            }
            
            try {
                switch (issue.type) {
                    case 'cors_missing_origins':
                        await this.fixCorsIssue(issue);
                        break;
                    
                    case 'env_url_inconsistency':
                    case 'env_port_mismatch':
                    case 'env_wrong_value':
                        await this.fixEnvVariable(issue);
                        break;
                    
                    case 'env_missing_variable':
                        await this.addEnvVariable(issue);
                        break;
                    
                    case 'env_file_missing':
                        await this.createEnvFile(issue);
                        break;
                    
                    case 'hardcoded_url':
                    case 'hardcoded_wrong_port':
                        await this.fixHardcodedUrl(issue);
                        break;
                    
                    case 'api_not_running':
                        console.log('⚠️  API not running - please start it manually');
                        break;
                    
                    case 'frontend_not_running':
                        console.log('⚠️  Frontend not running - please start it manually');
                        break;
                    
                    default:
                        console.log(`⚠️  Unknown issue type: ${issue.type}`);
                }
                
                // Remember we fixed this issue
                this.lastFixedIssues.add(issueKey);
            } catch (error) {
                console.error(`❌ Failed to fix ${issue.type}:`, error.message);
                this.log(`ERROR: Failed to fix ${issue.type} - ${error.message}`);
            }
        }
        
        // Clear fixed issues cache after 30 seconds
        setTimeout(() => {
            this.lastFixedIssues.clear();
        }, 30000);
        
        console.log('✅ Configuration fixes applied!');
        this.log('SUCCESS: All configuration fixes applied');
        
        // Restart services if needed
        if (issues.some(i => i.type.startsWith('env_') || i.type === 'cors_missing_origins')) {
            console.log('🔄 Configuration changed - services may need restart');
            await this.triggerServiceReload();
        }
        
        this.isFixing = false;
    }
    
    async fixCorsIssue(issue) {
        console.log(`📝 Fixing CORS configuration in ${path.basename(issue.file)}`);
        
        let content = fs.readFileSync(issue.file, 'utf8');
        
        // Find and update CORS line
        const corsRegex = /CORS\(app,\s*origins=\[(.*?)\]\)/s;
        const match = content.match(corsRegex);
        
        if (match) {
            const currentOrigins = match[1];
            const origins = [
                `"http://localhost:3000"`,
                `"http://localhost:3002"`,
                `"http://127.0.0.1:3000"`,
                `"http://127.0.0.1:3002"`,
                `"http://0.0.0.0:3002"`,
                `"https://picnotebook.com"`
            ];
            
            const newCorsLine = `CORS(app, origins=[${origins.join(', ')}])`;
            content = content.replace(corsRegex, newCorsLine);
            
            fs.writeFileSync(issue.file, content);
            console.log('✅ CORS configuration updated');
            this.log(`FIXED: CORS configuration in ${issue.file}`);
        }
    }
    
    async fixEnvVariable(issue) {
        console.log(`📝 Fixing environment variable in .env.local`);
        
        let content = fs.readFileSync(issue.file, 'utf8');
        const lines = content.split('\n');
        
        if (issue.type === 'env_url_inconsistency') {
            // Replace localhost with 127.0.0.1
            lines[issue.line - 1] = lines[issue.line - 1].replace('http://localhost:', `http://${this.standardHost}:`);
        } else if (issue.type === 'env_port_mismatch' || issue.type === 'env_wrong_value') {
            // Fix the entire line with correct value
            const varName = issue.variable || lines[issue.line - 1].split('=')[0];
            const correctValue = issue.expected || `http://${this.standardHost}:${this.apiPort}`;
            
            if (issue.line) {
                lines[issue.line - 1] = `${varName}=${correctValue}`;
            } else {
                // Find and replace by variable name
                for (let i = 0; i < lines.length; i++) {
                    if (lines[i].startsWith(`${issue.variable}=`)) {
                        lines[i] = `${issue.variable}=${correctValue}`;
                        break;
                    }
                }
            }
        }
        
        fs.writeFileSync(issue.file, lines.join('\n'));
        console.log('✅ Environment variable fixed');
        this.log(`FIXED: Environment variable in ${issue.file}`);
    }
    
    async addEnvVariable(issue) {
        console.log(`📝 Adding missing environment variable: ${issue.variable}`);
        
        const content = fs.readFileSync(issue.file, 'utf8');
        const newLine = `${issue.variable}=http://${this.standardHost}:${this.apiPort}`;
        
        fs.writeFileSync(issue.file, content + '\n' + newLine);
        console.log('✅ Environment variable added');
        this.log(`ADDED: Environment variable ${issue.variable}`);
    }
    
    async createEnvFile(issue) {
        console.log('📝 Creating .env.local file');
        
        const envContent = `# Auto-generated by config-watcher
# DO NOT EDIT MANUALLY

NEXT_PUBLIC_AUTH_SERVICE_URL=http://${this.standardHost}:${this.apiPort}
NEXT_PUBLIC_API_URL=http://${this.standardHost}:${this.apiPort}
NEXT_PUBLIC_CORE_SERVICE_URL=http://${this.standardHost}:${this.apiPort}
NEXT_PUBLIC_LEGACY_API_URL=http://${this.standardHost}:${this.apiPort}
NEXT_PUBLIC_CHART_API_URL=http://${this.standardHost}:${this.apiPort}
`;
        
        fs.writeFileSync(issue.file, envContent);
        console.log('✅ .env.local file created');
        this.log('CREATED: .env.local file');
    }
    
    async fixHardcodedUrl(issue) {
        console.log(`📝 Fixing hardcoded URL in ${path.basename(issue.file)}`);
        
        let content = fs.readFileSync(issue.file, 'utf8');
        const lines = content.split('\n');
        
        if (issue.line && issue.line <= lines.length) {
            let line = lines[issue.line - 1];
            
            // Replace hardcoded URLs with environment variables
            line = line.replace(/['"`]http:\/\/localhost:\d+/g, (match) => {
                const quote = match[0];
                return `${quote}\${process.env.NEXT_PUBLIC_API_URL || 'http://${this.standardHost}:${this.apiPort}'`;
            });
            
            line = line.replace(/['"`]http:\/\/127\.0\.0\.1:\d+/g, (match) => {
                const quote = match[0];
                return `${quote}\${process.env.NEXT_PUBLIC_API_URL || 'http://${this.standardHost}:${this.apiPort}'`;
            });
            
            // If the line uses template literals, ensure proper syntax
            if (line.includes('${process.env')) {
                line = line.replace(/['"](\$\{[^}]+\})['"]/, '`$1`');
            }
            
            lines[issue.line - 1] = line;
            fs.writeFileSync(issue.file, lines.join('\n'));
            
            console.log('✅ Hardcoded URL fixed');
            this.log(`FIXED: Hardcoded URL in ${issue.file}:${issue.line}`);
        }
    }
    
    async triggerServiceReload() {
        // Touch a file that Next.js watches to trigger reload
        const triggerFile = path.join(__dirname, 'frontend', '.env.local');
        if (fs.existsSync(triggerFile)) {
            const stats = fs.statSync(triggerFile);
            const newTime = new Date();
            fs.utimesSync(triggerFile, newTime, newTime);
            console.log('🔄 Triggered frontend reload');
        }
    }
    
    async startWatching() {
        // Periodic comprehensive checks
        setInterval(async () => {
            try {
                await this.performComprehensiveCheck();
            } catch (error) {
                console.error('❌ Error during configuration check:', error.message);
                this.log(`ERROR: Configuration check failed - ${error.message}`);
            }
        }, this.checkInterval);
        
        // Watch for file changes
        const watchFiles = [
            this.configFile,
            path.join(__dirname, 'frontend', '.env.local'),
            path.join(__dirname, 'mock_experiment_api.py')
        ];
        
        watchFiles.forEach(file => {
            if (fs.existsSync(file)) {
                fs.watchFile(file, { interval: 1000 }, (curr, prev) => {
                    if (curr.mtime !== prev.mtime) {
                        console.log(`📁 File changed: ${path.basename(file)}`);
                        this.log(`File changed: ${file}`);
                        setTimeout(() => this.performComprehensiveCheck(), 1000);
                    }
                });
            }
        });
    }
}

// Install required dependencies
const installDependencies = () => {
    const dependencies = ['node-fetch@2.7.0', 'glob'];
    
    dependencies.forEach(dep => {
        try {
            const [name] = dep.split('@');
            require(name);
        } catch (error) {
            console.log(`📦 Installing ${dep}...`);
            try {
                execSync(`npm install ${dep}`, { stdio: 'pipe' });
                console.log(`✅ ${dep} installed`);
            } catch (installError) {
                console.error(`❌ Failed to install ${dep}`);
            }
        }
    });
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Enhanced Configuration Watcher stopped');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Enhanced Configuration Watcher terminated');
    process.exit(0);
});

// Start the watcher
if (require.main === module) {
    installDependencies();
    new EnhancedConfigWatcher();
}

module.exports = EnhancedConfigWatcher;