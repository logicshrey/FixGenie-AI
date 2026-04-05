# FixGenie AI – AI-Based Maintenance Issue Resolver

## 🎓 Academic Details
- **Course:** Natural Language Processing (NLP)
- **Class:** Semester VI (Third Year Engineering)
- **College:** Pillai College of Engineering , You can learn more about the college by visiting the official website of Pillai College of Engineering. https://www.pce.ac.in/

## 📌 Overview
FixGenie AI is an NLP-powered maintenance ticketing platform built with Next.js 14. It allows users to report issues (plumbing, electrical, wifi, AC, etc.) while automatically classifying and prioritizing them using AI, detecting duplicates, predicting resolution time, and powering a full ticket workflow for Users, Technicians, and Admins. It also features FixBot, an AI chatbot with context from resolved tickets.

## 🎯 Objective
To streamline and automate the maintenance ticketing process by leveraging Natural Language Processing and AI to automatically classify, prioritize, and route issues to the appropriate technicians, reducing manual overhead and resolution time.

## 🧠 Technologies Used
- **Framework**: Next.js 14 (App Router), TypeScript
- **UI**: TailwindCSS, shadcn/ui, Framer Motion, Lucide-react
- **Auth**: NextAuth.js (JWT sessions)
- **Database**: PostgreSQL (Neon or Supabase), Prisma ORM
- **AI & NLP**: Google Gemini (preferred) / OpenAI with Zod-validated structured outputs
- **Testing**: Vitest

## 📊 Dataset
- **Source of dataset**: User-generated maintenance tickets and historical resolved tickets context.
- **Description**: Textual descriptions of maintenance issues used for AI/NLP classification, priority prediction, and providing intelligent assistance via the FixBot chatbot.

## ⚙️ Installation
Steps to run the project:

```bash
# Clone the repository
git clone <repo-link>
cd <project-folder>

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env.local and fill values:
# DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, GEMINI_API_KEY or OPENAI_API_KEY

# Run Prisma migration
npx prisma migrate dev --name init

# Run dev server
npm run dev
```

## ▶️ Usage
1. Visit `http://localhost:3000`.
2. Register as a new user via `/register` (defaults to `USER` role).
3. Submit a new maintenance ticket. The AI will automatically analyze the natural language input to assign categories, keywords, priorities, and estimated resolution time via `/api/ai/analyze-ticket`.
4. Access the `/chat` route to interact with FixBot AI for Q&A based on resolved ticket context.
5. Users can be promoted to `ADMIN` or `TECHNICIAN` by updating the `User.role` field in the database.

## 📈 Results
- Successful NLP analysis of user tickets for automated categorization.
- Accurate validation of AI responses utilizing Zod schemas.
- Complete implementation of role-based dashboards (Admin, Technician, User).

## 🎥 Demo Video
[Insert YouTube link here]

## 👥 Team Members
- [Name 1]
- [Name 2]
- [Name 3]

## 📌 GitHub Contributions
- [Name 1] – [Contribution description]
- [Name 2] – [Contribution description]
- [Name 3] – [Contribution description]

## 📚 References
- Next.js Documentation
- Prisma ORM Documentation
- Google Gemini API / OpenAI API References
- TailwindCSS and shadcn/ui Guides

