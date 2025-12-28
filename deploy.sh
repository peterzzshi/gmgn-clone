#!/bin/bash

# GMGN Clone - Quick Deployment Script for GitHub Pages
# This script helps you deploy your application to GitHub Pages step by step

set -e  # Exit on error

echo "🚀 GMGN Clone - GitHub Pages Deployment Script"
echo "================================================"
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if git is initialized
if [ ! -d .git ]; then
    print_info "Initializing git repository..."
    git init
    print_success "Git repository initialized"
else
    print_success "Git repository already initialized"
fi

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    print_warning "You have uncommitted changes"
    read -p "Do you want to commit all changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_msg
        git commit -m "$commit_msg"
        print_success "Changes committed"
    fi
else
    print_success "No uncommitted changes"
fi

# Check if remote is set
if ! git remote get-url origin &> /dev/null; then
    print_info "Setting up GitHub remote..."
    echo "Your GitHub repository URL should be: https://github.com/peterzzshi/gmgn-clone.git"
    read -p "Is this correct? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote add origin https://github.com/peterzzshi/gmgn-clone.git
        print_success "Remote added"
    else
        read -p "Enter your GitHub repository URL: " repo_url
        git remote add origin "$repo_url"
        print_success "Remote added"
    fi
else
    print_success "GitHub remote already configured: $(git remote get-url origin)"
fi

# Ask about backend deployment
echo ""
print_info "Backend Deployment"
echo "Your backend needs to be deployed separately (GitHub Pages only hosts static files)"
echo ""
echo "Recommended options:"
echo "  1. Render.com (Free tier available)"
echo "  2. Railway.app (Free $5 credit/month)"
echo "  3. Heroku (Paid)"
echo ""
read -p "Have you deployed your backend? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please deploy your backend first!"
    print_info "See GITHUB_PAGES_DEPLOYMENT.md for instructions"
    exit 1
fi

read -p "Enter your backend URL (e.g., https://gmgn-backend.onrender.com): " backend_url

if [ -z "$backend_url" ]; then
    print_error "Backend URL is required"
    exit 1
fi

# Update the GitHub Actions workflow with backend URL
print_info "Updating GitHub Actions workflow with backend URL..."
sed -i.bak "s|VITE_API_URL:.*|VITE_API_URL: ${backend_url}/api|" .github/workflows/deploy.yml
rm .github/workflows/deploy.yml.bak 2>/dev/null || true
print_success "Workflow updated"

# Commit the workflow change
git add .github/workflows/deploy.yml
git commit -m "Update backend API URL for deployment" || print_info "No changes to commit"

# Push to GitHub
echo ""
print_info "Pushing to GitHub..."
git branch -M main
git push -u origin main

print_success "Code pushed to GitHub!"

# Final instructions
echo ""
echo "================================================"
print_success "Setup Complete!"
echo "================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Go to: https://github.com/peterzzshi/gmgn-clone"
echo "2. Click 'Settings' → 'Pages'"
echo "3. Under 'Source', select 'GitHub Actions'"
echo "4. Wait for deployment (check 'Actions' tab)"
echo "5. Your site will be live at: https://peterzzshi.github.io/gmgn-clone/"
echo ""
print_info "Check deployment status: https://github.com/peterzzshi/gmgn-clone/actions"
echo ""
print_success "Happy deploying! 🎉"

