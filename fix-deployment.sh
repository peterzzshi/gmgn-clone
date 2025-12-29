#!/bin/bash
# Fix SSH connectivity and verify frontend configuration

set -e

echo "🔍 Diagnosing deployment issues..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

EC2_IP="54.79.43.184"
INSTANCE_ID="i-08e4538986a6d8534"

echo "1️⃣  Checking EC2 instance state..."
INSTANCE_STATE=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --region ap-southeast-2 \
  --query 'Reservations[0].Instances[0].State.Name' \
  --output text 2>/dev/null || echo "error")

if [ "$INSTANCE_STATE" = "running" ]; then
    echo -e "${GREEN}✅ Instance is running${NC}"
elif [ "$INSTANCE_STATE" = "stopped" ]; then
    echo -e "${YELLOW}⚠️  Instance is stopped. Starting...${NC}"
    aws ec2 start-instances --instance-ids $INSTANCE_ID --region ap-southeast-2
    echo "Waiting 30 seconds for instance to start..."
    sleep 30
    INSTANCE_STATE="running"
elif [ "$INSTANCE_STATE" = "error" ]; then
    echo -e "${RED}❌ Cannot query instance (check AWS credentials)${NC}"
else
    echo -e "${RED}❌ Instance state: $INSTANCE_STATE${NC}"
fi
echo ""

echo "2️⃣  Checking security group..."
SG_ID=$(aws ec2 describe-instances \
  --instance-ids $INSTANCE_ID \
  --region ap-southeast-2 \
  --query 'Reservations[0].Instances[0].SecurityGroups[0].GroupId' \
  --output text 2>/dev/null || echo "")

if [ -n "$SG_ID" ]; then
    echo "Security Group ID: $SG_ID"

    # Check if SSH is open to 0.0.0.0/0
    SSH_OPEN=$(aws ec2 describe-security-groups \
      --group-ids $SG_ID \
      --region ap-southeast-2 \
      --query 'SecurityGroups[0].IpPermissions[?FromPort==`22`].IpRanges[?CidrIp==`0.0.0.0/0`]' \
      --output text 2>/dev/null)

    if [ -n "$SSH_OPEN" ]; then
        echo -e "${GREEN}✅ SSH is open to all IPs (0.0.0.0/0)${NC}"
    else
        echo -e "${YELLOW}⚠️  SSH is NOT open to all IPs${NC}"
        echo "Updating security group with Terraform..."
        cd terraform
        terraform apply -auto-approve
        cd ..
    fi
else
    echo -e "${RED}❌ Cannot get security group${NC}"
fi
echo ""

echo "3️⃣  Testing SSH connectivity..."
if timeout 5 nc -zv $EC2_IP 22 2>&1 | grep -q succeeded; then
    echo -e "${GREEN}✅ Port 22 is accessible${NC}"
else
    echo -e "${RED}❌ Cannot connect to port 22${NC}"
    echo ""
    echo "Possible issues:"
    echo "1. Security group doesn't allow your IP"
    echo "2. Instance is still starting up"
    echo "3. SSH service isn't running"
    echo ""
    echo "Solutions:"
    echo "- Update security group: cd terraform && terraform apply"
    echo "- Wait 2-3 minutes if instance just started"
    echo "- Check instance system logs in AWS console"
fi
echo ""

echo "4️⃣  Testing SSH key..."
if [ -f ~/.ssh/gmgn-key ]; then
    echo -e "${GREEN}✅ SSH key exists at ~/.ssh/gmgn-key${NC}"

    # Check permissions
    PERMS=$(stat -f "%OLp" ~/.ssh/gmgn-key 2>/dev/null || stat -c "%a" ~/.ssh/gmgn-key 2>/dev/null)
    if [ "$PERMS" = "400" ] || [ "$PERMS" = "600" ]; then
        echo -e "${GREEN}✅ SSH key permissions are correct ($PERMS)${NC}"
    else
        echo -e "${YELLOW}⚠️  SSH key permissions are $PERMS, should be 400${NC}"
        chmod 400 ~/.ssh/gmgn-key
        echo "Fixed permissions to 400"
    fi

    # Try SSH
    echo ""
    echo "Testing SSH connection..."
    if timeout 10 ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i ~/.ssh/gmgn-key ubuntu@$EC2_IP "echo 'SSH connection successful'" 2>&1; then
        echo -e "${GREEN}✅ SSH connection works!${NC}"
    else
        echo -e "${RED}❌ SSH connection failed${NC}"
    fi
else
    echo -e "${RED}❌ SSH key not found at ~/.ssh/gmgn-key${NC}"
fi
echo ""

echo "5️⃣  Checking GitHub Secret format..."
echo "The EC2_SSH_KEY secret should contain:"
echo "- The PRIVATE key (not the .pub file)"
echo "- The ENTIRE content including BEGIN/END lines"
echo "- No extra spaces or newlines"
echo ""
echo "To update GitHub secret, copy this command output:"
echo -e "${YELLOW}cat ~/.ssh/gmgn-key${NC}"
echo ""
echo "Then paste at: https://github.com/peterzzshi/gmgn-clone/settings/secrets/actions"
echo ""

echo "6️⃣  Checking frontend Docker image build..."
echo "The frontend should be built with:"
echo "  VITE_API_URL=http://$EC2_IP:4000/api"
echo ""
echo "Current workflow configuration:"
grep -A 2 "VITE_API_URL" .github/workflows/deploy-ec2.yml || echo "Not found in workflow"
echo ""

echo "📋 Summary"
echo "=========="
echo "Instance ID: $INSTANCE_ID"
echo "Instance State: $INSTANCE_STATE"
echo "Elastic IP: $EC2_IP"
echo "Security Group: $SG_ID"
echo ""

echo "💡 Next Steps:"
echo "1. Ensure instance is running (check above)"
echo "2. Update security group: cd terraform && terraform apply -auto-approve"
echo "3. Verify GitHub secrets are correct:"
echo "   - DOCKER_PASSWORD"
echo "   - EC2_SSH_KEY (content of ~/.ssh/gmgn-key)"
echo "4. Push to trigger deployment: git push origin main"
echo ""

