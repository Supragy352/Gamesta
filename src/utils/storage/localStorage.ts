// localStorage utilities for Gamesta application
// Provides safe, typed localStorage operations with automatic backup and recovery

interface StorageConfig {
    key: string
    version: number
    maxAge?: number // in milliseconds
    compress?: boolean
}

interface StorageItem<T> {
    data: T
    timestamp: number
    version: number
    checksum?: string
}

class LocalStorageManager {
    private readonly prefix = 'gamesta_'
    private readonly maxStorageSize = 5 * 1024 * 1024 // 5MB limit

    /**
     * Safely store data in localStorage with versioning and error handling
     */
    setItem<T>(config: StorageConfig, data: T): boolean {
        try {
            const key = this.prefix + config.key
            const item: StorageItem<T> = {
                data,
                timestamp: Date.now(),
                version: config.version,
                checksum: this.generateChecksum(data)
            }

            const serialized = JSON.stringify(item)

            // Check storage size limit
            if (this.getStorageSize() + serialized.length > this.maxStorageSize) {
                this.cleanupExpiredData()

                // If still too large, fail gracefully
                if (this.getStorageSize() + serialized.length > this.maxStorageSize) {
                    console.warn('LocalStorage size limit exceeded')
                    return false
                }
            }

            localStorage.setItem(key, serialized)
            return true
        } catch (error) {
            console.error('Failed to save to localStorage:', error)
            return false
        }
    }

    /**
     * Safely retrieve data from localStorage with validation
     */
    getItem<T>(config: StorageConfig): T | null {
        try {
            const key = this.prefix + config.key
            const stored = localStorage.getItem(key)

            if (!stored) return null

            const item: StorageItem<T> = JSON.parse(stored)

            // Version check
            if (item.version !== config.version) {
                console.warn(`Version mismatch for ${key}. Expected: ${config.version}, Found: ${item.version}`)
                this.removeItem(config.key)
                return null
            }

            // Age check
            if (config.maxAge && Date.now() - item.timestamp > config.maxAge) {
                console.info(`Expired data removed for ${key}`)
                this.removeItem(config.key)
                return null
            }

            // Checksum validation
            if (item.checksum && item.checksum !== this.generateChecksum(item.data)) {
                console.warn(`Checksum mismatch for ${key}. Data may be corrupted.`)
                this.removeItem(config.key)
                return null
            }

            return item.data
        } catch (error) {
            console.error('Failed to retrieve from localStorage:', error)
            return null
        }
    }

    /**
     * Remove item from localStorage
     */
    removeItem(key: string): boolean {
        try {
            localStorage.removeItem(this.prefix + key)
            return true
        } catch (error) {
            console.error('Failed to remove from localStorage:', error)
            return false
        }
    }

    /**
     * Get all keys with our prefix
     */
    getAllKeys(): string[] {
        const keys: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith(this.prefix)) {
                keys.push(key.substring(this.prefix.length))
            }
        }
        return keys
    }

    /**
     * Get current storage size in bytes
     */
    getStorageSize(): number {
        let total = 0
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith(this.prefix)) {
                const value = localStorage.getItem(key)
                if (value) {
                    total += key.length + value.length
                }
            }
        }
        return total
    }

    /**
     * Clean up expired data
     */
    private cleanupExpiredData(): void {
        const keys = this.getAllKeys()
        keys.forEach(key => {
            try {
                const stored = localStorage.getItem(this.prefix + key)
                if (stored) {
                    const item = JSON.parse(stored)
                    // Remove items older than 30 days if no specific maxAge
                    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days
                    if (Date.now() - item.timestamp > maxAge) {
                        localStorage.removeItem(this.prefix + key)
                    }
                }
            } catch (error) {
                // Remove corrupted items
                localStorage.removeItem(this.prefix + key)
            }
        })
    }

    /**
     * Generate simple checksum for data integrity
     */
    private generateChecksum(data: any): string {
        const str = JSON.stringify(data)
        let hash = 0
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i)
            hash = ((hash << 5) - hash) + char
            hash = hash & hash // Convert to 32-bit integer
        }
        return hash.toString(36)
    }

    /**
     * Export all data for backup
     */
    exportData(): Record<string, any> {
        const data: Record<string, any> = {}
        const keys = this.getAllKeys()

        keys.forEach(key => {
            try {
                const stored = localStorage.getItem(this.prefix + key)
                if (stored) {
                    data[key] = JSON.parse(stored)
                }
            } catch (error) {
                console.warn(`Failed to export ${key}:`, error)
            }
        })

        return data
    }

    /**
     * Import data from backup
     */
    importData(data: Record<string, any>): boolean {
        try {
            Object.entries(data).forEach(([key, value]) => {
                localStorage.setItem(this.prefix + key, JSON.stringify(value))
            })
            return true
        } catch (error) {
            console.error('Failed to import data:', error)
            return false
        }
    }

    /**
     * Clear all Gamesta data
     */
    clearAll(): boolean {
        try {
            const keys = this.getAllKeys()
            keys.forEach(key => {
                localStorage.removeItem(this.prefix + key)
            })
            return true
        } catch (error) {
            console.error('Failed to clear localStorage:', error)
            return false
        }
    }
}

// Singleton instance
export const storage = new LocalStorageManager()

// Storage configurations for different data types
export const STORAGE_CONFIGS = {
    USER: { key: 'user', version: 1 },
    IDEAS: { key: 'ideas', version: 1, maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
    DRAFTS: { key: 'drafts', version: 1, maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
    USER_PREFERENCES: { key: 'preferences', version: 1 },
    FILTERS: { key: 'filters', version: 1, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
    SEARCH_HISTORY: { key: 'search_history', version: 1, maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
    OFFLINE_QUEUE: { key: 'offline_queue', version: 1 },
} as const

// Typed storage helpers
export const storageHelpers = {
    // User data
    saveUser: (user: any) => storage.setItem(STORAGE_CONFIGS.USER, user),
    getUser: () => storage.getItem(STORAGE_CONFIGS.USER),

    // Ideas cache
    saveIdeas: (ideas: any[]) => storage.setItem(STORAGE_CONFIGS.IDEAS, ideas),
    getIdeas: () => storage.getItem<any[]>(STORAGE_CONFIGS.IDEAS),

    // Draft ideas
    saveDrafts: (drafts: any[]) => storage.setItem(STORAGE_CONFIGS.DRAFTS, drafts),
    getDrafts: () => storage.getItem<any[]>(STORAGE_CONFIGS.DRAFTS),

    // User preferences
    savePreferences: (prefs: any) => storage.setItem(STORAGE_CONFIGS.USER_PREFERENCES, prefs),
    getPreferences: () => storage.getItem(STORAGE_CONFIGS.USER_PREFERENCES),

    // Filter state
    saveFilters: (filters: any) => storage.setItem(STORAGE_CONFIGS.FILTERS, filters),
    getFilters: () => storage.getItem(STORAGE_CONFIGS.FILTERS),

    // Search history
    saveSearchHistory: (history: string[]) => storage.setItem(STORAGE_CONFIGS.SEARCH_HISTORY, history),
    getSearchHistory: () => storage.getItem<string[]>(STORAGE_CONFIGS.SEARCH_HISTORY) || [],

    // Offline queue
    saveOfflineQueue: (queue: any[]) => storage.setItem(STORAGE_CONFIGS.OFFLINE_QUEUE, queue),
    getOfflineQueue: () => storage.getItem<any[]>(STORAGE_CONFIGS.OFFLINE_QUEUE) || [],
}

// Individual storage utilities for easier testing
export const UserStorage = {
    set: (user: any) => storage.setItem(STORAGE_CONFIGS.USER, user),
    get: () => storage.getItem(STORAGE_CONFIGS.USER),
    clear: () => storage.removeItem(STORAGE_CONFIGS.USER.key)
}

export const IdeasCacheStorage = {
    set: (ideas: any[]) => storage.setItem(STORAGE_CONFIGS.IDEAS, ideas),
    get: () => storage.getItem<any[]>(STORAGE_CONFIGS.IDEAS),
    clear: () => storage.removeItem(STORAGE_CONFIGS.IDEAS.key)
}

export const DraftsStorage = {
    set: (drafts: any[]) => storage.setItem(STORAGE_CONFIGS.DRAFTS, drafts),
    get: () => storage.getItem<any[]>(STORAGE_CONFIGS.DRAFTS),
    clear: () => storage.removeItem(STORAGE_CONFIGS.DRAFTS.key)
}

export const UserPreferencesStorage = {
    set: (prefs: any) => storage.setItem(STORAGE_CONFIGS.USER_PREFERENCES, prefs),
    get: () => storage.getItem(STORAGE_CONFIGS.USER_PREFERENCES),
    clear: () => storage.removeItem(STORAGE_CONFIGS.USER_PREFERENCES.key)
}

export const FilterStorage = {
    set: (filters: any) => storage.setItem(STORAGE_CONFIGS.FILTERS, filters),
    get: () => storage.getItem(STORAGE_CONFIGS.FILTERS),
    clear: () => storage.removeItem(STORAGE_CONFIGS.FILTERS.key)
}

export const SearchHistoryStorage = {
    set: (history: string[]) => storage.setItem(STORAGE_CONFIGS.SEARCH_HISTORY, history),
    get: () => storage.getItem<string[]>(STORAGE_CONFIGS.SEARCH_HISTORY) || [],
    clear: () => storage.removeItem(STORAGE_CONFIGS.SEARCH_HISTORY.key)
}

export const OfflineQueueStorage = {
    set: (queue: any[]) => storage.setItem(STORAGE_CONFIGS.OFFLINE_QUEUE, queue),
    get: () => storage.getItem<any[]>(STORAGE_CONFIGS.OFFLINE_QUEUE) || [],
    clear: () => storage.removeItem(STORAGE_CONFIGS.OFFLINE_QUEUE.key)
}

// Backup and restore utilities
export const createStorageBackup = () => {
    return storage.exportData()
}

export const restoreFromBackup = (backup: Record<string, any>) => {
    return storage.importData(backup)
}
