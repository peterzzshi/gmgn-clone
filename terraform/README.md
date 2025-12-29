# Terraform AWS Deployment

Infrastructure as Code for deploying GMGN Clone to AWS EC2.

## 🌐 Current Deployment

- **Elastic IP**: `54.79.43.184` (permanent)
- **Instance ID**: `i-08e4538986a6d8534`
- **Region**: `ap-southeast-2` (Sydney, Australia)
- **Frontend**: http://54.79.43.184
- **Backend**: http://54.79.43.184:4000/api

## 🎯 What This Creates

- **EC2 Instance**: t2.micro (Free Tier eligible)
- **Elastic IP**: Permanent IP address (won't change on stop/start)
- **Security Group**: Firewall rules for SSH, HTTP, and API access
- **Auto-Setup**: Docker + Docker Compose + Containers

## 🚀 Quick Commands

### Check Infrastructure Status

```bash
# View outputs
terraform output

# Check instance state
aws ec2 describe-instances \
  --instance-ids i-08e4538986a6d8534 \
  --region ap-southeast-2 \
  --query 'Reservations[0].Instances[0].State.Name' \
  --output text
```

### Start/Stop Instance

```bash
# Start instance
aws ec2 start-instances --instance-ids i-08e4538986a6d8534 --region ap-southeast-2

# Stop instance
aws ec2 stop-instances --instance-ids i-08e4538986a6d8534 --region ap-southeast-2
```

### Update Your IP (if SSH blocked)

```bash
# Update terraform.tfvars with your current IP
echo "your_ip = \"$(curl -s https://checkip.amazonaws.com)/32\"" > terraform.tfvars

# Apply changes
terraform apply -auto-approve
```

### SSH to Instance

```bash
ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184
```

## 🔧 Complete Deployment (if needed)

### 1. Create SSH Key (if not exists)

```bash
# Create SSH key
ssh-keygen -t rsa -b 4096 -f ~/.ssh/gmgn-key -N ""
chmod 400 ~/.ssh/gmgn-key

# Import to AWS
aws ec2 import-key-pair \
  --key-name gmgn-key \
  --public-key-material fileb://~/.ssh/gmgn-key.pub \
  --region ap-southeast-2
```

### 2. Configure Variables

```bash
# Get your current IP
curl -s https://checkip.amazonaws.com

# Create terraform.tfvars
cat > terraform.tfvars << EOF
your_ip = "YOUR_IP_HERE/32"
EOF
```

### 3. Deploy Infrastructure

```bash
# Initialize (first time only)
terraform init

# Preview changes
terraform plan

# Deploy
terraform apply -auto-approve
```

**Expected Output:**
```
backend_url = "http://54.79.43.184:4000/api"
frontend_url = "http://54.79.43.184"
instance_id = "i-08e4538986a6d8534"
instance_public_ip = "54.79.43.184"
ssh_command = "ssh -i ~/.ssh/gmgn-key ubuntu@54.79.43.184"
```

## 📋 Variables

| Variable        | Default          | Description                                 |
|-----------------|------------------|---------------------------------------------|
| `aws_region`    | `ap-southeast-2` | AWS region (Sydney)                         |
| `instance_name` | `gmgn-server`    | EC2 instance name tag                       |
| `key_name`      | `gmgn-key`       | SSH key pair name                           |
| `your_ip`       | **Required**     | Your IP for SSH access (format: x.x.x.x/32) |

## 🗑️ Destroy Infrastructure

To delete all AWS resources:

```bash
terraform destroy -auto-approve
```

⚠️ This will:
- Terminate EC2 instance
- Delete Elastic IP
- Remove Security Group
- Stop all charges

## 💰 Cost

**Free Tier** (first 12 months):
- ✅ 750 hours/month EC2 t2.micro
- ✅ 1 Elastic IP (while attached to running instance)
- ✅ 30 GB storage

**After Free Tier**:
- EC2 t2.micro: ~$8-10/month
- Elastic IP: Free when attached, $3.60/month when unattached

**Recommendation**: Keep instance running to avoid Elastic IP charges.

## 📚 Files

- `main.tf` - Main Terraform configuration
- `terraform.tfvars` - Your configuration values
- `terraform.tfstate` - Current infrastructure state (DO NOT DELETE)

## 🔐 Security

- SSH access restricted to your IP only
- HTTP ports (80, 4000) open to internet
- HTTPS ready (port 443 open)
- Security group managed by Terraform

## 📖 More Information

See [DEPLOYMENT.md](../DEPLOYMENT.md) for complete deployment guide with GitHub Actions integration.

