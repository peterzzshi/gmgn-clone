# GitHub Actions Workflows

This directory contains automated workflows for the GMGN Clone project.

## deploy.yml

Automatically builds and deploys the frontend to GitHub Pages when code is pushed to the `main` branch.

### Workflow Triggers

- Push to `main` branch
- Manual trigger via GitHub Actions UI (workflow_dispatch)

### What It Does

1. **Checkout Code**: Retrieves the latest code from the repository
2. **Setup Node.js**: Installs Node.js 20
3. **Install Dependencies**: Runs `npm ci` in the frontend directory
4. **Build Frontend**: Runs `npm run build` with production environment variables
5. **Upload Artifact**: Packages the built frontend for deployment
6. **Deploy to GitHub Pages**: Publishes the site to GitHub Pages

### Environment Variables

The workflow sets the following environment variable during build:

- `VITE_API_URL`: Backend API URL (default: https://gmgn-backend.onrender.com/api)

**⚠️ IMPORTANT**: Update this value with your actual backend URL!

### How to Update Backend URL

1. Open `.github/workflows/deploy.yml`
2. Find the `Build` step (around line 33)
3. Update the `VITE_API_URL` value:
   ```yaml
   env:
     VITE_API_URL: https://your-actual-backend-url.onrender.com/api
   ```
4. Commit and push:
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Update backend API URL"
   git push
   ```

### Monitoring Deployment

View deployment status and logs:
- Go to your repository on GitHub
- Click the **Actions** tab
- Select the latest workflow run
- Click on job steps to view detailed logs

### Troubleshooting

**Build Fails:**
- Check the Actions logs for error messages
- Verify all dependencies are in package.json
- Ensure TypeScript compiles without errors locally

**Deployment Fails:**
- Ensure GitHub Pages is enabled (Settings → Pages → Source: GitHub Actions)
- Check repository permissions
- Verify the artifact was uploaded successfully

**Site Not Loading:**
- Check if the base path in vite.config.ts matches your repo name
- Clear browser cache
- Wait 1-2 minutes for DNS propagation

### Local Testing Before Deploy

Test the production build locally:

```bash
cd frontend

# Build with production API URL
VITE_API_URL=https://your-backend-url.onrender.com/api npm run build

# Preview the production build
npm run preview
```

### Manual Deployment Alternative

If you prefer manual deployment:

```bash
cd frontend

# Build
npm run build

# Deploy using gh-pages
npm run deploy
```

## Permissions

The workflow requires these permissions:
- `contents: read` - Read repository contents
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - OIDC token for deployment

These are configured in the workflow file and should not need modification.

## Workflow Status Badge

Add this to your README.md to show deployment status:

```markdown
[![Deploy to GitHub Pages](https://github.com/peterzzshi/gmgn-clone/actions/workflows/deploy.yml/badge.svg)](https://github.com/peterzzshi/gmgn-clone/actions/workflows/deploy.yml)
```

---

For more information, see:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- Project documentation: `GITHUB_PAGES_DEPLOYMENT.md`

