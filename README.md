# Peter's Helper 🌱

A simple, full-screen tablet companion app designed for someone living with Alzheimer's or dementia.

Designed for a wall-mounted tablet in kiosk mode. No complicated menus — just the things that matter.

---

## What it does

### Peter's screen (`/`)
- **Time-based greeting** — Good morning / afternoon / evening, Peter
- **Live clock and date** — large, clear, always visible
- **Weather** — current conditions for Drogheda, updated every 30 minutes
- **Barry's location** — green banner ("Barry is at HOME today") or amber ("Barry is in DUBLIN today — Can't go to Drogheda today"), updated in real time
- **Reminder from Barry** — a message Barry can push from the admin panel, appears instantly
- **Note for carer** — a separate note for whoever's coming in that day, clears automatically every morning at 7am
- **Call Barry button** — sends Barry a Telegram message and shows "Message sent to Barry — he's on the way"
- **Music player** — tap Frank Sinatra, Bing Crosby, or Dean Martin to play YouTube videos right on the page

### Barry's admin panel (`/admin`)
- Set your location (home / Dublin) — updates Peter's screen instantly
- Send a reminder — appears on the tablet in real time
- Update the carer note — displayed prominently for carers on arrival
- Recent reminder log

---

## Tech stack

- **Next.js 14** (App Router)
- **Supabase** — real-time database for reminders, location status, and carer notes
- **Tailwind CSS**
- **Vercel** — hosting
- **wttr.in** — weather API (no key needed)
- **Telegram Bot API** — for the "Call Barry" notification

---

## Setup

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a free project.

In the SQL editor, run the contents of `supabase/schema.sql`.

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=       # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Your Supabase anon key
NEXT_PUBLIC_CALL_NUMBER=        # WhatsApp link, e.g. https://wa.me/353861234567
NEXT_PUBLIC_ADMIN_PASSWORD=     # Password for the admin panel
TELEGRAM_BOT_TOKEN=             # Your Telegram bot token
TELEGRAM_CHAT_ID=               # Your Telegram user ID (receive the "Call Barry" alert)
RESET_SECRET=                   # A secret string for the carer note reset API
```

### 3. Install and run locally

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
npx vercel deploy --prod
```

Set all the environment variables in your Vercel project settings before deploying.

---

## Kiosk mode

For a wall-mounted tablet:

- **Android**: Use [Fully Kiosk Browser](https://www.fully-kiosk.com/) — lock the tablet to the app URL, prevent navigation away, keep the screen on.
- **iPad**: Use Guided Access (Settings → Accessibility → Guided Access) to lock to Safari with the app URL.

---

## Carer note reset

The carer note clears automatically every morning at 7am (Ireland time). This is handled by a scheduled job that calls `/api/reset-carer-note` with a secret header.

If you want to reset it manually:

```bash
curl -X POST https://your-deployment.vercel.app/api/reset-carer-note \
  -H "x-reset-secret: YOUR_RESET_SECRET"
```

---

## Background

Built in an afternoon for a real use case — keeping Peter connected and informed while making life a little easier for his carers. If you're building something similar for a family member, feel free to fork and adapt it.

---

## Licence

MIT
