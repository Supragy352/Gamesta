// Auto-save hooks for form data persistence
// Provides automatic saving and recovery of form data to prevent data loss

import { useCallback, useEffect, useRef } from 'react'
import { storage, STORAGE_CONFIGS } from '../utils/storage/localStorage'

// Hook for auto-saving form data
export function useAutoSave<T extends Record<string, any>>(
    data: T,
    storageKey: string,
    options: {
        delay?: number // Debounce delay in ms
        enabled?: boolean // Whether auto-save is enabled
        onSave?: (data: T) => void // Callback when data is saved
        onRestore?: (data: T) => void // Callback when data is restored
    } = {}
) {
    const {
        delay = 1000,
        enabled = true,
        onSave,
        onRestore
    } = options

    const timeoutRef = useRef<NodeJS.Timeout>()
    const previousDataRef = useRef<string>('')

    // Save data to localStorage
    const saveData = useCallback((dataToSave: T) => {
        if (!enabled) return

        const success = storage.setItem(
            { key: `autosave_${storageKey}`, version: 1, maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
            dataToSave
        )

        if (success) {
            onSave?.(dataToSave)
        }
    }, [enabled, storageKey, onSave])

    // Restore data from localStorage
    const restoreData = useCallback((): T | null => {
        if (!enabled) return null

        const restored = storage.getItem<T>({
            key: `autosave_${storageKey}`,
            version: 1,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        if (restored) {
            onRestore?.(restored)
        }

        return restored
    }, [enabled, storageKey, onRestore])

    // Clear saved data
    const clearSavedData = useCallback(() => {
        storage.removeItem(`autosave_${storageKey}`)
    }, [storageKey])

    // Auto-save effect
    useEffect(() => {
        if (!enabled) return

        const currentData = JSON.stringify(data)

        // Only save if data has changed
        if (currentData !== previousDataRef.current) {
            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            // Set new timeout
            timeoutRef.current = setTimeout(() => {
                saveData(data)
                previousDataRef.current = currentData
            }, delay)
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [data, delay, enabled, saveData])

    return {
        saveData,
        restoreData,
        clearSavedData
    }
}

// Hook for managing draft ideas
export function useDraftManager() {
    const saveDraft = useCallback((draft: {
        id?: string
        title: string
        description: string
        category: string
        timestamp?: number
    }) => {
        const drafts = storage.getItem<any[]>(STORAGE_CONFIGS.DRAFTS) || []

        const draftWithTimestamp = {
            ...draft,
            id: draft.id || `draft_${Date.now()}`,
            timestamp: draft.timestamp || Date.now()
        }

        // Update existing draft or add new one
        const existingIndex = drafts.findIndex(d => d.id === draftWithTimestamp.id)
        if (existingIndex >= 0) {
            drafts[existingIndex] = draftWithTimestamp
        } else {
            drafts.unshift(draftWithTimestamp)
        }

        // Keep only last 10 drafts
        const limitedDrafts = drafts.slice(0, 10)

        storage.setItem(STORAGE_CONFIGS.DRAFTS, limitedDrafts)
        return draftWithTimestamp.id
    }, [])

    const getDrafts = useCallback(() => {
        return storage.getItem<any[]>(STORAGE_CONFIGS.DRAFTS) || []
    }, [])

    const getDraft = useCallback((id: string) => {
        const drafts = getDrafts()
        return drafts.find(d => d.id === id) || null
    }, [getDrafts])

    const deleteDraft = useCallback((id: string) => {
        const drafts = getDrafts()
        const filteredDrafts = drafts.filter(d => d.id !== id)
        storage.setItem(STORAGE_CONFIGS.DRAFTS, filteredDrafts)
    }, [getDrafts])

    const clearAllDrafts = useCallback(() => {
        storage.setItem(STORAGE_CONFIGS.DRAFTS, [])
    }, [])

    return {
        saveDraft,
        getDrafts,
        getDraft,
        deleteDraft,
        clearAllDrafts
    }
}

// Hook for user preferences persistence
export function useUserPreferences() {
    const savePreferences = useCallback((preferences: {
        theme?: 'light' | 'dark'
        language?: string
        notifications?: boolean
        autoSave?: boolean
        defaultCategory?: string
        itemsPerPage?: number
    }) => {
        const currentPrefs = storage.getItem(STORAGE_CONFIGS.USER_PREFERENCES) || {}
        const updatedPrefs = { ...currentPrefs, ...preferences }
        storage.setItem(STORAGE_CONFIGS.USER_PREFERENCES, updatedPrefs)
        return updatedPrefs
    }, [])

    const getPreferences = useCallback(() => {
        return storage.getItem(STORAGE_CONFIGS.USER_PREFERENCES) || {
            theme: 'dark',
            language: 'en',
            notifications: true,
            autoSave: true,
            defaultCategory: 'activity',
            itemsPerPage: 10
        }
    }, [])

    const resetPreferences = useCallback(() => {
        storage.removeItem('preferences')
        return getPreferences()
    }, [getPreferences])

    return {
        savePreferences,
        getPreferences,
        resetPreferences
    }
}

// Hook for search history management
export function useSearchHistory() {
    const addSearchTerm = useCallback((term: string) => {
        if (!term.trim()) return

        const history = storage.getItem<string[]>(STORAGE_CONFIGS.SEARCH_HISTORY) || []

        // Remove existing term if present
        const filteredHistory = history.filter(t => t.toLowerCase() !== term.toLowerCase())

        // Add new term at the beginning
        const updatedHistory = [term, ...filteredHistory].slice(0, 20) // Keep last 20 searches

        storage.setItem(STORAGE_CONFIGS.SEARCH_HISTORY, updatedHistory)
        return updatedHistory
    }, [])

    const getSearchHistory = useCallback(() => {
        return storage.getItem<string[]>(STORAGE_CONFIGS.SEARCH_HISTORY) || []
    }, [])

    const clearSearchHistory = useCallback(() => {
        storage.setItem(STORAGE_CONFIGS.SEARCH_HISTORY, [])
    }, [])

    const removeSearchTerm = useCallback((term: string) => {
        const history = getSearchHistory()
        const filteredHistory = history.filter(t => t !== term)
        storage.setItem(STORAGE_CONFIGS.SEARCH_HISTORY, filteredHistory)
        return filteredHistory
    }, [getSearchHistory])

    return {
        addSearchTerm,
        getSearchHistory,
        clearSearchHistory,
        removeSearchTerm
    }
}

// Hook for offline queue management
export function useOfflineQueue() {
    const addToQueue = useCallback((action: {
        type: 'vote' | 'submit_idea' | 'update_profile'
        data: any
        timestamp: number
        retryCount?: number
    }) => {
        const queue = storage.getItem<any[]>(STORAGE_CONFIGS.OFFLINE_QUEUE) || []

        const queueItem = {
            ...action,
            id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            retryCount: action.retryCount || 0
        }

        queue.push(queueItem)
        storage.setItem(STORAGE_CONFIGS.OFFLINE_QUEUE, queue)
        return queueItem.id
    }, [])

    const getQueue = useCallback(() => {
        return storage.getItem<any[]>(STORAGE_CONFIGS.OFFLINE_QUEUE) || []
    }, [])

    const removeFromQueue = useCallback((id: string) => {
        const queue = getQueue()
        const filteredQueue = queue.filter(item => item.id !== id)
        storage.setItem(STORAGE_CONFIGS.OFFLINE_QUEUE, filteredQueue)
        return filteredQueue
    }, [getQueue])

    const updateQueueItem = useCallback((id: string, updates: any) => {
        const queue = getQueue()
        const updatedQueue = queue.map(item =>
            item.id === id ? { ...item, ...updates } : item
        )
        storage.setItem(STORAGE_CONFIGS.OFFLINE_QUEUE, updatedQueue)
        return updatedQueue
    }, [getQueue])

    const clearQueue = useCallback(() => {
        storage.setItem(STORAGE_CONFIGS.OFFLINE_QUEUE, [])
    }, [])

    return {
        addToQueue,
        getQueue,
        removeFromQueue,
        updateQueueItem,
        clearQueue
    }
}

// Hook for backup management
export function useBackupManager() {
    const createBackup = useCallback(() => {
        const backup = {
            timestamp: Date.now(),
            data: storage.exportData(),
            version: '1.0'
        }

        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const link = document.createElement('a')
        link.href = url
        link.download = `gamesta_backup_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        URL.revokeObjectURL(url)
        return backup
    }, [])

    const restoreBackup = useCallback(async (file: File): Promise<boolean> => {
        try {
            const text = await file.text()
            const backup = JSON.parse(text)

            if (!backup.data || !backup.version) {
                throw new Error('Invalid backup file format')
            }

            const success = storage.importData(backup.data)
            return success
        } catch (error) {
            console.error('Failed to restore backup:', error)
            return false
        }
    }, [])

    const getBackupInfo = useCallback(() => {
        const data = storage.exportData()
        const size = JSON.stringify(data).length
        const keys = Object.keys(data)

        return {
            size: size,
            itemCount: keys.length,
            keys: keys,
            lastModified: Math.max(...Object.values(data)
                .filter(item => item && typeof item === 'object' && item.timestamp)
                .map(item => item.timestamp)
            )
        }
    }, [])

    return {
        createBackup,
        restoreBackup,
        getBackupInfo
    }
}
