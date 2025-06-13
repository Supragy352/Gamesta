// Data validation and sanitization utilities for Gamesta
// Provides comprehensive input validation, sanitization, and content filtering

// XSS Prevention - HTML sanitization
export const sanitizeHtml = (input: string): string => {
    const element = document.createElement('div')
    element.textContent = input
    return element.innerHTML
}

// Basic HTML tag removal
export const stripHtml = (input: string): string => {
    return input.replace(/<[^>]*>/g, '')
}

// URL validation and sanitization
export const sanitizeUrl = (url: string): string | null => {
    try {
        const parsedUrl = new URL(url)
        // Only allow http and https protocols
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return null
        }
        return parsedUrl.toString()
    } catch {
        return null
    }
}

// Email validation
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
    if (!email || typeof email !== 'string') {
        return { isValid: false, error: 'Email is required' }
    }

    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedEmail.length === 0) {
        return { isValid: false, error: 'Email is required' }
    }

    if (trimmedEmail.length > 254) {
        return { isValid: false, error: 'Email is too long' }
    }

    // RFC 5322 compliant regex (simplified)
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (!emailRegex.test(trimmedEmail)) {
        return { isValid: false, error: 'Please enter a valid email address' }
    }

    return { isValid: true }
}

// Password validation
export const validatePassword = (password: string): { isValid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } => {
    if (!password || typeof password !== 'string') {
        return { isValid: false, error: 'Password is required', strength: 'weak' }
    }

    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters long', strength: 'weak' }
    }

    if (password.length > 128) {
        return { isValid: false, error: 'Password is too long', strength: 'weak' }
    }

    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'password123', 'admin', 'qwerty', 'letmein']
    if (commonPasswords.includes(password.toLowerCase())) {
        return { isValid: false, error: 'Please choose a stronger password', strength: 'weak' }
    }

    // Calculate password strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const criteriaCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length

    if (password.length >= 8 && criteriaCount >= 3) {
        strength = 'strong'
    } else if (password.length >= 6 && criteriaCount >= 2) {
        strength = 'medium'
    }

    return { isValid: true, strength }
}

// Username validation
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
    if (!username || typeof username !== 'string') {
        return { isValid: false, error: 'Username is required' }
    }

    const trimmedUsername = username.trim()

    if (trimmedUsername.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters long' }
    }

    if (trimmedUsername.length > 30) {
        return { isValid: false, error: 'Username must be less than 30 characters' }
    }

    // Allow letters, numbers, underscore, and hyphen
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' }
    }

    // Can't start or end with underscore or hyphen
    if (/^[_-]|[_-]$/.test(trimmedUsername)) {
        return { isValid: false, error: 'Username cannot start or end with underscore or hyphen' }
    }

    // Check for reserved usernames
    const reservedUsernames = ['admin', 'root', 'user', 'test', 'api', 'www', 'mail', 'ftp', 'gamesta', 'mitaoe']
    if (reservedUsernames.includes(trimmedUsername.toLowerCase())) {
        return { isValid: false, error: 'This username is reserved' }
    }

    return { isValid: true }
}

// Content validation for ideas and descriptions
export const validateContent = (content: string, options: {
    minLength?: number
    maxLength?: number
    allowHtml?: boolean
    fieldName?: string
} = {}): { isValid: boolean; error?: string; sanitized: string } => {
    const {
        minLength = 1,
        maxLength = 1000,
        allowHtml = false,
        fieldName = 'Content'
    } = options

    if (!content || typeof content !== 'string') {
        return { isValid: false, error: `${fieldName} is required`, sanitized: '' }
    }

    // Sanitize content
    let sanitized = allowHtml ? sanitizeHtml(content) : stripHtml(content.trim())

    // Remove excessive whitespace
    sanitized = sanitized.replace(/\s+/g, ' ').trim()

    if (sanitized.length < minLength) {
        return { isValid: false, error: `${fieldName} must be at least ${minLength} characters long`, sanitized }
    }

    if (sanitized.length > maxLength) {
        return { isValid: false, error: `${fieldName} must be less than ${maxLength} characters`, sanitized }
    }

    // Check for inappropriate content (basic filter)
    const inappropriateWords = ['spam', 'scam', 'hack', 'cheat', 'exploit']
    const lowerContent = sanitized.toLowerCase()
    const foundInappropriate = inappropriateWords.find(word => lowerContent.includes(word))

    if (foundInappropriate) {
        return { isValid: false, error: 'Content contains inappropriate language', sanitized }
    }

    return { isValid: true, sanitized }
}

// Comprehensive form validation
export interface FormValidation {
    isValid: boolean
    errors: Record<string, string>
    warnings: Record<string, string>
    data: Record<string, any>
}

export const validateForm = (formData: Record<string, any>, validationRules: Record<string, any>): FormValidation => {
    const result: FormValidation = {
        isValid: true,
        errors: {},
        warnings: {},
        data: {}
    }

    Object.entries(validationRules).forEach(([field, rules]) => {
        const value = formData[field]

        // Apply validation based on field type
        switch (rules.type) {
            case 'email':
                const emailResult = validateEmail(value)
                if (!emailResult.isValid) {
                    result.errors[field] = emailResult.error!
                    result.isValid = false
                } else {
                    result.data[field] = value.trim().toLowerCase()
                }
                break

            case 'password':
                const passwordResult = validatePassword(value)
                if (!passwordResult.isValid) {
                    result.errors[field] = passwordResult.error!
                    result.isValid = false
                } else {
                    result.data[field] = value
                    if (passwordResult.strength === 'weak') {
                        result.warnings[field] = 'Consider using a stronger password'
                    }
                }
                break

            case 'username':
                const usernameResult = validateUsername(value)
                if (!usernameResult.isValid) {
                    result.errors[field] = usernameResult.error!
                    result.isValid = false
                } else {
                    result.data[field] = value.trim()
                }
                break

            case 'content':
                const contentResult = validateContent(value, {
                    minLength: rules.minLength,
                    maxLength: rules.maxLength,
                    fieldName: rules.fieldName || field
                })
                if (!contentResult.isValid) {
                    result.errors[field] = contentResult.error!
                    result.isValid = false
                } else {
                    result.data[field] = contentResult.sanitized
                }
                break

            case 'url':
                if (value && value.trim()) {
                    const sanitizedUrl = sanitizeUrl(value.trim())
                    if (!sanitizedUrl) {
                        result.errors[field] = 'Please enter a valid URL'
                        result.isValid = false
                    } else {
                        result.data[field] = sanitizedUrl
                    }
                }
                break

            default:
                result.data[field] = value
        }
    })

    return result
}

// File validation (for future file uploads)
export const validateFile = (file: File, options: {
    maxSize?: number // in bytes
    allowedTypes?: string[]
    allowedExtensions?: string[]
} = {}): { isValid: boolean; error?: string } => {
    const {
        maxSize = 5 * 1024 * 1024, // 5MB default
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    } = options

    if (!file) {
        return { isValid: false, error: 'No file selected' }
    }

    if (file.size > maxSize) {
        return { isValid: false, error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` }
    }

    if (!allowedTypes.includes(file.type)) {
        return { isValid: false, error: 'File type not allowed' }
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(extension)) {
        return { isValid: false, error: 'File extension not allowed' }
    }

    return { isValid: true }
}

// Rate limiting helper (for client-side rate limiting simulation)
class RateLimiter {
    private attempts: Map<string, number[]> = new Map()

    isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
        const now = Date.now()
        const attempts = this.attempts.get(key) || []

        // Remove old attempts outside the window
        const validAttempts = attempts.filter(time => now - time < windowMs)

        if (validAttempts.length >= maxAttempts) {
            return false
        }

        validAttempts.push(now)
        this.attempts.set(key, validAttempts)
        return true
    }

    getRemainingTime(key: string, windowMs: number): number {
        const attempts = this.attempts.get(key) || []
        if (attempts.length === 0) return 0

        const oldestAttempt = Math.min(...attempts)
        const remaining = windowMs - (Date.now() - oldestAttempt)
        return Math.max(0, remaining)
    }
}

export const rateLimiter = new RateLimiter()

// Predefined validation rules for common forms
export const VALIDATION_RULES = {
    LOGIN: {
        email: { type: 'email' },
        password: { type: 'password' }
    },
    REGISTER: {
        email: { type: 'email' },
        password: { type: 'password' },
        username: { type: 'username' }
    },
    IDEA_SUBMISSION: {
        title: { type: 'content', minLength: 5, maxLength: 100, fieldName: 'Title' },
        description: { type: 'content', minLength: 10, maxLength: 1000, fieldName: 'Description' }
    },
    PROFILE_UPDATE: {
        username: { type: 'username' },
        bio: { type: 'content', minLength: 0, maxLength: 500, fieldName: 'Bio' }
    }
} as const
