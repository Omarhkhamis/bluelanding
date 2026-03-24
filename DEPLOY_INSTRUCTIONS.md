# Deploy Instructions

This is a manual deploy for the `landing` server.

## Step-by-step

```bash
ssh landing
su - deploy
cd /var/www/bluelanding
git pull origin main
npm install
npm run build
pm2 restart bluelanding --update-env
```

## Notes

- Run the deploy as the `deploy` user, not `root`.
- The app directory is `/var/www/bluelanding`.
- The PM2 process name is `bluelanding`.
- If `git pull` fails, inspect server-side local changes first with `git status`.
- give me results in arabic after you finish