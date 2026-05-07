# Deploy canberkefe.dev — full beginner walkthrough

You have nothing set up. This walks every single click. ~45 minutes total.
Read it once top to bottom, then go.

---

## Glossary (so the rest makes sense)

- **git** — a tool already on your computer that tracks your file changes locally. It does not need the internet.
- **GitHub** — a website (github.com) that stores your git repositories online so other services can read them. Free.
- **gh** — GitHub's command-line tool. Helper that lets you create/manage GitHub repos from the terminal without dealing with SSH keys or git URLs.
- **repository (repo)** — a project folder tracked by git. Yours will be called `canberkefe-dev`.
- **commit** — one saved snapshot of your code with a message describing what changed.
- **push** — upload your commits to GitHub.
- **Cloudflare Pages** — a free hosting service that watches your GitHub repo, runs `npm run build`, and serves the resulting static files on the web.
- **DNS** — the phone book of the internet: it maps `canberkefe.dev` → an IP address. Cloudflare manages this for you because the domain is already on your Cloudflare account.
- **SSL / HTTPS** — encryption between your visitor's browser and the site. Cloudflare turns this on **automatically** when you add a custom domain. **You don't install anything.** No certificate files, no openssl, nothing.
- **Email Routing** — Cloudflare's free service to receive mail at `contact@canberkefe.dev` and forward it to your real Gmail/whatever.

The flow you're building: **your code → GitHub → Cloudflare Pages builds it → serves it on canberkefe.dev with HTTPS.**

---

## Step 1 — make a GitHub account

Skip if you already have one.

1. Go to <https://github.com/signup>.
2. Pick a username (this becomes part of your repo URL like `github.com/USERNAME/canberkefe-dev`).
3. Verify email. Done.

## Step 2 — install GitHub CLI (`gh`)

This is the easiest way to push code without fighting SSH keys.

```bash
sudo apt install gh
```

Then log in:

```bash
gh auth login
```

It asks 4 questions. Answer in this order:

1. *Where do you use GitHub?* → press Enter (default: **GitHub.com**).
2. *Preferred protocol for git operations?* → choose **HTTPS** (arrow keys, Enter).
3. *Authenticate Git with your GitHub credentials?* → **Yes**.
4. *How would you like to authenticate?* → **Login with a web browser**.

It prints a one-time code like `ABCD-1234` and tells you to press Enter to open the browser. Press Enter, paste the code in the browser, click Authorize. The terminal says `✓ Logged in as <your-username>`.

## Step 3 — push your site to GitHub

From `~/blog`:

```bash
cd ~/blog
git init -b main
git add -A
git commit -m "initial: canberkefe.dev"
gh repo create canberkefe-dev --private --source=. --push
```

What each command does:

- `cd ~/blog` — go into the project folder.
- `git init -b main` — make this folder a git repo, name the default branch `main`.
- `git add -A` — stage every file for the next commit.
- `git commit -m "..."` — save the snapshot with a message.
- `gh repo create canberkefe-dev --private --source=. --push` — create a private repo on GitHub named `canberkefe-dev`, link your local folder to it, and upload (`--push`) everything.

Verify by opening `https://github.com/<your-username>/canberkefe-dev` in your browser. You should see all the source files.

> ⚠️ The `_archive/` folder (your old test files) is in `.gitignore` so it won't be uploaded — that's intentional.

## Step 4 — connect Cloudflare Pages to that repo

You're already on <https://dash.cloudflare.com/> from earlier when you added the domain.

1. Left sidebar → **Workers & Pages**.
2. Big blue button **Create**.
3. Click the **Pages** tab at the top.
4. Click **Connect to Git**.
5. **Authorize Cloudflare to access GitHub** opens a popup:
   - Click *Connect GitHub*.
   - On GitHub's page: choose **"Only select repositories"** (NOT "All repositories" — safer).
   - In the dropdown, pick `canberkefe-dev`.
   - Click **Install & Authorize**.
6. Back in Cloudflare, the repo `canberkefe-dev` now appears. Click it. Then **Begin setup**.
7. **Set up builds and deployments** — fill in:
   - **Project name:** `canberkefe-dev` (this becomes `canberkefe-dev.pages.dev`)
   - **Production branch:** `main`
   - **Framework preset:** scroll the dropdown, pick **Astro**. The next two fields auto-fill.
   - **Build command:** `npm run build` (already filled)
   - **Build output directory:** `dist` (already filled)
   - Expand **Environment variables (advanced)** — click **Add variable**:
     - Variable name: `NODE_VERSION`
     - Value: `20`
     - Click outside the box to confirm.
8. Click **Save and Deploy** at the bottom.

You'll see a build log. Wait ~2 minutes. Green "Success" appears with a URL like `https://abc123.canberkefe-dev.pages.dev`. Open it. The site loads. **That's the staging URL.** It works but isn't on your real domain yet.

## Step 5 — attach `canberkefe.dev` to the Pages project

Still inside the `canberkefe-dev` Pages project:

1. Click the **Custom domains** tab (top of the project page).
2. Click **Set up a custom domain**.
3. Type `canberkefe.dev` → Continue.
4. Cloudflare shows the DNS record it will create. Click **Activate domain**.
5. Repeat: **Set up a custom domain** → type `www.canberkefe.dev` → Continue → **Activate domain**.

Wait ~2 minutes. Both **canberkefe.dev** and **www.canberkefe.dev** now show "Active" with a tick. Open `https://canberkefe.dev` — your site, with HTTPS, on your real domain.

**That is full deployment.** Steps 6–9 below make it production-quality.

---

## Step 6 — SSL / HTTPS hardening (no install, just clicks)

In the Cloudflare dashboard, click **canberkefe.dev** in the domain list. (Do NOT click the Pages project — click the domain itself in the websites list.)

1. **SSL/TLS → Overview** → set encryption mode to **Full (strict)**.
2. **SSL/TLS → Edge Certificates**:
   - **Always Use HTTPS** → ON
   - **Automatic HTTPS Rewrites** → ON
   - **Minimum TLS Version** → 1.2
   - **Opportunistic Encryption** → ON
   - **TLS 1.3** → ON

Done. Site is HTTPS-only with a free auto-renewing certificate.

---

## Step 7 — get `contact@canberkefe.dev` working (Cloudflare Email Routing)

Yes, you can have `contact@canberkefe.dev` for free using Cloudflare Email Routing. It **receives** mail at any address on your domain and **forwards** it to your real inbox (Gmail, Outlook, whatever). It's free, no monthly cost, no provider to manage.

Limitation: Email Routing only **receives**. To **send** mail *as* contact@canberkefe.dev, you need a separate setup (Gmail's "Send mail as" feature, or a service like ForwardEmail / Resend / Zoho Mail). For now, receiving is enough — replies from your real Gmail still work.

### Setup

In the Cloudflare dashboard, click `canberkefe.dev` in the domain list.

1. Left sidebar → **Email** → **Email Routing**.
2. Click **Get started** (or **Enable Email Routing** if you see it).
3. Cloudflare adds the required MX and TXT (SPF) DNS records automatically. Click **Add records and enable**.
4. **Destination addresses** tab → **Add destination address** → enter your real email (e.g. `yourname@gmail.com`) → Save. Cloudflare sends a verification email to that address. **Open your real inbox, click the verification link.** You're back in Cloudflare with a green tick on the destination.
5. **Routing rules** tab → **Create address**:
   - Custom address: `contact` (Cloudflare auto-fills `@canberkefe.dev`)
   - Action: **Send to an email** → select your verified destination
   - Click **Save**
6. Optional: also create a catch-all so anything `@canberkefe.dev` forwards to you (e.g. typos like `contat@…` still arrive). **Routing rules** → toggle **Catch-all address** → Action: **Send to an email** → your destination → Save.

### Test it

From any other email account (e.g. your phone), send a mail to `contact@canberkefe.dev`. It should land in your real inbox within a minute, with a small Cloudflare forwarding header.

---

## Step 8 — visitor analytics (countries, pages, counts, bots filtered)

Use **Cloudflare Web Analytics** — free, privacy-friendly, no cookies, bots already excluded.

1. Cloudflare dashboard → left sidebar → **Analytics & Logs → Web Analytics**.
2. Click **Add a site** (or **Manage Site**).
3. Choose **Add by hostname** → type `canberkefe.dev` → **Done**.
4. Cloudflare gives you a JS snippet that contains a token like:
   ```html
   <script defer src='https://static.cloudflareinsights.com/beacon.min.js'
     data-cf-beacon='{"token": "abc123def456ghi789..."}'></script>
   ```
5. Copy ONLY the token (the long alphanumeric string between `"token": "` and `"`).
6. Open `~/blog/src/consts.ts` and paste the token between the quotes:
   ```ts
   export const CLOUDFLARE_ANALYTICS_TOKEN = 'abc123def456ghi789...';
   ```
7. Push to GitHub:
   ```bash
   cd ~/blog
   git add -A
   git commit -m "analytics: enable cloudflare web analytics"
   git push
   ```
8. Cloudflare auto-builds in ~60s. Visit your live site once. Wait ~5 min — the **Web Analytics** dashboard then shows: visitors, page views, top pages, top referrers, country breakdown, browsers, devices. Bots are auto-filtered.

To exclude your own visits: Web Analytics → Settings → add your IP to the exclusion list.

---

## Step 9 — get found on Google (SEO)

The site already has every technical SEO piece set up: sitemap, RSS, JSON-LD structured data, OG tags, fast static HTML, mobile-first, semantic HTML, clean URLs. You just need to register with search engines.

### Google Search Console (do this once)

1. Go to <https://search.google.com/search-console>.
2. **Add property** → choose **Domain** (the left column, not URL prefix).
3. Type `canberkefe.dev` → Continue.
4. Google asks you to verify by adding a TXT DNS record. Copy the value it shows.
5. In Cloudflare → `canberkefe.dev` → **DNS → Records** → **Add record**:
   - Type: TXT
   - Name: `@`
   - Content: paste the value Google gave
   - TTL: Auto
   - Click Save.
6. Back in Google Search Console → click **Verify**. Done in seconds.
7. Now in Search Console: left sidebar → **Sitemaps** → enter `https://canberkefe.dev/sitemap-index.xml` → Submit.

Google starts indexing within a day. After a week, the **Performance** tab shows clicks/impressions/queries.

### Per-post checklist for ranking

When you write a post, in the frontmatter:

- **`title`** — write the actual phrase you want to rank for. *"TryHackMe Pickle Rick walkthrough"* beats *"my first ctf"*.
- **`description`** — 140–160 characters, contains the same keywords, written for humans. This shows in Google search results.
- **`tags`** — 3–6 specific tags. Each becomes a `/tags/<tag>/` page.

Then in the post body:

- First paragraph restates what the post is about.
- Use `##` and `###` headings — Google uses them to build "jump to" links.
- Link out to authoritative sources (CVE pages, manuals). Link your own related posts when you have them.

After publishing a new post:

- Search Console → **URL Inspection** → paste the post URL → **Request Indexing**. Google indexes within hours instead of days.

> Ranking #1 isn't a setting; it's earned by writing posts people link to. The technical infra here gets out of the way; the rest is the writing.

---

## Step 10 — your day-to-day workflow

Write a new post:

```bash
cd ~/blog
# create or edit a post
nano src/content/blog/2026-05-12-some-post.md
# (use the existing pickle-rick post as a template)

# preview locally
npm run dev
# open http://localhost:4321/blog

# ship it
git add -A
git commit -m "post: some-post"
git push
```

Cloudflare auto-builds and deploys in ~60 seconds. Done.

---

## Troubleshooting

- **Cloudflare build fails with "node version"** → Pages project → Settings → Environment variables → set `NODE_VERSION=20` → Retry deployment.
- **Custom domain stuck on "verifying"** → Confirm `canberkefe.dev` is on the same Cloudflare account as the Pages project. Pages can't auto-create DNS otherwise.
- **HTTPS error on first visit** → Wait 5 minutes; the universal SSL cert needs to issue. If still broken: SSL/TLS → set to "Flexible" → save → set back to "Full (strict)".
- **`/pgp.txt` 404s** → It's in `public/`. Run `npm run build`; anything in `public/` is copied verbatim to `dist/`.
- **Analytics shows nothing** → Token must be filled in `src/consts.ts`, pushed to GitHub, deployed. Visit the live site once. Wait 5 minutes. Refresh the dashboard.
- **Email Routing test mail doesn't arrive** → Check spam in your real inbox. Cloudflare → Email Routing → check the destination is verified (green tick). Wait 1 min and retry.
- **`gh repo create` says repo already exists** → You ran it twice. Either: `cd ~/blog && git remote add origin https://github.com/<USER>/canberkefe-dev.git && git push -u origin main`, OR delete the GitHub repo from the website and rerun the command.
