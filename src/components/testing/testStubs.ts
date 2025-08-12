// Temporary stub for testing components to fix build
// This file can be properly implemented later

export const useDraftManager = () => ({
    saveDraft: (_draft: any) => { },
    getDrafts: () => [],
})

export const useUserPreferences = () => ({
    savePreferences: (_prefs: any) => { },
    getPreferences: () => ({}),
})

export const useSearchHistory = () => ({
    addSearchTerm: (_term: string) => { },
    getSearchHistory: () => [],
})

export const UserStorage = {
    set: (_data: any) => { },
    get: () => null,
}

export const IdeasCacheStorage = {
    set: (_data: any) => { },
    get: () => [],
}

export const DraftsStorage = {
    set: (_data: any) => { },
    get: () => [],
}

export const UserPreferencesStorage = {
    set: (_data: any) => { },
    get: () => ({}),
}

export const SearchHistoryStorage = {
    set: (_data: any) => { },
    get: () => [],
}

export const createStorageBackup = () => ({})

export const validateEmail = (email: string) => ({ isValid: email.includes('@') })
export const validatePassword = (password: string) => ({ isValid: password.length >= 6 })
export const validateUsername = (username: string) => ({ isValid: username.length >= 3 })
export const validateContent = (content: string) => ({ sanitized: content.replace(/<script>/g, '') })
