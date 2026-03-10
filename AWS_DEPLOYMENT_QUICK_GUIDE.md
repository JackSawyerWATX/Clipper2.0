# AWS Deployment - Quick Reference

## Files Created

### Configuration Files
- `.ebextensions/` - Elastic Beanstalk environment configuration
  - `nodecommand.config` - Node.js start command
  - `01-environment.config` - Environment settings (t3.micro, health checks)
  - `02-nodejs.config` - Node.js-specific settings (nginx, gzip)
  - `03-static-files.config` - Nginx configuration for static files & API routing
- `.platform/hooks/postdeploy/01_init_database.sh` - Post-deployment setup

### Build Configuration
- `buildspec.yml` - AWS CodeBuild configuration for CI/CD pipeline

### Documentation
- `AWS_DEPLOYMENT.md` - Complete deployment guide (see this for step-by-step instructions)

### Code Changes
- `server/server.js` - Now serves React frontend + API routes
- `server/package.json` - Added postinstall script to build frontend

## Quick Start (TL;DR)

### Prerequisites
```bash
# Ensure you have these ready:
- GitHub account (repository access)
- AWS account
- AWS CLI installed (optional)
```

### 1. Create RDS Database
```
AWS Console → RDS → Create Database
- Engine: MySQL 8.0+
- Instance: db.t3.micro
- Name: clipper-db
- Master User: clipper_user
- Password: (strong password)
```

### 2. Create Elastic Beanstalk Environment
```
AWS Console → Elastic Beanstalk → Applications → New Application
- Name: Clipper2.0
- Platform: Node.js (v18+)
- Instance Type: t3.micro
- Environment Variables: (see AWS_DEPLOYMENT.md)
```

### 3. Set Up CodePipeline
```
AWS Console → CodePipeline → Create Pipeline
- Source: GitHub (JackSawyerWATX/Clipper2.0, main branch)
- Build: CodeBuild (uses buildspec.yml)
- Deploy: Elastic Beanstalk (clipper-production)
```

### 4. Initialize Database
```bash
# Once deployed, run schema via SSH or Lambda
mysql -h <RDS_ENDPOINT> -u clipper_user -p < database/schema.sql
```

### 5. Push to Deploy
```bash
git push origin main
# Pipeline triggers automatically → deploys within 5-10 minutes
```

## Key Deployment Information

| Component | Details |
|-----------|---------|
| **Frontend** | React (Vite) → built to `dist/` → served as static files |
| **Backend** | Express.js running on port 8081 (internal), nginx proxy on 80 |
| **Database** | AWS RDS MySQL (managed service) |
| **Compute** | EC2 t3.micro (free tier eligible) |
| **CI/CD** | CodePipeline + CodeBuild (automated on git push) |
| **Entry Point** | Express server: `server/server.js` |
| **Build Command** | Frontend: `npm run build`, Backend: already in server/ |

## Deployment Flow

```
1. Push to main branch
   ↓
2. GitHub webhook triggers CodePipeline
   ↓
3. CodeBuild executes buildspec.yml:
   - npm install (frontend)
   - npm run build (React → dist/)
   - npm install (server)
   - Artifact upload to S3
   ↓
4. Elastic Beanstalk downloads artifact
   ↓
5. server/package.json postinstall runs (if needed)
   ↓
6. Node.js starts: node server/server.js
   ↓
7. Express serves:
   - /api/* → backend routes
   - /* → React dist/index.html (for React Router)
   - Static files → from dist/
   ↓
8. Deployment complete ✅
```

## Environment Variables Needed in EB

```
DB_HOST=<RDS_ENDPOINT>
DB_PORT=3306
DB_USER=clipper_user
DB_PASSWORD=<YOUR_PASSWORD>
DB_NAME=clipper_db
NODE_ENV=production
PORT=8081
JWT_SECRET=<RUN: openssl rand -base64 32>
JWT_EXPIRES_IN=24h
VITE_API_URL=https://<eb-domain>
FRONTEND_URL=https://<eb-domain>
```

## Monitoring After Deploy

- **EB Health**: AWS Console → Elastic Beanstalk → Environment Health
- **Logs**: CloudWatch → Log Groups → /aws/elasticbeanstalk/Clipper2.0/*
- **API Test**: `curl https://<eb-url>/api/health`
- **Frontend**: `https://<eb-url>/` in browser

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "React frontend not loading" | Check `npm run build` completed; verify `dist/` exists on EB |
| "Database connection refused" | Check RDS security group allows EB security group; verify credentials |
| "CodeBuild fails" | Check CodePipeline logs; verify buildspec.yml syntax |
| "404 on React routes" | Nginx config should route non-API requests to Express; check `03-static-files.config` |

## Manual Deployment (if needed)

```bash
# 1. Build locally
npm install
npm run build
cd server
npm install
cd ..

# 2. Create deployment package
zip -r Clipper2.0.zip . -x "node_modules/*" ".git/*" ".venv/*"

# 3. Upload to EB
# AWS Console → Elastic Beanstalk → Upload and Deploy
```

## Cost Breakdown

- **t3.micro EC2** (free tier 1st year): ~$7/month after
- **RDS db.t3.micro** (free tier 1st year): ~$15/month after  
- **ALB**: ~$16/month
- **Data Transfer**: ~$1/month
- **Total**: *~$39/month* (or ~$17 in first year with free tier)

## Next: SSL/HTTPS

1. AWS Certificate Manager (free)
2. Point domain → EB via Route 53 or external DNS
3. Update VITE_API_URL to use https://

See `AWS_DEPLOYMENT.md` for complete step-by-step guide.
