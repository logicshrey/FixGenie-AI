## FixGenie AI – AI-Based Maintenance Issue Resolver

FixGenie AI is an NLP-powered maintenance ticketing platform built with **Next.js 14 App Router**, **TypeScript**, **TailwindCSS**, **shadcn/ui**, **Prisma**, **PostgreSQL (Neon/Supabase)**, and **Google Gemini / OpenAI**.

It lets users report issues (plumbing, electrical, wifi, AC, etc.), automatically classifies and prioritizes them using AI, detects duplicates, predicts resolution time, and powers a full ticket workflow for **Users**, **Technicians**, and **Admins**.

### Tech Stack

- **Framework**: Next.js 14 (App Router), TypeScript
- **UI**: TailwindCSS, shadcn/ui, Framer Motion, Lucide-react
- **Auth**: NextAuth.js (JWT sessions) with roles: `USER`, `TECHNICIAN`, `ADMIN`
- **DB**: PostgreSQL (Neon or Supabase), Prisma ORM
- **AI**: Google Gemini (preferred) or OpenAI with Zod-validated structured outputs

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon or Supabase recommended)
- One of:
  - Google Gemini API key
  - OpenAI API key

### Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

Copy `.env.example` to `.env.local` and fill values:

- `DATABASE_URL` – Postgres connection string
- `NEXTAUTH_URL` – e.g. `http://localhost:3000` in dev
- `NEXTAUTH_SECRET` – random string
- `GEMINI_API_KEY` or `OPENAI_API_KEY`

3. **Prisma migration**

```bash
npx prisma migrate dev --name init
```

4. **Run dev server**

```bash
npm run dev
```

Visit `http://localhost:3000`.

### Authentication & Roles

- Register via `/register` – new users default to `USER`.
- Promote to `ADMIN` or `TECHNICIAN` by updating the `User.role` field in the database (or via future admin UI).
- Role-based routing is enforced in `middleware.ts` and via API RBAC checks.

### Key Pages

- `/` – Marketing landing page
- `/login`, `/register` – Auth
- `/dashboard` – User overview
- `/tickets`, `/tickets/new`, `/tickets/[id]` – User ticket lifecycle
- `/technician`, `/technician/tickets/[id]` – Technician view
- `/admin`, `/admin/tickets`, `/admin/tickets/[id]`, `/admin/technicians` – Admin analytics and management
- `/chat` – FixBot AI chatbot with context from resolved tickets

### AI Features

- **NLP analysis** on ticket creation via `/api/ai/analyze-ticket`
  - Category, priority, summary, keywords, fix steps, technician type, predicted resolution time
- **FixBot chatbot** via `/api/ai/chat`
  - Answers user questions and uses similar resolved tickets as context
- **Zod validation** ensures safe structured outputs; fallbacks applied on AI failure.

### Testing

Basic tests use **Vitest**:

- AI response validation
- Ticket creation API

Run:

```bash
npm test
```

### Deployment (Vercel)

1. Push this repository to GitHub.
2. Import in Vercel.
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (Vercel URL)
   - `NEXTAUTH_SECRET`
   - `GEMINI_API_KEY` or `OPENAI_API_KEY`
4. Vercel will run `npm install`, `npx prisma migrate deploy`, and `npm run build` automatically.

### Folder Structure

- `app/` – App Router pages & API routes
- `components/` – UI components and shared layout
- `lib/auth/` – NextAuth configuration
- `lib/db/` – Prisma client
- `lib/ai/` – AI client + Zod schemas
- `prisma/` – Prisma schema
- `services/`, `utils/` – Business logic and helpers
- `middleware.ts` – RBAC and route protection

