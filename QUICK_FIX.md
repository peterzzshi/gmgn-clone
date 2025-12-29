# GMGN Clone - Deployment Status & Quick Fixes

## 🚨 Current Issues

Based on your deployment attempt to Render.com, you're experiencing:

1. ❌ GitHub Actions failing with: `'aws-secret-access-key' must be provided`
2. ❌ Frontend showing: `GET http://localhost:4000/api net::ERR_CONNECTION_REFUSED`
3. ❌ Cannot see EC2 instance in AWS console

## ✅ Your Infrastructure (from Terraform state)

- **Elastic IP**: `54.79.43.184` (permanent - doesn't change!)
- **Instance ID**: `i-08e4538986a6d8534`
- **Region**: `ap-southeast-2` (Sydney, Australia)
- **AWS Account**: `9489-8846-0792`
- **IAM Access Key**: `AKIA5Z5A6X34A26DDX7R`

## 🔧 IMMEDIATE FIXES (Do These Now)

### Fix 1: Check if EC2 Instance is Running

```bash
# Method A: Check via AWS CLI
aws ec2 describe-instances \
  --instance-ids i-08e4538986a6d8534 \
  --region ap-southeast-2 \
  --query 'Reservations[0].Instances[0].State.Name' \
  --output text
```

**Expected**: `running`
**If stopped**: Run below to start it
**If empty/error**: Instance might be terminated, need to recreate

```bash
# Start the instance if stopped
aws ec2 start-instances --instance-ids i-08e4538986a6d8534 --region ap-southeast-2

# Wait 30 seconds for it to start
sleep 30
```

**Method B: Check in AWS Console**
- Go to: https://ap-southeast-2.console.aws.amazon.com/ec2/home?region=ap-southeast-2#Instances:
- Look for instance named "gmgn-server"
- If stopped, click Actions → Instance State → Start

### Fix 2: Fix GitHub Actions (Choose One Option)

**Option A (Recommended - Simpler):**
Remove AWS credentials from GitHub secrets - the workflow will use Terraform state from Git.

1. Go to: https://github.com/peterzzshi/gmgn-clone/settings/secrets/actions
2. Delete `AWS_ACCESS_KEY_ID` secret
3. Delete `AWS_SECRET_ACCESS_KEY` secret if it exists
4. Keep only:
   - `DOCKER_PASSWORD` (required)
   - `EC2_SSH_KEY` (required)

**Option B:**
Add the missing secret:

1. Go to: https://github.com/peterzzshi/gmgn-clone/settings/secrets/actions
2. Click "New repository secret"
3. Name: `AWS_SECRET_ACCESS_KEY`
4. Value: Your IAM user's secret access key (from when you created the IAM user)

### Fix 3: Ensure SSH Key Exists

```bash
# Check if SSH key exists
ls -la ~/.ssh/gmgn-key

# If missing, create it:
ssh-keygen -t rsa -b 4096 -f ~/.ssh/gmgn-key -N ""
chmod 400 ~/.ssh/gmgn-key

# Import to AWS
aws ec2 import-key-pair \
  --key-name gmgn-key \
  --public-key-material fileb://~/.ssh/gmgn-key.pub \
  --region ap-southeast-2
```

### Fix 4: Add EC2_SSH_KEY to GitHub Secrets

```bash
# Get the private key content
cat ~/.ssh/gmgn-key
```

1. Copy the **ENTIRE** output (including `-----BEGIN...` and `-----END...` lines)
2. Go to: https://github.com/peterzzshi/gmgn-clone/settings/secrets/actions
3. Create/update `EC2_SSH_KEY` secret with this content

### Fix 5: Test SSH Connection

```bash
# Try to SSH
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184

# If connection timeout, update security group:
cd terraform
echo "your_ip = \"$(curl -s https://checkip.amazonaws.com)/32\"" > terraform.tfvars
terraform apply -auto-approve
```

### Fix 6: Verify/Start Docker Containers

```bash
# SSH to EC2
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184

# Check containers
docker ps

# If no containers running:
cd ~
docker-compose up -d

# Check logs
docker-compose logs -f
```

### Fix 7: Rebuild Frontend with Correct API URL

The frontend must be rebuilt with the EC2 IP address, not localhost.

**Method A (Automated - Recommended):**
```bash
cd /Users/thaochinguyen/Desktop/gmgn-clone

# After fixing GitHub secrets above, trigger deployment
git commit --allow-empty -m "Trigger deployment with correct API URL"
git push origin main

# Monitor at: https://github.com/peterzzshi/gmgn-clone/actions
```

**Method B (Manual):**
```bash
cd /Users/thaochinguyen/Desktop/gmgn-clone

# Build frontend with correct API URL
docker build \
  --build-arg VITE_API_URL=http://54.79.43.184:4000/api \
  -t peterweb3/gmgn-frontend:latest \
  ./frontend

# Login to Docker Hub
docker login -u peterweb3

# Push
docker push peterweb3/gmgn-frontend:latest

# Deploy to EC2
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 \
  "cd ~ && docker-compose pull && docker-compose up -d"
```

## ✅ Verification Steps

After completing the fixes above, verify everything works:

```bash
# 1. Check backend health
curl http://54.79.43.184:4000/api/health

# Expected: {"status":"ok","timestamp":"..."}

# 2. Check frontend
curl -I http://54.79.43.184

# Expected: HTTP/1.1 200 OK

# 3. Open in browser
open http://54.79.43.184
```

## 📊 Expected Results After Fixes

- ✅ EC2 instance is running
- ✅ Can SSH to `54.79.43.184`
- ✅ Backend responds at: http://54.79.43.184:4000/api/health
- ✅ Frontend loads at: http://54.79.43.184
- ✅ Frontend connects to backend (no localhost errors)
- ✅ GitHub Actions can deploy successfully

## 🎯 Understanding Your Deployment

### Your Elastic IP is PERMANENT: 54.79.43.184

This IP address will **NEVER** change, even if you:
- Stop/start the EC2 instance
- Reboot the server
- Redeploy with Terraform

This is different from Render.com which gives you dynamic URLs.

### Deployment Flow

```
Local Machine                  GitHub Actions                 AWS EC2
     │                              │                            │
     ├─ Push to main ──────────────>│                            │
     │                              │                            │
     │                              ├─ Read Terraform state      │
     │                              │  (get IP: 54.79.43.184)   │
     │                              │                            │
     │                              ├─ Build Docker images       │
     │                              │  with API_URL=http://      │
     │                              │  54.79.43.184:4000/api    │
     │                              │                            │
     │                              ├─ Push to Docker Hub        │
     │                              │                            │
     │                              ├─ SSH to EC2 ──────────────>│
     │                              │                            │
     │                              │                            ├─ Pull images
     │                              │                            ├─ Restart containers
     │                              │                            │
     │<────────────── Access: http://54.79.43.184 ──────────────>│
```

## 📞 Quick Commands Reference

```bash
# Check instance status
aws ec2 describe-instances --instance-ids i-08e4538986a6d8534 --region ap-southeast-2

# Start instance
aws ec2 start-instances --instance-ids i-08e4538986a6d8534 --region ap-southeast-2

# SSH to server
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184

# View logs on server
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 "docker-compose logs -f"

# Restart containers
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184 "cd ~ && docker-compose restart"

# Check Terraform state
cd terraform && terraform output
```

## 📚 Documentation

- **Complete Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Terraform**: [terraform/README.md](./terraform/README.md)
- **Main README**: [README.md](./README.md)

## 🆘 Still Having Issues?

Run the diagnostic script:
```bash
./diagnose.sh
```

Or check each component manually:
1. Terraform state: `cd terraform && terraform output`
2. AWS instance: Check EC2 console in ap-southeast-2
3. GitHub secrets: https://github.com/peterzzshi/gmgn-clone/settings/secrets/actions
4. Docker images: https://hub.docker.com/u/peterweb3
5. GitHub Actions: https://github.com/peterzzshi/gmgn-clone/actions

