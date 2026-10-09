# Blade Tier Tests Website

A static, responsive frontend for Blade Tier Tests, styled around the supplied emblem artwork: electric cyan, cobalt blue, violet accents, gold highlights, and a Minecraft fantasy atmosphere.

## Files
- `index.html` — page structure
- `styles.css` — responsive design and visual theme
- `app.js` — frontend rendering, filtering, refresh, and API calls
- `config.js` — public frontend configuration
- `assets/blade-tier-tests-emblem.png` — supplied visual reference artwork
- `assets/favicon.svg` — matching favicon

## Cloudflare Pages
This is a static site. For the current plain HTML/CSS/JS project, set:
- Build command: leave empty / none
- Build output directory: `/` (or the repository root, depending on Cloudflare's UI)
- Root directory: `/`

The current frontend expects a public HTTPS API base URL in `config.js`. Keep it blank until the bot API can be reached securely over HTTPS and configured for the site's origin. Do not place Discord bot tokens, database credentials, or private client secrets in frontend files.

## API integration
`app.js` currently requests `/api/health`, `/api/kits`, `/api/tiers`, `/api/players?limit=100`, `/api/results?limit=8`, and `/api/stats`. Confirm the actual endpoints, response shapes, CORS policy, and API exposure before enabling a production URL. If the bot's existing API differs, update the frontend to match the real API instead of fabricating data.
