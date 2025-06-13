import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children?: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({
            hasError: true,
            error,
            errorInfo
        })

        // Log error to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('ErrorBoundary caught an error:', error, errorInfo)
        }

        // TODO: Send error to monitoring service in production
        // this.logErrorToService(error, errorInfo)
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    private handleReload = () => {
        window.location.reload()
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
                    <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 text-center">
                        <div className="bg-red-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-8 w-8 text-red-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-4 gaming-font">
                            Something went wrong!
                        </h1>

                        <p className="text-gray-300 mb-6">
                            The gaming arena encountered an unexpected error. Don't worry, your progress is safe!
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left mb-6 p-4 bg-red-900/20 rounded-lg border border-red-500/30">
                                <summary className="text-red-300 font-semibold cursor-pointer mb-2">
                                    Error Details (Development)
                                </summary>
                                <pre className="text-xs text-red-200 overflow-auto">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 gaming-font flex items-center justify-center"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </button>

                            <button
                                onClick={this.handleReload}
                                className="flex-1 bg-gray-600/50 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 backdrop-blur-lg border border-white/20 flex items-center justify-center"
                            >
                                <Home className="h-4 w-4 mr-2" />
                                Reload
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
    return (error: Error, errorInfo?: ErrorInfo) => {
        console.error('Error caught by useErrorHandler:', error, errorInfo)

        // In a real app, you'd send this to an error reporting service
        // reportError(error, errorInfo)
    }
}
