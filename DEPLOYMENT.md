# Deployment & Development Guide

Complete guide for deploying to AWS EC2 and local development setup.

## 📋 Quick Start

### Local Development

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**With Docker:**
```bash
docker-compose up -d
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000/api

---

## ☁️ AWS Deployment Overview

- **Frontend**: React + Vite (containerised with nginx)
- **Backend**: Node.js + Express (containerised)
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

| Secret Name             | Value                  | How to Get                               |
|-------------------------|------------------------|------------------------------------------|
| `DOCKER_PASSWORD`       | Docker Hub password    | https://hub.docker.com/settings/security |
| `EC2_SSH_KEY`           | Private key content    | `cat ~/.ssh/gmgn-key` (entire output)    |
| `AWS_ACCESS_KEY_ID`     | `AKIA5Z5A6X34A26DDX7R` | ⚠️ Optional (see note below)             |
| `AWS_SECRET_ACCESS_KEY` | Your IAM secret key    | ⚠️ Optional (see note below)             |

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

Use the deployment helper for automated diagnostics and fixes:

```bash
# Run comprehensive diagnostics
./deployment-helper.sh diagnose

# Fix specific issues
./deployment-helper.sh fix-ssh      # Fix SSH connectivity
./deployment-helper.sh fix-cors     # Fix CORS configuration
./deployment-helper.sh verify       # Verify deployment
./deployment-helper.sh restart      # Restart containers
./deployment-helper.sh logs         # View container logs
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
git commit --allow-empty -m "Rebuild with correct API URL"
git push origin main
```

#### 2. CORS Errors in Browser

**Symptoms:**
```
Access to XMLHttpRequest ... blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present
```

**Cause**: Backend not configured to allow frontend origin

**Solution**:
```bash
./deployment-helper.sh fix-cors
```

#### 3. SSH Connection Timeout

**Symptoms:**
```
ssh: connect to host 54.79.43.184 port 22: Operation timed out
```

**Cause**: Security group doesn't allow your IP

**Solution**:
```bash
./deployment-helper.sh fix-ssh
```

#### 4. GitHub Actions Fails: AWS Credentials Error

**Error:**
```
Error: 'aws-secret-access-key' must be provided if 'aws-access-key-id' is provided
```

**Solution**: Either remove `AWS_ACCESS_KEY_ID` from GitHub secrets, or add `AWS_SECRET_ACCESS_KEY`

#### 5. Docker Containers Not Running on EC2

**Check status:**
```bash
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 "docker ps"
```

**Fix:**
```bash
./deployment-helper.sh restart
```

### Verification Checklist

```bash
# 1. Check backend health
curl http://54.79.43.184:4000/api/health
# Expected: {"status":"ok","timestamp":"..."}

# 2. Check frontend
curl -I http://54.79.43.184
# Expected: HTTP/1.1 200 OK

# 3. Run full verification
./deployment-helper.sh verify
```

### Useful Commands

**View logs:**
```bash
./deployment-helper.sh logs  # Interactive log viewer
```

**Check container status:**
```bash
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 "docker-compose ps"
```

**Restart containers:**
```bash
./deployment-helper.sh restart
```

**Force rebuild:**
```bash
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 \
  "cd ~ && docker-compose down && docker-compose pull && docker-compose up -d"
```

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
- [AWS Free Tier](https://aws.amazon.com/free/)
