# Back to the Basics Movement

**backtothebasicsmovement.com** — A personal development and education movement rooted in discipline, truth, gratitude, and shared testimony.

Built with Next.js. Deployed on Vercel.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Email + Kit Setup

The website has two form systems:

| Form | Purpose | Backend |
|------|---------|---------|
| Subscribe (newsletter) | Collect email subscribers | `/api/subscribe` → Kit API |
| Share Your Story (contact) | Receive story submissions | FormSubmit.co → contact@ email |

### Step-by-step Kit setup

1. Create a free account at [kit.com](https://kit.com) using `contact@backtothebasicsmovement.com`
2. In Kit, go to **Grow → Landing Pages & Forms** → Create a new form named **"Join the Movement"**
3. Copy the **Form ID** from the URL (the number after `/forms/`)
4. Go to **Settings → Developer** → copy your **API Key**
5. In your **Vercel dashboard** → Project → Settings → Environment Variables, add:
   - `KIT_API_KEY` = your API key
   - `KIT_FORM_ID` = your form ID
   - `KIT_TAG_ID` = *(optional)* a tag ID to auto-tag new subscribers
6. In Kit, go to **Send → Sequences** → Create a new sequence named **"Welcome Series"**
7. Add the 4 emails from `KIT_WELCOME_SEQUENCE.md` with delays: immediate, +1 day, +2 days, +3 days
8. Go to **Automate → Visual Automations** → Create automation:
   - **Trigger**: Subscribes to form "Join the Movement"
   - **Action**: Add to sequence "Welcome Series"
9. **Activate** the automation
10. **Redeploy** on Vercel (so env vars take effect)
11. **Test** with your own email

### How it works

```
Visitor enters email → Website form → POST /api/subscribe → Kit API → Subscriber created → Automation triggers → 4-email welcome sequence
```

The welcome sequence is handled entirely by Kit once the subscriber is added to the form. The website only needs to create the subscriber via the API.

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KIT_API_KEY` | Yes | Kit API key from Settings → Developer |
| `KIT_FORM_ID` | Yes | Kit form ID for "Join the Movement" |
| `KIT_TAG_ID` | No | Optional tag to apply to new subscribers |
| `CONTACT_EMAIL` | No | Defaults to contact@backtothebasicsmovement.com |

If `KIT_API_KEY` or `KIT_FORM_ID` are missing, the subscribe form will show a friendly error message to visitors and log a clear error server-side. The site will not crash.

### Contact form (Share Your Story)

Uses FormSubmit.co. Submissions go to `contact@backtothebasicsmovement.com`. No env vars needed.

## Testing

### Local test

1. Copy `.env.example` to `.env.local` and fill in your Kit credentials
2. Run `npm run dev`
3. Go to `http://localhost:3000`
4. Click "Enter the Movement"
5. Scroll to the Subscribe section
6. Enter a test email and click "Join"
7. Confirm you see "Welcome to the Family" success message
8. Log into Kit and confirm the subscriber appears
9. Confirm the welcome email arrives in the test inbox
10. Test the "Share Your Story" form — confirm submission reaches contact@backtothebasicsmovement.com

### Production test (after deploy)

1. Ensure env vars are set in Vercel
2. Redeploy the project
3. Go to backtothebasicsmovement.com
4. Subscribe with a test email
5. Confirm success message appears on site
6. Confirm subscriber appears in Kit dashboard
7. Confirm welcome email #1 arrives
8. Submit a test story — confirm it reaches contact@backtothebasicsmovement.com

## Deploy on Vercel

Auto-deploys from the `main` branch. Add environment variables in Vercel dashboard before deploying.

## Key files

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Main page with all sections, forms, and voice system |
| `src/app/globals.css` | Full stylesheet |
| `src/app/api/subscribe/route.ts` | Server-side Kit API endpoint |
| `KIT_WELCOME_SEQUENCE.md` | Complete 4-email welcome sequence content |
| `KIT_EMAIL_SETUP.md` | Kit account setup guide + system architecture |
| `.env.example` | Template for environment variables |
