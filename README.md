# ripplelabs.in

Static site hub for Ripple Labs products. Deployed on Vercel from `master`.

## URL layout

| Path | App |
|------|-----|
| `/` | Redirects to `/recall` (temporary) |
| `/recall` | Recall marketing landing |

## Add a new static app

1. Create a sibling folder, e.g. `blog/index.html` + assets.
2. Add `blog/sitemap.xml` if the app should be indexed.
3. Push to `master` — Vercel auto-deploys.

The app is served at `https://ripplelabs.in/{folder}/`.

## Replace root redirect with company landing

1. Add `index.html` at repo root.
2. Remove the `/` → `/recall` redirect from `vercel.json`.
3. Push to `master`.

## Add a dynamic app (separate Vercel project)

1. Deploy the app as its own Vercel project.
2. Add a rewrite in `vercel.json`:

```json
{ "source": "/app/:path*", "destination": "https://your-app.vercel.app/:path*" }
```

No DNS changes required.

## Local preview

```bash
npx serve .
```

Open `http://localhost:3000/recall`.

## Domains

- Production: `ripplelabs.in` (apex)
- `www.ripplelabs.in` redirects to apex
