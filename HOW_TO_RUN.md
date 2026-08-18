
# Resume Redefined — Setup & Run Guide

A step-by-step guide for complete beginners. No prior technical knowledge needed.

---

## What Is This Project?

**Resume Redefined** is a full-stack resume builder web application. Users create an account, answer a guided questionnaire, choose from **40 professionally designed templates**, and download their resume as PDF or DOCX. Existing resumes can be uploaded (PDF/DOCX) to auto-fill the questionnaire.

The project uses:

- **React 19 + Vite 7** — frontend (SPA with state-based navigation)
- **Express 5 + Drizzle ORM** — backend REST API
- **PostgreSQL** — database (users, resumes with JSONB data)
- **JWT + bcrypt** — authentication with httpOnly cookie sessions
- **pnpm workspaces** — monorepo package management

---

## Prerequisites (One-Time Setup)

You need three things installed on your computer before running the project.

### 1. Install Node.js (v20 or later)

Node.js is the engine that runs JavaScript outside of a browser.

1. Go to: https://nodejs.org/
2. Download the **LTS** version (Long Term Support)
3. Install it like any normal program

**Verify it worked:**

```bash
node --version    # should print v20.x.x or higher
npm --version     # should print 10.x.x or higher
```

### 2. Install pnpm

pnpm is the package manager this project uses (instead of npm or yarn).

```bash
npm install -g pnpm
pnpm --version    # should print 11.x.x or higher
```

### 3. Install PostgreSQL

The backend stores user accounts and resume data in a PostgreSQL database.

**Option A — Local install (recommended for development):**

- **Mac:** `brew install postgresql@16` then `brew services start postgresql@16`
- **Ubuntu/Debian:** `sudo apt install postgresql postgresql-contrib`
- **Windows:** Download the installer from https://www.postgresql.org/download/windows/

**Option B — Cloud-hosted database:**

Use any PostgreSQL-compatible service (Neon, Supabase, Railway, etc.) and copy the connection string.

After installing locally, create a database for the project:

```bash
createdb resumeredefined    # or: psql -c "CREATE DATABASE resumeredefined;"
```

---

## Environment Variables

The backend needs three environment variables. Create a file named `.env` in the **project root** (next to `pnpm-workspace.yaml`):

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resumeredefined

# Secret key for signing JWT tokens — use any long random string
JWT_SECRET=change-me-to-a-long-random-secret

# Port the API server listens on
PORT=5000
```

> **Tip:** You can generate a strong secret with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

For cloud databases, replace the `DATABASE_URL` with your provider's connection string.

---

## Running the Project

### Step 1: Open Your Terminal in the Project Folder

```bash
cd ~/Desktop/Project4-main    # adjust path to your project location
```

### Step 2: Install Dependencies

```bash
pnpm install
```

This downloads all packages for every workspace package. It may take 1–5 minutes the first time. A `node_modules/` folder will appear — **do not touch it**.

### Step 3: Push the Database Schema

This creates the `users` and `resumes` tables in your PostgreSQL database:

```bash
DATABASE_URL=postgresql://postgres@localhost:5432/resumeredefined pnpm --filter @workspace/db run push
```

You should see Drizzle Kit output confirming the tables were created. You only need to run this once (or after schema changes).

### Step 4: Start the Backend API Server

Open a **new terminal tab/window** and run:

```bash
# From the project root:
PORT=5000 JWT_SECRET=change-me-to-a-long-random-secret DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resumeredefined pnpm --filter @workspace/api-server run dev
```

> Or, if you created the `.env` file, your shell may auto-load it (depending on your setup). On Replit or platforms with built-in Secrets, just set the values there and run:
> ```bash
> pnpm --filter @workspace/api-server run dev
> ```

You should see:

```
Server listening {"port":5000}
```

The API is now running at **http://localhost:5000**.

### Step 5: Start the Frontend Dev Server

Open **another terminal tab/window** and run:

```bash
pnpm --filter @workspace/job-application-master-profile run dev
```

You should see:

```
VITE v7.x.x  ready in 300 ms

➜  Local:   http://localhost:5173/
```

### Step 6: Open the App

Open your browser and go to **http://localhost:5173/**

Both servers must be running simultaneously:

| Service   | URL                      | Terminal |
|-----------|--------------------------|----------|
| Frontend  | http://localhost:5173    | Tab 1    |
| Backend   | http://localhost:5000    | Tab 2    |

The Vite dev server automatically proxies `/api/*` requests from the frontend to the backend, so everything works on a single origin.

### Step 7: Stop the Servers When Done

In each terminal tab, press `Ctrl + C` to stop the server.

---

## Quick Reference (Copy-Paste Commands)

If you already did the one-time setup (Node.js + pnpm + PostgreSQL), run these every time:

```bash
# 1. Go to the project folder
cd ~/Desktop/Project4-main

# 2. Install dependencies (first time or after pulling updates)
pnpm install

# 3. Push database schema (first time or after schema changes)
DATABASE_URL=postgresql://postgres@localhost:5432/resumeredefined pnpm --filter @workspace/db run push

# 4. Start the backend (in one terminal tab)
PORT=5000 JWT_SECRET=your-secret DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resumeredefined pnpm --filter @workspace/api-server run dev

# 5. Start the frontend (in another terminal tab)
pnpm --filter @workspace/job-application-master-profile run dev
```

Then open **http://localhost:5173/** in your browser.

---

## The Full User Flow

1. **Landing Page** — Learn about Resume Redefined, see the 4-step process
2. **Sign Up / Log In** — Create an account or sign in to an existing one
3. **Dashboard** — See all your resumes, create new ones, or continue editing
4. **Role Selection** — Pick a career category (Students, Freshers, Experienced, Career Switchers, Freelance)
5. **Template Gallery** — Browse 40 templates across 5 categories, see live previews
6. **Resume Import** — Start from scratch or upload an existing PDF/DOCX resume
7. **Questionnaire** — Answer guided questions (auto-filled if you uploaded a resume)
8. **Review** — Review and refine your answers
9. **Resume Builder** — Live preview, switch templates on-the-fly, download PDF or DOCX

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (port 5173)                   │
│  React 19 SPA — state-based navigation (no URL router)  │
│  Vite dev server proxies /api/* → localhost:5000         │
└───────────────────────┬─────────────────────────────────┘
                        │ fetch('/api/...')
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  API Server (port 5000)                  │
│  Express 5 · REST API · JWT auth · httpOnly cookies     │
│  Routes: /api/auth/* , /api/resumes/*                   │
└───────────────────────┬─────────────────────────────────┘
                        │ drizzle-orm
                        ▼
┌─────────────────────────────────────────────────────────┐
│                     PostgreSQL                           │
│  Tables: users (id, email, password_hash, created_at)   │
│          resumes (id, user_id, name, category,          │
│                   template_id, data [JSONB],            │
│                   created_at, updated_at)               │
└─────────────────────────────────────────────────────────┘
```

### Key Design Decisions

- **State-based navigation** — No React Router; boolean flags (`showLanding`, `showLogin`, `showDashboard`, etc.) control which page renders
- **40 templates** — Config-driven: each template is a declarative `TemplateConfig` object with layout, typography, and color settings
- **Dual persistence** — Data is saved to the server (debounced, best-effort) AND to `localStorage` as a fallback
- **Template persistence** — The selected template ID is stored in the database `template_id` column and synced to the frontend
- **Resume Redefined design system** — Thick borders, offset box-shadows, Space Grotesk / DM Mono / DM Sans fonts, CSS custom properties defined in `theme.css`

---

## Project Structure

```
Project4-main/                                ← Root (pnpm workspace)
├── package.json                              ← Root config
├── pnpm-workspace.yaml                       ← Workspace definition
├── pnpm-lock.yaml                            ← Locked dependency versions
├── HOW_TO_RUN.md                             ← This file
│
├── artifacts/
│   ├── api-server/                           ← Backend (Express 5 API)
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts                      ← Entry point (reads PORT env)
│   │   │   ├── app.ts                        ← Express app setup (CORS, routes)
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts                   ← POST /api/auth/register, /login, /logout, /me
│   │   │   │   └── resumes.ts                ← CRUD /api/resumes/*
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts                   ← JWT sign/verify, cookie options
│   │   │   │   └── logger.ts                 ← Pino logger
│   │   │   └── middlewares/
│   │   │       └── auth.ts                   ← requireAuth middleware
│   │   └── build.mjs                         ← esbuild config
│   │
│   └── job-application-master-profile/       ← Frontend (React 19 + Vite 7)
│       ├── package.json
│       ├── vite.config.ts                    ← Vite config (API proxy to :5000)
│       ├── index.html
│       └── src/
│           ├── App.tsx                        ← Main orchestrator (routing, state, flow)
│           ├── Landing.tsx                    ← Landing page
│           ├── ResumeImport.tsx               ← Upload/create page
│           ├── ResumeBuilder.tsx              ← Resume preview + download
│           ├── masterProfile.ts              ← Data model (DO NOT MODIFY)
│           ├── questionnaire.ts              ← Question definitions (DO NOT MODIFY)
│           ├── resumeParser.ts               ← PDF/DOCX parsing engine
│           ├── resumeOptimizer.ts            ← Heuristic optimization engine
│           ├── resumeTemplates.ts            ← Template schema
│           ├── resumeMapper.ts               ← PDF/DOCX rendering engine
│           ├── resumeDocument.ts             ← Document type definitions
│           ├── pages/
│           │   ├── LoginPage.tsx              ← Auth page
│           │   ├── DashboardPage.tsx          ← Resume dashboard
│           │   ├── TemplateGallery.tsx        ← Template browser (40 templates)
│           │   └── RoleSelect.tsx             ← Category selection (DO NOT MODIFY)
│           ├── hooks/
│           │   └── useAuth.tsx                ← Auth context provider
│           ├── lib/
│           │   └── api.ts                     ← API client (fetch wrappers)
│           ├── templates/                     ← 40 template config files
│           └── styles/
│               ├── theme.css                  ← Global design tokens + base styles
│               ├── landing.css                ← Landing page styles
│               ├── dashboard.css              ← Dashboard styles
│               ├── login.css                  ← Login page styles
│               ├── roleSelect.css             ← Role selection styles
│               └── resumeImport.css           ← Upload page styles
│
├── lib/                                      ← Shared workspace libraries
│   ├── db/                                   ← Database (Drizzle ORM + schema)
│   │   ├── src/
│   │   │   ├── index.ts                      ← Pool + db instance
│   │   │   └── schema/
│   │   │       ├── users.ts                  ← users table
│   │   │       └── resumes.ts                ← resumes table
│   │   └── drizzle.config.ts                 ← Drizzle Kit config
│   ├── api-zod/                              ← Shared Zod validation schemas
│   └── api-client-react/                     ← Shared React API utilities
│
└── scripts/                                  ← Utility scripts
```

---

## Troubleshooting

### "command not found: pnpm"

Install pnpm globally: `npm install -g pnpm`

### "command not found: node" or "command not found: npm"

Install Node.js from https://nodejs.org/

### "DATABASE_URL must be set"

The backend cannot connect to PostgreSQL. Make sure:
1. PostgreSQL is running (`pg_isready` or `brew services list`)
2. You created the database (`createdb resumeredefined`)
3. `DATABASE_URL` is set correctly in your environment or `.env` file

### "JWT_SECRET environment variable is required"

Set the `JWT_SECRET` environment variable before starting the backend. Use any long random string.

### "PORT environment variable is required"

Set `PORT=5000` before starting the backend server.

### Port 5000 or 5173 is already in use

Another program is using that port. Either close it, or use a different port:

```bash
# Backend on port 5001:
PORT=5001 pnpm --filter @workspace/api-server run dev

# Frontend on port 5174:
pnpm --filter @workspace/job-application-master-profile run dev -- --port 5174
```

If you change the backend port, also update the proxy target in `vite.config.ts`:

```ts
proxy: {
  '/api': {
    target: 'http://localhost:5001',  // match your backend port
    changeOrigin: true,
  },
},
```

### "Use pnpm instead" error

This project only works with pnpm. Use `pnpm` commands, not `npm`.

### Frontend loads but API calls fail (404 or network errors)

Make sure the backend server is running in a separate terminal on port 5000. The Vite proxy forwards `/api/*` to the backend — if the backend is not running, requests will fail.

### The page is blank or shows an error

1. Check **both** terminals for error messages
2. Stop both servers (`Ctrl + C`) and restart them
3. Make sure you ran `pnpm install` in the project root
4. Make sure you ran `DATABASE_URL=postgresql://postgres@localhost:5432/resumeredefined pnpm --filter @workspace/db run push` to create the database tables

---

## Type Checking (Optional)

Verify the code has no TypeScript errors:

```bash
# From the project root — checks all packages:
pnpm typecheck
```

---

## Building for Production (Optional)

Build the frontend for deployment:

```bash
pnpm --filter @workspace/job-application-master-profile run build
```

This creates a `dist/public/` folder with the compiled static site. The backend must still be deployed separately (e.g., on a Node.js host or serverless platform).
