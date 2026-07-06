-- ══════════════════════════════════════════════════════════════════════════════
-- STEP 1: DROP ALL TABLES — Run this FIRST in Supabase SQL Editor
-- This nukes everything regardless of what tables currently exist.
-- ══════════════════════════════════════════════════════════════════════════════

-- Drop all tables in the public schema with a single dynamic command
DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Confirm everything is gone
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- ↑ This should return 0 rows if the drop was successful.
