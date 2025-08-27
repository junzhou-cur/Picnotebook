#!/bin/bash

echo "🚀 Setting up PicNotebook on EC2 (Minimal)..."
echo "=============================================="

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Step 1: Installing system dependencies...${NC}"

# Update system packages
sudo yum update -y

# Install Python 3, pip, Node.js, nginx, git
sudo yum install -y python3 python3-pip git nginx

# Install Node.js
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
fi

# Install PM2 for process management
sudo npm install -g pm2

echo -e "${GREEN}Step 2: Setting up Python environment...${NC}"

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install minimal Python dependencies
pip install --upgrade pip
pip install -r requirements-minimal.txt

echo -e "${GREEN}Step 3: Setting up database...${NC}"

# Create necessary directories
mkdir -p uploads projects logs instance

# Initialize database
export FLASK_APP=app.py
export FLASK_ENV=production

# Create database tables
python3 -c "
from app import create_app
from models import db
app = create_app('production')
with app.app_context():
    db.create_all()
    print('✅ Database initialized successfully!')
"

echo -e "${GREEN}Step 4: Setting up frontend...${NC}"

# Setup frontend
cd frontend
npm install
npm run build
cd ..

echo -e "${GREEN}Step 5: Configuring Nginx...${NC}"

# Create nginx configuration
sudo tee /etc/nginx/conf.d/picnotebook.conf > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 50M;

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
        alias /home/ec2-user/Picnotebook/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
NGINX_EOF

# Remove default nginx config
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo -e "${GREEN}Step 6: Creating PM2 configuration...${NC}"

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'PM2_EOF'
module.exports = {
  apps: [
    {
      name: 'picnotebook-backend',
      script: 'gunicorn',
      args: '--bind 0.0.0.0:5000 --workers 2 --timeout 120 "app:create_app()"',
      cwd: '/home/ec2-user/Picnotebook',
      interpreter: '/home/ec2-user/Picnotebook/venv/bin/python',
      env: {
        FLASK_ENV: 'production',
        FLASK_APP: 'app.py'
      }
    },
    {
      name: 'picnotebook-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/ec2-user/Picnotebook/frontend',
      env: {
        PORT: 3000,
        NODE_ENV: 'production'
      }
    }
  ]
};
PM2_EOF

echo -e "${GREEN}Step 7: Starting applications...${NC}"

# Stop any existing processes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Start applications
pm2 start ecosystem.config.js
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo "🌐 Your app is running at: http://3.150.3.60"
echo ""
echo "Commands:"
echo "  pm2 status    - Check app status"
echo "  pm2 logs      - View logs"
echo "  pm2 restart all - Restart apps"