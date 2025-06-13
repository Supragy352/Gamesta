import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    color?: string
    className?: string
}

export function LoadingSpinner({ size = 'md', color = 'text-purple-400', className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12'
    }

    return (
        <Loader2 className={`animate-spin ${sizeClasses[size]} ${color} ${className}`} />
    )
}

interface LoadingOverlayProps {
    isLoading: boolean
    message?: string
    children: React.ReactNode
    className?: string
}

export function LoadingOverlay({ isLoading, message = 'Loading...', children, className = '' }: LoadingOverlayProps) {
    return (
        <div className={`relative ${className}`}>
            {children}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-900/90 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center">
                        <LoadingSpinner size="lg" className="mx-auto mb-3" />
                        <p className="text-white gaming-font">{message}</p>
                    </div>
                </div>
            )}
        </div>
    )
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean
    loadingText?: string
    children: React.ReactNode
}

export function LoadingButton({ isLoading = false, loadingText, children, disabled, className = '', ...props }: LoadingButtonProps) {
    return (
        <button
            {...props}
            disabled={disabled || isLoading}
            className={`${className} ${isLoading ? 'cursor-not-allowed opacity-75' : ''}`}
        >
            {isLoading ? (
                <span className="flex items-center justify-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    {loadingText || 'Loading...'}
                </span>
            ) : (
                children
            )}
        </button>
    )
}

interface LoadingCardProps {
    message?: string
    className?: string
}

export function LoadingCard({ message = 'Loading epic content...', className = '' }: LoadingCardProps) {
    return (
        <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 text-center ${className}`}>
            <LoadingSpinner size="xl" className="mx-auto mb-4" />
            <p className="text-white gaming-font text-lg">{message}</p>
            <p className="text-gray-400 text-sm mt-2">Please wait while we prepare your gaming experience...</p>
        </div>
    )
}

interface LoadingDotsProps {
    size?: 'sm' | 'md' | 'lg'
    color?: string
}

export function LoadingDots({ size = 'md', color = 'bg-purple-400' }: LoadingDotsProps) {
    const sizeClasses = {
        sm: 'w-1 h-1',
        md: 'w-2 h-2',
        lg: 'w-3 h-3'
    }

    return (
        <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={`${sizeClasses[size]} ${color} rounded-full animate-pulse`}
                    style={{ animationDelay: `${i * 0.15}s` }}
                />
            ))}
        </div>
    )
}

// Skeleton loading components
export function SkeletonText({ lines = 1, className = '' }: { lines?: number, className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-white/10 rounded animate-pulse"
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                />
            ))}
        </div>
    )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 ${className}`}>
            <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                    <div className="h-6 bg-white/10 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-white/10 rounded animate-pulse w-1/2" />
                    <SkeletonText lines={2} />
                </div>
            </div>
        </div>
    )
}
