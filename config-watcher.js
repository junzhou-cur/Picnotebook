#!/usr/bin/env node

/**
 * PicNotebook Configuration Watcher
 * Automatically detects and fixes port/URL configuration issues
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class ConfigWatcher {
    constructor() {
        this.configFile = path.join(__dirname, 'local-dev-config.json');
        this.isFixing = false;
        this.checkInterval = 5000; // Check every 5 seconds
        this.logFile = path.join(__dirname, 'config-watcher.log');
        
        // Load current configuration
        this.loadConfig();
        
        // Start monitoring
        console.log('🔍 Configuration Watcher Started');
        console.log(`📊 Frontend should be: ${this.expectedFrontendUrl}`);
        console.log(`🔧 API should be: ${this.expectedApiUrl}`);
        this.log('Configuration Watcher started');
        
        this.startWatching();
    }
    
    loadConfig() {
        try {
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
    
    async checkPortAvailability(port) {
        return new Promise((resolve) => {
            const { exec } = require('child_process');
            exec(`lsof -i :${port}`, (error, stdout) => {
                if (error) {
                    resolve(false); // Port is free
                } else {
                    resolve(stdout.includes('LISTEN')); // Port is in use
                }
            });
        });
    }
    
    async checkApiHealth(url) {
        try {
            const fetch = require('node-fetch');
            const response = await fetch(`${url}/health`, { timeout: 3000 });
            const data = await response.json();
            return response.ok && data.status === 'healthy';
        } catch (error) {
            return false;
        }
    }
    
    async checkFrontendHealth(url) {
        try {
            const fetch = require('node-fetch');
            const response = await fetch(url, { timeout: 3000 });
            return response.ok && response.headers.get('content-type')?.includes('text/html');
        } catch (error) {
            return false;
        }
    }
    
    async detectConfigurationIssues() {
        const issues = [];
        
        // Check if expected ports are actually being used
        const frontendPortInUse = await this.checkPortAvailability(this.frontendPort);
        const apiPortInUse = await this.checkPortAvailability(this.apiPort);
        
        // Check if services are healthy on expected URLs
        const apiHealthy = await this.checkApiHealth(this.expectedApiUrl);
        const frontendHealthy = await this.checkFrontendHealth(this.expectedFrontendUrl);
        
        // Detect common alternative ports
        const commonPorts = {
            frontend: [3000, 3001, 3002, 3003],
            api: [5001, 5003, 5004, 5005]
        };
        
        // Check if frontend is running on a different port
        if (!frontendHealthy && frontendPortInUse) {
            for (const port of commonPorts.frontend) {
                if (port !== this.frontendPort) {
                    const testUrl = `http://localhost:${port}`;
                    const healthy = await this.checkFrontendHealth(testUrl);
                    if (healthy) {
                        issues.push({
                            type: 'frontend_port_mismatch',
                            expected: this.frontendPort,
                            actual: port,
                            expectedUrl: this.expectedFrontendUrl,
                            actualUrl: testUrl
                        });
                        break;
                    }
                }
            }
        }
        
        // Check if API is running on a different port
        if (!apiHealthy && apiPortInUse) {
            for (const port of commonPorts.api) {
                if (port !== this.apiPort) {
                    const testUrl = `http://localhost:${port}`;
                    const healthy = await this.checkApiHealth(testUrl);
                    if (healthy) {
                        issues.push({
                            type: 'api_port_mismatch',
                            expected: this.apiPort,
                            actual: port,
                            expectedUrl: this.expectedApiUrl,
                            actualUrl: testUrl
                        });
                        break;
                    }
                }
            }
        }
        
        return issues;
    }
    
    async scanForHardcodedUrls() {
        const hardcodedUrls = [];
        const glob = require('glob');
        
        try {
            // Find all TypeScript/TSX files using Node.js glob (handles spaces properly)
            const files = glob.sync('frontend/src/**/*.{ts,tsx}', { cwd: __dirname });
            
            for (const filePath of files) {
                try {
                    const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
                    const lines = content.split('\n');
                    
                    lines.forEach((line, index) => {
                        // Check if line has localhost URLs but doesn't use environment variables
                        const hasLocalhost = /localhost:\d+/.test(line);
                        const hasProcessEnv = /process\.env/.test(line);
                        const hasGetApiBaseUrl = /getApiBaseUrl/.test(line);
                        
                        if (hasLocalhost && !hasProcessEnv && !hasGetApiBaseUrl) {
                            const urlMatch = line.match(/http:\/\/localhost:\d+/);
                            if (urlMatch) {
                                hardcodedUrls.push({
                                    file: filePath,
                                    line: index + 1,
                                    url: urlMatch[0],
                                    content: line.trim()
                                });
                            }
                        }
                    });
                } catch (fileError) {
                    console.log(`⚠️  Could not read file ${filePath}: ${fileError.message}`);
                }
            }
        } catch (error) {
            console.log(`⚠️  Error scanning for hardcoded URLs: ${error.message}`);
        }
        
        return hardcodedUrls;
    }

    async fixHardcodedUrls(hardcodedUrls) {
        if (hardcodedUrls.length === 0) return;
        
        console.log(`🔍 Found ${hardcodedUrls.length} hardcoded URL(s), fixing directly...`);
        this.log(`SCANNING: Found ${hardcodedUrls.length} hardcoded URLs`);
        
        let fixedCount = 0;
        
        // Group URLs by file for efficiency
        const fileGroups = {};
        for (const urlIssue of hardcodedUrls) {
            if (!fileGroups[urlIssue.file]) {
                fileGroups[urlIssue.file] = [];
            }
            fileGroups[urlIssue.file].push(urlIssue);
        }
        
        for (const [filePath, urls] of Object.entries(fileGroups)) {
            try {
                console.log(`📝 Fixing ${urls.length} URL(s) in: ${filePath}`);
                
                // Read the file
                let content = fs.readFileSync(filePath, 'utf8');
                let modified = false;
                
                // Apply comprehensive fixes using regex patterns
                const originalContent = content;
                
                // Fix single-quoted URLs with paths: 'http://localhost:PORT/path' -> `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:PORT'}/path`
                content = content.replace(/'http:\/\/localhost:(\d+)([^']*?)'/g, (match, port, path) => {
                    return `\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:${port}'}${path}\``;
                });
                
                // Fix double-quoted URLs with paths: "http://localhost:PORT/path" -> `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:PORT"}/path`
                content = content.replace(/"http:\/\/localhost:(\d+)([^"]*?)"/g, (match, port, path) => {
                    return `\`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:${port}"}${path}\``;
                });
                
                // Fix template literal URLs: `http://localhost:PORT/path` -> `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:PORT'}/path`
                content = content.replace(/`http:\/\/localhost:(\d+)([^`]*?)`/g, (match, port, path) => {
                    return `\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:${port}'}${path}\``;
                });
                
                if (content !== originalContent) {
                    modified = true;
                }
                
                if (modified) {
                    // Create backup
                    const backupPath = `${filePath}.backup.${Date.now()}`;
                    fs.writeFileSync(backupPath, fs.readFileSync(filePath));
                    
                    // Write fixed content
                    fs.writeFileSync(filePath, content);
                    console.log(`✅ Fixed: ${filePath}`);
                    this.log(`FIXED: ${filePath}`);
                    fixedCount++;
                }
            } catch (error) {
                console.log(`❌ Error fixing ${filePath}: ${error.message}`);
                this.log(`ERROR: Failed to fix ${filePath} - ${error.message}`);
            }
        }
        
        if (fixedCount > 0) {
            console.log(`✅ Successfully fixed ${fixedCount} file(s)!`);
            this.log(`SUCCESS: Fixed ${fixedCount} files with hardcoded URLs`);
            
            // Check if there are still remaining hardcoded URLs
            setTimeout(async () => {
                const remainingUrls = await this.scanForHardcodedUrls();
                if (remainingUrls.length === 0) {
                    console.log(`🎯 All hardcoded URLs fixed permanently - scanning disabled`);
                    this.hardcodedUrlsFixed = true;
                    this.log(`COMPLETE: All hardcoded URLs have been fixed permanently`);
                } else {
                    console.log(`🔄 ${remainingUrls.length} hardcoded URLs still remain - will continue scanning`);
                    this.log(`REMAINING: ${remainingUrls.length} hardcoded URLs still need fixing`);
                }
            }, 2000); // Wait 2 seconds for file system to update
        } else {
            console.log(`⚠️  No files were modified`);
            this.log(`WARNING: No hardcoded URLs were actually fixed`);
        }
    }

    async fixConfigurationIssues(issues) {
        if (this.isFixing || issues.length === 0) return;
        
        this.isFixing = true;
        console.log(`🔧 Found ${issues.length} configuration issue(s), fixing...`);
        
        for (const issue of issues) {
            console.log(`📝 Fixing ${issue.type}: ${issue.expectedUrl} → ${issue.actualUrl}`);
            this.log(`FIXING: ${issue.type} - Expected ${issue.expectedUrl}, found ${issue.actualUrl}`);
            
            // Update the main config file
            const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
            
            if (issue.type === 'frontend_port_mismatch') {
                config.ports.frontend = issue.actual;
                config.urls.frontend = issue.actualUrl;
            } else if (issue.type === 'api_port_mismatch') {
                config.ports.api = issue.actual;
                config.urls.api = issue.actualUrl;
            }
            
            // Save updated config
            fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
            console.log(`✅ Updated ${this.configFile}`);
            
            // Run the update script to sync all files
            console.log('🔄 Running update-config.sh to sync all files...');
            const updateProcess = spawn('./update-config.sh', [], {
                stdio: 'pipe',
                shell: true
            });
            
            updateProcess.stdout.on('data', (data) => {
                console.log(`📄 ${data.toString().trim()}`);
            });
            
            updateProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Configuration automatically updated!');
                    this.log(`SUCCESS: Configuration updated automatically`);
                } else {
                    console.log('❌ Failed to run update script');
                    this.log(`ERROR: Update script failed with code ${code}`);
                }
            });
        }
        
        // Reload the new configuration
        this.loadConfig();
        
        setTimeout(() => {
            this.isFixing = false;
        }, 10000); // Wait 10 seconds before allowing another fix
    }
    
    async startWatching() {
        const check = async () => {
            try {
                const issues = await this.detectConfigurationIssues();
                
                if (issues.length > 0) {
                    console.log(`⚠️  Detected configuration issues:`);
                    issues.forEach(issue => {
                        console.log(`   - ${issue.type}: Expected ${issue.expectedUrl}, but service is on ${issue.actualUrl}`);
                    });
                    
                    await this.fixConfigurationIssues(issues);
                }
                
                // Scan for hardcoded URLs every 30 seconds (every 6th check) - but only if not already fixed
                if (!this.checkCount) this.checkCount = 0;
                this.checkCount++;
                
                if (this.checkCount % 6 === 0 && !this.hardcodedUrlsFixed) {
                    const hardcodedUrls = await this.scanForHardcodedUrls();
                    if (hardcodedUrls.length > 0) {
                        await this.fixHardcodedUrls(hardcodedUrls);
                    }
                }
            } catch (error) {
                console.error('❌ Error during configuration check:', error.message);
                this.log(`ERROR: Configuration check failed - ${error.message}`);
            }
        };
        
        // Initial check
        setTimeout(check, 2000); // Wait 2 seconds for services to start
        
        // Periodic checks
        setInterval(check, this.checkInterval);
        
        // File watcher for config changes
        fs.watchFile(this.configFile, (curr, prev) => {
            console.log('📁 Configuration file changed, reloading...');
            this.loadConfig();
            this.log('Configuration file changed and reloaded');
        });
    }
}

// Install node-fetch if not available
const installFetch = () => {
    try {
        require('node-fetch');
    } catch (error) {
        console.log('📦 Installing node-fetch...');
        const { execSync } = require('child_process');
        execSync('npm install node-fetch@2.7.0', { stdio: 'pipe' });
        console.log('✅ node-fetch installed');
    }
};

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Configuration Watcher stopped');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Configuration Watcher terminated');
    process.exit(0);
});

// Start the watcher
if (require.main === module) {
    installFetch();
    new ConfigWatcher();
}

module.exports = ConfigWatcher;