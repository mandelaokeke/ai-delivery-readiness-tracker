# MANDAI — AI Delivery Readiness Tracker

MANDAI is a project and delivery-management workspace for tracking workstream health, launch readiness, risks, milestones, ownership, and leadership decisions in one place.

It supports both individual users and organisations, with secure Supabase authentication, tenant-aware data access, editable workstreams, portfolio reporting, and an AI delivery assistant powered by the OpenAI Responses API.

**Live application:** [ai-delivery-readiness-tracker-1.onrender.com](https://ai-delivery-readiness-tracker-1.onrender.com/)

## Core features

- **Personal and organisation accounts** — create a private personal workspace or an organisation workspace for a delivery team.
- **Secure authentication** — sign up, sign in, sign out, email confirmation, and password recovery through Supabase Auth.
- **Workstream management** — create, edit, filter, and delete workstreams with owners, milestones, status, risk severity, progress, and due dates.
- **Delivery overview** — monitor readiness, active workstreams, at-risk work, and blocked items from a single dashboard.
- **Portfolio reporting** — review status distribution, delivery progress, risk exposure, and upcoming deadlines.
- **MANDAI assistant** — ask questions about the current portfolio and generate focused priorities, mitigation actions, and leadership updates.
- **Role-based access** — owner, admin, project manager, contributor, and viewer permissions backed by PostgreSQL row-level security.
- **Responsive interface** — designed for desktop and mobile project-management workflows.

## Technology

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/) and TypeScript
- [Supabase](https://supabase.com/) Auth and PostgreSQL
- [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses)
- [Lucide React](https://lucide.dev/) icons
- CSS and Tailwind CSS tooling
- [Render](https://render.com/) hosting

## Local development

### 1. Clone and install

```bash
git clone https://github.com/mandelaokeke/ai-delivery-readiness-tracker.git
cd ai-delivery-readiness-tracker
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key
```

`OPENAI_API_KEY` is only used on the server and must never be exposed through a `NEXT_PUBLIC_` variable.

### 3. Set up Supabase

Create a Supabase project and run the migration in:

```text
supabase/migrations/202607140001_initial_multi_tenant.sql
```

The migration creates:

- user profiles
- organisations and memberships
- workstreams
- role and status types
- account-creation triggers
- row-level security policies

In Supabase Authentication settings, add the URLs used by the app:

```text
http://localhost:3000/auth/confirm
http://localhost:3000/auth/reset
https://ai-delivery-readiness-tracker-1.onrender.com/auth/confirm
https://ai-delivery-readiness-tracker-1.onrender.com/auth/reset
```

If you deploy under another domain, replace the Render URL with that public domain.

### 4. Start the application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without Supabase environment variables, the application opens in preview mode with demonstration workstreams. Authentication and persistent changes require Supabase.

## MANDAI assistant

The assistant is available from the Overview page. It sends the user’s question, readiness score, and current workstream data to the OpenAI Responses API.

To enable it, set a valid server-side `OPENAI_API_KEY`. The assistant is instructed to answer only from the supplied delivery portfolio and to avoid inventing project facts.

## Deployment on Render

Create a Render web service connected to this repository, then configure:

```text
Build command: npm install && npm run build
Start command: npm start
```

Add the following environment variables in Render:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SITE_URL
OPENAI_API_KEY
```

Set `NEXT_PUBLIC_SITE_URL` to the public application origin, without a trailing slash:

```text
https://ai-delivery-readiness-tracker-1.onrender.com
```

The application also respects Render’s forwarded host and protocol headers so authentication redirects remain on the public domain rather than Render’s internal port.

## Available commands

```bash
npm run dev      # Start the development server
npm run lint     # Run ESLint
npm run build    # Create a production build
npm start        # Start the production server
```

## Project structure

```text
app/                    Next.js pages, authentication routes, and API routes
components/             Dashboard, authentication, reports, and workspace UI
lib/                    Shared types, application context, URL, and Supabase helpers
supabase/migrations/    Database schema and row-level security policies
```

## Security notes

- Supabase row-level security isolates organisation and personal-workspace records.
- Authentication cookies are managed server-side with `@supabase/ssr`.
- OpenAI credentials remain server-side.
- Workstream mutations are checked against the authenticated user’s workspace role.

## License

This repository does not currently include an open-source license. All rights are reserved by the project owner unless a license is added later.
