-- ── AI TUTOR PLATFORM DATABASE SCHEMA ──────────────────────────────────────────
-- Target: Supabase (PostgreSQL)
-- Description: Core schema for user management, chat history, notes, quizzes, and analytics.

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. USERS TABLE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── 2. CHAT HISTORY TABLE ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
    content TEXT NOT NULL,
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── 3. NOTES TABLE ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    summary TEXT,
    key_topics TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── 4. QUIZZES TABLE ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) NOT NULL,
    score INT DEFAULT 0,
    total INT NOT NULL,
    questions JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── 5. ANALYTICS TABLE ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    study_minutes INT DEFAULT 0,
    quiz_accuracy FLOAT DEFAULT 0,
    weak_topics TEXT[] DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── INDEXES FOR PERFORMANCE ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_user ON quizzes(user_id);

-- ── 6. TEACHERS TABLE ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);

-- ── 7. LIVE QUIZZES TABLE ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    access_code TEXT UNIQUE NOT NULL,
    duration_minutes INT DEFAULT 10 NOT NULL,
    questions JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ── 8. LIVE QUIZ SUBMISSIONS TABLE ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS live_quiz_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    live_quiz_id UUID REFERENCES live_quizzes(id) ON DELETE CASCADE NOT NULL,
    student_name TEXT NOT NULL,
    student_usn TEXT NOT NULL,
    score INT NOT NULL,
    total INT NOT NULL,
    user_answers JSONB NOT NULL,
    tab_switch_count INT DEFAULT 0 NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_live_quizzes_teacher ON live_quizzes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz ON live_quiz_submissions(live_quiz_id);
