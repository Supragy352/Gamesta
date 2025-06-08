import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react'
import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
    duration?: number
    action?: {
        label: string
        onClick: () => void
    }
}

interface ToastContextType {
    toasts: Toast[]
    showToast: (toast: Omit<Toast, 'id'>) => string
    hideToast: (id: string) => void
    showSuccess: (title: string, message?: string) => string
    showError: (title: string, message?: string) => string
    showWarning: (title: string, message?: string) => string
    showInfo: (title: string, message?: string) => string
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(7)
        const newToast: Toast = {
            ...toast,
            id,
            duration: toast.duration ?? 5000
        }

        setToasts(prev => [...prev, newToast])

        // Auto remove toast after duration
        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                hideToast(id)
            }, newToast.duration)
        }

        return id
    }, [hideToast])

    const showSuccess = useCallback((title: string, message?: string) => {
        return showToast({ type: 'success', title, message })
    }, [showToast])

    const showError = useCallback((title: string, message?: string) => {
        return showToast({ type: 'error', title, message, duration: 7000 })
    }, [showToast])

    const showWarning = useCallback((title: string, message?: string) => {
        return showToast({ type: 'warning', title, message })
    }, [showToast])

    const showInfo = useCallback((title: string, message?: string) => {
        return showToast({ type: 'info', title, message })
    }, [showToast])

    return (
        <ToastContext.Provider value={{
            toasts,
            showToast,
            hideToast,
            showSuccess,
            showError,
            showWarning,
            showInfo
        }}>
            {children}
            <ToastContainer toasts={toasts} onHide={hideToast} />
        </ToastContext.Provider>
    )
}

function ToastContainer({ toasts, onHide }: { toasts: Toast[], onHide: (id: string) => void }) {
    if (toasts.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onHide={onHide} />
            ))}
        </div>
    )
}

function ToastItem({ toast, onHide }: { toast: Toast, onHide: (id: string) => void }) {
    const icons = {
        success: CheckCircle,
        error: XCircle,
        warning: AlertTriangle,
        info: Info
    }

    const styles = {
        success: 'bg-green-900/90 border-green-500/50 text-green-100',
        error: 'bg-red-900/90 border-red-500/50 text-red-100',
        warning: 'bg-yellow-900/90 border-yellow-500/50 text-yellow-100',
        info: 'bg-blue-900/90 border-blue-500/50 text-blue-100'
    }

    const iconColors = {
        success: 'text-green-400',
        error: 'text-red-400',
        warning: 'text-yellow-400',
        info: 'text-blue-400'
    }

    const Icon = icons[toast.type]

    return (
        <div className={`
      ${styles[toast.type]}
      backdrop-blur-lg border rounded-lg p-4 min-w-[320px] max-w-[400px]
      transform transition-all duration-300 ease-in-out
      animate-slide-in-right shadow-lg
    `}>
            <div className="flex items-start space-x-3">
                <Icon className={`h-5 w-5 ${iconColors[toast.type]} flex-shrink-0 mt-0.5`} />

                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold gaming-font text-sm">
                        {toast.title}
                    </h4>
                    {toast.message && (
                        <p className="text-sm opacity-90 mt-1">
                            {toast.message}
                        </p>
                    )}
                    {toast.action && (
                        <button
                            onClick={toast.action.onClick}
                            className="text-sm underline hover:no-underline mt-2 opacity-90 hover:opacity-100 transition-opacity"
                        >
                            {toast.action.label}
                        </button>
                    )}
                </div>

                <button
                    onClick={() => onHide(toast.id)}
                    className="text-white/60 hover:text-white/90 transition-colors p-1 hover:bg-white/10 rounded"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

// Utility hook for common toast patterns
export function useToastHandlers() {
    const toast = useToast()

    return {
        handleSuccess: useCallback((message: string) => {
            toast.showSuccess('Success!', message)
        }, [toast]),

        handleError: useCallback((error: unknown, fallbackMessage = 'Something went wrong') => {
            const message = error instanceof Error ? error.message : fallbackMessage
            toast.showError('Error', message)
        }, [toast]),

        handleAsyncOperation: useCallback(async <T,>(
            operation: () => Promise<T>,
            {
                loadingMessage,
                successMessage,
                errorMessage = 'Operation failed'
            }: {
                loadingMessage?: string
                successMessage?: string
                errorMessage?: string
            } = {}
        ): Promise<T | null> => {
            let loadingToastId: string | undefined

            try {
                if (loadingMessage) {
                    loadingToastId = toast.showInfo('Loading...', loadingMessage)
                }

                const result = await operation()

                if (loadingToastId) {
                    toast.hideToast(loadingToastId)
                }

                if (successMessage) {
                    toast.showSuccess('Success!', successMessage)
                }

                return result
            } catch (error) {
                if (loadingToastId) {
                    toast.hideToast(loadingToastId)
                }

                const message = error instanceof Error ? error.message : errorMessage
                toast.showError('Error', message)
                return null
            }
        }, [toast])
    }
}
