# Gamesta Deployment Guide: Database + Hosting

## 🎯 **Overview**
This guide covers adding a database to Gamesta and deploying it. We'll use Supabase (PostgreSQL) for the database and explore hosting options.

## 📋 **Prerequisites**
- ✅ Supabase dependency already installed
- ✅ GitHub repository set up
- ✅ GitHub Pages deployment configured

## 🗄️ **Database Setup (Supabase)**

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign in with GitHub
3. Click "New Project"
4. Choose your organization
5. Set project name: `gamesta-db`
6. Create a strong database password
7. Select a region (closest to your users)
8. Click "Create new project"

### Step 2: Set Up Database Schema
1. Go to your Supabase dashboard
2. Navigate to "SQL Editor"
3. Copy the SQL from `database-schema.md`
4. Run the SQL commands to create tables and policies

### Step 3: Get Environment Variables
1. In Supabase dashboard, go to "Settings" → "API"
2. Copy your "Project URL" and "anon public" key
3. Create `.env.local` file:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🚀 **Hosting Options for Database-Enabled Apps**

### Option 1: GitHub Pages + Supabase (Recommended)
**✅ Pros:**
- Free hosting for frontend
- Free database tier (up to 50MB)
- Easy deployment with existing setup
- Perfect for student projects

**❌ Limitations:**
- Static hosting only (no server-side rendering)
- Environment variables need special handling

**Setup:**
```bash
# Install GitHub Pages deployment
npm install -D gh-pages

# Your package.json already has:
"deploy": "npm run build && gh-pages -d dist"
```

**Environment Variables for GitHub Pages:**
Since GitHub Pages doesn't support runtime environment variables, you have two options:

1. **Build-time variables (Current approach):** Variables starting with `VITE_` are embedded at build time
2. **GitHub Secrets:** Store sensitive data in GitHub repository secrets

### Option 2: Vercel (Recommended Alternative)
**✅ Pros:**
- Automatic deployments from GitHub
- Built-in environment variable support
- Excellent performance
- Free tier perfect for projects like Gamesta

**Setup:**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Import your Gamesta repository
4. Add environment variables in dashboard
5. Deploy automatically

### Option 3: Netlify
**✅ Pros:**
- Great for static sites
- Form handling
- Environment variable support
- Free SSL

### Option 4: Railway / Render
**✅ Pros:**
- Full-stack hosting
- Database + frontend in one place
- Good for more complex applications

## 🔧 **Migration from localStorage to Database**

The codebase currently uses localStorage. Here's how to gradually migrate:

### Phase 1: Dual Storage (Recommended)
Keep localStorage as backup while implementing database:

```typescript
// In your services
class HybridStorage {
  async saveIdea(idea: Idea) {
    try {
      // Try database first
      const result = await DatabaseService.createIdea(idea)
      // Backup to localStorage
      localStorage.setItem(`idea_${result.id}`, JSON.stringify(result))
      return result
    } catch (error) {
      // Fallback to localStorage
      return saveToLocalStorage(idea)
    }
  }
}
```

### Phase 2: Full Database Migration
Once confident, remove localStorage dependencies.

## 🔐 **Security Considerations**

### Environment Variables
```bash
# ❌ Never commit these to Git
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# ✅ Add to .gitignore
echo ".env.local" >> .gitignore
```

### Row Level Security (RLS)
Supabase RLS policies are already configured in the schema to ensure:
- Users can only edit their own ideas
- Users can only manage their own votes
- Authentication is required for write operations

## 📊 **Deployment Workflow**

### For GitHub Pages:
```bash
# 1. Set up environment variables for build
echo "VITE_SUPABASE_URL=your_url" > .env.local
echo "VITE_SUPABASE_ANON_KEY=your_key" >> .env.local

# 2. Deploy
npm run deploy
```

### For Vercel/Netlify:
1. Connect GitHub repository
2. Add environment variables in dashboard
3. Deploy automatically on every push

## 🎯 **Recommended Deployment Strategy**

For a student gaming fest project like Gamesta:

**Best Choice: GitHub Pages + Supabase**
- ✅ Completely free
- ✅ Uses your existing setup
- ✅ Great for portfolio/academic projects
- ✅ Easy to demonstrate to professors/peers

**Setup Steps:**
1. Create Supabase project (5 minutes)
2. Run database schema (2 minutes)
3. Add environment variables (1 minute)
4. Deploy with `npm run deploy` (2 minutes)

**Total setup time: ~10 minutes!**

## 🔄 **Next Steps After Database Integration**

1. **Update AuthContext** to use DatabaseService
2. **Migrate Dashboard** to fetch from database
3. **Add real-time features** with Supabase subscriptions
4. **Implement offline sync** for better UX
5. **Add database backup/restore** features

## 💡 **Pro Tips**

1. **Environment Variables:** Use GitHub Secrets for sensitive data in CI/CD
2. **Performance:** Implement caching with React Query or SWR
3. **Offline Support:** Keep localStorage as cache for offline functionality
4. **Real-time:** Use Supabase real-time subscriptions for live voting
5. **Analytics:** Add Supabase Analytics for user insights

## 🚨 **Common Issues & Solutions**

### Issue: "Missing Supabase environment variables"
**Solution:** Ensure `.env.local` exists with correct variables

### Issue: GitHub Pages not updating
**Solution:** Check GitHub Actions tab for deployment status

### Issue: CORS errors
**Solution:** Supabase automatically handles CORS for web apps

### Issue: Database connection fails
**Solution:** Verify Supabase project is not paused (free tier auto-pauses after 1 week of inactivity)

---

**Ready to implement?** Let me know if you want me to help integrate the database service with your existing components!
