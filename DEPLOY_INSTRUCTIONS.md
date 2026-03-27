# Deploy Instructions

This is a manual deploy for the `landing` server.

## Step-by-step

```bash
ssh landing
su - deploy
cd /var/www/bluelanding
git pull origin main
test -n "$DATABASE_URL" && echo "DATABASE_URL is set" || (echo "DATABASE_URL is missing" && exit 1)
npm install
npm run build
pm2 restart bluelanding --update-env
```

## Database and Prisma

- This project currently uses `DATABASE_URL` directly from the app code in `lib/cms.ts`.
- Database updates are non-destructive in production:
  - missing tables are created with `CREATE TABLE IF NOT EXISTS`
  - missing columns are added with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
  - existing online data must not be deleted or reset
- After deploy, open the live site or `/admin` once to trigger the safe database check/update path, then review the logs:

```bash
pm2 logs bluelanding --lines 100
```

- If Prisma is added later, only run safe production commands:

```bash
npx prisma generate
npx prisma migrate deploy
```

- Never run destructive Prisma commands on production:

```bash
npx prisma migrate reset
npx prisma db push --force-reset
```

## Notes

- Run the deploy as the `deploy` user, not `root`.
- The app directory is `/var/www/bluelanding`.
- The PM2 process name is `bluelanding`.
- If `git pull` fails, inspect server-side local changes first with `git status`.
- The current project does not include an active `schema.prisma` file yet, so Prisma commands above are only for future Prisma-based schema management.
- give me results in arabic after you finish
