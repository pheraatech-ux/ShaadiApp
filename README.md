# Shaadi Wedding Planner

Professional starter platform for building a full-stack wedding planning product.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + `shadcn/ui`
- TanStack Query
- Supabase
- Vercel-ready deployment

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

3. Fill the Supabase values in `.env.local`.

4. Start development:

```bash
npm run dev
```

5. Link your Supabase project (remote):

```bash
npm run supabase:link
```

6. Apply migrations to your linked project:

```bash
npm run supabase:db:push
```

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Project Structure

- `src/app` - App Router pages, layouts, global styling
- `src/components/ui` - generated `shadcn/ui` components
- `src/components/providers` - React app providers
- `src/lib/supabase` - Supabase client setup
- `src/types` - shared app and database types

## What Is Already Configured

- `shadcn/ui` initialized (`components.json` + UI primitives)
- Global `QueryProvider` with TanStack Query and devtools
- Supabase browser client helper with typed database model
- Supabase CLI config + remote migration workflow (no Docker required)
- Modern login/sign-up page at `/auth`
- Production-style landing page and starter module breakdown

## Deploy

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Add the same environment variables in Vercel project settings.
4. Deploy.

## Suggested Next Features

- Supabase Auth + role-based access (`couple`, `planner`, `vendor`)
- Wedding project workspace (events, budgets, tasks, guest list)
- Vendor contracts and payment milestones
- Calendar timeline with reminders and notifications
