# AWS Elastic Beanstalk Deployment Guide

## Overview

This application is configured to deploy on **AWS Elastic Beanstalk** with:
- **Frontend**: React (built and served as static files)
- **Backend**: Express.js
- **Database**: AWS RDS (MySQL)
- **Compute**: t3.micro EC2 instances
- **CI/CD**: AWS CodePipeline with CodeBuild

## Architecture

```
GitHub Repository
    ↓
CodePipeline (triggered on push to main)
    ↓
CodeBuild (buildspec.yml)
    ├─ npm install (frontend & backend)
    ├─ npm run build (React)
    └─ Artifact upload to S3
    ↓
Elastic Beanstalk Environment
    ├─ EC2 (t3.micro) - runs Express server
    │  └─ Port 8081: Node.js app
    ├─ ALB - routes traffic
    │  └─ Port 80: nginx proxy
    └─ Auto-scaling group
    ↓
RDS MySQL Database
```

## Prerequisites

1. **AWS Account** with appropriate IAM permissions
2. **GitHub Repository Access** (for CodePipeline integration)
3. **AWS CLI** installed locally (optional, for manual deployments)

## Step 1: Create RDS MySQL Database

### Via AWS Console:

1. Go to **RDS → Databases → Create Database**
2. Select **MySQL** (8.0+)
3. **DB Instance Identifier**: `clipper-db`
4. **Master Username**: `clipper_user`
5. **Master Password**: Generate a strong password
6. **DB Instance Class**: `db.t3.micro` (free tier eligible)
7. **Storage**: `20 GB` (General Purpose SSD)
8. **Publicly Accessible**: No
9. **VPC**: Default VPC
10. **DB Subnet Group**: Default
11. **Security Group**: Create new or use existing (ensure it allows port 3306 from EB security group)
12. Click **Create Database**

### Note the following:

- **Endpoint**: `clipper-db.xxxxx.us-east-1.rds.amazonaws.com`
- **Port**: `3306`
- **Username**: `clipper_user`
- **Password**: (as you set it)
- **Database**: Will be created during first deployment

## Step 2: Create RDS Security Group

1. Go to **VPC → Security Groups**
2. Create a new security group named `clipper-rds-sg`
3. Add inbound rule:
   - Type: MySQL/Aurora
   - Protocol: TCP
   - Port: 3306
   - Source: Security group from Elastic Beanstalk (you'll configure EB first, then come back)

## Step 3: Create Elastic Beanstalk Environment

### Via AWS Console:

1. Go to **Elastic Beanstalk → Applications → Create Application**
2. **Application Name**: `Clipper2.0`
3. **Environment Name**: `clipper-production`
4. **Platform**: Node.js (latest v18+)
5. **Application Code**: Select "Upload your code"

### Configure Environment:

1. **Instance Type**: t3.micro
2. **Number of Instances**: 1 (auto-scale 1-2)
3. **Load Balancer Type**: Application Load Balancer (ALB)
4. **Environment Properties**:
   ```
   NODE_ENV=production
   PORT=8081
   DB_HOST=<RDS Endpoint>
   DB_PORT=3306
   DB_USER=clipper_user
   DB_PASSWORD=<Your Strong Password>
   DB_NAME=clipper_db
   JWT_SECRET=<Generate: openssl rand -base64 32>
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=https://<your-domain-or-eb-url>
   ```
5. Click **Create Environment**

### Get EB Security Group:

1. After EB environment is created, go to **EC2 → Security Groups**
2. Find the EB security group (usually `awseb-***`)
3. Copy its ID
4. Go back to RDS security group and update inbound rule to allow traffic from this EB security group

## Step 4: Initialize Database

### Option A: AWS Systems Manager Session Manager

1. Go to **Systems Manager → Session Manager**
2. Start session to your EB EC2 instance
3. Run:
   ```bash
   cd /var/app/current/server
   mysql -h <RDS_ENDPOINT> -u clipper_user -p clipper_db < ../database/schema.sql
   ```

### Option B: Local MySQL Client (if you have it)

```bash
mysql -h <RDS_ENDPOINT> -u clipper_user -p clipper_db < database/schema.sql
```

### Option C: Use AWS Lambda (recommended for CI/CD)

Create a Lambda function that runs schema.sql on first deployment (see Advanced section).

## Step 5: Set Up CI/CD with CodePipeline

### Via AWS Console:

1. Go to **CodePipeline → Pipelines → Create Pipeline**
2. **Pipeline Name**: `Clipper2.0-Pipeline`
3. **Service Role**: Create new service role

### Add Stages:

#### Stage 1: Source
- **Provider**: GitHub (v2)
- **Repository**: `JackSawyerWATX/Clipper2.0`
- **Branch**: `main`
- **Authentication**: Authorize via GitHub

#### Stage 2: Build
- **Provider**: CodeBuild
- **Project Name**: Click "Create Project"
  - **Project Name**: `clipper-build`
  - **Environment**: Managed image
  - **Operating System**: Amazon Linux 2
  - **Runtime**: Standard
  - **Image**: Latest
  - **Service Role**: Create new
  - **Buildspec**: Use a buildspec file (root of repo: `buildspec.yml`)

#### Stage 3: Deploy
- **Provider**: Elastic Beanstalk
- **Application Name**: `Clipper2.0`
- **Environment Name**: `clipper-production`

Click **Create Pipeline**

## Step 6: Configure GitHub Webhook

The OAuth connection will automatically set up webhooks. Verify in GitHub:

1. Go to your repository → **Settings → Webhooks**
2. Confirm webhook is present and active

## Step 7: Update Frontend API Endpoint

Update `src/utils/auth.js` if needed:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://<your-eb-domain>';
```

In EB environment variables or `.env.production`:
```
VITE_API_URL=https://clipper-production.us-east-1.elasticbeanstalk.com
```

## Deployment Testing

### First Deployment:

1. Push a commit to `main` branch
2. Go to **CodePipeline** to watch the pipeline execute
3. Once deployed, visit your EB environment URL
4. Login with admin credentials

### Verify:

- API health check: `https://<your-eb-url>/api/health`
- Frontend: `https://<your-eb-url>/`
- Create test order through UI

## Environment Variables

### Production (.env.production)

```env
# Database
DB_HOST=your-rds-endpoint.amazonaws.com
DB_USER=clipper_user
DB_PASSWORD=your_strong_password
DB_NAME=clipper_db
DB_PORT=3306

# Server
PORT=8081
NODE_ENV=production

# JWT
JWT_SECRET=your_generated_secret_here
JWT_EXPIRES_IN=24h

# Frontend
VITE_API_URL=https://your-eb-domain.elasticbeanstalk.com
FRONTEND_URL=https://your-eb-domain.elasticbeanstalk.com
```

## Monitoring

### CloudWatch Logs:

1. Go to **CloudWatch → Logs → Log Groups**
2. Find `/aws/elasticbeanstalk/Clipper2.0/var/log/eb-engine.log`
3. Monitor real-time logs

### EB Health Dashboard:

1. Go to **Elastic Beanstalk → Environments → clipper-production**
2. View **Health** tab for instance status

### Auto-Scaling:

1. Go to **EC2 → Auto Scaling Groups**
2. Find `awseb-Clipper2.0-***`
3. Monitor instance count and scaling activities

## Scaling Configuration

### Current Setup (t3.micro):

- **Min Instances**: 1
- **Max Instances**: 2
- **Scale Up**: CPU > 70% for 5 min
- **Scale Down**: CPU < 30% for 10 min

### To Increase:

1. Go to **Elastic Beanstalk → clipper-production → Configuration**
2. **Capacity → Auto Scaling Group → Edit**
3. Adjust Min/Max instances and scaling thresholds

## Cost Estimates (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| EC2 (t3.micro, 1 instance) | Free (12 mo) / ~$7 | ~$7 |
| RDS MySQL (db.t3.micro, 20GB) | Free (12 mo) / ~$15 | ~$15 |
| Data Transfer | Minimal | ~$1 |
| Load Balancer | ALB | ~$16 |
| **Total** | | **~$39** |

*First 12 months with AWS Free Tier: ~$17*

## Troubleshooting

### Build Fails in CodeBuild

Check **CodePipeline → Pipeline Execution Details → Build Logs**

Common issues:
- Missing `npm run build` in buildspec.yml
- Node version mismatch
- Dependency conflicts

### Application won't start

1. Check **EB Environment Health → Logs**
2. Look for database connection errors
3. Verify environment variables are set

### Database connection refused

1. Ensure RDS security group allows traffic from EB
2. Verify credentials in EB environment properties
3. Confirm RDS endpoint is correct

### React frontend not loading

1. Verify `npm run build` completed successfully
2. Check that `dist/` folder exists on EB instance
3. Confirm Express is serving static files: `app.use(express.static(frontendPath))`

## Advanced: Lambda Database Initialization

To automatically initialize the database on first deployment:

1. Create Lambda function with MySQL driver
2. Add it as post-deployment step in CodePipeline
3. Trigger after EB deployment succeeds

(Detailed setup in separate doc)

## Next Steps

1. **Domain Setup**: Point your domain to EB environment using Route 53 or external DNS
2. **SSL Certificate**: Request free ACM certificate for HTTPS
3. **Backup Strategy**: Enable automated RDS backups (7 days retention)
4. **Monitoring Alerts**: Set up CloudWatch alarms for CPU, memory, database
5. **CI/CD Improvements**: Add automated tests to CodeBuild

## Support

For issues:
1. Check CloudWatch logs
2. Review EB event logs
3. Consult AWS documentation: https://docs.aws.amazon.com/elasticbeanstalk/
