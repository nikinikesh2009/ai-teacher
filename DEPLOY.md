# TutorFlow Deployment

## Production URL
https://tutorflow-peach.vercel.app

## Connect GitHub (auto-deploy on push)

### 1. Create a new repo on GitHub
- Go to [github.com/new](https://github.com/new)
- Name it `tutorflow` (or any name)
- Leave it **empty** (no README, no .gitignore)
- Create

### 2. Push your code
```bash
cd tutorflow
git remote add origin https://github.com/YOUR_USERNAME/tutorflow.git
git branch -M main
git push -u origin main
```

### 3. Connect Vercel to GitHub
- Go to [Vercel Project Settings → Git](https://vercel.com/nikils-projects-d73bb2bb/tutorflow/settings/git)
- Click **Connect Git Repository**
- Choose **GitHub** → authorize if needed
- Select your `tutorflow` repo
- Save

After this, every push to `main` will auto-deploy to production.

---

## Commands
- `npm run db:setup` – Create users table in Neon (run once)
- `npm run vercel:env` – Push env vars from .env.local to Vercel (run once or when env changes)
- `npm run deploy` – Deploy manually (or just `git push` after GitHub is connected)

## Admin panel
1. Create admin tables: `npm run admin:setup` (or `npx tsx scripts/setup-admin-db.ts`).
2. Create first admin: `npx tsx scripts/seed-admin.ts your@email.com YourPassword`.
3. Open **`/admin/login`**, sign in, then use **`/admin`** for the dashboard.

### Default admin credentials (already seeded)
| Field    | Value                |
|----------|----------------------|
| **URL**  | `/admin/login`       |
| **Email**| `admin@tutorflow.local` |
| **Password** | `AdminPass123!` |

## Environment Variables (Vercel)
Set in [Vercel Project Settings](https://vercel.com/nikils-projects-d73bb2bb/tutorflow/settings/environment-variables):
- `DATABASE_URL` – Neon connection string
- `JWT_SECRET` – JWT signing secret

Or run `npm run vercel:env` to sync from .env.local.
