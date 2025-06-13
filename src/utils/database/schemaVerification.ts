import { supabase } from '../../lib/supabaseClient';

export interface TableInfo {
    table_name: string
    exists: boolean
    error?: string
}

export class SchemaVerification {
    static async checkDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
        try {
            const { error } = await supabase.from('users').select('count').limit(1)

            if (error) {
                console.error('Database connection error:', error)
                return { connected: false, error: error.message }
            }

            return { connected: true }
        } catch (error) {
            console.error('Database connection failed:', error)
            return { connected: false, error: (error as Error).message }
        }
    }

    static async checkRequiredTables(): Promise<TableInfo[]> {
        const requiredTables = [
            'users',
            'ideas',
            'categories',
            'votes',
            'comments',
            'notifications',
            'user_preferences',
            'user_achievements'
        ]

        const tableResults: TableInfo[] = []

        for (const tableName of requiredTables) {
            try {
                const { error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1)

                if (error) {
                    console.error(`Table ${tableName} check failed:`, error)
                    tableResults.push({
                        table_name: tableName,
                        exists: false,
                        error: error.message
                    })
                } else {
                    tableResults.push({
                        table_name: tableName,
                        exists: true
                    })
                }
            } catch (error) {
                console.error(`Exception checking table ${tableName}:`, error)
                tableResults.push({
                    table_name: tableName,
                    exists: false,
                    error: (error as Error).message
                })
            }
        }

        return tableResults
    }

    static async createMissingTables(): Promise<{ success: boolean; errors: string[] }> {
        const errors: string[] = []

        try {
            // Check if we can create tables (this would require admin privileges)
            console.log('Note: Table creation requires database admin privileges')
            console.log('Tables should be created through Supabase dashboard or SQL editor')

            return { success: false, errors: ['Table creation requires admin access to Supabase'] }
        } catch (error) {
            errors.push((error as Error).message)
            return { success: false, errors }
        }
    }

    static async generateCreateTableSQL(): Promise<string> {
        return `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  points INTEGER DEFAULT 0,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  user_id UUID REFERENCES users(id),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  idea_id UUID REFERENCES ideas(id),
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, idea_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES ideas(id),
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  theme TEXT DEFAULT 'dark',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_type TEXT NOT NULL,
  achievement_data JSONB,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (adjust as needed)
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view ideas" ON ideas FOR SELECT USING (true);
CREATE POLICY "Users can create ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ideas" ON ideas FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Users can create votes" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON votes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO categories (name, description, color) VALUES
  ('Tournament Ideas', 'Ideas for gaming tournaments and competitions', '#ef4444'),
  ('Event Planning', 'Planning and organization ideas for gaming events', '#f59e0b'),
  ('Tech Setup', 'Technical setup and equipment ideas', '#10b981'),
  ('Community', 'Community building and engagement ideas', '#3b82f6'),
  ('Prizes & Rewards', 'Ideas for prizes and reward systems', '#8b5cf6'),
  ('Marketing', 'Marketing and promotion ideas', '#ec4899')
ON CONFLICT (name) DO NOTHING;
    `
    }
}
