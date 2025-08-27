#!/bin/bash

# PicNotebook Configuration Update Script
# This script reads local-dev-config.json and updates all configuration files

CONFIG_FILE="local-dev-config.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 PicNotebook Configuration Updater"
echo "===================================="

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Read configuration using Python (works on all systems)
read_config() {
    python3 -c "
import json
with open('$CONFIG_FILE', 'r') as f:
    config = json.load(f)
    
# Extract values
frontend_port = config['ports']['frontend']
api_port = config['ports']['api']
frontend_url = config['urls']['frontend']
api_url = config['urls']['api']

print(f'FRONTEND_PORT={frontend_port}')
print(f'API_PORT={api_port}')
print(f'FRONTEND_URL={frontend_url}')
print(f'API_URL={api_url}')
"
}

# Get config values
eval $(read_config)

echo "📖 Reading configuration:"
echo "   Frontend: $FRONTEND_URL"
echo "   API: $API_URL"
echo ""

# Update frontend .env.local
echo "📝 Updating frontend/.env.local..."
cat > frontend/.env.local << EOF
# Auto-generated from local-dev-config.json
# DO NOT EDIT MANUALLY - Use update-config.sh instead

NEXT_PUBLIC_AUTH_SERVICE_URL=$API_URL
NEXT_PUBLIC_API_URL=$API_URL
NEXT_PUBLIC_CORE_SERVICE_URL=$API_URL
NEXT_PUBLIC_LEGACY_API_URL=$API_URL
NEXT_PUBLIC_CHART_API_URL=$API_URL
EOF

# Update frontend package.json
echo "📝 Updating frontend/package.json..."
python3 -c "
import json
import re

# Read package.json
with open('frontend/package.json', 'r') as f:
    data = json.load(f)

# Update dev script
data['scripts']['dev'] = f'next dev -p $FRONTEND_PORT -H 0.0.0.0'

# Write back
with open('frontend/package.json', 'w') as f:
    json.dump(data, f, indent=2)
"

# Update start script
echo "📝 Updating start_local_development.sh..."
sed -i.bak "s/Starting Frontend on.*/Starting Frontend on $FRONTEND_URL/" start_local_development.sh
sed -i.bak "s/Starting Mock Experiment API on.*/Starting Mock Experiment API on $API_URL/" start_local_development.sh
sed -i.bak "s/Frontend: http.*/Frontend: $FRONTEND_URL/" start_local_development.sh
sed -i.bak "s/API: http.*/API: $API_URL/" start_local_development.sh
sed -i.bak "s/API Health: http.*/API Health: $API_URL/health/" start_local_development.sh
sed -i.bak "s/Review Page: http.*/Review Page: $FRONTEND_URL/review/" start_local_development.sh

# Update mock API port (in Python file)
echo "📝 Updating mock_experiment_api.py..."
python3 -c "
import re

# Read the Python file
with open('mock_experiment_api.py', 'r') as f:
    content = f.read()

# Update the port in app.run()
content = re.sub(
    r'app\.run\([^)]*\)', 
    f'app.run(host=\"0.0.0.0\", port=$API_PORT, debug=True)',
    content
)

# Write back
with open('mock_experiment_api.py', 'w') as f:
    f.write(content)
"

# Fix hardcoded URLs in frontend components
echo "📝 Fixing hardcoded URLs in frontend components..."
find frontend/src -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v .bak | while read file; do
    if [ -f "$file" ]; then
        # Replace hardcoded localhost:5001, 5003, 5004 with API_URL
        sed -i.tmp "s|http://localhost:500[1-4]|$API_URL|g" "$file"
        # Remove temporary files
        rm -f "$file.tmp"
    fi
done

# Clean up backup files
rm -f start_local_development.sh.bak

echo ""
echo "✅ Configuration updated successfully!"
echo "📋 Summary:"
echo "   Frontend will run on: $FRONTEND_URL"
echo "   API will run on: $API_URL"
echo ""
echo "🚀 To apply changes, restart the development server:"
echo "   ./start_local_development.sh"
echo ""
echo "💡 To change ports in the future:"
echo "   1. Edit local-dev-config.json"
echo "   2. Run ./update-config.sh"
echo "   3. Restart the development server"