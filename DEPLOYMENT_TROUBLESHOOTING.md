# AWS Elastic Beanstalk Deployment Troubleshooting Guide

## What Was Fixed

### 1. **Created Missing NodeCommand**
Your `.ebextensions/01_nodejs.config` was missing the command that tells EB how to start your Node.js application. 

**Fixed by adding:**
```yaml
aws:elasticbeanstalk:container:nodejs:
  NodeCommand: "cd /var/app/staging/server && node server.js"
```

### 2. **Removed Conflicting Build Commands**
File `.ebextensions/02_server.config` had duplicate build commands that could conflict with the primary build process.

**Simplified to:**
```yaml
commands:
  01_create_log_dir:
    command: "mkdir -p /var/log/nodejs && chown -R ec2-user:ec2-user /var/log/nodejs"
    ignoreErrors: true
```

### 3. **Enhanced Logging in Build Process**
Updated `.ebextensions/01_build.config` to capture detailed build logs for debugging.

## How to Redeploy

### Step 1: Commit Your Changes
```powershell
cd c:\Users\jonat\OneDrive\Desktop\Clipper2.0
git add -A
git commit -m "Fix EB deployment: Add NodeCommand and consolidate build config"
git push origin main
```

### Step 2: Trigger New Deployment
Your CodePipeline should automatically detect the push and start deployment, OR manually trigger in AWS console.

### Step 3: Monitor Deployment
```powershell
# Real-time logs from EB
eb logs --stream

# Alternative: Check specific log files
eb ssh
tail -f /tmp/build.log           # Frontend build output
tail -f /tmp/root-install.log    # Frontend deps installation
tail -f /tmp/server-install.log  # Server deps installation
tail -f /var/log/eb-engine.log   # EB engine logs
tail -f /var/log/nodejs/nodejs.log  # Node app logs
```

## Environment Variables Setup (CRITICAL)

Before the app can fully function in production, you need to set database environment variables on EB.

### Via AWS Console:
1. Go to **Elastic Beanstalk** → Your environment
2. Click **Configuration** → **Environment properties**
3. Add these environment variables:
   ```
   DB_HOST: (your RDS endpoint)
   DB_USER: admin
   DB_PASSWORD: (your RDS password)
   DB_NAME: clipper_db
   DB_PORT: 3306
   JWT_SECRET: your-secret-key-here
   NODE_ENV: production
   PORT: 8080
   ```

### Via EB CLI:
```bash
eb setenv DB_HOST=your-rds-endpoint DB_USER=admin DB_PASSWORD=yourpassword DB_NAME=clipper_db NODE_ENV=production JWT_SECRET=your-secret-key
```

## Container Command Execution Order (for reference)

When EB deploys, container_commands run in this order:

1. **00_install_root_deps** - Installs frontend + React dependencies
2. **01_install_server_deps** - Installs Express server dependencies  
3. **02_build_frontend** - Runs `npm run build` to create `/dist` folder
4. **03_verify_build** - Checks if `/dist` directory was created successfully
5. **04_install_server_production_deps** - Installs production-only dependencies

**Then the NodeCommand starts the server:**
```
node /var/app/staging/server/server.js
```

**Then nginx proxies requests** to the Node app running on port 8080.

## If Deployment Still Fails

### Scenario 1: Build Still Failing
```bash
# SSH into the instance
eb ssh

# Check the build log
cat /tmp/build.log

# Try building manually
cd /var/app/staging
npm install
npm run build
ls -la dist/  # Should show React build output
```

### Scenario 2: App Won't Start
```bash
# SSH into instance
eb ssh

# Check if dist exists
ls -la /var/app/staging/dist/

# Try starting server manually
cd /var/app/staging/server
node server.js
```

### Scenario 3: Port Connection Refused
This usually means Node.js isn't running or listening on port 8080. Check:
1. Is the server process running? `ps aux | grep node`
2. Is it listening on port 8080? `netstat -tlnp | grep 8080`
3. Check application logs: `/var/log/nodejs/nodejs.log`

## Key File Locations on EB Instance

```
/var/app/staging/          → Root app directory (from artifact)
/var/app/staging/dist/     → React build output
/var/app/staging/server/   → Express server
/tmp/build.log             → Frontend build output
/tmp/root-install.log      → Frontend npm install output
/tmp/server-install.log    → Server npm install output
/var/log/eb-engine.log     → EB deployment engine logs
/var/log/eb-activity.log   → EB activity logs
/var/log/nodejs/nodejs.log → Node.js application output
```

## Database Initialization

After your first successful deployment:

1. Connect to RDS MySQL database
2. Run [database/schema.sql](./database/schema.sql) to create tables
3. Create admin user:
   ```bash
   eb ssh
   cd /var/app/staging/server
   node scripts/createAdmin.js
   ```

## Verify Deployment Success

Once deployed:
```bash
# Test API endpoint
curl https://your-env.elasticbeanstalk.com/api/health

# Response should be:
# {"status":"OK","message":"Clipper API is running"}

# Test frontend (should return index.html)
curl https://your-env.elasticbeanstalk.com/

# Login with credentials created by createAdmin.js
```

## RDS Database Setup (One-Time)

If using Amazon RDS:

1. Create RDS MySQL 8.0 instance in same VPC as EB
2. Add security group rule allowing EB security group to access RDS port 3306
3. Get RDS endpoint (e.g., `clipper-db.c9akciq32.us-west-2.rds.amazonaws.com`)
4. Set environment variables (see section above)
5. Run schema.sql on RDS to create tables

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Command 01_build_frontend failed` | npm run build exited with error | Check /tmp/build.log for details |
| `connection refused (111)` | Node app not running on 8080 | Check if process is running and logs |
| `dist directory not found` | Build didn't complete | Check Vite configuration and logs |
| `MySQL connection failed` | Database variables not set | Set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME |
| `Cannot find module 'express'` | Dependencies not installed | Verify npm install ran successfully |

## Performance Tips

- Use `t3.small` instance type instead of `t3.micro` for faster builds
- Enable autoscaling to handle traffic spikes
- Use CloudFront CDN for static assets
- Monitor CloudWatch metrics for performance issues

---

**Last Updated:** After fixing NodeCommand and build configuration issues
**Next Action:** Commit changes and push to trigger new deployment
