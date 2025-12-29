terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  default     = "ap-southeast-2"
}

variable "instance_name" {
  description = "Name for EC2 instance"
  default     = "gmgn-server"
}

variable "key_name" {
  description = "SSH key pair name"
  default     = "gmgn-key"
}

variable "your_ip" {
  description = "Your IP address for SSH access (format: x.x.x.x/32)"
  type        = string
}

# Get latest Ubuntu 22.04 AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Security Group
resource "aws_security_group" "gmgn_sg" {
  name        = "gmgn-security-group"
  description = "Security group for GMGN Clone app"

  # SSH from your IP
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.your_ip]
    description = "SSH from your IP"
  }

  # SSH from GitHub Actions (needed for deployment)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH from anywhere (for GitHub Actions deployment)"
  }

  # HTTP
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP from anywhere"
  }

  # HTTPS
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS from anywhere"
  }

  # Backend API
  ingress {
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Backend API"
  }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "gmgn-security-group"
  }
}

# Elastic IP (persistent IP address)
resource "aws_eip" "gmgn_eip" {
  domain   = "vpc"
  instance = aws_instance.gmgn_server.id

  tags = {
    Name = "gmgn-elastic-ip"
  }
}

# EC2 Instance
resource "aws_instance" "gmgn_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t2.micro"
  key_name      = var.key_name

  vpc_security_group_ids = [aws_security_group.gmgn_sg.id]

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              set -e

              # Update system
              apt-get update
              apt-get upgrade -y

              # Install Docker
              curl -fsSL https://get.docker.com | sh
              usermod -aG docker ubuntu

              # Install Docker Compose
              curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
              chmod +x /usr/local/bin/docker-compose

              # Get EC2 public IP
              EC2_IP=$(curl -s http://checkip.amazonaws.com)

              # Create docker-compose.yml
              cat > /home/ubuntu/docker-compose.yml << 'DOCKEREOF'
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
                    - CORS_ORIGIN=http://EC2_IP_PLACEHOLDER,http://EC2_IP_PLACEHOLDER:80
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
              DOCKEREOF

              # Replace placeholder with actual IP
              sed -i "s/EC2_IP_PLACEHOLDER/$EC2_IP/g" /home/ubuntu/docker-compose.yml

              # Set ownership
              chown ubuntu:ubuntu /home/ubuntu/docker-compose.yml

              # Pull images and start containers
              cd /home/ubuntu

              # Wait for Docker to be fully ready
              sleep 10

              # Pull latest images (these should have correct API URL after GitHub Actions builds them)
              docker pull peterweb3/gmgn-backend:latest
              docker pull peterweb3/gmgn-frontend:latest

              # Start containers
              docker-compose up -d

              # Create update script
              cat > /home/ubuntu/update.sh << 'UPDATEEOF'
              #!/bin/bash
              cd /home/ubuntu
              docker-compose pull
              docker-compose up -d
              docker image prune -f
              echo "Update completed!"
              UPDATEEOF

              chmod +x /home/ubuntu/update.sh
              chown ubuntu:ubuntu /home/ubuntu/update.sh

              echo "Deployment completed!"
              EOF

  tags = {
    Name = var.instance_name
  }
}

# Outputs
output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.gmgn_server.id
}

output "instance_public_ip" {
  description = "Elastic IP address of the EC2 instance (PERMANENT)"
  value       = aws_eip.gmgn_eip.public_ip
}

output "frontend_url" {
  description = "Frontend URL"
  value       = "http://${aws_eip.gmgn_eip.public_ip}"
}

output "backend_url" {
  description = "Backend API URL"
  value       = "http://${aws_eip.gmgn_eip.public_ip}:4000/api"
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_eip.gmgn_eip.public_ip}"
}

