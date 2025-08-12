import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import AdminDashboard from './components/admin/AdminDashboard'
import EmailVerified from './components/auth/EmailVerified'
import Login from './components/auth/Login'
import Dashboard from './components/core/Dashboard'
import Landing from './components/core/Landing'
import Profile from './components/core/Profile'
import LoginDebugPage from './components/debug/LoginDebugPage'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { LoadingSpinner } from './components/ui/LoadingComponents'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import './utils/dbConnectionTest'; // Temporary: Auto-run database connection test

function App() {
  // Use basename only in production (GitHub Pages)
  const basename = process.env.NODE_ENV === 'production' ? '/Gamesta' : ''

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Router basename={basename}>
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">              <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/email-verified" element={<EmailVerified />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/debug-login" element={<LoginDebugPage />} />
            </Routes>
            </div>
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

export default App
