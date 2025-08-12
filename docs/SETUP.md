# 🚀 Quick Setup Guide for GitHub Deployment

Follow these steps to deploy your Gamesta project to GitHub Pages:

## Step 1: Prepare Your Repository

1. **Create a new repository on GitHub** named `Gamesta`
2. **Make sure your local project has the correct base path**:
   - If your repository name is different, update `base: '/Gamesta/'` in `vite.config.ts`

## Step 2: Initialize Git and Push

```bash
# In your project directory
git init
git add .
git commit -m "🎮 Initial commit: Gamesta gaming fest platform"
git branch -M main
git remote add origin https://github.com/[YOUR_USERNAME]/Gamesta.git
git push -u origin main
```

## Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section
4. Under **Source**, select **"GitHub Actions"**
5. Save the settings

## Step 4: Automatic Deployment

That's it! 🎉 

- The GitHub Actions workflow will automatically trigger
- Your site will be built and deployed
- Access your live site at: `https://[YOUR_USERNAME].github.io/Gamesta/`

## 🔄 Making Updates

Simply push changes to the `main` branch:

```bash
git add .
git commit -m "✨ Add new feature"
git push origin main
```

The site will automatically rebuild and redeploy!

## 🧪 Test Locally Before Deploying

```bash
# Install dependencies
npm install

# Test the build
npm run build

# Preview the production build
npm run preview
```

## 📱 What Gets Deployed

Your deployed site includes:
- ✅ All enhanced gaming aesthetics and animations
- ✅ Responsive design for mobile and desktop
- ✅ Optimized performance with code splitting
- ✅ Production-ready build with minification
- ✅ Proper routing for single-page application

---

**🎮 Your Gamesta platform is now live and ready for the gaming community!**
