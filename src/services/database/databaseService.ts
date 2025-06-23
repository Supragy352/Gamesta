import { supabase, type Category, type Comment, type Idea, type Notification, type User, type UserAchievement, type UserPreferences, type Vote } from '../../lib/supabaseClient';
import { logger } from '../../utils/logger';

export class DatabaseService {    // Auth operations
    static async signUp(email: string, password: string, username: string) {
        logger.info('DATABASE', 'User signup initiated', { email, username });

        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            })

            if (authError) {
                logger.error('DATABASE', 'User signup auth failed', authError, { email });
                throw authError;
            }
            if (!authData.user) {
                const error = new Error('User creation failed');
                logger.error('DATABASE', 'User creation failed - no user data', error, { email });
                throw error;
            }

            // Create user profile
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: authData.user.id,
                    email,
                    username,
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                })

            if (profileError) {
                logger.error('DATABASE', 'User profile creation failed', profileError, {
                    userId: authData.user.id
                });
                throw profileError;
            }            // Create default user preferences
            const { error: prefError } = await supabase
                .from('user_preferences')
                .insert({
                    user_id: authData.user.id,
                })

            if (prefError) {
                logger.warn('DATABASE', 'User preferences creation failed', {
                    userId: authData.user.id,
                    error: prefError.message
                });
                // Don't throw error for preferences - it's not critical
            }

            logger.info('DATABASE', 'User signup completed successfully', {
                userId: authData.user.id,
                email,
                username
            });
            return authData;
        } catch (error) {
            logger.error('DATABASE', 'User signup failed', error instanceof Error ? error : new Error('Unknown error'), { email });
            throw error;
        }
    }

    // Create user profile (called after email verification)
    static async createUserProfile(userId: string, email: string, username: string) {
        logger.info('DATABASE', 'Creating user profile after verification', { userId, email, username });

        try {
            // Create user profile
            const { error: profileError } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    email,
                    username,
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                })

            if (profileError) {
                logger.error('DATABASE', 'User profile creation failed', profileError, { userId });
                throw profileError;
            }

            // Create default user preferences
            const { error: prefError } = await supabase
                .from('user_preferences')
                .insert({
                    user_id: userId,
                })

            if (prefError) {
                logger.warn('DATABASE', 'User preferences creation failed', { userId, error: prefError.message });
                // Don't throw error for preferences - it's not critical
            }

            logger.info('DATABASE', 'User profile created successfully', { userId, email, username });
            return { success: true };
        } catch (error) {
            logger.error('DATABASE', 'User profile creation failed', error instanceof Error ? error : new Error('Unknown error'), { userId });
            throw error;
        }
    } static async signIn(email: string, password: string) {
        logger.info('DATABASE', 'User signin initiated', { email });

        try {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('signIn timeout after 15 seconds')), 15000);
            });

            const signInPromise = supabase.auth.signInWithPassword({
                email,
                password,
            });

            const { data, error } = await Promise.race([signInPromise, timeoutPromise]);

            if (error) {
                logger.error('DATABASE', 'User signin failed', error, { email });
                throw error;
            }

            logger.info('DATABASE', 'User signin completed successfully', {
                userId: data.user?.id,
                email
            });
            return data;
        } catch (error) {
            logger.error('DATABASE', 'User signin error', error instanceof Error ? error : new Error('Unknown error'), { email });
            throw error;
        }
    }

    static async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    } static async getCurrentUser(): Promise<User | null> {
        logger.debug('DATABASE', 'Getting current user');

        try {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('getCurrentUser timeout after 10 seconds')), 10000);
            });

            const getUserPromise = (async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    logger.debug('DATABASE', 'No authenticated user found');
                    return null;
                }

                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error) {
                    logger.error('DATABASE', 'Failed to get user profile', error, { userId: user.id });
                    throw error;
                }

                logger.debug('DATABASE', 'Current user retrieved successfully', { userId: user.id });
                return data;
            })();

            const result = await Promise.race([getUserPromise, timeoutPromise]);
            return result;
        } catch (error) {
            logger.error('DATABASE', 'Get current user error', error instanceof Error ? error : new Error('Unknown error'));
            throw error;
        }
    }// Categories operations
    static async getCategories(): Promise<Category[]> {
        logger.debug('DATABASE', 'Fetching categories');

        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name')

            if (error) {
                logger.error('DATABASE', 'Failed to fetch categories', error);
                throw error;
            }

            logger.info('DATABASE', 'Categories fetched successfully', { count: data?.length || 0 });
            return data || [];
        } catch (error) {
            logger.error('DATABASE', 'Get categories error', error instanceof Error ? error : new Error('Unknown error'));
            throw error;
        }
    }

    static async createCategory(category: { name: string; description: string; color: string }) {
        const { data, error } = await supabase
            .from('categories')
            .insert({
                name: category.name,
                description: category.description,
                color: category.color,
            })
            .select()
            .single()

        if (error) throw error
        return data
    }

    // Ideas operations
    static async createIdea(idea: { title: string; description: string; category_id?: string }) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('ideas')
            .insert({
                ...idea,
                author_id: user.id,
            })
            .select(`
                *,
                author:users(username, avatar_url),
                category:categories(*)
            `)
            .single()

        if (error) throw error
        return data
    } static async getIdeas(options: {
        category?: string
        status?: string
        featured?: boolean
        limit?: number
        offset?: number
        sortBy?: 'created_at' | 'net_votes' | 'upvotes'
        sortOrder?: 'asc' | 'desc'
    } = {}): Promise<Idea[]> {
        const {
            category,
            status = 'submitted',
            featured,
            limit = 50,
            offset = 0,
            sortBy = 'created_at',
            sortOrder = 'desc'
        } = options

        logger.debug('DATABASE', 'Fetching ideas', {
            category,
            status,
            featured,
            limit,
            offset,
            sortBy,
            sortOrder
        });

        try {
            let query = supabase
                .from('ideas')
                .select(`
                    *,
                    author:users(username, avatar_url),
                    category:categories(*)
                `)
                .eq('status', status)

            if (category) {
                query = query.eq('category_id', category)
            }

            if (featured !== undefined) {
                query = query.eq('featured', featured)
            } query = query
                .order(sortBy, { ascending: sortOrder === 'asc' })
                .range(offset, offset + limit - 1)

            const { data, error } = await query

            if (error) {
                logger.error('DATABASE', 'Failed to fetch ideas', error, { options });
                throw error;
            }

            logger.info('DATABASE', 'Ideas fetched successfully', {
                count: data?.length || 0,
                category,
                status
            });

            // Get user votes for each idea if user is authenticated
            const { data: { user } } = await supabase.auth.getUser()
            if (user && data) {
                const ideaIds = data.map(idea => idea.id)
                const { data: votes } = await supabase
                    .from('votes')
                    .select('idea_id, vote_type')
                    .eq('user_id', user.id)
                    .in('idea_id', ideaIds)

                const voteMap = new Map(votes?.map(v => [v.idea_id, v.vote_type]) || [])

                return data.map(idea => ({
                    ...idea,
                    user_vote: voteMap.get(idea.id) || null
                }))
            }

            return data || [];
        } catch (error) {
            logger.error('DATABASE', 'Get ideas error', error instanceof Error ? error : new Error('Unknown error'), { options });
            throw error;
        }
    }

    static async getIdeaById(id: string): Promise<Idea | null> {
        const { data, error } = await supabase
            .from('ideas')
            .select(`
                *,
                author:users(username, avatar_url),
                category:categories(*)
            `)
            .eq('id', id)
            .single()

        if (error) return null

        // Get user vote if authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: userVote } = await supabase
                .from('votes')
                .select('vote_type')
                .eq('user_id', user.id)
                .eq('idea_id', id)
                .single()

            return {
                ...data,
                user_vote: userVote?.vote_type || null
            }
        }

        return data
    }

    static async updateIdea(id: string, updates: Partial<Idea>) {
        const { data, error } = await supabase
            .from('ideas')
            .update(updates)
            .eq('id', id)
            .select(`
                *,
                author:users(username, avatar_url),
                category:categories(*)
            `)
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
                return null
            } else {
                // Update vote type
                const { data, error } = await supabase
                    .from('votes')
                    .update({ vote_type: voteType })
                    .eq('id', existingVote.id)
                    .select()
                    .single()
                if (error) throw error
                return data
            }
        } else {
            // Create new vote
            const { data, error } = await supabase
                .from('votes')
                .insert({
                    user_id: user.id,
                    idea_id: ideaId,
                    vote_type: voteType,
                })
                .select()
                .single()
            if (error) throw error
            return data
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

    // Comments operations
    static async getComments(ideaId: string): Promise<Comment[]> {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                author:users(username, avatar_url)
            `)
            .eq('idea_id', ideaId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data || []
    }

    static async createComment(ideaId: string, content: string, parentId?: string) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not authenticated')

        const { data, error } = await supabase
            .from('comments')
            .insert({
                idea_id: ideaId,
                author_id: user.id,
                content,
                parent_id: parentId || null,
            })
            .select(`
                *,
                author:users(username, avatar_url)
            `)
            .single()

        if (error) throw error
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

    // User achievements
    static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
        const { data, error } = await supabase
            .from('user_achievements')
            .select(`
                *,
                achievement:achievements(*)
            `)
            .eq('user_id', userId)
            .order('earned_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    // Notifications
    static async getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) throw error
        return data || []
    }

    static async markNotificationAsRead(notificationId: string) {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)

        if (error) throw error
    }

    // User preferences
    static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
        const { data, error } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId)
            .single()

        if (error) return null
        return data
    }

    static async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>) {
        const { data, error } = await supabase
            .from('user_preferences')
            .update(preferences)
            .eq('user_id', userId)
            .select()
            .single()

        if (error) throw error
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

    static subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
        return supabase
            .channel(`notifications_${userId}`)
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${userId}`
                },
                () => {
                    // Refetch notifications when changes occur
                    this.getUserNotifications(userId).then(callback)
                }
            )
            .subscribe()
    }

    // Admin helper methods for testing
    static async getAllUsers(): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    static async getAllIdeas(): Promise<Idea[]> {
        const { data, error } = await supabase
            .from('ideas')
            .select(`
                *,
                author:users(username, avatar_url),
                category:categories(*)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    static async getAllVotes(): Promise<Vote[]> {
        const { data, error } = await supabase
            .from('votes')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }

    static async voteOnIdea(ideaId: string, userId: string, voteType: 'upvote' | 'downvote') {
        // Check if user already voted
        const { data: existingVote } = await supabase
            .from('votes')
            .select('*')
            .eq('user_id', userId)
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
                return null
            } else {
                // Update vote type
                const { data, error } = await supabase
                    .from('votes')
                    .update({ vote_type: voteType })
                    .eq('id', existingVote.id)
                    .select()
                    .single()
                if (error) throw error
                return data
            }
        } else {
            // Create new vote
            const { data, error } = await supabase
                .from('votes')
                .insert({
                    user_id: userId,
                    idea_id: ideaId,
                    vote_type: voteType,
                })
                .select()
                .single()
            if (error) throw error
            return data
        }
    }

    static async searchIdeas(query: string, categoryIds: string[]): Promise<Idea[]> {
        let supabaseQuery = supabase
            .from('ideas')
            .select(`
                *,
                author:users(username, avatar_url),
                category:categories(*)
            `)

        if (query) {
            supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        }

        if (categoryIds.length > 0) {
            supabaseQuery = supabaseQuery.in('category_id', categoryIds)
        } const { data, error } = await supabaseQuery.order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    }
}
