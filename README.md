# AI Tutor Platform

A comprehensive AI-powered tutoring platform built with a modern tech stack. This monorepo contains both the frontend and backend applications.

## Project Structure

- `frontend/`: Next.js 14 application (App Router, TypeScript, Tailwind CSS)
- `backend/`: Node.js Express server (TypeScript)

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- Supabase account (for database and authentication)
- Google AI Studio account (for Gemini API key)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, and `JWT_SECRET`.
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Ensure `NEXT_PUBLIC_API_URL` points to your backend server (default: `http://localhost:5000/api`).
4. Start the development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express, TypeScript, Supabase SDK, Google Generative AI (Gemini)
- **Database**: PostgreSQL (via Supabase)
- **AI**: Google Gemini 1.5 Flash

## Features (Planned)

- AI-powered personalized tutoring
- Interactive chat interface
- Student progress tracking
- Resource management
- Secure authentication via Supabase
