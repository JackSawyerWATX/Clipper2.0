# Clipper 2.0 — AWS Deployment Guide

> **Stack:** React/Vite frontend + Node.js Express backend + PostgreSQL (RDS)  
> **Services:** AWS Amplify · Elastic Beanstalk · RDS  
> **Prerequisites:** AWS CLI installed, EB CLI installed, AWS account with appropriate IAM permissions

---

## PART 1 — RDS PostgreSQL Database

Set this up first so you have the connection string ready for your backend.

### Step 1: Create the RDS Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier clipper-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username clipper_admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --db-name clipper \
  --publicly-accessible \
  --backup-retention-period 7 \
  --no-multi-az
```

> **Free tier eligible?** `db.t3.micro` + 20GB is within the 12-month free tier.  
> `--publicly-accessible` lets EB reach it — you'll lock it down with security groups next.

### Step 2: Note the endpoint

```bash
aws rds describe-db-instances \
  --db-instance-identifier clipper-db \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text
```

Save that output — it'll look like:  
`clipper-db.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com`

### Step 3: Configure the security group to allow EB access

```bash
# Get the RDS security group ID
aws rds describe-db-instances \
  --db-instance-identifier clipper-db \
  --query 'DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId' \
  --output text

# Allow inbound PostgreSQL (port 5432) from anywhere (tighten later)
aws ec2 authorize-security-group-ingress \
  --group-id <SECURITY_GROUP_ID> \
  --protocol tcp \
  --port 5432 \
  --cidr 0.0.0.0/0
```

### Step 4: Run your database migrations

Once the instance is available (~5 minutes):

```bash
# From the /database folder in your repo
cd database
DATABASE_URL=postgresql://clipper_admin:YOUR_SECURE_PASSWORD@<RDS_ENDPOINT>:5432/clipper \
  node migrate.js   # or whatever your migration script is called
```

---

## PART 2 — Elastic Beanstalk (Node.js Backend)

### Step 1: Install the EB CLI (if not already installed)

```bash
pip install awsebcli --upgrade
```

Verify: `eb --version`

### Step 2: Configure AWS credentials

```bash
aws configure
# Enter: AWS Access Key ID, Secret Access Key, region (e.g. us-east-1), output format (json)
```

### Step 3: Initialize EB in your project root

```bash
cd /path/to/Clipper2.0
eb init
```

When prompted:
- **Region:** us-east-1 (or your preferred region)
- **Application name:** clipper-backend
- **Platform:** Node.js
- **Node.js version:** match your `.nvmrc` (likely 18 or 20)
- **CodeCommit:** No
- **SSH keypair:** Yes (create or select one for debugging access)

### Step 4: Create the environment

```bash
eb create clipper-prod \
  --instance-type t3.micro \
  --single \
  --envvars NODE_ENV=production
```

> `--single` skips the load balancer — cheapest option for a personal/small project.  
> Remove `--single` if you need high availability.

### Step 5: Set environment variables

Replace the values with your actual secrets (move them OUT of your committed `.env` file):

```bash
eb setenv \
  NODE_ENV=production \
  PORT=8080 \
  DATABASE_URL=postgresql://clipper_admin:YOUR_SECURE_PASSWORD@<RDS_ENDPOINT>:5432/clipper \
  JWT_SECRET=your_jwt_secret \
  STRIPE_SECRET_KEY=your_stripe_key
```

> Add any other variables from your `.env.production` file here.

### Step 6: Deploy

```bash
eb deploy
```

Watch the output — it'll stream logs. When done:

```bash
eb open   # opens the backend URL in your browser
```

Note the EB URL — it'll look like:  
`http://clipper-prod.us-east-1.elasticbeanstalk.com`

### Step 7: Check logs if anything fails

```bash
eb logs
# or open the EB console in AWS for detailed deployment logs
```

---

## PART 3 — AWS Amplify (React Frontend)

This is the easiest part — all done in the AWS console or via CLI.

### Option A: Console (Recommended for first-time)

1. Go to [https://console.aws.amazon.com/amplify](https://console.aws.amazon.com/amplify)
2. Click **"New app" → "Host web app"**
3. Select **GitHub** and authorize AWS Amplify
4. Choose your repo: `JackSawyerWATX/Clipper2.0`
5. Select branch: `main`
6. Amplify will auto-detect Vite — confirm the build settings:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

7. Click **"Advanced settings"** → add environment variables:

```
VITE_API_URL = http://clipper-prod.us-east-1.elasticbeanstalk.com
```

> Any env var the React app needs must be prefixed with `VITE_` and added here.

8. Click **"Save and deploy"**

Amplify will build and give you a URL like:  
`https://main.xxxxxxxxxxxx.amplifyapp.com`

### Option B: CLI

```bash
npm install -g @aws-amplify/cli
amplify configure   # walks you through IAM setup

cd /path/to/Clipper2.0
amplify init
amplify add hosting
# Choose: Hosting with Amplify Console → Continuous deployment
amplify publish
```

---

## PART 4 — Post-Deployment Checklist

### Update CORS in your Node.js server

Your backend needs to allow requests from your Amplify URL:

```js
// server/index.js or app.js
app.use(cors({
  origin: [
    'https://main.xxxxxxxxxxxx.amplifyapp.com',
    'http://localhost:5173'  // keep for local dev
  ]
}));
```

Then redeploy the backend:

```bash
eb deploy
```

### Point your frontend API calls to the EB URL

Make sure your React app is using `VITE_API_URL` for all API calls — not hardcoded localhost.

### Lock down the RDS security group (important!)

Once everything is working, restrict the DB to only accept connections from the EB security group:

```bash
# Get the EB environment's security group ID from the EC2 console, then:
aws ec2 revoke-security-group-ingress \
  --group-id <RDS_SG_ID> \
  --protocol tcp \
  --port 5432 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id <RDS_SG_ID> \
  --protocol tcp \
  --port 5432 \
  --source-group <EB_SG_ID>
```

---

## Cost Summary (us-east-1, light traffic)

| Service | Instance | Est. Monthly |
|---------|----------|-------------|
| Amplify Hosting | — | Free (400 min build / 15 GB serve) |
| Elastic Beanstalk | t3.micro | ~$8–10/mo |
| RDS PostgreSQL | db.t3.micro | Free (12mo) then ~$13/mo |
| **Total** | | **~$8–10/mo first year** |

---

## Quick Reference — Common Commands

```bash
# Deploy backend changes
eb deploy

# View backend logs
eb logs

# SSH into EB instance
eb ssh

# Check EB environment status
eb status

# Open EB environment in browser
eb open

# Terminate environment (stop billing)
eb terminate clipper-prod
```

---

*Generated for Clipper 2.0 — https://github.com/JackSawyerWATX/Clipper2.0*