-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 2: CREATE FRESH SCHEMA — Run this AFTER the drop script
-- AI Tutor Platform — Supabase (PostgreSQL)
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. USERS ─────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL,
    email         TEXT        UNIQUE NOT NULL,
    password_hash TEXT        NOT NULL,
    role          TEXT        NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. TEACHERS ──────────────────────────────────────────────────────────────
CREATE TABLE teachers (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL,
    email         TEXT        UNIQUE NOT NULL,
    password_hash TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. CHAT HISTORY ──────────────────────────────────────────────────────────
CREATE TABLE chat_history (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       TEXT        NOT NULL CHECK (role IN ('user', 'assistant')),
    content    TEXT        NOT NULL,
    subject    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 4. NOTES ─────────────────────────────────────────────────────────────────
CREATE TABLE notes (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT        NOT NULL,
    raw_text   TEXT        NOT NULL,
    summary    TEXT,
    key_topics TEXT[]      NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 5. QUIZZES ───────────────────────────────────────────────────────────────
CREATE TABLE quizzes (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject    TEXT        NOT NULL,
    topic      TEXT        NOT NULL,
    difficulty TEXT        NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    score      INT         NOT NULL DEFAULT 0,
    total      INT         NOT NULL,
    questions  JSONB       NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 6. FLASHCARDS ────────────────────────────────────────────────────────────
CREATE TABLE flashcards (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id    UUID,                  -- optional reference to a note
    front      TEXT        NOT NULL,
    back       TEXT        NOT NULL,
    mastered   BOOLEAN     NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 7. STUDY PLANS (Planner) ─────────────────────────────────────────────────────
CREATE TABLE study_plans (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_json  JSONB       NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 8. ANALYTICS ─────────────────────────────────────────────────────────────
CREATE TABLE analytics (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    study_minutes  INT         NOT NULL DEFAULT 0,
    quiz_accuracy  FLOAT       NOT NULL DEFAULT 0,
    weak_topics    TEXT[]      NOT NULL DEFAULT '{}',
    last_updated   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 9. LIVE QUIZZES ──────────────────────────────────────────────────────────
CREATE TABLE live_quizzes (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id       UUID        NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    subject          TEXT        NOT NULL,
    topic            TEXT        NOT NULL,
    access_code      TEXT        UNIQUE NOT NULL,
    duration_minutes INT         NOT NULL DEFAULT 10,
    questions        JSONB       NOT NULL,
    is_active        BOOLEAN     NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 10. LIVE QUIZ SUBMISSIONS ─────────────────────────────────────────────────
CREATE TABLE live_quiz_submissions (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    live_quiz_id     UUID        NOT NULL REFERENCES live_quizzes(id) ON DELETE CASCADE,
    student_name     TEXT        NOT NULL,
    student_usn      TEXT        NOT NULL,
    score            INT         NOT NULL,
    total            INT         NOT NULL,
    user_answers     JSONB       NOT NULL,
    tab_switch_count INT         NOT NULL DEFAULT 0,
    submitted_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── INDEXES ───────────────────────────────────────────────────────────────────
CREATE INDEX idx_chat_user          ON chat_history(user_id);
CREATE INDEX idx_notes_user         ON notes(user_id);
CREATE INDEX idx_quizzes_user       ON quizzes(user_id);
CREATE INDEX idx_flashcards_user    ON flashcards(user_id);
CREATE INDEX idx_study_plans_user   ON study_plans(user_id);
CREATE INDEX idx_live_quiz_teacher  ON live_quizzes(teacher_id);
CREATE INDEX idx_submissions_quiz   ON live_quiz_submissions(live_quiz_id);
CREATE INDEX idx_teachers_email     ON teachers(email);

-- ── VERIFY ────────────────────────────────────────────────────────────────────
-- Run this to confirm all 10 tables were created:
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
