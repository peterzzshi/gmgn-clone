# GitHub Actions Workflows

This directory contains automated workflows for the GMGN Clone project.

## docker-build.yml

Automatically builds Docker images and pushes them to Docker Hub when code is pushed to the `main` branch.

### Workflow Triggers

- Push to `main` branch
- Manual trigger via GitHub Actions UI (workflow_dispatch)

### What It Does

1. **Checkout Code**: Retrieves the latest code from the repository
2. **Set up Docker Buildx**: Prepares multi-platform Docker builds
3. **Login to Docker Hub**: Authenticates with peterweb3 account
4. **Build Backend Image**: Creates `peterweb3/gmgn-backend:latest`
5. **Build Frontend Image**: Creates `peterweb3/gmgn-frontend:latest`
6. **Push to Docker Hub**: Uploads images to Docker Hub registry

### Docker Images

Your images will be available at:
- Backend: `peterweb3/gmgn-backend:latest`
- Frontend: `peterweb3/gmgn-frontend:latest`

View at: https://hub.docker.com/u/peterweb3

### Required Secrets

Add this secret to your GitHub repository:

**Name**: `DOCKER_PASSWORD`
**Value**: Docker Hub access token

Get token from: https://hub.docker.com/settings/security
Add secret at: https://github.com/peterzzshi/gmgn-clone/settings/secrets/actions

### Monitoring Builds

View build status and logs:
- Go to: https://github.com/peterzzshi/gmgn-clone/actions
- Click the **Actions** tab
- Select the latest workflow run
- Click on job steps to view detailed logs

### Troubleshooting

**Build Fails:**
- Check the Actions logs for error messages
- Verify Dockerfiles are correct
- Test build locally: `docker build -t test ./backend`

**Login Fails:**
- Verify `DOCKER_PASSWORD` secret is set correctly
- Token should have Read, Write, Delete permissions
- Recreate token if needed

**Images Not on Docker Hub:**
- Ensure workflow completed successfully (green checkmark)
- Wait a few minutes after build completes
- Check Docker Hub: https://hub.docker.com/u/peterweb3

### Local Testing

Test Docker builds locally before pushing:

```bash
# Build backend
docker build -t peterweb3/gmgn-backend:latest ./backend

# Build frontend
docker build -t peterweb3/gmgn-frontend:latest ./frontend

# Test locally
docker-compose up
```

---

## Free Deployment Options

Since GitHub Pages and Docker Hub are free, here are your options:

### Option 1: Frontend on GitHub Pages + Backend on Free Tier (Recommended)

**Frontend (FREE):**
- Deploy static build to GitHub Pages
- Custom domain supported
- Automatic HTTPS

**Backend (FREE with limitations):**
- Render.com free tier (sleeps after 15 min)
- Railway free trial ($5 credit)
- Fly.io free tier (sleeps)

### Option 2: Self-Host on Free VPS

Use Oracle Cloud Always Free tier:
- 2 VM instances (ARM-based)
- 1GB RAM each
- Run Docker containers
- 100% FREE forever

See: `DEPLOYMENT_GUIDE.md` for instructions

---

For more information, see:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- Project documentation: `DOCKER_CLOUD_DEPLOYMENT.md`

