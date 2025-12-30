#!/bin/bash
# GMGN Clone - Comprehensive Deployment Helper
# This script can diagnose issues, apply fixes, and verify deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EC2_IP="54.79.43.184"
INSTANCE_ID="i-08e4538986a6d8534"
AWS_REGION="ap-southeast-2"
SSH_KEY="~/.ssh/gmgn-key"

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to show usage
show_usage() {
    echo "GMGN Clone - Deployment Helper"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  diagnose      Run comprehensive diagnostics"
    echo "  fix-ssh       Fix SSH connectivity issues"
    echo "  fix-cors      Fix CORS configuration on EC2"
    echo "  verify        Verify deployment is working"
    echo "  start         Start the EC2 instance"
    echo "  restart       Restart Docker containers on EC2"
    echo "  logs          View container logs"
    echo "  help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 diagnose     # Check everything"
    echo "  $0 fix-cors     # Fix CORS issues"
    echo "  $0 logs         # View logs"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    print_section "Checking Prerequisites"

    local missing=0

    # Check AWS CLI
    if command -v aws &> /dev/null; then
        echo -e "${GREEN}✅ AWS CLI installed${NC}"
    else
        echo -e "${RED}❌ AWS CLI not found${NC}"
        echo "   Install: https://aws.amazon.com/cli/"
        missing=1
    fi

    # Check SSH key
    if [ -f ~/.ssh/gmgn-key ]; then
        echo -e "${GREEN}✅ SSH key exists${NC}"
        PERMS=$(stat -f "%OLp" ~/.ssh/gmgn-key 2>/dev/null || stat -c "%a" ~/.ssh/gmgn-key 2>/dev/null)
        if [ "$PERMS" = "400" ] || [ "$PERMS" = "600" ]; then
            echo -e "${GREEN}✅ SSH key permissions correct ($PERMS)${NC}"
        else
            echo -e "${YELLOW}⚠️  SSH key permissions are $PERMS, fixing to 400${NC}"
            chmod 400 ~/.ssh/gmgn-key
        fi
    else
        echo -e "${RED}❌ SSH key not found at ~/.ssh/gmgn-key${NC}"
        missing=1
    fi

    # Check Terraform
    if [ -f terraform/terraform.tfstate ]; then
        echo -e "${GREEN}✅ Terraform state found${NC}"
    else
        echo -e "${YELLOW}⚠️  Terraform state not found${NC}"
    fi

    return $missing
}

# Function to check EC2 instance
check_instance() {
    print_section "Checking EC2 Instance"

    INSTANCE_STATE=$(aws ec2 describe-instances \
        --instance-ids $INSTANCE_ID \
        --region $AWS_REGION \
        --query 'Reservations[0].Instances[0].State.Name' \
        --output text 2>/dev/null || echo "error")

    if [ "$INSTANCE_STATE" = "running" ]; then
        echo -e "${GREEN}✅ Instance is running${NC}"
        echo "   Instance ID: $INSTANCE_ID"
        echo "   Elastic IP: $EC2_IP"
        return 0
    elif [ "$INSTANCE_STATE" = "stopped" ]; then
        echo -e "${YELLOW}⚠️  Instance is stopped${NC}"
        return 1
    elif [ "$INSTANCE_STATE" = "error" ]; then
        echo -e "${RED}❌ Cannot query instance (check AWS credentials)${NC}"
        return 2
    else
        echo -e "${RED}❌ Instance state: $INSTANCE_STATE${NC}"
        return 2
    fi
}

# Function to start instance
start_instance() {
    print_section "Starting EC2 Instance"

    echo "Starting instance $INSTANCE_ID..."
    aws ec2 start-instances --instance-ids $INSTANCE_ID --region $AWS_REGION

    echo "Waiting for instance to start (30 seconds)..."
    sleep 30

    check_instance
}

# Function to check SSH connectivity
check_ssh() {
    print_section "Checking SSH Connectivity"

    # Check port is open
    if timeout 5 nc -zv $EC2_IP 22 2>&1 | grep -q succeeded; then
        echo -e "${GREEN}✅ Port 22 is accessible${NC}"
    else
        echo -e "${RED}❌ Cannot connect to port 22${NC}"
        return 1
    fi

    # Try SSH
    if timeout 10 ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i ~/.ssh/gmgn-key ubuntu@$EC2_IP "echo 'SSH OK'" &> /dev/null; then
        echo -e "${GREEN}✅ SSH connection successful${NC}"
        return 0
    else
        echo -e "${RED}❌ SSH connection failed${NC}"
        return 1
    fi
}

# Function to check Docker containers
check_containers() {
    print_section "Checking Docker Containers"

    CONTAINERS=$(ssh -o StrictHostKeyChecking=no -i ~/.ssh/gmgn-key ubuntu@$EC2_IP "docker ps --format '{{.Names}}' 2>/dev/null" || echo "")

    if echo "$CONTAINERS" | grep -q "gmgn-backend"; then
        echo -e "${GREEN}✅ Backend container running${NC}"
    else
        echo -e "${RED}❌ Backend container not running${NC}"
    fi

    if echo "$CONTAINERS" | grep -q "gmgn-frontend"; then
        echo -e "${GREEN}✅ Frontend container running${NC}"
    else
        echo -e "${RED}❌ Frontend container not running${NC}"
    fi

    if [ -z "$CONTAINERS" ]; then
        return 1
    fi

    return 0
}

# Function to check services
check_services() {
    print_section "Checking Services"

    # Backend health
    if curl -s -f "http://$EC2_IP:4000/api/health" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy${NC}"
        echo "   URL: http://$EC2_IP:4000/api/health"
    else
        echo -e "${RED}❌ Backend health check failed${NC}"
    fi

    # Frontend
    if curl -s -f "http://$EC2_IP" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend is accessible${NC}"
        echo "   URL: http://$EC2_IP"
    else
        echo -e "${RED}❌ Frontend is not accessible${NC}"
    fi
}

# Function to fix SSH
fix_ssh() {
    print_section "Fixing SSH Issues"

    echo "Updating security group with Terraform..."
    cd terraform

    # Get current IP
    CURRENT_IP=$(curl -s https://checkip.amazonaws.com)
    echo "Your current IP: $CURRENT_IP"
    echo "your_ip = \"$CURRENT_IP/32\"" > terraform.tfvars

    terraform apply -auto-approve
    cd ..

    echo -e "${GREEN}✅ Security group updated${NC}"
    echo ""
    echo "Waiting 10 seconds for changes to propagate..."
    sleep 10

    check_ssh
}

# Function to fix CORS
fix_cors() {
    print_section "Fixing CORS Configuration"

    echo "Connecting to EC2 and updating docker-compose.yml..."

    ssh -i ~/.ssh/gmgn-key ubuntu@$EC2_IP << 'ENDSSH'
cd ~

echo "Creating updated docker-compose.yml..."

cat > docker-compose.yml << 'EOF'
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
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    image: peterweb3/gmgn-frontend:latest
    container_name: gmgn-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

networks:
  default:
    name: gmgn-network
EOF

echo "Restarting containers..."
docker-compose down
docker-compose up -d

echo "✅ CORS configuration updated and containers restarted"
ENDSSH

    echo -e "${GREEN}✅ CORS fix applied${NC}"
}

# Function to restart containers
restart_containers() {
    print_section "Restarting Docker Containers"

    ssh -i ~/.ssh/gmgn-key ubuntu@$EC2_IP "cd ~ && docker-compose restart"

    echo -e "${GREEN}✅ Containers restarted${NC}"

    echo "Waiting 10 seconds for containers to start..."
    sleep 10

    check_containers
    check_services
}

# Function to view logs
view_logs() {
    print_section "Container Logs"

    echo "Select which logs to view:"
    echo "1. Backend logs"
    echo "2. Frontend logs"
    echo "3. All logs (follow mode)"
    echo "4. All logs (last 100 lines)"
    echo ""
    read -p "Enter choice (1-4): " choice

    case $choice in
        1)
            ssh -i ~/.ssh/gmgn-key ubuntu@$EC2_IP "docker logs gmgn-backend --tail 100 -f"
            ;;
        2)
            ssh -i ~/.ssh/gmgn-key ubuntu@$EC2_IP "docker logs gmgn-frontend --tail 100 -f"
            ;;
        3)
            ssh -i ~/.ssh/gmgn-key ubuntu@$EC2_IP "docker-compose logs -f"
            ;;
        4)
            ssh -i ~/.ssh/gmgn-key ubuntu@$EC2_IP "docker-compose logs --tail 100"
            ;;
        *)
            echo "Invalid choice"
            ;;
    esac
}

# Function to run diagnostics
run_diagnostics() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║       GMGN Clone - Deployment Diagnostics               ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    check_prerequisites
    check_instance

    if [ $? -ne 0 ]; then
        echo ""
        read -p "Instance is not running. Start it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            start_instance
        fi
    fi

    check_ssh
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${YELLOW}💡 Tip: Run '$0 fix-ssh' to fix SSH issues${NC}"
    fi

    check_containers
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${YELLOW}💡 Tip: Run '$0 restart' to start containers${NC}"
    fi

    check_services

    print_section "Summary"
    echo "Instance ID:  $INSTANCE_ID"
    echo "Elastic IP:   $EC2_IP"
    echo "Frontend:     http://$EC2_IP"
    echo "Backend:      http://$EC2_IP:4000/api"
    echo "SSH:          ssh -i ~/.ssh/gmgn-key ubuntu@$EC2_IP"
    echo ""
    echo "GitHub Actions: https://github.com/peterzzshi/gmgn-clone/actions"
    echo "GitHub Secrets: https://github.com/peterzzshi/gmgn-clone/settings/secrets/actions"
    echo ""
}

# Function to verify deployment
verify_deployment() {
    print_section "Verifying Deployment"

    local failed=0

    # Check backend health
    echo -n "Checking backend health... "
    if RESPONSE=$(curl -s "http://$EC2_IP:4000/api/health" 2>/dev/null); then
        if echo "$RESPONSE" | grep -q "ok"; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${RED}❌${NC}"
            failed=1
        fi
    else
        echo -e "${RED}❌${NC}"
        failed=1
    fi

    # Check frontend
    echo -n "Checking frontend... "
    if curl -s -f "http://$EC2_IP" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
    else
        echo -e "${RED}❌${NC}"
        failed=1
    fi

    # Check CORS headers
    echo -n "Checking CORS configuration... "
    if CORS_HEADER=$(curl -s -H "Origin: http://$EC2_IP" -I "http://$EC2_IP:4000/api/health" 2>/dev/null | grep -i "access-control-allow-origin"); then
        echo -e "${GREEN}✅${NC}"
        echo "   $CORS_HEADER"
    else
        echo -e "${YELLOW}⚠️${NC}"
        echo "   CORS headers not found (might be OK)"
    fi

    echo ""
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}✅ All checks passed!${NC}"
        echo ""
        echo "Your application is running at:"
        echo "  🌐 http://$EC2_IP"
    else
        echo -e "${RED}❌ Some checks failed${NC}"
        echo "Run '$0 diagnose' for more details"
    fi
}

# Main script logic
case "${1:-help}" in
    diagnose)
        run_diagnostics
        ;;
    fix-ssh)
        check_prerequisites
        fix_ssh
        ;;
    fix-cors)
        check_prerequisites
        fix_cors
        ;;
    verify)
        verify_deployment
        ;;
    start)
        check_prerequisites
        start_instance
        ;;
    restart)
        check_prerequisites
        restart_containers
        ;;
    logs)
        check_prerequisites
        view_logs
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        echo "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac

