# Supabase Database Schema for Gamesta - Gaming Fest Platform

This file contains the SQL commands to set up your Supabase database schema for a complete gaming fest idea-sharing platform.

## How to set up:
1. Go to https://supabase.com and create a new project
2. Go to the SQL Editor in your Supabase dashboard
3. Run these commands in order

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  ideas_submitted INTEGER DEFAULT 0,
  total_votes_received INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create idea categories table
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.categories (name, description, icon, color) VALUES
('tournament', 'Competitive gaming tournaments and esports events', 'trophy', '#fbbf24'),
('activity', 'Fun gaming activities and workshops', 'gamepad-2', '#8b5cf6'),
('other', 'Other creative gaming-related ideas', 'lightbulb', '#06b6d4');

-- Create ideas table
CREATE TABLE public.ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  net_votes INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'implemented')),
  featured BOOLEAN DEFAULT false,
  implementation_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  vote_type TEXT CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, idea_id)
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, color, criteria) VALUES
('First Idea', 'Submit your first gaming idea', 'lightbulb', '#fbbf24', '{"type": "ideas_count", "threshold": 1}'),
('Popular Idea', 'Get 10 upvotes on a single idea', 'heart', '#ef4444', '{"type": "idea_upvotes", "threshold": 10}'),
('Trending Creator', 'Get 50 total votes across all ideas', 'trending-up', '#8b5cf6', '{"type": "total_votes", "threshold": 50}'),
('Community Champion', 'Submit 5 approved ideas', 'crown', '#f59e0b', '{"type": "approved_ideas", "threshold": 5}'),
('Early Adopter', 'Be among the first 100 users', 'zap', '#06b6d4', '{"type": "user_rank", "threshold": 100}');

-- Create user achievements junction table
CREATE TABLE public.user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  default_category UUID REFERENCES public.categories(id),
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  dark_mode BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_ideas_author_id ON public.ideas(author_id);
CREATE INDEX idx_ideas_category_id ON public.ideas(category_id);
CREATE INDEX idx_ideas_created_at ON public.ideas(created_at DESC);
CREATE INDEX idx_ideas_net_votes ON public.ideas(net_votes DESC);
CREATE INDEX idx_ideas_status ON public.ideas(status);
CREATE INDEX idx_ideas_featured ON public.ideas(featured);
CREATE INDEX idx_votes_idea_id ON public.votes(idea_id);
CREATE INDEX idx_votes_user_id ON public.votes(user_id);
CREATE INDEX idx_comments_idea_id ON public.comments(idea_id);
CREATE INDEX idx_comments_author_id ON public.comments(author_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Row Level Security Policies

-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Categories table policies (read-only for all users)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

-- Ideas table policies
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ideas" ON public.ideas
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create ideas" ON public.ideas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own ideas" ON public.ideas
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own ideas" ON public.ideas
  FOR DELETE USING (auth.uid() = author_id);

-- Votes table policies
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view votes" ON public.votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON public.votes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON public.votes
  FOR DELETE USING (auth.uid() = user_id);

-- Comments table policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" ON public.comments
  FOR DELETE USING (auth.uid() = author_id);

-- Achievements table policies (read-only)
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- User achievements policies
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all user achievements" ON public.user_achievements
  FOR SELECT USING (true);

CREATE POLICY "System can insert achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- Notifications policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- User preferences policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Functions to update vote counts and user stats
CREATE OR REPLACE FUNCTION update_idea_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'upvote' THEN
      UPDATE public.ideas SET upvotes = upvotes + 1 WHERE id = NEW.idea_id;
    ELSE
      UPDATE public.ideas SET downvotes = downvotes + 1 WHERE id = NEW.idea_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Remove old vote
    IF OLD.vote_type = 'upvote' THEN
      UPDATE public.ideas SET upvotes = upvotes - 1 WHERE id = OLD.idea_id;
    ELSE
      UPDATE public.ideas SET downvotes = downvotes - 1 WHERE id = OLD.idea_id;
    END IF;
    -- Add new vote
    IF NEW.vote_type = 'upvote' THEN
      UPDATE public.ideas SET upvotes = upvotes + 1 WHERE id = NEW.idea_id;
    ELSE
      UPDATE public.ideas SET downvotes = downvotes + 1 WHERE id = NEW.idea_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'upvote' THEN
      UPDATE public.ideas SET upvotes = upvotes - 1 WHERE id = OLD.idea_id;
    ELSE
      UPDATE public.ideas SET downvotes = downvotes - 1 WHERE id = OLD.idea_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update ideas submitted count
    UPDATE public.users 
    SET ideas_submitted = ideas_submitted + 1 
    WHERE id = NEW.author_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrease ideas submitted count
    UPDATE public.users 
    SET ideas_submitted = GREATEST(0, ideas_submitted - 1) 
    WHERE id = OLD.author_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update total votes received
CREATE OR REPLACE FUNCTION update_total_votes_received()
RETURNS TRIGGER AS $$
DECLARE
  idea_author_id UUID;
BEGIN
  -- Get the author of the idea being voted on
  SELECT author_id INTO idea_author_id FROM public.ideas WHERE id = COALESCE(NEW.idea_id, OLD.idea_id);
  
  IF TG_OP = 'INSERT' THEN
    UPDATE public.users 
    SET total_votes_received = total_votes_received + 1 
    WHERE id = idea_author_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.users 
    SET total_votes_received = GREATEST(0, total_votes_received - 1) 
    WHERE id = idea_author_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- No change in vote count for updates, just vote type change
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_idea_vote_counts();

CREATE TRIGGER trigger_update_user_ideas_count
  AFTER INSERT OR DELETE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER trigger_update_user_votes_received
  AFTER INSERT OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_total_votes_received();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ideas_updated_at
  BEFORE UPDATE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Environment Variables Needed

Add these to your `.env` file (and configure in your hosting platform):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy the "Project URL" and "anon public" key
4. Add them to your environment variables
