#!/bin/bash

# PicNotebook EC2 Production Setup Script
# Run this script on your EC2 instance after cloning the repository

set -e

echo "🚀 Setting up PicNotebook on EC2..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${GREEN}Step 1: Installing system dependencies...${NC}"

# Update system packages
sudo yum update -y || sudo apt-get update -y

# Install Python 3, pip, Node.js, nginx, git, and other dependencies
if command -v yum &> /dev/null; then
    echo "Detected Amazon Linux/RHEL - using yum"
    sudo yum install -y python3 python3-pip git nginx
    
    # Install Node.js on Amazon Linux
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js..."
        curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    fi
else
    echo "Detected Ubuntu/Debian - using apt"
    sudo apt-get install -y python3 python3-pip python3-venv nodejs npm nginx git
fi

# Install PM2 for process management
sudo npm install -g pm2

echo -e "${GREEN}Step 2: Setting up Python environment...${NC}"

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Upgrade pip and install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

echo -e "${GREEN}Step 3: Setting up database...${NC}"

# Initialize database
export FLASK_APP=app.py
export FLASK_ENV=production

# Create necessary directories
mkdir -p uploads projects logs instance

# Initialize database if it doesn't exist
if [ ! -f "lab_notebook_production.db" ]; then
    echo "Initializing database..."
    flask db init || true
    flask db migrate -m "Initial migration" || true
    flask db upgrade || true
else
    echo "Database exists, running migrations..."
    flask db upgrade || true
fi

echo -e "${GREEN}Step 4: Setting up frontend...${NC}"

# Setup frontend
cd frontend

# Install Node.js dependencies
npm install

# Build production frontend
npm run build

# Go back to main directory
cd ..

echo -e "${GREEN}Step 5: Configuring Nginx...${NC}"

# Create nginx configuration
sudo tee /etc/nginx/conf.d/picnotebook.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;  # Accept all hostnames
    
    client_max_body_size 50M;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Auth endpoints
    location /auth/ {
        proxy_pass http://localhost:5000/auth/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static uploads
    location /uploads/ {
        alias $PWD/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Remove default nginx configurations that might conflict
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Test nginx configuration
sudo nginx -t

# Start and enable nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo -e "${GREEN}Step 6: Setting up PM2 ecosystem...${NC}"

# Create PM2 ecosystem configuration
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'picnotebook-backend',
      script: 'gunicorn',
      args: '--bind 0.0.0.0:5000 --workers 4 --timeout 120 "app:create_app()"',
      cwd: process.cwd(),
      interpreter: process.cwd() + '/venv/bin/python',
      env: {
        FLASK_ENV: 'production',
        FLASK_APP: 'app.py',
        DATABASE_URL: 'sqlite:///lab_notebook_production.db'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend.log'
    },
    {
      name: 'picnotebook-frontend',
      script: 'npm',
      args: 'start',
      cwd: process.cwd() + '/frontend',
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      },
      error_file: '../logs/frontend-error.log',
      out_file: '../logs/frontend-out.log',
      log_file: '../logs/frontend.log'
    }
  ]
};
EOF

echo -e "${GREEN}Step 7: Starting applications...${NC}"

# Stop any existing PM2 processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $(whoami) --hp $(eval echo ~$(whoami))

echo ""
echo -e "${GREEN}✅ PicNotebook setup complete!${NC}"
echo ""
echo "Your application is now running:"
echo "  🌐 Frontend: http://$(curl -s http://checkip.amazonaws.com || echo 'YOUR_EC2_IP')"
echo "  🔧 Backend API: http://$(curl -s http://checkip.amazonaws.com || echo 'YOUR_EC2_IP'):5000"
echo ""
echo "Useful commands:"
echo "  📊 Check status: pm2 status"
echo "  📝 View logs: pm2 logs"
echo "  🔄 Restart apps: pm2 restart all"
echo "  🛑 Stop apps: pm2 stop all"
echo ""
echo "To update the application:"
echo "  1. git pull origin main"
echo "  2. ./setup-ec2-production.sh"
echo ""
echo -e "${YELLOW}Note: The first user to register will automatically become an admin.${NC}"