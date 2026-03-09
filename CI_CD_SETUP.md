# GitHub Actions CI/CD Setup Guide

This guide walks you through setting up automatic deployments to AWS Lightsail.

## Overview

The CI/CD pipeline automatically:
1. ✅ **Tests** code on every push
2. 🔨 **Builds** frontend and backend
3. 🚀 **Deploys** to Lightsail with zero downtime

## Prerequisites

- Lightsail instance created and running (see `LIGHTSAIL_DEPLOYMENT.md`)
- GitHub repository access
- SSH key for Lightsail instance
- PM2 running services on Lightsail

## Step 1: Get Your Lightsail Connection Details

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com)
2. Click your instance name `clipper-app`
3. Note the following:
   - **Public IP address** (e.g., `3.145.67.89`)
   - **Username** (usually `ec2-user` for Amazon Linux or `ubuntu` for Ubuntu)
   - **SSH port** (usually `22`)

4. Download your SSH key:
   - Click **Account** (top right)
   - Go to **SSH keys**
   - Download the key if you haven't already

## Step 2: Create GitHub Secrets

1. Go to GitHub repository: `https://github.com/JackSawyerWATX/Clipper2.0`
2. Click **Settings** (top menu)
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret** and add these secrets:

### Secret 1: LIGHTSAIL_HOST
- **Name**: `LIGHTSAIL_HOST`
- **Value**: Your Lightsail instance IP (e.g., `3.145.67.89`)
- Click **Add secret**

### Secret 2: LIGHTSAIL_USERNAME
- **Name**: `LIGHTSAIL_USERNAME`
- **Value**: `ec2-user` (or `ubuntu` if using Ubuntu image)
- Click **Add secret**

### Secret 3: LIGHTSAIL_SSH_PORT
- **Name**: `LIGHTSAIL_SSH_PORT`
- **Value**: `22`
- Click **Add secret**

### Secret 4: LIGHTSAIL_SSH_KEY
- **Name**: `LIGHTSAIL_SSH_KEY`
- **Value**: Your private SSH key content (see below)
- Click **Add secret**

#### How to get SSH key content:

**Option A: Using the default Lightsail key**
1. Find your downloaded SSH key file (e.g., `LightsailDefaultKey-us-east-1.pem`)
2. Open it in a text editor
3. Copy the entire content (from `-----BEGIN RSA PRIVATE KEY-----` to `-----END RSA PRIVATE KEY-----`)
4. Paste into GitHub secret `LIGHTSAIL_SSH_KEY`

**Option B: Generate new SSH key pair**
```bash
ssh-keygen -t rsa -b 4096 -f lightsail_key -N ""
# This creates:
# - lightsail_key (private key)
# - lightsail_key.pub (public key)

# Copy content of private key to GitHub secret
cat lightsail_key
```

Then add public key to your Lightsail instance:
```bash
# SSH into Lightsail
ssh -i /path/to/your/key.pem ec2-user@your-instance-ip

# Add public key
cat >> ~/.ssh/authorized_keys << 'EOF'
<paste content of lightsail_key.pub>
EOF

# Secure permissions
chmod 600 ~/.ssh/authorized_keys
```

## Step 3: Test the Setup

1. Go to GitHub repository
2. Click **Actions** (top menu)
3. You should see 2 workflows:
   - **Tests & Linting** - Runs on every push
   - **Deploy to Lightsail** - Runs on main branch pushes

4. Make a small change to test:
   ```bash
   git add .
   git commit -m "Test CI/CD pipeline"
   git push origin main
   ```

5. Watch the deployment:
   - Go to **Actions** tab
   - Click the running workflow
   - Watch the deployment progress

## Step 4: Verify Deployment

After successful GitHub Actions run:

1. Visit your Lightsail instance IP in browser: `http://<your-instance-ip>`
2. Check PM2 status on instance:
   ```bash
   ssh -i /path/to/key.pem ec2-user@your-instance-ip
   pm2 status
   ```

3. View logs:
   ```bash
   pm2 logs
   ```

## Workflow Files

### File 1: `.github/workflows/deploy.yml`
- Triggered on: Push to `main` branch or manual trigger
- Actions:
  - Installs dependencies
  - Builds frontend
  - Connects to Lightsail via SSH
  - Pulls latest code
  - Restarts services with PM2

### File 2: `.github/workflows/test.yml`
- Triggered on: Every push to `main` or `develop`
- Actions:
  - Runs linting (if configured)
  - Runs tests (if configured)
  - Checks syntax
  - Builds frontend

## How It Works

```
git push main
     ↓
GitHub receives push
     ↓
Triggers deploy.yml workflow
     ↓
Tests run ✓
     ↓
Frontend builds ✓
     ↓
Connects to Lightsail via SSH
     ↓
Pulls latest code
     ↓
Installs dependencies
     ↓
Rebuilds frontend
     ↓
Restarts PM2 services
     ↓
✅ Deployment complete!
```

## Useful Commands

### Manual Trigger (without git push)
1. Go to GitHub **Actions** tab
2. Click **Deploy to Lightsail**
3. Click **Run workflow** → **Run workflow**

### View Deployment Logs
1. Go **Actions** tab
2. Click the workflow run
3. Expand "Deploy to Lightsail" step

### SSH into Lightsail
```bash
ssh -i /path/to/lightsail_key.pem ec2-user@your-instance-ip
pm2 logs
```

## Troubleshooting

### "Permission denied" error
**Issue**: SSH key doesn't have permission
**Fix**:
```bash
chmod 600 ~/.ssh/lightsail_key
```

### SSH connection timeout
**Issue**: Security group not allowing SSH
**Fix**:
1. Go to Lightsail console
2. Click your instance
3. Go to **Networking**
4. Ensure **SSH (22)** is allowed from your IP

### "git pull fails"
**Issue**: Repository not initialized on Lightsail
**Fix**: Run manual setup first:
```bash
ssh -i /path/to/key.pem ec2-user@your-instance-ip
cd /home/ec2-user
git clone https://github.com/JackSawyerWATX/Clipper2.0.git
```

### New public key format issue
**Issue**: SSH key is in newer format (openssh-key-v1)
**Fix**: Convert to RSA format:
```bash
ssh-keygen -p -N "" -m pem -f lightsail_key
```

## Security Best Practices

1. ✅ **Never commit SSH keys** to repository
2. ✅ **Store secrets in GitHub** not in code
3. ✅ **Use strong SSH passwords** if no key auth
4. ✅ **Rotate SSH keys** regularly
5. ✅ **Restrict SSH access** to specific IPs in Lightsail firewall
6. ✅ **Review workflow logs** for any sensitive data (they won't show secrets)

## Next Steps

1. **Test a deployment**: Make a code change and push
2. **Monitor logs**: Use GitHub Actions logs + PM2 logs
3. **Set up alerts**: GitHub email notifications on failure
4. **Add more workflows**:
   - Database migrations
   - Backup before deploy
   - Slack notifications
   - Performance testing

## Advanced: Manual SSH Deployment

If you prefer to deploy manually:
```bash
ssh -i /path/to/key.pem ec2-user@your-instance-ip
cd /home/ec2-user/Clipper2.0
git pull origin main
npm install
npm run build
cd server && npm install && cd ..
pm2 restart all
```

## Support

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SSH Keys Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- [AWS Lightsail SSH](https://docs.aws.amazon.com/lightsail/latest/userguide/understanding-ssh-in-amazon-lightsail.html)

---

**Setup complete!** Your CI/CD pipeline is now ready. Every `git push` to `main` will automatically deploy to Lightsail.

🎉 **From now on, deployment is as simple as:**
```bash
git add .
git commit -m "Your changes"
git push origin main
```

Watch it deploy automatically in the **Actions** tab!
