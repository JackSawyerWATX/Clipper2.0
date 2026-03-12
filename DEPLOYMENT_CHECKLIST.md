# Deployment Checklist & Next Steps

## Pre-Deployment Checklist ✓

- [x] Fixed dependency installation order in `.ebextensions/01_build.config`
- [x] Added NodeCommand to `.ebextensions/01_nodejs.config` 
- [x] Set NODE_ENV correctly (development during build, production at runtime)
- [x] Added comprehensive logging to all commands
- [x] Added build verification step
- [x] Updated buildspec.yml with better error capture

## Deployment Steps

### Step 1: Commit Changes
```powershell
cd c:\Users\jonat\OneDrive\Desktop\Clipper2.0
git add -A
git commit -m "Fix: EB deployment - correct dependency installation order and add NodeCommand"
git push origin main
```

**What happens:** GitHub webhook triggers CodePipeline → CodeBuild → EB deployment

### Step 2: Monitor Deployment (Real-Time)
```bash
# Terminal 1: Watch deployment progress
eb logs --stream

# Terminal 2: Check environment status
eb status
```

### Step 3: Check Deployment Results
```bash
# After ~5-10 minutes, deployment should be complete
# Look for these indicators in logs:

# ✅ SUCCESS INDICATORS:
✓ "SUCCESS: dist created" in /tmp/build.log
✓ "🚀 Server running on http://localhost:8080" in /tmp/app.log  
✓ "Your environment is ready" in eb-engine.log
✓ No "connection refused" errors in nginx/error.log

# ❌ FAILURE INDICATORS:
✗ "FAILED: dist not found" in /tmp/build.log
✗ "Cannot find module" error
✗ "EACCES: permission denied"
✗ "connection refused" errors
```

### Step 4: If Deployment Succeeds
```bash
# Test the application
curl https://your-env.elasticbeanstalk.com/api/health

# Response should be:
# {"status":"OK","message":"Clipper API is running"}

# Test frontend
curl https://your-env.elasticbeanstalk.com/ | head -20
# Should return HTML with React app
```

### Step 5: If Deployment Fails
```bash
# SSH into instance
eb ssh

# Check build log for actual error
cat /tmp/build.log

# Check dependency installation
cat /tmp/root-deps.log
cat /tmp/server-deps.log

# Check app startup
cat /tmp/app.log

# Full cfn-init log
sudo cat /var/log/cfn-init.log
```

## Critical Environment Variables (MUST SET)

After successful deployment, set these on EB:

```bash
eb setenv \
  DB_HOST='your-rds-endpoint.rds.amazonaws.com' \
  DB_USER='admin' \
  DB_PASSWORD='your-secure-password' \
  DB_NAME='clipper_db' \
  DB_PORT='3306' \
  JWT_SECRET='your-random-jwt-secret' \
  NODE_ENV='production' \
  PORT='8080'
```

**Without these variables, the app will start but won't connect to the database.**

## Common Issues & Solutions

### Issue: "Connection refused" errors in nginx
```
Error: connect() failed (111: Connection refused) while connecting to upstream
```
**Cause:** Node.js app not running  
**Solution:**
1. Check `/tmp/app.log` for startup errors
2. Check `/tmp/build.log` for build errors
3. Verify NodeCommand was added to `/ebextensions/01_nodejs.config`
4. SSH and manually test: `node /var/app/staging/server/server.js`

### Issue: "dist directory not found"
```
Error: FAILED: dist not found (01_verify_build)
```
**Cause:** Vite build failed or output path wrong  
**Solution:**
1. Check `/tmp/build.log` for actual Vite error
2. Verify `vite.config.js` has React plugin: `plugins: [react()]`
3. Check `package.json` has correct build script: `"build": "vite build"`
4. Try increasing instance: `eb scale 2` (more memory for build)

### Issue: "Cannot find module" or "ENOENT" errors
```
Error: Cannot find module '@vitejs/plugin-react'
Error: ENOENT: no such file or directory
```
**Cause:** Dependencies not installed properly  
**Solution:**
1. Check `/tmp/root-deps.log` for npm install errors
2. Verify `package.json` and `package-lock.json` exist
3. SSH and manually test: `npm install && npm run build`
4. Check disk space: `eb ssh` → `df -h`

### Issue: Database connection failed at startup
```
Error: ❌ MySQL Database connection failed
```
**Cause:** Database environment variables not set  
**Solution:**
1. Create RDS MySQL instance in same VPC as EB
2. Get RDS endpoint (e.g., `clipper-db.c9akciq32.us-west-2.rds.amazonaws.com`)
3. Create database and tables: `mysql -h <RDS_ENDPOINT> -u admin -p<password> < database/schema.sql`
4. Set environment variables with correct RDS endpoint
5. Re-deploy: `git push origin main` (or `eb deploy`)

## Expected Timeline

| Step | Time | Action |
|------|------|--------|
| 0:00 | Now | Push to GitHub |
| 0:00-0:30 | 30 min | CodeBuild runs, creates artifact |
| 0:30-1:00 | 30 min | CodeDeploy sets up EB stack |
| 1:00-2:00 | 60 min | EB runs build commands, dependency installation |
| 2:00-2:30 | 30 min | App starts, health checks |
| **2:30** | **Done** | Application live |

(Times are estimates; actual times depend on instance size and network)

## Testing After Deployment

```bash
# Test health check
curl https://your-env.elasticbeanstalk.com/api/health

# Test admin login (create admin role first)
curl -X POST https://your-env.elasticbeanstalk.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Test protected route
curl https://your-env.elasticbeanstalk.com/api/customers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check if frontend loads
open https://your-env.elasticbeanstalk.com
# Or visit in browser and verify login page appears
```

## Scale & Performance (Optional)

For better build performance:
```bash
# Use larger instance during build
eb scale --instance-type t3.small

# Save money by scaling down after deployment
eb scale --instance-type t3.micro
```

## Rollback (If Needed)

```bash
# Revert to previous version
eb abort

# Or manually roll back deployment
eb deploy --version <previous-version-label>

# List previous deployments
eb appversion

# Check in AWS CodeDeploy console
```

## Summary

1. **Commit and push** the configuration fixes
2. **Wait for automatic deployment** (CodePipeline/CodeBuild/EB)
3. **Monitor with** `eb logs --stream` 
4. **Verify build** - Check `/tmp/build.log` for errors
5. **Verify app start** - Check `/tmp/app.log` for startup success
6. **Set environment variables** - Need DB connection info
7. **Test application** - Hit `/api/health` endpoint

**Key files changed:**
- `buildspec.yml` - Added better logging
- `.ebextensions/01_build.config` - Fixed dependency order, added NodeCommand migration
- `.ebextensions/01_nodejs.config` - Added NodeCommand to start server

---

**Status:** Ready for deployment ✓  
**Expected Result:** Application running on EB with nginx → Node.js → MySQL  
**If issues:** Check `/tmp/*.log` files for actual errors

Good luck! 🚀
