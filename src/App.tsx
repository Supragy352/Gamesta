import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import { ErrorBoundary } from './components/ErrorBoundary'
import FeatureTest from './components/FeatureTest'
import Landing from './components/Landing'
import { LoadingSpinner } from './components/LoadingComponents'
import Login from './components/Login'
import Profile from './components/Profile'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'

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
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/test" element={<FeatureTest />} />
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
