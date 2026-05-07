# canberkefe.dev

Astro static site. 3 themes (hacker / dark / light), terminal-styled landing,
blog with content collections, tags pages, RSS, sitemap, JSON-LD structured data,
Cloudflare Web Analytics ready, PGP-published public key.

## Local development

```bash
npm install
npm run dev         # http://localhost:4321
npm run build       # outputs to dist/
npm run preview     # serve dist/ locally
```

## Adding a blog post

Drop a Markdown (or `.mdx`) file into `src/content/blog/`:

```markdown
---
title: "Post title — write the phrase you want to rank for"
description: "140–160 chars summary that shows up in Google results."
pubDate: 2026-05-10
tags: ["tag-one", "tag-two"]
draft: false
---

your content here
```

The filename becomes the URL slug. `2026-05-04-tryhackme-pickle-rick.md` →
`/blog/2026-05-04-tryhackme-pickle-rick/`.

For images, drop them in `public/blog/<slug>/img.svg` and reference as
`/blog/<slug>/img.svg`. SVG is preferred (scales, fast).

## Themes

Three themes, cycle button in the top-right of the nav:

- **HACKER** — Kali-style: green prompt, red user, blue host on `#000` (default)
- **DARK** — neutral developer dark + cyan accent
- **LIGHT** — warm paper cream + dark green accent

Theme persists in `localStorage` under `cb_theme`.

## PGP key

- **Email:** `contact@canberkefe.dev`
- **Key ID:** `0x006E0A32393BBEA4`
- **Fingerprint:** `79FB 6FF6 FDB3 53AB B5E9  AD05 006E 0A32 393B BEA4`
- **Public key:** `public/pgp.txt` → served at `/pgp.txt`
- **Private key:** `~/.gnupg/` — set a passphrase: `gpg --change-passphrase 0x006E0A32393BBEA4`
- **Backup:** `gpg --export-secret-keys --armor 0x006E0A32393BBEA4 > ~/canberkefe-private.asc`
- **Decrypt:** `gpg --decrypt message.asc`

## Analytics

Cloudflare Web Analytics. After creating the site in Cloudflare's dashboard,
paste the token in `src/consts.ts` (the `CLOUDFLARE_ANALYTICS_TOKEN` constant).
The script tag injects automatically when the token is set.

## SEO

Every page ships with: canonical URL, OG image, Twitter Card, JSON-LD
structured data (`WebSite` / `BlogPosting`), meta description, keywords,
sitemap, RSS, robots.txt. After deploy, submit
`https://canberkefe.dev/sitemap-index.xml` to Google Search Console.

## Deployment

See `DEPLOY.md`. Goes from "I have nothing" → "live on canberkefe.dev with
HTTPS, analytics, and SEO."
