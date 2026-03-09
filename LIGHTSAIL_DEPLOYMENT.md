# AWS Lightsail Deployment Guide for Clipper 2.0

## Overview
This guide walks you through deploying Clipper 2.0 to AWS Lightsail (~$15-25/month).

## Prerequisites
- AWS Account with Lightsail access
- Application code ready
- Git repository (optional but recommended)

## Step 1: Create Lightsail Instance

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com)
2. Click **Create instance**
3. Choose:
   - **Location**: Your region
   - **Platform**: Linux
   - **Blueprint**: Node.js 18 (or latest)
   - **Instance plan**: $3-5/month (t2.nano or t3.nano)
   - **Instance name**: `clipper-app`
4. Click **Create instance**
5. Wait for instance to start (2-3 minutes)

## Step 2: Add Database to Instance

### Option A: Use Lightsail Managed Database (Recommended)
1. In Lightsail console, go to **Databases**
2. Click **Create database**
3. Choose:
   - **Engine**: MySQL 8.0
   - **Instance plan**: $15/month (smallest)
   - **Database name**: `clipper_db`
   - **Master username**: `admin`
   - **Master password**: (generate strong password)
4. Note the **Endpoint** (you'll need this)

### Option B: Use MySQL on Same Instance (Saves $15/month)
SSH into your instance and install MySQL locally (see Step 4 below)

## Step 3: Connect to Your Instance

1. In Lightsail console, click your instance name
2. Click **Connect using SSH** (or use your SSH client)
3. Or download the SSH key and use:
   ```bash
   ssh -i /path/to/key.pem ec2-user@your-instance-ip
   ```

## Step 4: Setup Your Instance

### 4.1 Update System
```bash
sudo yum update -y
sudo yum install -y git nano
```

### 4.2 Clone Your Repository
```bash
cd /home/ec2-user
git clone https://github.com/JackSawyerWATX/Clipper2.0.git
cd Clipper2.0
```

### 4.3 Install Node.js Dependencies
```bash
cd /home/ec2-user/Clipper2.0/server
npm install
```

### 4.4 Setup MySQL (if using local DB)
```bash
sudo yum install -y mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# Create database
mysql -u root -p << EOF
CREATE DATABASE clipper_db;
CREATE USER 'clipper_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON clipper_db.* TO 'clipper_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF

# Import schema
mysql -u clipper_user -p clipper_db < /home/ec2-user/Clipper2.0/database/schema.sql
```

## Step 5: Configure Environment Variables

```bash
cat > /home/ec2-user/Clipper2.0/.env << EOF
# Database Configuration
DB_HOST=localhost          # Or Lightsail managed DB endpoint if using that
DB_USER=clipper_user       # Or 'admin' if using managed DB
DB_PASSWORD=your_password
DB_NAME=clipper_db
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=24h

# Frontend URL
FRONTEND_URL=http://your-instance-ip:3000
EOF
```

## Step 6: Build Frontend

```bash
cd /home/ec2-user/Clipper2.0
npm install
npm run build
```

## Step 7: Setup PM2 (Process Manager)

```bash
cd /home/ec2-user/Clipper2.0/server
npm install -g pm2

# Start backend with PM2
pm2 start server.js --name "clipper-backend"

# Start frontend static server
pm2 start "npm run preview" --name "clipper-frontend" --cwd /home/ec2-user/Clipper2.0

# Make PM2 start on boot
pm2 startup
pm2 save
```

## Step 8: Setup Nginx Reverse Proxy

```bash
sudo yum install -y nginx

# Create Nginx config
sudo cat > /etc/nginx/conf.d/clipper.conf << 'EOF'
upstream backend {
    server localhost:5000;
}

server {
    listen 80 default_server;
    server_name _;

    # Frontend
    location / {
        root /home/ec2-user/Clipper2.0/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Step 9: Configure Firewall

In Lightsail console:
1. Click your instance
2. Go to **Networking**
3. Add **Inbound traffic rule**:
   - Protocol: HTTP (port 80)
   - Source: Anywhere (0.0.0.0/0)
4. Add HTTPS if you have SSL certificate:
   - Protocol: HTTPS (port 443)
   - Source: Anywhere

## Step 10: Setup SSL Certificate (Free with Let's Encrypt)

```bash
sudo yum install -y certbot python3-certbot-nginx

# Get certificate (replace with your domain)
sudo certbot certonly --nginx -d yourdomain.com

# Auto-renew
sudo systemctl enable certbot-renew.service
sudo systemctl start certbot-renew.service
```

## Step 11: Verify Deployment

1. Get your instance IP from Lightsail console
2. Visit `http://your-instance-ip` in browser
3. Login with credentials from AUTH_README.md:
   - Username: `admin`
   - Password: `admin123`

## Monitoring & Maintenance

### Check Service Status
```bash
pm2 status          # Check running processes
pm2 logs clipper-*  # View logs
pm2 restart all     # Restart all services
```

### View MySQL
```bash
mysql -u clipper_user -p -e "SELECT * FROM users;"
```

### Update Application
```bash
cd /home/ec2-user/Clipper2.0
git pull origin main
npm install
npm run build
pm2 restart clipper-backend
pm2 restart clipper-frontend
```

## Cost Breakdown

| Component | Cost/Month |
|-----------|-----------|
| Lightsail Instance (3GB RAM) | $3-5 |
| Lightsail Managed DB (optional) | $15 |
| Data transfer | Included |
| **Total (with local DB)** | **~$3-5** |
| **Total (with managed DB)** | **~$18-20** |

## Troubleshooting

### Can't connect to database
```bash
# Check MySQL status
sudo systemctl status mysqld

# Verify credentials
mysql -u clipper_user -p -h localhost
```

### Backend not responding
```bash
# Check PM2
pm2 status
pm2 logs clipper-backend

# Check port 5000
sudo netstat -tlnp | grep 5000
```

### Website shows 503 error
```bash
# Check Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Slow performance
- Upgrade to larger instance size ($20-40/month)
- Enable CloudFront CDN for static assets
- Optimize database queries

## Next Steps

1. Configure automated backups
2. Setup monitoring/alerts
3. Configure custom domain
4. Setup CI/CD pipeline to auto-deploy on git push
5. Add SSL certificate for HTTPS
6. Setup database backups

## Support

For AWS Lightsail help:
- [Lightsail Documentation](https://docs.aws.amazon.com/lightsail/)
- [Lightsail Pricing](https://aws.amazon.com/lightsail/pricing/)
