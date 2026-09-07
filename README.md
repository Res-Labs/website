# Res Labs landing page

## Purpose and current state

This directory contains the static Res Labs marketing landing page. `reslabs.ai` is the Vercel marketing lane.

The site has no package manifest and no build step. `index.html` loads versioned React, ReactDOM, and Babel CDN scripts, then runs `app.jsx` and `tweaks-panel.jsx` in the browser. `vercel.json` sets immutable caching for `/assets/*`.

The latest Vercel preview was deployed on 2026-09-07 and reached `READY`: `https://website-bf8h4wqgd-hughflood-5808s-projects.vercel.app/`.
Vercel Authentication is disabled for the project, making the preview publicly accessible. An unauthenticated request returned HTTP 200, and browser inspection confirmed the expected metadata, content, structured data, poster, and optimized video.
Production is connected to Vercel's Git integration, so a push to `main` can trigger a production deployment. The current rollout at `https://reslabs.ai/` was verified after the latest content and SEO push.
The deployment used the gate-loaded project-scoped credentials. No secret value entered this repository or README.

## Keep approved design and copy stable

SEO work must keep the approved visual design stable unless the user explicitly approves a content or accessibility change. Keep metadata changes in the document head and dedicated crawl files.

The current approved title is `Res Labs | Verified context for physical products`, and the current description is `Res Labs gives physical products a verified digital context, so objects can carry information and identity beyond the shelf. Learn more and work with us.`

For metadata-only work, do not change the hero copy, layout, animations, links, fonts, CDN scripts, or video assets.

Do not edit `styles.css`, `app.jsx`, `tweaks-panel.jsx`, or existing image and video assets for metadata-only work.

## Source map

- `index.html` owns the document shell, document metadata, CDN scripts, stylesheet link, and the no-JavaScript fallback.
- `app.jsx` owns the React landing page, hero copy, CTA, logo, glyph video, social links, and runtime behavior.
- `styles.css` owns layout, typography, colors, responsive rules, and animations.
- `tweaks-panel.jsx` owns the in-browser development controls and their state persistence.
- `robots.txt` owns crawler rules and the sitemap location.
- `sitemap.xml` owns the canonical URL list.
- `favicon.svg` is the root favicon. Its canonical source is `/Users/joon/projects/twoj/res-labs/ObjectOS/objectos/apps/research-chemical/public/favicon.svg`.
- `assets/og-image.png` is the social preview image. Its approved dimensions are 1200 by 630 pixels.
- `assets/logo.svg`, `assets/logo.png`, and `assets/logo-white.png` are Res Labs logo assets.
- `assets/hero.mp4` is the glyph video used by the landing page.
- `vercel.json` owns the immutable cache header for `/assets/*`. It does not own SEO metadata.
- `.agents/skills/deploy-prod/SKILL.md` owns the project-scoped Vercel production deployment workflow and credential-loading procedure.
- `assets/hero-poster.jpg` is the first frame of the hero video, used as its loading poster.
- `assets/logo-schema.svg` is the square logo used by Organization JSON-LD.

## Use the verified brand context

Res Labs is the branding source for this site. ObjectOS embeds NFC chips in products and gives them verified context.

Use that context to orient maintainers. Do not replace or expand the landing page copy with unsupported ObjectOS product claims.

## Own SEO metadata in the right file

`index.html` owns the page title, meta description, canonical URL, robots directive, theme color, favicon link, Open Graph tags, Twitter tags, and Organization JSON-LD. Keep the canonical URLs on `https://reslabs.ai/`.

`robots.txt` allows crawlers to read the site and points to `https://reslabs.ai/sitemap.xml`.

`sitemap.xml` lists `https://reslabs.ai/` as the canonical landing page URL.

`favicon.svg` supplies the browser icon. Update it only from the canonical ObjectOS source listed in the source map.

`assets/og-image.png` supplies the Open Graph and Twitter image. Keep its metadata dimensions at 1200 by 630 pixels.

## Preview locally

Run the server from this directory.

```sh
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/` in a browser. Stop the server with `Ctrl-C`.

The local server has no build step. It serves the files as they exist on disk, so use it to inspect metadata files and the rendered page before deploying.

## Create a Vercel preview

A Vercel preview is the staging inspection target for this website. It is not ObjectOS canonical staging.

Run the secret gate and the deploy command in one shell. The gate loads these keys from the `ObjectOS` project without printing their values.

```sh
GATE=/Users/joon/.agents/skills/secrets/scripts/secret_output_gate.sh
(
  source "$GATE" && \
    secret_output_gate -p ObjectOS load VERCEL_LANDING_PAGE_TOKEN VERCEL_LANDING_PAGE_PROJECT_ID && \
    curl -fsS -o /dev/null \
      -w 'project_status=%{http_code}\n' \
      "https://api.vercel.com/v9/projects/$VERCEL_LANDING_PAGE_PROJECT_ID" \
      -H "Authorization: Bearer $VERCEL_LANDING_PAGE_TOKEN" && \
    node .agents/skills/deploy-prod/scripts/deploy-vercel-static.mjs preview
)
```

The helper prints the deployment URL and waits for `READY`. Use that URL for inspection. Do not use ObjectOS application deploy scripts for this site.

## Deploy to production

Run the production command from the website directory after the preview passes its checks.

```sh
GATE=/Users/joon/.agents/skills/secrets/scripts/secret_output_gate.sh
(
  source "$GATE" && \
    secret_output_gate -p ObjectOS load VERCEL_LANDING_PAGE_TOKEN VERCEL_LANDING_PAGE_PROJECT_ID && \
    curl -fsS -o /dev/null \
      -w 'project_status=%{http_code}\n' \
      "https://api.vercel.com/v9/projects/$VERCEL_LANDING_PAGE_PROJECT_ID" \
      -H "Authorization: Bearer $VERCEL_LANDING_PAGE_TOKEN" && \
    node .agents/skills/deploy-prod/scripts/deploy-vercel-static.mjs
)
```

The helper deploys the project selected by `VERCEL_LANDING_PAGE_PROJECT_ID` to the production target. Never paste token or project ID values into a command, file, issue, or log. Do not use secret-bearing legacy scripts.



## Verify the change

Inspect the working diff before staging.

```sh
git diff --check
git diff -- index.html robots.txt sitemap.xml favicon.svg
```

After a preview or production deploy, check the real URLs.

```sh
curl -fsS -o /dev/null https://reslabs.ai/
curl -fsS https://reslabs.ai/robots.txt
curl -fsS https://reslabs.ai/sitemap.xml
curl -fsS -o /dev/null https://reslabs.ai/favicon.svg
curl -fsS -o /dev/null https://reslabs.ai/assets/og-image.png
```

Use the same checks against the preview URL before production. Confirm the following points.

- The page title and description remain unchanged.
- The canonical URL and sitemap use `https://reslabs.ai/`, and the Open Graph and Twitter URLs use the same host.
- The Open Graph image metadata says 1200 by 630 pixels.
- `robots.txt`, `sitemap.xml`, `favicon.svg`, and `assets/og-image.png` return successfully.
- The hero copy, CTA, layout, animations, links, and video match the local page.
- No secret value appears in the README, diff, terminal output, or deployment notes.

## Stage and inspect

Stage only the files that belong to the metadata or documentation change.

```sh
git status --short
git add README.md index.html robots.txt sitemap.xml favicon.svg
git diff --cached --name-only
git diff --cached --check
git diff --cached -- index.html robots.txt sitemap.xml favicon.svg README.md .gitignore
```

Review the staged file list and diff. If the list includes an unrelated path, remove that path from the index before deploying.

## Roll back production

Choose a known-good Vercel deployment URL or ID and set `ROLLBACK_TARGET` to that value. A rollback points production traffic at that deployment without rebuilding the working tree.

```sh
GATE=/Users/joon/.agents/skills/secrets/scripts/secret_output_gate.sh
(
  source "$GATE" && \
    secret_output_gate -p ObjectOS load VERCEL_LANDING_PAGE_TOKEN VERCEL_LANDING_PAGE_PROJECT_ID && \
    vercel rollback "$ROLLBACK_TARGET" --token="$VERCEL_LANDING_PAGE_TOKEN"
)
```

Check the rollback status and repeat the production URL checks.

```sh
GATE=/Users/joon/.agents/skills/secrets/scripts/secret_output_gate.sh
(
  source "$GATE" && \
    secret_output_gate -p ObjectOS load VERCEL_LANDING_PAGE_TOKEN VERCEL_LANDING_PAGE_PROJECT_ID && \
    vercel rollback status --token="$VERCEL_LANDING_PAGE_TOKEN"
)
```

Investigate the bad deployment, fix the source, create a new preview, and deploy the fix after it passes the checklist.

To undo a rollback, promote the known-good deployment again.

```sh
GATE=/Users/joon/.agents/skills/secrets/scripts/secret_output_gate.sh
(
  source "$GATE" && \
    secret_output_gate -p ObjectOS load VERCEL_LANDING_PAGE_TOKEN VERCEL_LANDING_PAGE_PROJECT_ID && \
    vercel promote "$ROLLBACK_TARGET" --yes --token="$VERCEL_LANDING_PAGE_TOKEN"
)
```

## Keep the environments separate

`https://reslabs.ai/` is the Vercel marketing lane for this landing page.

ObjectOS's `https://staging.reslabs.ai` is a separate DigitalOcean Research Chemical RC environment. Its staging API is `https://staging-api.reslabs.ai`. Do not deploy this static landing page to that environment or alias a landing-page preview to it.
