// Temporary stub for testing components to fix build
// This file can be properly implemented later

export const useDraftManager = () => ({
    saveDraft: () => { },
    getDrafts: () => [],
})

export const useUserPreferences = () => ({
    savePreferences: () => { },
    getPreferences: () => ({}),
})

export const useSearchHistory = () => ({
    addSearchTerm: () => { },
    getSearchHistory: () => [],
})

export const UserStorage = {
    set: () => { },
    get: () => null,
}

export const IdeasCacheStorage = {
    set: () => { },
    get: () => [],
}

export const DraftsStorage = {
    set: () => { },
    get: () => [],
}

export const UserPreferencesStorage = {
    set: () => { },
    get: () => ({}),
}

export const SearchHistoryStorage = {
    set: () => { },
    get: () => [],
}

export const createStorageBackup = () => ({})

export const validateEmail = (email: string) => email.includes('@')
export const validatePassword = (password: string) => password.length >= 6
export const validateUsername = (username: string) => username.length >= 3
export const validateContent = (content: string) => content
