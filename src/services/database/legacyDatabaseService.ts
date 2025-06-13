import { supabase, type Idea, type User, type Vote } from '../lib/supabase'

export class DatabaseService {
    // Auth operations
    static async signUp(email: string, password: string, username: string) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (authError) throw authError
        if (!authData.user) throw new Error('User creation failed')

        // Create user profile
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                email,
                username,
            })

        if (profileError) throw profileError
        return authData
    }

    static async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) throw error
        return data
    }

    static async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    }

    static async getCurrentUser(): Promise<User | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) throw error
        return data
    }

    // Ideas operations
    static async createIdea(idea: Omit<Idea, 'id' | 'created_at' | 'updated_at' | 'upvotes' | 'downvotes'>) {
        const { data, error } = await supabase
            .from('ideas')
            .insert(idea)
            .select()
            .single()

        if (error) throw error
        return data
    }

    static async getIdeas(): Promise<Idea[]> {
        const { data, error } = await supabase
            .from('ideas')
            .select(`
        *,
        author:users(username)
      `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    static async getIdeaById(id: string): Promise<Idea | null> {
        const { data, error } = await supabase
            .from('ideas')
            .select(`
        *,
        author:users(username)
      `)
            .eq('id', id)
            .single()

        if (error) return null
        return data
    }

    static async updateIdea(id: string, updates: Partial<Idea>) {
        const { data, error } = await supabase
            .from('ideas')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    }

    static async deleteIdea(id: string) {
        const { error } = await supabase
            .from('ideas')
            .delete()
            .eq('id', id)

        if (error) throw error
    }

    // Voting operations
    static async vote(ideaId: string, voteType: 'upvote' | 'downvote') {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        // Check if user already voted
        const { data: existingVote } = await supabase
            .from('votes')
            .select('*')
            .eq('user_id', user.id)
            .eq('idea_id', ideaId)
            .single()

        if (existingVote) {
            if (existingVote.vote_type === voteType) {
                // Remove vote if clicking same vote type
                const { error } = await supabase
                    .from('votes')
                    .delete()
                    .eq('id', existingVote.id)
                if (error) throw error
            } else {
                // Update vote type
                const { error } = await supabase
                    .from('votes')
                    .update({ vote_type: voteType })
                    .eq('id', existingVote.id)
                if (error) throw error
            }
        } else {
            // Create new vote
            const { error } = await supabase
                .from('votes')
                .insert({
                    user_id: user.id,
                    idea_id: ideaId,
                    vote_type: voteType,
                })
            if (error) throw error
        }
    }

    static async getUserVote(ideaId: string): Promise<Vote | null> {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data, error } = await supabase
            .from('votes')
            .select('*')
            .eq('user_id', user.id)
            .eq('idea_id', ideaId)
            .single()

        if (error) return null
        return data
    }

    // User profile operations
    static async updateUserProfile(userId: string, updates: Partial<User>) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single()

        if (error) throw error
        return data
    }

    static async getUserProfile(userId: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) return null
        return data
    }

    // Real-time subscriptions
    static subscribeToIdeas(callback: (ideas: Idea[]) => void) {
        return supabase
            .channel('ideas')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'ideas' },
                () => {
                    // Refetch ideas when changes occur
                    this.getIdeas().then(callback)
                }
            )
            .subscribe()
    }

    static subscribeToVotes(ideaId: string, callback: (votes: Vote[]) => void) {
        return supabase
            .channel(`votes_${ideaId}`)
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'votes',
                    filter: `idea_id=eq.${ideaId}`
                },
                () => {
                    // Refetch votes when changes occur
                    supabase
                        .from('votes')
                        .select('*')
                        .eq('idea_id', ideaId)
                        .then(({ data }) => callback(data || []))
                }
            )
            .subscribe()
    }
}
