# 🚀 Gamesta Deployment Guide

This guide covers how to deploy your Gamesta gaming fest platform to GitHub Pages using automated CI/CD.

## 📋 Prerequisites

- GitHub account
- Git installed locally
- Node.js 18+ installed
- Your project repository on GitHub

## 🔧 Setup Instructions

### 1. Repository Configuration

1. **Create a GitHub repository** named `Gamesta` (or update the base path in `vite.config.ts`)
2. **Push your code** to the `main` branch
3. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Source: "GitHub Actions"

### 2. Automatic Deployment (Recommended)

The project includes a GitHub Actions workflow that automatically:
- ✅ Builds the project on every push to `main`
- ✅ Runs linting checks
- ✅ Deploys to GitHub Pages
- ✅ Optimizes build for production

**No additional setup required!** Just push to `main` branch.

### 3. Manual Deployment (Optional)

For manual deployment, install dependencies and run:

```bash
# Install dependencies
npm install

# Build and deploy manually
npm run deploy
```

## 🌐 Access Your Deployed Site

After successful deployment, your site will be available at:
```
https://[your-username].github.io/Gamesta/
```

## 📁 Project Structure

```
.github/
  workflows/
    deploy.yml          # GitHub Actions CI/CD workflow
src/
  components/           # React components
  contexts/            # React Context providers
  ...
vite.config.ts         # Vite configuration with GitHub Pages setup
package.json           # Dependencies and scripts
```

## 🔄 Workflow Features

- **Automated Testing**: Runs ESLint checks
- **Build Optimization**: Chunks vendor libraries for better caching
- **Production Ready**: Optimized builds with proper asset handling
- **Error Handling**: Fails deployment if build errors occur
- **Concurrent Safety**: Prevents conflicting deployments

## 🐛 Troubleshooting

### Common Issues:

1. **404 on deployed site**: Check that `base` path in `vite.config.ts` matches your repository name

2. **Build failures**: Check the Actions tab in your GitHub repository for detailed error logs

3. **Assets not loading**: Ensure all imports use relative paths

4. **Routing issues**: GitHub Pages serves static files, so client-side routing may need configuration

### Quick Fixes:

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Test build locally
npm run build
npm run preview
```

## 📊 Performance Optimizations

The deployment includes:
- Code splitting for vendor libraries
- Asset optimization
- Source map removal in production
- Automatic dependency caching in CI

## 🔄 Updates and Maintenance

1. **Automatic Updates**: Push to `main` branch triggers deployment
2. **Manual Updates**: Use `npm run deploy` for immediate deployment
3. **Monitoring**: Check GitHub Actions for deployment status

---

**🎮 Happy Gaming!** Your Gamesta platform is now ready for the world to experience!
