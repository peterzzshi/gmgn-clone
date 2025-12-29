#!/bin/bash
# Fix CORS issue by updating docker-compose.yml on EC2

set -e

EC2_IP="54.79.43.184"
SSH_KEY="~/.ssh/gmgn-key"

echo "🔧 Fixing CORS configuration on EC2..."
echo ""

# SSH to EC2 and update docker-compose.yml
ssh -i $SSH_KEY ubuntu@$EC2_IP << 'ENDSSH'
cd ~

echo "Creating updated docker-compose.yml with correct CORS_ORIGIN..."

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

echo "✅ Updated docker-compose.yml"
echo ""
echo "Restarting containers..."

# Restart containers to apply new configuration
docker-compose down
docker-compose up -d

echo ""
echo "✅ Containers restarted with new CORS configuration"
echo ""
echo "Container status:"
docker-compose ps

ENDSSH

echo ""
echo "✅ CORS fix applied!"
echo ""
echo "Test the backend:"
echo "curl http://$EC2_IP:4000/api/health"
echo ""
echo "Test in browser:"
echo "open http://$EC2_IP"
echo ""

