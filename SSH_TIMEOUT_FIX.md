# 🚨 SSH Timeout Fix Required

## Your Issue

GitHub Actions is failing with:
```
dial tcp 54.79.43.184:22: i/o timeout
```

This means GitHub Actions cannot SSH to your EC2 instance.

## Root Causes

1. **Security Group blocking GitHub Actions** - The security group may only allow SSH from your local IP
2. **Instance might be stopped** - The EC2 instance may not be running
3. **SSH key format issue** - The GitHub secret might not have the correct private key format

## ✅ Fixes Applied

I've updated the following files:

### 1. Security Group (terraform/main.tf)
- Added rule to allow SSH from 0.0.0.0/0 (needed for GitHub Actions)
- This allows GitHub Actions runners (which have dynamic IPs) to connect

### 2. GitHub Workflow (deploy-ec2.yml)
- Added connectivity check before SSH deployment
- Added timeout and command_timeout parameters
- This will help debug connection issues

## 🚀 Action Required (Do These Now)

### Step 1: Apply Terraform Changes

```bash
cd /Users/thaochinguyen/Desktop/gmgn-clone/terraform
terraform apply -auto-approve
```

This will update the security group to allow GitHub Actions to SSH in.

### Step 2: Verify Instance is Running

```bash
aws ec2 describe-instances \
  --instance-ids i-08e4538986a6d8534 \
  --region ap-southeast-2 \
  --query 'Reservations[0].Instances[0].State.Name' \
  --output text
```

**Expected**: `running`

**If stopped**, start it:
```bash
aws ec2 start-instances --instance-ids i-08e4538986a6d8534 --region ap-southeast-2
```

### Step 3: Verify GitHub Secret Format

The `EC2_SSH_KEY` secret must contain:
- ✅ The **private key** (not the .pub file)
- ✅ The **entire content** including BEGIN/END lines
- ✅ No extra spaces or newlines

**Get the correct format:**
```bash
cat ~/.ssh/gmgn-key
```

**Expected output format:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
... (many lines) ...
AAAEC1pzaGlAR0xMTi1JQlBUAQIDBA==
-----END OPENSSH PRIVATE KEY-----
```

Copy the **ENTIRE** output and update the GitHub secret:
https://github.com/peterzzshi/gmgn-clone/settings/secrets/actions

### Step 4: Run Diagnostic Script

```bash
cd /Users/thaochinguyen/Desktop/gmgn-clone
./fix-deployment.sh
```

This will check all the potential issues and help you fix them.

### Step 5: Commit and Push

Once the above is fixed:
```bash
cd /Users/thaochinguyen/Desktop/gmgn-clone
git add -A
git commit -m "Fix security group for GitHub Actions SSH access"
git push origin main
```

Monitor deployment: https://github.com/peterzzshi/gmgn-clone/actions

---

## ✅ Frontend API URL - Already Fixed!

The frontend configuration is **correct**:
- ✅ Frontend Dockerfile accepts `VITE_API_URL` build arg
- ✅ Workflow passes `VITE_API_URL=http://54.79.43.184:4000/api`
- ✅ Frontend code uses `import.meta.env.VITE_API_URL`

**The frontend will work correctly AFTER:**
1. Security group is fixed
2. GitHub Actions can successfully deploy
3. New Docker image is built and deployed

---

## 🔍 Verification

After applying fixes and redeploying:

### 1. Check Connectivity Test in GitHub Actions
Look for this in the workflow logs:
```
✅ Port 22 is open
```

### 2. Check SSH Deployment Succeeds
The deployment step should complete without timeout.

### 3. Verify Frontend API URL
Once deployed, check in browser console:
```bash
# Should call http://54.79.43.184:4000/api
# NOT http://localhost:4000/api
```

### 4. Test Backend
```bash
curl http://54.79.43.184:4000/api/health
```

### 5. Test Frontend
```bash
open http://54.79.43.184
```

---

## 📋 Checklist

- [ ] Run `terraform apply` to update security group
- [ ] Verify EC2 instance is running
- [ ] Verify `EC2_SSH_KEY` GitHub secret has correct format
- [ ] Run `./fix-deployment.sh` to diagnose issues
- [ ] Commit and push to trigger deployment
- [ ] Monitor GitHub Actions (should succeed now)
- [ ] Test frontend connects to correct API URL
- [ ] Verify no more `ERR_CONNECTION_REFUSED` errors

---

## 🆘 Still Having Issues?

### Issue: Security group update doesn't help
**Check**: AWS console → EC2 → Security Groups → gmgn-security-group
**Verify**: Port 22 has inbound rule from 0.0.0.0/0

### Issue: Instance keeps stopping
**Check**: Instance might have been terminated
**Fix**: Re-run `terraform apply` to recreate it

### Issue: SSH key still doesn't work
**Check**: GitHub secret format
**Fix**: Delete and recreate the secret with correct format (no spaces/newlines)

### Issue: Frontend still uses localhost
**Wait**: After successful deployment, hard refresh browser (Cmd+Shift+R)
**Clear**: Browser cache and cookies

---

## 💡 Why This Happened

1. **Security Group**: Initially configured to only allow SSH from your local IP for security
2. **GitHub Actions IPs**: GitHub Actions runners have dynamic IPs, so they need 0.0.0.0/0 access
3. **Frontend**: Was built before infrastructure was ready, so it used localhost fallback

**Now fixed**: Security group allows GitHub Actions, workflow builds frontend with correct IP!

---

Ready to fix? Run the steps above! 🚀

