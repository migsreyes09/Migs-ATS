# Applicant Tracker (ATS)

Password-protected applicant tracking app deployed on [Vercel](https://migs-ats.vercel.app/).

## Password protection

The ATS shows a login screen before you can view applicants. Sessions last 7 days via a secure cookie.

## One-time Vercel setup

In your [Vercel project → Settings → Environment Variables](https://vercel.com), add:

| Variable | Required | Purpose |
|----------|----------|---------|
| `ATS_PASSWORD` | Yes | The password used to unlock the ATS |
| `ATS_SESSION_SECRET` | Yes | Random string used to sign login sessions |
| `VERCEL_TOKEN` | For change-password | [Vercel API token](https://vercel.com/account/settings/tokens) so the app can update the password and redeploy |
| `VERCEL_PROJECT_ID` | For change-password | Found in Project Settings → General |
| `VERCEL_TEAM_ID` | Optional | Only if the project is under a team |

After adding variables, redeploy once from the Vercel dashboard.

### Creating a Vercel API token

1. Go to [vercel.com/account/settings/tokens](https://vercel.com/account/settings/tokens)
2. Create a token with access to your project
3. Paste it as `VERCEL_TOKEN` in environment variables

## Change password (in-app)

Once logged in, click **Password** in the header. Enter your current and new password. The app will:

1. Update `ATS_PASSWORD` in Vercel
2. Trigger a production redeploy so the new password is live everywhere

Redeploy usually takes about a minute.

## Local development

```bash
npm install
npm run dev          # UI only — login API won't work
npm run dev:vercel   # Full app with login (requires vercel CLI + .env)
```

Copy `.env.example` to `.env` and fill in values for local testing with `vercel dev`.

## Deploy

Push to GitHub — Vercel auto-deploys on each push.
