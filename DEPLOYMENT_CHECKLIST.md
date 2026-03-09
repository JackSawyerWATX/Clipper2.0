# Clipper 2.0 Lightsail Deployment Checklist

## Pre-Deployment ✓
- [ ] AWS account created and verified
- [ ] Lightsail access enabled in your AWS region
- [ ] Application tested locally and working
- [ ] All credentials and secrets documented securely
- [ ] GitHub repository is up to date with latest code

## AWS Lightsail Setup
- [ ] Lightsail instance created (Node.js 18 blueprint, $3-5/month)
- [ ] Instance is running and accessible
- [ ] SSH key downloaded and secured
- [ ] Firewall rules configured (Port 80 for HTTP allowed)

## Instance Configuration
- [ ] Connected to instance via SSH
- [ ] System packages updated: `sudo yum update -y`
- [ ] Git installed: `git --version`
- [ ] Node.js installed: `node -v` (should be v18+)

## Code Deployment
- [ ] Repository cloned to `/home/ec2-user/Clipper2.0`
- [ ] Backend dependencies installed: `npm install` in `/server`
- [ ] Frontend dependencies installed: `npm install` in root
- [ ] Frontend built successfully: `npm run build`

## Database Setup (Choose One)

### Option A: Local MySQL
- [ ] MySQL installed: `sudo systemctl status mysqld`
- [ ] MySQL service running and enabled
- [ ] Database `clipper_db` created
- [ ] User `clipper_user` created with permissions
- [ ] Schema imported: `mysql ... < database/schema.sql`
- [ ] Database credentials tested

### Option B: Lightsail Managed Database
- [ ] Managed MySQL database created ($15/month)
- [ ] Database endpoint noted
- [ ] Database credentials saved
- [ ] Security group configured to allow instance access
- [ ] Database initialized with schema

## Environment Configuration
- [ ] `.env` file created in `/home/ec2-user/Clipper2.0`
- [ ] `DB_HOST` set correctly (localhost or managed DB endpoint)
- [ ] `DB_USER` and `DB_PASSWORD` match database setup
- [ ] `JWT_SECRET` generated with: `openssl rand -base64 32`
- [ ] `FRONTEND_URL` set to instance IP or domain
- [ ] File permissions secured: `chmod 600 .env`

## Process Management
- [ ] PM2 installed globally: `npm install -g pm2`
- [ ] Backend service running: `pm2 start server/server.js --name "clipper-backend"`
- [ ] Frontend preview running: `pm2 start "npm run preview" --name "clipper-frontend"`
- [ ] PM2 startup configured: `pm2 startup` and `pm2 save`
- [ ] Services survive instance restart

## Web Server (Nginx)
- [ ] Nginx installed: `nginx -v`
- [ ] Nginx config created at `/etc/nginx/conf.d/clipper.conf`
- [ ] Default config disabled/backed up
- [ ] Nginx started and enabled: `sudo systemctl start nginx && sudo systemctl enable nginx`
- [ ] Nginx proxy to backend working
- [ ] Static files served from `/home/ec2-user/Clipper2.0/dist`

## Security Configuration
- [ ] Firewall rule: HTTP (80) allowed from anywhere
- [ ] Firewall rule: HTTPS (443) if using SSL
- [ ] SSH (22) restricted to your IP (recommended)
- [ ] Database port (3306) only accessible from instance
- [ ] `.env` file not committed to git

## Testing & Verification
- [ ] Instance IP obtained from Lightsail console
- [ ] Frontend loads at `http://<instance-ip>`
- [ ] Login page displays correctly
- [ ] Can login with admin/admin123
- [ ] Dashboard loads without errors
- [ ] API calls working: check browser console for network errors
- [ ] Database queries working (customers, orders, inventory visible)

## Monitoring & Logs
- [ ] Backend logs viewable: `pm2 logs clipper-backend`
- [ ] Frontend logs viewable: `pm2 logs clipper-frontend`
- [ ] Nginx error log accessible: `sudo tail -f /var/log/nginx/error.log`
- [ ] MySQL errors checked: `sudo journalctl -u mysqld`

## DNS & Domain (Optional)
- [ ] Domain registered
- [ ] DNS records pointing to Lightsail static IP
- [ ] SSL certificate requested (Let's Encrypt)
- [ ] Nginx config updated for HTTPS

## Backup & Recovery
- [ ] Database backup script created
- [ ] Automated backups scheduled via cron
- [ ] Application code backed up to GitHub
- [ ] Lightsail snapshots configured (optional)

## Post-Launch
- [ ] Application monitoring tool installed (optional)
- [ ] Access logs enabled
- [ ] Error alerts configured
- [ ] Weekly backup verification scheduled
- [ ] Documentation updated with live URL

## Known Credentials (Change Immediately!)
⚠️ **SECURITY WARNING**: Change these on production deployment!

Default Admin:
- Username: `admin`
- Password: `admin123`

**Change these immediately by:**
1. Login as admin
2. Go to Admin panel
3. Update admin password
4. Use your own credentials

## Useful Commands

### Check Status
```bash
pm2 status
sudo systemctl status nginx
sudo systemctl status mysqld
```

### View Logs
```bash
pm2 logs
pm2 logs clipper-backend
pm2 logs clipper-frontend
sudo tail -f /var/log/nginx/error.log
```

### Restart Services
```bash
pm2 restart all
sudo systemctl restart nginx
sudo systemctl restart mysqld
```

### Update Application
```bash
cd /home/ec2-user/Clipper2.0
git pull origin main
npm install
npm run build
cd server && npm install
pm2 restart all
```

## Troubleshooting

### Backend returns 502 Bad Gateway
```bash
pm2 logs clipper-backend
pm2 restart clipper-backend
```

### Database connection error
```bash
mysql -u clipper_user -p -h localhost
# Test connection
```

### Frontend not loading
```bash
cd /home/ec2-user/Clipper2.0/dist
ls -la  # Verify files exist
pm2 logs clipper-frontend
```

### Out of memory
```bash
pm2 monit  # Check memory usage
# Consider upgrading instance size
```

## Support Resources
- [AWS Lightsail Docs](https://docs.aws.amazon.com/lightsail/)
- [Node.js PM2 Docs](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

**Deployment Date**: _______________
**Instance IP**: _______________
**Domain**: _______________
**Status**: _______________

---

✅ **All items checked? Congratulations! Your app is deployed on Lightsail!**
