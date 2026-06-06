# 💸 Spendwise

A personal **expense & lending tracker**. Add what you spend the way you'd say
it — `10 birr gum`, `200 birr ride`, `108 usd claude subscription` — and the app
keeps a running total of where your money goes. It also tracks money you **lend**
to people, syncs across your devices, and uses **Claude** to give you insights
about your spending.

Built with **Next.js + TypeScript** and **Supabase** (cloud sync + login). No
paid AI API — to analyze your spending, export your data and paste it into
[claude.ai](https://claude.ai), which your Claude subscription covers.

---

## Features

- **Quick add in plain language.** Type `10 birr gum` and it figures out the
  amount, currency, what it was for, and the category (Food) automatically.
- **Currencies stay separate.** Birr and USD totals are shown side by side — never
  summed or converted. Supports ETB, USD, EUR, GBP, AED, SAR, KES.
- **Monthly view** with a per-category breakdown.
- **Lending tracker** — record loans, see who owes you, mark them repaid.
- **Cloud sync + login.** Your data lives in Supabase and follows you across phone
  and laptop. Sign in with email + password.
- **Analyze with Claude — free.** The Export tab has a one-tap "Copy my data for
  Claude" that bundles a ready-made prompt; paste it into claude.ai (covered by
  your subscription, no API cost).
- **Export & backup.** Download your data as CSV (spreadsheet) or JSON.
- **Mobile-first**, with dark mode.

---

## Setup (≈10 minutes)

You need a free **Supabase** project and an **Anthropic API key**.

### 1. Install

```bash
npm install
```

### 2. Supabase (cloud sync + login)

1. Create a free project at **[supabase.com](https://supabase.com)**.
2. Open the **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and **Run** it. This creates the `transactions` table with row-level security (each user only sees their own data).
3. Go to **Settings → API** and copy the **Project URL** and the **anon public** key.
4. **Set up login** (pick one or both):
   - **Email + password (easiest):** Authentication → Providers → **Email**, and turn **off** "Confirm email" so you can sign up and log in instantly with no email step.
   - **Google (free, no passwords):**
     1. Supabase: Authentication → Providers → **Google** → enable. Copy the **Callback URL** it shows (`https://<ref>.supabase.co/auth/v1/callback`).
     2. [Google Cloud Console](https://console.cloud.google.com): create an OAuth **consent screen**, then **Credentials → Create OAuth client ID → Web application**. Add that Supabase Callback URL under **Authorized redirect URIs**. Copy the **Client ID** and **Client Secret**.
     3. Paste the Client ID + Secret back into Supabase's Google provider and **Save**.
   - Then in Supabase → Authentication → **URL Configuration**: set **Site URL** to `http://localhost:3000` and add `http://localhost:3000/**` to **Redirect URLs**.

### 3. Fill in `.env.local`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run

```bash
npm run dev
```

Open **http://localhost:3000**, sign in (Google or email + password), and start adding expenses.

> Until the keys are set, the app shows a setup screen instead of the tracker.
> After editing `.env.local`, **restart `npm run dev`** (env changes need a restart).

---

## Analyzing your spending (free, no API)

This app does **not** call any paid AI API. Instead, the **Export** tab has a
**"Copy my data for Claude"** button: it copies a ready-made prompt plus your data
to the clipboard. Open [claude.ai](https://claude.ai), paste, and send — the
analysis runs on your existing Claude subscription at no extra cost.

> 🔒 **Privacy:** your data stays between your browser and your own Supabase
> project. Nothing is sent anywhere automatically — sharing with Claude only
> happens when *you* paste it into claude.ai.

---

## Deploy (free, with auto-deploys)

Deploy to [Vercel](https://vercel.com) so it's reachable anywhere and redeploys on
every `git push`:

1. Go to **[vercel.com/new](https://vercel.com/new)** and **import this GitHub repo**.
2. Framework is auto-detected (Next.js) — leave the build settings as-is.
3. Add **Environment Variables** (same names as `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - (These are `NEXT_PUBLIC_*`, so they must be set **before** the build.)
4. Click **Deploy**.
5. In **Supabase → Authentication → URL Configuration**, set **Site URL** to your
   Vercel URL and add `https://<your-app>.vercel.app/**` to **Redirect URLs** (so
   Google / email login redirects back to the live site). Keep `http://localhost:3000/**`
   for local dev.

On your phone, open the deployed URL and **Add to Home Screen**. Because data lives
in Supabase, your phone and laptop share the same synced history.

---

## How it's organized

```
app/
  layout.tsx              # page shell + metadata
  page.tsx                # gatekeeper: setup screen / login / app
  globals.css             # all styling (light + dark)
components/
  TrackerApp.tsx          # the main signed-in UI (tabs + state)
  AddTab / SpendingTab / LendingTab / ExportTab
  Summary / TxnItem / TabBar
  AuthGate.tsx            # email 6-digit code login
  SetupNeeded.tsx         # shown until env vars are set
hooks/
  useTransactions.ts      # load/save transactions in Supabase (optimistic)
lib/
  parse.ts                # the "10 birr gum" natural-language parser
  currency.ts             # currencies + money formatting
  categories.ts           # categories + auto-tagging keywords
  summary.ts / export.ts  # aggregate + CSV / Claude-prompt export
  dates.ts / selectors.ts / types.ts
  supabase/               # browser + server clients, config
middleware.ts             # refreshes the auth session
supabase/schema.sql       # database table + row-level security
```

The natural-language parser in [`lib/parse.ts`](lib/parse.ts) is the fun part —
tweak [`lib/categories.ts`](lib/categories.ts) to teach it new keywords.
