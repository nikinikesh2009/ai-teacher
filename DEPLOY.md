# TutorFlow Deployment

## Production URL
https://tutorflow-peach.vercel.app

## Commands
- `npm run db:setup` – Create users table in Neon (run once)
- `npm run vercel:env` – Push env vars from .env.local to Vercel (run once or when env changes)
- `npm run deploy` – Deploy to Vercel production

## Environment Variables (Vercel)
Set in [Vercel Project Settings](https://vercel.com/nikils-projects-d73bb2bb/tutorflow/settings/environment-variables):
- `DATABASE_URL` – Neon connection string
- `JWT_SECRET` – JWT signing secret

Or run `npm run vercel:env` to sync from .env.local.
