import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    username: string
                    bio: string | null
                    avatar_url: string | null
                    ideas_submitted: number
                    total_votes_received: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    username: string
                    bio?: string | null
                    avatar_url?: string | null
                    ideas_submitted?: number
                    total_votes_received?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    email?: string
                    username?: string
                    bio?: string | null
                    avatar_url?: string | null
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    icon: string | null
                    color: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    icon?: string | null
                    color?: string | null
                    created_at?: string
                }
                Update: {
                    name?: string
                    description?: string | null
                    icon?: string | null
                    color?: string | null
                }
            }
            ideas: {
                Row: {
                    id: string
                    title: string
                    description: string
                    category_id: string | null
                    upvotes: number
                    downvotes: number
                    net_votes: number
                    author_id: string
                    status: string
                    featured: boolean
                    implementation_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    category_id?: string | null
                    upvotes?: number
                    downvotes?: number
                    author_id: string
                    status?: string
                    featured?: boolean
                    implementation_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    title?: string
                    description?: string
                    category_id?: string | null
                    status?: string
                    featured?: boolean
                    implementation_date?: string | null
                    updated_at?: string
                }
            }
            votes: {
                Row: {
                    id: string
                    user_id: string
                    idea_id: string
                    vote_type: 'upvote' | 'downvote'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    idea_id: string
                    vote_type: 'upvote' | 'downvote'
                    created_at?: string
                }
                Update: {
                    vote_type?: 'upvote' | 'downvote'
                }
            }
            comments: {
                Row: {
                    id: string
                    idea_id: string
                    author_id: string
                    content: string
                    parent_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    idea_id: string
                    author_id: string
                    content: string
                    parent_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    content?: string
                    updated_at?: string
                }
            }
            achievements: {
                Row: {
                    id: string
                    name: string
                    description: string
                    icon: string | null
                    color: string | null
                    criteria: any
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description: string
                    icon?: string | null
                    color?: string | null
                    criteria?: any
                    created_at?: string
                }
                Update: {
                    name?: string
                    description?: string
                    icon?: string | null
                    color?: string | null
                    criteria?: any
                }
            }
            user_achievements: {
                Row: {
                    id: string
                    user_id: string
                    achievement_id: string
                    earned_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    achievement_id: string
                    earned_at?: string
                }
                Update: never
            }
            notifications: {
                Row: {
                    id: string
                    user_id: string
                    type: string
                    title: string
                    message: string
                    data: any | null
                    read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    type: string
                    title: string
                    message: string
                    data?: any | null
                    read?: boolean
                    created_at?: string
                }
                Update: {
                    read?: boolean
                }
            }
            user_preferences: {
                Row: {
                    id: string
                    user_id: string
                    default_category: string | null
                    email_notifications: boolean
                    push_notifications: boolean
                    dark_mode: boolean
                    preferences: any
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    default_category?: string | null
                    email_notifications?: boolean
                    push_notifications?: boolean
                    dark_mode?: boolean
                    preferences?: any
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    default_category?: string | null
                    email_notifications?: boolean
                    push_notifications?: boolean
                    dark_mode?: boolean
                    preferences?: any
                    updated_at?: string
                }
            }
        }
    }
}

export type User = Database['public']['Tables']['users']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Idea = Database['public']['Tables']['ideas']['Row'] & {
    author?: Pick<User, 'username' | 'avatar_url'>
    category?: Category
    user_vote?: 'upvote' | 'downvote' | null
    comments_count?: number
}
export type Vote = Database['public']['Tables']['votes']['Row']
export type Comment = Database['public']['Tables']['comments']['Row'] & {
    author?: Pick<User, 'username' | 'avatar_url'>
}
export type Achievement = Database['public']['Tables']['achievements']['Row']
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row'] & {
    achievement?: Achievement
}
export type Notification = Database['public']['Tables']['notifications']['Row']
export type UserPreferences = Database['public']['Tables']['user_preferences']['Row']
