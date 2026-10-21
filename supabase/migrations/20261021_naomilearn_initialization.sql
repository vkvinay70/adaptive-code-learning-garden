-- ============================================================================
-- NaomiLearn — Python & AI Academy
-- Complete Idempotent PostgreSQL & Supabase Initialization Script
-- Migration: 20261021_naomilearn_initialization.sql
-- ============================================================================

-- Enable UUID generation extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. UTILITY FUNCTIONS & UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. USER PROFILES TABLE (Linked to auth.users / Google OAuth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  preferred_level TEXT NOT NULL DEFAULT 'Beginner'
    CHECK (preferred_level IN ('Beginner', 'Intermediate', 'Advanced')),
  daily_goal INTEGER NOT NULL DEFAULT 5
    CHECK (daily_goal >= 1 AND daily_goal <= 50),
  study_minutes INTEGER NOT NULL DEFAULT 0
    CHECK (study_minutes >= 0),
  streak_days INTEGER NOT NULL DEFAULT 0
    CHECK (streak_days >= 0),
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Automatically provision or update a profile row when a user signs in via Google OAuth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, 'Student'), '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc'::text, now());

  INSERT INTO public.user_learning_goals (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. LEARNING PROGRESS TABLE (24 Curriculum Modules & Code Lab Submissions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  module_title TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'Beginner'
    CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  completed BOOLEAN NOT NULL DEFAULT false,
  exercise_completed BOOLEAN NOT NULL DEFAULT false,
  code_submitted TEXT,
  best_score INTEGER NOT NULL DEFAULT 0
    CHECK (best_score >= 0 AND best_score <= 100),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_learning_progress_user_module UNIQUE (user_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id
  ON public.learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_module_id
  ON public.learning_progress(module_id);

DROP TRIGGER IF EXISTS set_learning_progress_updated_at ON public.learning_progress;
CREATE TRIGGER set_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 4. QUIZ ATTEMPTS TABLE (Adaptive Quiz Scores & Answer History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  level TEXT NOT NULL
    CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  score INTEGER NOT NULL CHECK (score >= 0),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id_attempted_at
  ON public.quiz_attempts(user_id, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_module_id
  ON public.quiz_attempts(module_id);

-- ============================================================================
-- 5. AI TUTOR CONVERSATIONS & MESSAGES TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tutor_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Python AI Tutor Session',
  module_context TEXT NOT NULL DEFAULT 'Variables & Data Types',
  level_context TEXT NOT NULL DEFAULT 'Beginner'
    CHECK (level_context IN ('Beginner', 'Intermediate', 'Advanced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tutor_conversations_user_id_updated_at
  ON public.tutor_conversations(user_id, updated_at DESC);

DROP TRIGGER IF EXISTS set_tutor_conversations_updated_at ON public.tutor_conversations;
CREATE TRIGGER set_tutor_conversations_updated_at
  BEFORE UPDATE ON public.tutor_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.tutor_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.tutor_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model', 'assistant', 'system')),
  content TEXT NOT NULL,
  tools_used TEXT[] NOT NULL DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_tutor_messages_conversation_id_created_at
  ON public.tutor_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_user_id
  ON public.tutor_messages(user_id);

-- ============================================================================
-- 6. USER LEARNING GOALS & PREFERENCES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_learning_goals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  weekly_target_modules INTEGER NOT NULL DEFAULT 3
    CHECK (weekly_target_modules >= 1 AND weekly_target_modules <= 24),
  daily_activity_target INTEGER NOT NULL DEFAULT 5
    CHECK (daily_activity_target >= 1 AND daily_activity_target <= 50),
  current_track TEXT NOT NULL DEFAULT 'Beginner'
    CHECK (current_track IN ('Beginner', 'Intermediate', 'Advanced')),
  reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_user_learning_goals_updated_at ON public.user_learning_goals;
CREATE TRIGGER set_user_learning_goals_updated_at
  BEFORE UPDATE ON public.user_learning_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Attach auth.users trigger after all dependent tables exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_goals ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only read, insert, and update their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Learning Progress: Users can only CRUD their own module progress
DROP POLICY IF EXISTS "Users can view their own learning progress" ON public.learning_progress;
CREATE POLICY "Users can view their own learning progress"
  ON public.learning_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own learning progress" ON public.learning_progress;
CREATE POLICY "Users can insert their own learning progress"
  ON public.learning_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own learning progress" ON public.learning_progress;
CREATE POLICY "Users can update their own learning progress"
  ON public.learning_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own learning progress" ON public.learning_progress;
CREATE POLICY "Users can delete their own learning progress"
  ON public.learning_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Quiz Attempts: Users can only view and insert their own quiz attempts
DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can view their own quiz attempts"
  ON public.quiz_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can insert their own quiz attempts"
  ON public.quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own quiz attempts" ON public.quiz_attempts;
CREATE POLICY "Users can delete their own quiz attempts"
  ON public.quiz_attempts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tutor Conversations: Users can only CRUD their own conversations
DROP POLICY IF EXISTS "Users can view their own tutor conversations" ON public.tutor_conversations;
CREATE POLICY "Users can view their own tutor conversations"
  ON public.tutor_conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tutor conversations" ON public.tutor_conversations;
CREATE POLICY "Users can insert their own tutor conversations"
  ON public.tutor_conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tutor conversations" ON public.tutor_conversations;
CREATE POLICY "Users can update their own tutor conversations"
  ON public.tutor_conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tutor conversations" ON public.tutor_conversations;
CREATE POLICY "Users can delete their own tutor conversations"
  ON public.tutor_conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Tutor Messages: Users can only CRUD messages belonging to their own user_id
DROP POLICY IF EXISTS "Users can view their own tutor messages" ON public.tutor_messages;
CREATE POLICY "Users can view their own tutor messages"
  ON public.tutor_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tutor messages" ON public.tutor_messages;
CREATE POLICY "Users can insert their own tutor messages"
  ON public.tutor_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tutor messages" ON public.tutor_messages;
CREATE POLICY "Users can delete their own tutor messages"
  ON public.tutor_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- User Learning Goals: Users can only CRUD their own learning goals
DROP POLICY IF EXISTS "Users can view their own learning goals" ON public.user_learning_goals;
CREATE POLICY "Users can view their own learning goals"
  ON public.user_learning_goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own learning goals" ON public.user_learning_goals;
CREATE POLICY "Users can insert their own learning goals"
  ON public.user_learning_goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own learning goals" ON public.user_learning_goals;
CREATE POLICY "Users can update their own learning goals"
  ON public.user_learning_goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
