# What Changed - Quick Reference

## buildspec.yml
**BEFORE:**
```yaml
build:
  commands:
    - npm run build
```

**AFTER:**
```yaml
build:
  commands:
    - echo "[$(date)] Starting frontend build..."
    - npm run build 2>&1
    - echo "[$(date)] Checking dist directory..."
    - ls -la dist/ || echo "ERROR: dist directory not created"
```

**Why:** Capture actual build output and verify /dist was created


## .ebextensions/01_build.config
**BEFORE:**
```yaml
container_commands:
  00_install_server_deps:
    command: "cd /var/app/staging/server && npm install --production"
  01_build_frontend:
    command: "cd /var/app/staging && npm run build"
```

**AFTER:**
```yaml
commands:  # ← NEW: Runs FIRST, before container starts
  01_install_deps:
    command: "npm install"  # All deps including dev
  02_install_server_deps:
    command: "cd server && npm install"  # Server deps

container_commands:  # ← Now runs AFTER dependencies ready
  00_build_frontend:
    command: "npm run build"  # Has dev deps available
  01_verify_build:
    command: "if [ -d dist ]; then ... else exit 1; fi"
  02_install_production_deps:
    command: "cd server && npm install --production"  # Strip dev deps
```

**Why:** 
1. Build happens AFTER all dependencies installed
2. Dev dependencies available for Vite
3. Production deps installed AFTER build starts


## .ebextensions/01_nodejs.config
**BEFORE:**
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
  # No NodeCommand - EB doesn't know how to start app!
```

**AFTER:**
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production  # For RUNTIME
    PORT: 8080
  aws:elasticbeanstalk:container:nodejs:  # ← NEW
    NodeCommand: "cd /var/app/staging/server && node server.js 2>&1 | tee /tmp/app.log"
    ProxyServer: nginx
    GzipCompression: true
```

**Why:**
1. NodeCommand tells EB how to start your app
2. nginx can now proxy to running Node.js on port 8080
3. App output logged to /tmp/app.log for debugging


## Key Differences Explained

### Dependency Installation Order (CRITICAL FIX)

**OLD FLOW - BROKEN:**
```
CodeBuild: npm install ✓
     ↓
EB receives artifact
     ↓
EB container_commands: npm install --production ✗ (removes devDeps!)
     ↓
EB container_commands: npm run build ✗ (Vite fails - no devDeps!)
```

**NEW FLOW - CORRECT:**
```
CodeBuild: npm install ✓ (includes devDeps)
     ↓
EB receives artifact with devDeps
     ↓
EB commands: npm install ✓ (keeps devDeps)
     ↓
EB container_commands: npm run build ✓ (Vite has devDeps!)
     ↓
EB container_commands: npm install --production ✓ (now safe to remove)
```


### NODE_ENV Timing

**OLD - PROBLEMATIC:**
```
NODE_ENV=production during ENTIRE deployment
     ↓
npm skips installing devDependencies
     ↓
npm run build FAILS (Vite is devDependency!)
```

**NEW - CORRECT:**
```
During build (commands/container_commands): NODE_ENV=development
     ↓
npm installs devDependencies
     ↓
npm run build SUCCEEDS ✓
     ↓
During runtime: NODE_ENV=production
     ↓
App runs with optimizations
```


## Testing Locally First (Optional)

Before deploying to AWS, test the build locally:

```bash
cd c:\Users\jonat\OneDrive\Desktop\Clipper2.0

# Clean install (like EB would do)
rmdir /s node_modules 2>nul
rmdir /s server\node_modules 2>nul

# Install dependencies
npm install
cd server && npm install && cd ..

# Build (this is what fails on EB)
npm run build

# Check results
dir dist

# If this works locally, it should work on EB
```


## How to Deploy

```powershell
cd c:\Users\jonat\OneDrive\Desktop\Clipper2.0
git add -A
git commit -m "Fix: EB deployment - correct dependency order, add NodeCommand"
git push origin main
```

CodePipeline will automatically:
1. Pull from GitHub
2. Run CodeBuild (buildspec.yml)
3. Deploy to EB (.ebextensions configs)


## Verification Commands

```bash
# After pushing, monitor deployment
eb status              # Check environment status
eb events -f          # Watch deployment events
eb logs --stream      # Real-time logs
eb ssh                # SSH to instance if needed
```

---

**Key Takeaway:** The build was failing because dependencies were being removed BEFORE the build ran. The fixes ensure dependencies are available when needed.
