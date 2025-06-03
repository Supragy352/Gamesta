# Gamesta - College Gaming Fest Idea Hub

A modern React TypeScript web application for managing ideas and community engagement for college gaming festivals. Students can submit ideas, vote on proposals, and help shape the ultimate gaming event.

## 🎮 Features

- **User Authentication**: Secure login and registration system
- **Idea Submission**: Submit creative ideas for tournaments and activities
- **Voting System**: Upvote and downvote ideas to show community preference
- **User Profiles**: Personalized profiles with activity stats
- **Filtering & Search**: Find ideas by category and search terms
- **Responsive Design**: Beautiful UI that works on all devices
- **Real-time Updates**: Dynamic voting and idea management

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone or download the project to your local machine
2. Navigate to the project directory:
   ```bash
   cd Gamesta
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and visit `http://localhost:5173`

## 📁 Project Structure

```
Gamesta/
├── src/
│   ├── components/
│   │   ├── Landing.tsx      # Home landing page
│   │   ├── Login.tsx        # Authentication component
│   │   ├── Dashboard.tsx    # Main idea hub
│   │   └── Profile.tsx      # User profile page
│   ├── contexts/
│   │   └── AuthContext.tsx  # Authentication state management
│   ├── App.tsx              # Main app component with routing
│   ├── main.tsx            # React app entry point
│   └── index.css           # Global styles with Tailwind
├── public/                  # Static assets
├── package.json            # Project dependencies
└── README.md              # This file
```

## 🛠 Technology Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **React Router** - Client-side routing for single-page application
- **Lucide React** - Beautiful icon library

## 🎨 Design Features

- **Glass Morphism**: Modern glass-like UI elements with backdrop blur
- **Dark Theme**: Sleek dark gradient background for gaming aesthetic
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Purple/Pink Gradient**: Vibrant color scheme perfect for gaming events
- **Smooth Animations**: Subtle transitions and hover effects

## 📱 Usage

1. **Landing Page**: Visit the homepage to learn about the platform
2. **Sign Up**: Create an account or sign in with existing credentials
3. **Submit Ideas**: Add your creative ideas for the gaming fest
4. **Vote**: Upvote ideas you love and downvote ones you don't
5. **Profile**: Manage your profile and view your activity stats
6. **Explore**: Use filters and search to discover the best ideas

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality
- `npm run deploy` - Manual deployment to GitHub Pages

## ⚡ **VS Code Shortcuts & Tasks**

This project includes **supercharged VS Code shortcuts** for lightning-fast development!

🎮 **Quick Access:**
- Press `Ctrl+Shift+P` → type `task dev` → Enter (Start development)
- Press `F5` for instant dev server launch
- Press `Ctrl+Shift+B` to build for production
- Press `Ctrl+Shift+U` to deploy to GitHub Pages

📖 **Complete Guides:**
- [SHORTCUTS_READY.md](./SHORTCUTS_READY.md) - **Ready-to-use shortcuts reference**
- [QUICK_START.md](./QUICK_START.md) - Quick development workflow
- [VSCODE_SHORTCUTS.md](./VSCODE_SHORTCUTS.md) - Detailed shortcuts guide

🎯 **Available VS Code Tasks:**
- 🎮 Start Development Server
- 🔨 Build for Production
- 🚀 Deploy to GitHub Pages
- 🔍 Lint Code
- 🧹 Clean Install
- 👀 Preview Production Build

## 🚀 Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Quick Deployment Setup:

1. **Push to GitHub**: Create a repository and push your code
2. **Enable Pages**: Go to Settings → Pages → Source: "GitHub Actions"
3. **Automatic Deploy**: Every push to `main` triggers deployment

Your live site will be available at: `https://[username].github.io/Gamesta/`

📖 **Detailed guides:**
- [SETUP.md](./SETUP.md) - Quick setup instructions
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide

### Deployment Features:
- ✅ Automated CI/CD with GitHub Actions
- ✅ Production build optimization
- ✅ Code splitting for better performance
- ✅ Automatic linting and error checking
- ✅ Zero-downtime deployments

## 🚀 Future Enhancements

- Real backend integration with database
- Real-time notifications for votes and comments
- Advanced user roles and permissions
- Idea commenting system
- Email notifications
- Social media integration
- Mobile app version

## 🤝 Contributing

This project was created for a college gaming fest. Feel free to:
- Submit bug reports and feature requests
- Contribute code improvements
- Suggest design enhancements
- Add new gaming-related features

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Getting Started for Development

The app currently uses mock authentication and stores data in localStorage. For production use, you'll want to:

1. Set up a backend API (Node.js, Python, etc.)
2. Implement real user authentication
3. Add a database for persistent storage
4. Deploy to a hosting platform

---

**Built with ❤️ for the gaming community**
