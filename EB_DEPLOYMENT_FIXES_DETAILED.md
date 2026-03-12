# Critical EB Deployment Fixes Applied

## Summary of Issues & Solutions

### Issue 1: Dependency Installation Happening in Wrong Order ❌ → ✅
**Problem:** Container commands ran `npm install --production` BEFORE building the frontend. This removed dev dependencies that Vite needed for the build.

**Solution:** 
- Moved dependency installation to `commands:` section (runs first)
- Install ALL dependencies (including dev) before any builds
- Install production-only deps AFTER the build completes
- Build now has all the dependencies it needs

### Issue 2: NODE_ENV Set to "production" Too Early ❌ → ✅
**Problem:** Setting `NODE_ENV: production` during build prevents npm from installing dev dependencies.

**Solution:**
- During `commands:` and `container_commands`: `NODE_ENV: development`
- Switch to `NODE_ENV: production` in `aws:elasticbeanstalk:container:nodejs` for final app runtime
- Allows Vite and build tools to work correctly

### Issue 3: Missing NodeCommand (App Won't Start) ❌ → ✅
**Problem:** EB didn't know how to start your Node.js application, resulting in nginx "connection refused" errors.

**Solution:** Added to `.ebextensions/01_nodejs.config`:
```yaml
aws:elasticbeanstalk:container:nodejs:
  NodeCommand: "cd /var/app/staging/server && node server.js 2>&1 | tee /tmp/app.log"
```

### Issue 4: No Build Logging ❌ → ✅
**Problem:** When build failed, no error output was captured. `cfn-init.log` wasn't accessible.

**Solution:** All commands now use `2>&1 | tee /tmp/*.log`:
- `/tmp/root-deps.log` - Frontend dependencies installation
- `/tmp/server-deps.log` - Server dependencies installation  
- `/tmp/build.log` - Frontend build output
- `/tmp/production-deps.log` - Production-only deps installation
- `/tmp/app.log` - Application startup output

## Execution Flow (New Order)

### Phase 1: CodeBuild (AWS CodeBuild)
```bash
npm install                    # All deps including dev
cd server && npm install       # Server deps
npm run build                  # Vite builds React to /dist
```
Result: Artifact uploaded to S3 with `/dist` directory

### Phase 2: EB Initialization (commands:)
```bash
npm install                    # Re-extract all dependencies from artifact
npm install (server/)          # Re-extract server dependencies
```
These run in the EB instance BEFORE container starts

### Phase 3: EB Container Commands (container_commands:)
Sequential execution inside container:
```bash
npm run build                  # Final frontend build
verify dist exists             # Check /dist was created
npm install --production       # Strip dev dependencies for production
```

### Phase 4: EB Starts Application (NodeCommand)
```bash
node /var/app/staging/server/server.js
```
Node app listens on port 8080, nginx proxies requests

## To Deploy These Fixes

```powershell
# 1. Commit changes
cd c:\Users\jonat\OneDrive\Desktop\Clipper2.0
git add -A
git commit -m "Fix: Correct dependency installation order, add NodeCommand, fix NODE_ENV timing"
git push origin main

# This triggers CodePipeline → CodeBuild → EB automatically
```

## Real-Time Monitoring

```bash
# Watch deployment progress
eb logs --stream

# OR - SSH into instance after deployment starts
eb ssh

# Check specific logs
tail -f /tmp/build.log                # Live frontend build output
tail -f /tmp/app.log                 # Live app startup output
tail -f /var/log/eb-engine.log       # EB engine activity
cat /var/log/cfn-init.log            # CloudFormation initialization (full history)
```

## Key Log Files & What They Mean

| Log File | When | What It Shows |
|----------|------|---------------|
| `/tmp/root-deps.log` | During container_commands 01 | npm install output for frontend |
| `/tmp/build.log` | During container_commands 00 | npm run build output (Vite build) |
| `/tmp/app.log` | After app starts | Node.js application output |
| `/var/log/cfn-init.log` | Full deployment | Complete CloudFormation/cfn-init execution |
| `/var/log/eb-engine.log` | Full deployment | EB engine decisions and actions |
| `/var/log/nginx/error.log` | Runtime | Nginx errors (connection refused, etc) |

## If Build Still Fails

### Step 1: Check the actual error
```bash
eb ssh
cat /tmp/build.log  # Will show exactly what npm run build failed on
```

### Common Build Errors & Solutions

**Error: "Cannot find module '@vitejs/plugin-react'"**
- Solution: devDependencies not installed
- Check: `/tmp/root-deps.log` for npm install errors

**Error: "Unexpected token" or syntax errors**
- Solution: Vite didn't process JSX correctly
- Check: Ensure `vite.config.js` has `plugins: [react()]`

**Error: "dist directory not found"**
- Solution: Vite build failed silently
- Check: `/tmp/build.log` for full output
- Try increasing instance type to t3.small (more memory/CPU)

**Error: "EACCES: permission denied"**
- Solution: File permissions issue
- Check: Instance type has enough resources

### Step 2: Manual Verification
```bash
# SSH and manually test build
eb ssh
cd /var/app/staging
npm install          # Reinstall everything
npm run build        # Try building manually
ls -la dist/         # Check if dist exists
```

### Step 3: Check Dependencies
```bash
eb ssh
# Check if node_modules exists and has content
du -sh /var/app/staging/node_modules
ls -la /var/app/staging/node_modules | head -20

# Check package.json is intact
cat /var/app/staging/package.json | grep -A5 '"scripts"'
```

## Configuration Files Changed

### 1. **buildspec.yml**
- Added verbose logging
- Added timestamps to each step
- Added error output capture (2>&1)

### 2. **.ebextensions/01_build.config** (NEW STRUCTURE)
- Split into `commands:` and `container_commands:` 
- `commands:` run first with all dependencies
- `container_commands:` run build in proper order
- Build verification step added

### 3. **.ebextensions/01_nodejs.config**
- **CRITICAL**: Added `NodeCommand` to start server
- Set `NODE_ENV: production` for runtime only
- Added ProxyServer and GzipCompression settings

## Environment Variables Needed on EB

Once the app is running, set these on EB:

```bash
eb setenv \
  DB_HOST='your-rds-endpoint.rds.amazonaws.com' \
  DB_USER='admin' \
  DB_PASSWORD='your-secure-password' \
  DB_NAME='clipper_db' \
  DB_PORT='3306' \
  JWT_SECRET='your-jwt-secret-key' \
  NODE_ENV='production' \
  PORT='8080'
```

## Security Checklist

- [ ] .env file NOT in git (check `.gitignore`)
- [ ] Database credentials set as EB environment variables (not in code)
- [ ] JWT_SECRET is strong and random
- [ ] .ebignore excludes node_modules and sensitive files
- [ ] SSL/HTTPS enabled on EB

## Next Steps

1. **Commit and push** the configuration changes
2. **Monitor deployment** with `eb logs --stream`
3. **Verify frontend builds** - Check for `/dist` in logs
4. **Verify app starts** - Check `/tmp/app.log` for "Server running on..."
5. **Set environment variables** - Configure database connection
6. **Test application** - Visit `https://your-env.elasticbeanstalk.com`

## Success Indicators

✅ **Deployment Successful:**
- `eb-engine.log` shows no errors
- `/tmp/build.log` ends with build completion  
- `/tmp/app.log` shows "🚀 Server running on http://localhost:8080"
- nginx error.log has no "connection refused" errors
- Application responds to requests

---

**Note:** If deployment continues to fail after these changes, the issue is likely:
1. Insufficient instance resources (use t3.small instead of t3.micro)
2. Missing database environment variables
3. Dependency compatibility issues
4. Vite/React configuration issue on the build

Check `/tmp/build.log` for the actual error message.
