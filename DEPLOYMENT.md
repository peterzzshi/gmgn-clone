# GMGN Clone - AWS EC2 Deployment Guide

Complete guide to deploy this application to AWS EC2 using Docker, Terraform, and GitHub Actions.

## 📋 Overview

- **Frontend**: React + Vite (containerized with nginx)
- **Backend**: Node.js + Express (containerized)
- **Cloud**: AWS EC2 (t2.micro - Free Tier eligible)
- **Container Registry**: Docker Hub (`peterweb3/gmgn-frontend`, `peterweb3/gmgn-backend`)
- **Infrastructure as Code**: Terraform
- **CI/CD**: GitHub Actions (automated deployment on push to main)
- **Region**: ap-southeast-2 (Sydney, Australia)

## 🎯 Architecture

```
GitHub Push to main
    ↓
GitHub Actions Workflow
    ↓
1. Read Elastic IP from Terraform state (54.79.43.184)
2. Build Docker images with correct API URL
3. Push images to Docker Hub
4. SSH to EC2 and deploy containers
    ↓
EC2 Instance (t2.micro)
├── Docker: gmgn-backend (port 4000)
└── Docker: gmgn-frontend (port 80)
```

## 🌐 Current Deployment

- **Elastic IP**: `54.79.43.184` (permanent, won't change)
- **Frontend**: http://54.79.43.184
- **Backend**: http://54.79.43.184:4000/api
- **Instance ID**: `i-08e4538986a6d8534`
- **SSH**: `ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184`

## 🚀 One-Time Setup

> **Note**: Infrastructure is already deployed! These steps are documented for reference and troubleshooting.

### Prerequisites

**AWS Account**: 
- Account ID: `9489-8846-0792`
- IAM User: Created with access key `AKIA5Z5A6X34A26DDX7R`
- IAM Permissions: EC2FullAccess, VPCFullAccess
- Region: `ap-southeast-2` (Sydney, Australia)

**Local Tools**:
- AWS CLI configured with your credentials
- Terraform installed
- Docker and Docker Hub account (`peterweb3`)
- Git and GitHub account (`peterzzshi`)

### Step 1: Create SSH Key (if not exists)

```bash
# Check if key exists
ls -la ~/.ssh/gmgn-key

# If not, create it
ssh-keygen -t rsa -b 4096 -f ~/.ssh/gmgn-key -N ""
chmod 400 ~/.ssh/gmgn-key

# Import to AWS
aws ec2 import-key-pair \
  --key-name gmgn-key \
  --public-key-material fileb://~/.ssh/gmgn-key.pub \
  --region ap-southeast-2
```

### Step 2: Verify or Deploy Infrastructure

```bash
cd terraform

# Check current state
terraform output

# If output is empty, deploy infrastructure
terraform init
terraform apply -auto-approve
```

**Expected output:**
```
backend_url = "http://54.79.43.184:4000/api"
frontend_url = "http://54.79.43.184"
instance_id = "i-08e4538986a6d8534"
instance_public_ip = "54.79.43.184"
ssh_command = "ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184"
```

> **Important**: `54.79.43.184` is an Elastic IP (permanent). It will NOT change on stop/start.

### Step 3: Verify EC2 Instance is Running

```bash
# Check instance state
aws ec2 describe-instances \
  --instance-ids i-08e4538986a6d8534 \
  --region ap-southeast-2 \
  --query 'Reservations[0].Instances[0].State.Name' \
  --output text
```

**Expected output**: `running`

**If stopped**:
```bash
aws ec2 start-instances --instance-ids i-08e4538986a6d8534 --region ap-southeast-2
# Wait 30 seconds for instance to start
```

### Step 4: Configure GitHub Secrets

Go to: https://github.com/peterzzshi/gmgn-clone/settings/secrets/actions

Add these secrets:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `DOCKER_PASSWORD` | Docker Hub password | https://hub.docker.com/settings/security |
| `EC2_SSH_KEY` | Private key content | `cat ~/.ssh/gmgn-key` (entire output) |
| `AWS_ACCESS_KEY_ID` | `AKIA5Z5A6X34A26DDX7R` | ⚠️ Optional (see note below) |
| `AWS_SECRET_ACCESS_KEY` | Your IAM secret key | ⚠️ Optional (see note below) |

**⚠️ Note on AWS Secrets:**
- AWS credentials are **optional** since Terraform state is in Git
- If you add `AWS_ACCESS_KEY_ID`, you MUST also add `AWS_SECRET_ACCESS_KEY`
- Or remove both and let workflow use Terraform state directly

**To get EC2_SSH_KEY:**
```bash
cat ~/.ssh/gmgn-key
```
Copy the **entire** output including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`

### Step 5: Test SSH Connection

```bash
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184

# Check Docker containers
docker ps

# Check compose file
cat ~/docker-compose.yml

# Exit
exit
```

## 🔄 Automated Deployment

Once setup is complete, deployment is **fully automated**:

1. **Make changes** to your code
2. **Commit and push** to `main` branch:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **GitHub Actions automatically**:
   - Reads the Elastic IP from Terraform state
   - Builds Docker images with correct API URL
   - Pushes images to Docker Hub
   - SSHs to EC2 and deploys new containers

### Monitor Deployment

Watch the deployment progress:
- Go to: https://github.com/peterzzshi/gmgn-clone/actions
- Click on the latest workflow run
- See real-time logs for each step

### Manual Deployment Trigger

You can also trigger deployment manually:
1. Go to: https://github.com/peterzzshi/gmgn-clone/actions
2. Click "Deploy to AWS EC2"
3. Click "Run workflow" → "Run workflow"

## 🌐 Access Your Application

After deployment completes (5-7 minutes):

- **Frontend**: http://YOUR-ELASTIC-IP
- **Backend**: http://YOUR-ELASTIC-IP:4000/api
- **Health Check**: http://YOUR-ELASTIC-IP:4000/api/health

## 🔧 Troubleshooting

### Quick Diagnostic

Run this to check everything:
```bash
./diagnose.sh
```

### Common Issues

#### 1. Frontend Shows `ERR_CONNECTION_REFUSED` to localhost

**Symptoms:**
```
GET http://localhost:4000/api/market/tokens net::ERR_CONNECTION_REFUSED
```

**Cause**: Frontend container was built with wrong API URL (localhost instead of EC2 IP)

**Solution**: Rebuild and redeploy with correct API URL

```bash
# Option A: Trigger GitHub Actions (recommended)
git commit --allow-empty -m "Rebuild with correct API URL"
git push origin main

# Option B: Build and push manually
docker build \
  --build-arg VITE_API_URL=http://54.79.43.184:4000/api \
  -t peterweb3/gmgn-frontend:latest \
  ./frontend

docker push peterweb3/gmgn-frontend:latest

# Deploy to EC2
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 \
  "cd ~ && docker-compose pull && docker-compose up -d"
```

#### 2. GitHub Actions Fails: AWS Credentials Error

**Error:**
```
Error: 'aws-secret-access-key' must be provided if 'aws-access-key-id' is provided
```

**Cause**: Missing `AWS_SECRET_ACCESS_KEY` in GitHub secrets

**Solutions**:
1. **Option A (Recommended)**: Remove AWS credentials from GitHub secrets
   - Delete `AWS_ACCESS_KEY_ID` secret
   - Workflow will use Terraform state from Git
   
2. **Option B**: Add the missing secret
   - Add `AWS_SECRET_ACCESS_KEY` with your IAM secret key

#### 3. Cannot Find EC2 Instance

**Symptoms**: No instances show in EC2 console

**Checks**:
1. **Wrong region**: Ensure you're viewing `ap-southeast-2` (Sydney)
2. **Instance stopped**: Check state with AWS CLI
3. **Never created**: Run Terraform

```bash
# Check in correct region
aws ec2 describe-instances \
  --region ap-southeast-2 \
  --filters "Name=tag:Name,Values=gmgn-server" \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name,PublicIpAddress]' \
  --output table

# Start instance if stopped
aws ec2 start-instances \
  --instance-ids i-08e4538986a6d8534 \
  --region ap-southeast-2
```

#### 4. SSH Connection Timeout

**Error**: `ssh: connect to host 54.79.43.184 port 22: Operation timed out`

**Solutions**:

1. **Check instance is running** (see issue #3 above)

2. **Update security group with your current IP**:
```bash
cd terraform
echo "your_ip = \"$(curl -s https://checkip.amazonaws.com)/32\"" > terraform.tfvars
terraform apply -auto-approve
```

3. **Verify SSH key permissions**:
```bash
chmod 400 ~/.ssh/gmgn-key
ls -la ~/.ssh/gmgn-key
```

#### 5. Backend Build Errors in GitHub Actions

**Errors**:
```
error TS2580: Cannot find name 'process'
error TS2584: Cannot find name 'console'
```

**Status**: ✅ **Already fixed** in `backend/tsconfig.json` with:
- `@types/node` installed
- `compilerOptions.types: ["node"]`

If you still see this, run:
```bash
cd backend
npm install --save-dev @types/node
```

#### 6. Docker Containers Not Running on EC2

**Check**:
```bash
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184

# Check containers
docker ps

# If no containers:
cd ~
docker-compose up -d

# View logs
docker-compose logs -f
```

**If docker-compose.yml is missing**, recreate it:
```bash
cat > ~/docker-compose.yml << 'EOF'
version: '3.8'

services:
  backend:
    image: peterweb3/gmgn-backend:latest
    container_name: gmgn-backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - PORT=4000
      - CORS_ORIGIN=http://54.79.43.184
    restart: unless-stopped

  frontend:
    image: peterweb3/gmgn-frontend:latest
    container_name: gmgn-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
EOF

docker-compose up -d
```

### Useful Commands

**Check container status:**
```bash
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 "docker-compose ps"
```

**View logs:**
```bash
# Backend logs
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 "docker logs gmgn-backend --tail 100 -f"

# Frontend logs
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 "docker logs gmgn-frontend --tail 100 -f"

# All logs
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 "docker-compose logs -f"
```

**Restart containers:**
```bash
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 "cd ~ && docker-compose restart"
```

**Force rebuild and redeploy:**
```bash
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 \
  "cd ~ && docker-compose down && docker-compose pull && docker-compose up -d"
```

**View cloud-init logs (user data script):**
```bash
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 "sudo cat /var/log/cloud-init-output.log"
```

## 💰 Cost

**Free Tier Eligible:**
- ✅ EC2 t2.micro (750 hours/month free for 12 months)
- ✅ 1 Elastic IP (free when attached to running instance)
- ✅ 30 GB storage
- ✅ Docker Hub (free for public images)
- ✅ GitHub Actions (2000 minutes/month free)

**After Free Tier:**
- EC2 t2.micro: ~$8-10/month
- Elastic IP: $0.005/hour when NOT attached (~$3.60/month)
- Always keep instance running to avoid Elastic IP charges

## 🗑️ Cleanup

To destroy all AWS resources:

```bash
cd terraform
terraform destroy -auto-approve
```

This will:
- Terminate EC2 instance
- Delete Elastic IP
- Remove Security Group
- Stop all charges

## 📝 Manual Updates

If you need to change the Elastic IP or infrastructure:

1. Update `terraform/terraform.tfvars`
2. Run `terraform apply`
3. Push any code change to trigger new deployment with updated IP

## 🔐 Security Notes

- SSH access is restricted to your IP only (set in terraform.tfvars)
- HTTP ports (80, 4000) are open to the internet
- For production, add HTTPS with Let's Encrypt
- Rotate AWS credentials regularly
- Use AWS Secrets Manager for sensitive data

## 📚 Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Docker Hub](https://hub.docker.com/u/peterweb3)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [AWS Free Tier](https://aws.amazon.com/free/)

## ❓ FAQ

**Q: Will my IP address change?**
A: No, we use an Elastic IP which is permanent.

**Q: Do I need to manually set EC2_HOST secret?**
A: No, the workflow automatically reads it from Terraform.

**Q: How often are containers updated?**
A: On every push to `main` branch.

**Q: Can I use a custom domain?**
A: Yes, point your domain's A record to the Elastic IP and update CORS settings.

**Q: Is this production-ready?**
A: For learning yes, for production add: HTTPS, environment secrets, monitoring, backups.

