#!/bin/bash

# Clipper 2.0 Automated Deployment Script for Lightsail
# Run this AFTER following the manual setup steps in LIGHTSAIL_DEPLOYMENT.md

set -e

echo "🚀 Starting Clipper 2.0 Lightsail Deployment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Update System
echo -e "${BLUE}Step 1: Updating system packages...${NC}"
sudo yum update -y
sudo yum install -y git nano wget curl

# Step 2: Clone Repository (if not already present)
if [ ! -d "/home/ec2-user/Clipper2.0" ]; then
    echo -e "${BLUE}Step 2: Cloning repository...${NC}"
    cd /home/ec2-user
    git clone https://github.com/JackSawyerWATX/Clipper2.0.git
else
    echo -e "${BLUE}Step 2: Repository already exists, pulling latest...${NC}"
    cd /home/ec2-user/Clipper2.0
    git pull origin main
fi

# Step 3: Install Node.js (if not installed)
if ! command -v node &> /dev/null; then
    echo -e "${BLUE}Step 3: Installing Node.js...${NC}"
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
else
    echo -e "${GREEN}Step 3: Node.js already installed: $(node -v)${NC}"
fi

# Step 4: Install Backend Dependencies
echo -e "${BLUE}Step 4: Installing backend dependencies...${NC}"
cd /home/ec2-user/Clipper2.0/server
npm install

# Step 5: Build Frontend
echo -e "${BLUE}Step 5: Building frontend...${NC}"
cd /home/ec2-user/Clipper2.0
npm install
npm run build

# Step 6: Install PM2 (if not installed)
if ! command -v pm2 &> /dev/null; then
    echo -e "${BLUE}Step 6: Installing PM2...${NC}"
    sudo npm install -g pm2
else
    echo -e "${GREEN}Step 6: PM2 already installed${NC}"
fi

# Step 7: Stop existing PM2 services
echo -e "${BLUE}Step 7: Stopping existing services...${NC}"
pm2 delete all 2>/dev/null || true
sleep 2

# Step 8: Start services with PM2
echo -e "${BLUE}Step 8: Starting services with PM2...${NC}"
cd /home/ec2-user/Clipper2.0/server
pm2 start server.js --name "clipper-backend"

cd /home/ec2-user/Clipper2.0
pm2 start "npm run preview" --name "clipper-frontend"

# Step 9: Setup PM2 to start on boot
echo -e "${BLUE}Step 9: Setting up PM2 startup...${NC}"
pm2 startup -u ec2-user --hp /home/ec2-user > /dev/null
pm2 save

# Step 10: Install and configure Nginx
echo -e "${BLUE}Step 10: Configuring Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo yum install -y nginx
fi

sudo tee /etc/nginx/conf.d/clipper.conf > /dev/null <<EOF
upstream backend {
    server localhost:5000;
}

server {
    listen 80 default_server;
    server_name _;

    # Frontend
    location / {
        root /home/ec2-user/Clipper2.0/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Disable default Nginx config
sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.bak || true

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl reload nginx

# Step 11: Display Status
echo -e "${BLUE}Step 11: Checking service status...${NC}"
pm2 status

# Final status
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "${YELLOW}Services running:${NC}"
pm2 list
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Check AWS Lightsail console for your instance IP"
echo "2. Visit http://<your-instance-ip> in your browser"
echo "3. Login with admin/admin123"
echo "4. Configure firewall rules in Lightsail console to allow HTTP (80) traffic"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "pm2 logs clipper-backend"
echo "pm2 logs clipper-frontend"
echo ""
echo -e "${YELLOW}To manage services:${NC}"
echo "pm2 restart all          # Restart all services"
echo "pm2 stop all             # Stop all services"
echo "pm2 delete all           # Delete all services"
