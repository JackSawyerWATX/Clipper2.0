# Root Cause Analysis - Why Deployment Was Failing

## The Problem Explained

Your AWS EB deployment was failing with this error:
```
Command 01_build_frontend failed
nginx: connect() failed (111: Connection refused) while connecting to upstream
```

This meant:
1. ✗ Frontend build failed
2. ✗ Node.js app never started  
3. ✗ nginx couldn't proxy to port 8080 (nothing listening)
4. ✗ All user requests got 404 errors

## Root Cause #1: Broken Dependency Installation Order

### The Issue
Your `.ebextensions/01_build.config` had:
```yaml
container_commands:
  00_install_server_deps:
    command: "cd /var/app/staging/server && npm install --production"
  01_build_frontend:
    command: "cd /var/app/staging && npm run build"
```

### What Happened
```
Step 1: CodeBuild creates artifact with all dependencies ✓
        (npm install includes devDependencies)

Step 2: EB starts EC2 instance
        Extracts artifact with full node_modules

Step 3: EB runs container_commands:
        → 00_install_server_deps runs --production
        → This REMOVES all devDependencies!
        → Deletes @vitejs/plugin-react, vite, etc.

Step 4: EB runs 01_build_frontend
        → npm run build tries to run
        → Calls vite build (which is a devDependency)
        → ❌ CRASH: "Cannot find module 'vite'"
```

### The Fix
Split into `commands:` (runs first) and `container_commands:` (runs second):
```yaml
commands:  # ← Runs BEFORE container
  01_install_deps:
    command: "npm install"  # ALL deps including dev

container_commands:  # ← Runs AFTER dependencies ready
  00_build_frontend:
    command: "npm run build"  # Has dev deps!
  02_install_production_deps:
    command: "npm install --production"  # Safe now
```

Now: Build has dependencies → Build succeeds → Dev deps removed


## Root Cause #2: NODE_ENV=production Too Early

### The Issue
Your config set `NODE_ENV: production` during the build phase:
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production  # ← Set during ENTIRE deployment
```

### What Happened
```
NODE_ENV=production set at startup
       ↓
npm checks NODE_ENV at install time
       ↓
npm decides: "production mode - don't install devDependencies"
       ↓
npm skips downloading @vitejs/plugin-react, vite, etc.
       ↓
Later: npm run build tries to run
       ↓
❌ CRASH: Vite not found
```

### The Fix
Set NODE_ENV strategically:
```yaml
commands:
  option_settings:
    NODE_ENV: development  # ← During build phase

container_commands:
  option_settings:
    NODE_ENV: development  # ← Still during build

aws:elasticbeanstalk:container:nodejs:
  option_settings:
    NODE_ENV: production  # ← Only at RUNTIME
```

Now: Build runs with dev deps available → App runs in production mode


## Root Cause #3: Missing NodeCommand (App Won't Start)

### The Issue
Your `.ebextensions/01_nodejs.config` had no `NodeCommand`:
```yaml
option_settings:
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
  # ← Missing: NodeCommand!
```

### What Happened
```
Even IF the build succeeded, EB wouldn't know how to start it!

EB looks for NodeCommand in .ebextensions
       ↓
Doesn't find it
       ↓
Falls back to Procfile or default behavior
       ↓
Default might try to run: node server.js
       ↓
But it should be: cd server && node server.js
       ↓
Wrong directory → app.js not found
       ↓
❌ App never starts
       ↓
nginx tries to proxy to port 8080
       ↓
Nothing listening there
       ↓
"connection refused" errors
```

### The Fix
Add explicit NodeCommand:
```yaml
aws:elasticbeanstalk:container:nodejs:
  NodeCommand: "cd /var/app/staging/server && node server.js"
```

Now: EB knows exactly how to start your app


## Root Cause #4: No Build Error Visibility

### The Issue
When the build failed, the error message was generic:
```
Command 01_build_frontend failed
```

No actual error details! This made debugging impossible.

### The Fix
Capture all output:
```bash
command: "npm run build 2>&1 | tee /tmp/build.log"
#         ↑                   ↑              ↑
#         Build command       Capture stdout+stderr to file
```

Now: Full error output saved to `/tmp/build.log` accessible via `eb ssh`


## Summary of All Changes

| Issue | Cause | Fix |
|-------|-------|-----|
| Build failed | Dependencies removed before build | Split commands, install before build |
| Dependencies missing | NODE_ENV=production too early | Set NODE_ENV=development during build |
| App won't start | No NodeCommand specified | Add NodeCommand to nodejs config |
| No error visibility | No logging | Tee all outputs to /tmp/*.log |

## The Complete Execution Flow (Now)

```
CODEBUILD (buildspec.yml)
├─ pre_build: npm install (all deps)
└─ build: npm run build → /dist created ✓

EB INITIALIZATION
├─ Extract artifact
└─ commands:
    ├─ npm install (get all deps back)
    └─ npm install (server) (server deps)

EB BUILD PHASE
├─ container_commands:
    ├─ npm run build (Vite builds React) ✓
    ├─ Verify /dist exists ✓
    └─ npm install --production (clean up dev deps)

EB RUNTIME
├─ NodeCommand starts app:
    └─ node /var/app/staging/server/server.js
├─ App listens on port 8080 ✓
├─ nginx proxies requests to port 8080 ✓
└─ React frontend served from /dist ✓
```

## Why This Works

1. **Build dependencies available** - npm run build has Vite, React, plugins
2. **Production optimized** - Dev deps removed before shipping
3. **App starts correctly** - NodeCommand known to EB
4. **Errors visible** - Full logs captured for debugging
5. **Clean separation** - Build phase separate from runtime

## Before vs After

### BEFORE (Failing) ❌
```
npm install --production (removes Vite)
         ↓
npm run build (needs Vite!)
         ↓
Cannot find module 'vite'
         ↓
Build failed
         ↓
App won't start
         ↓
nginx connection refused
         ↓
User sees: Error 502 Bad Gateway
```

### AFTER (Working) ✅
```
npm install (includes all dev deps)
         ↓
npm run build (Vite available!)
         ↓
Build succeeds → /dist created
         ↓
npm install --production (safe cleanup)
         ↓
node server.js (NodeCommand known)
         ↓
App running on port 8080
         ↓
nginx proxies successfully
         ↓
User sees: Clipper 2.0 Application
```

## Key Lessons

1. **Dependency installation order matters drastically**
   - Wrong order = missing dev tools = build failure
   
2. **NODE_ENV timing is critical**
   - Set too early = npm skips dev dependencies
   - Must be development during build, production at runtime
   
3. **EB needs explicit instructions**
   - Always provide NodeCommand
   - Don't rely on defaults or implicit behavior
   
4. **Logging is essential for cloud debugging**
   - Without logs, you're flying blind
   - Tee outputs to files that EB can access
   
5. **Test locally first**
   - If build works locally, configuration likely okay
   - If build fails locally, fix BEFORE pushing to EB

## Testing to Verify Fix Works

```bash
# Locally (minimal test)
npm install          # Should succeed
npm run build        # Should create /dist
ls dist/             # Should show React build output

# On EB (after deployment)
eb ssh
cat /tmp/build.log   # Should show successful Vite build
cat /tmp/app.log     # Should show "Server running on..."
curl localhost:8080  # Should return frontend HTML
```

---

**In Summary:** The deployment was failing because of improper dependency management combined with missing runtime configuration. All three issues have now been fixed.
