# AIR HVAC Ltd website

Single-page, responsive website for https://www.airhvac.co.uk/ built with HTML, Sass (SCSS) and vanilla JavaScript, deployed as a Cloudflare Worker with static assets.

## Single-page navigation

All public website content is on `index.html`:

- Services: `/#services`
- Latest Instagram posts: `/#work`
- Eight randomly selected installation portfolio photos: `/#portfolio`
- Areas covered: `/#areas`
- About: `/#about`
- Contact: `/#contact`

There is **no separate portfolio or project detail page**. Legacy `/portfolio.html`, `/project.html`, `/portfolio` and `/project` requests redirect permanently to `/#portfolio` through the `_redirects` static-asset rules.

`js/portfolio-data.js` is intentionally retained: the rotating hero photo slideshow uses its project photo groups. `portfolio-photo-manifest.json` is a source-photo reference, not a page.

## Build and deploy

Use a recent Node.js LTS version.

```bash
npm install
npm run build
npx wrangler deploy
```

Cloudflare Git deploy settings:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Root directory: repository root

The build compiles `scss/style.scss` to `css/style.css` and generates `js/gallery-manifest.js` from the images actually available under `images/`. Both generated files are ignored by Git.

**Pull-request previews:** `css/style.css` is not committed, so every preview must run the build before asset upload. The `build.command` in `wrangler.jsonc` runs `npm run build` as part of Wrangler's custom-build workflow. In Cloudflare **Workers & Pages → air-hvac-website → Settings → Build**, verify the **Build command** is `npm run build`, **Preview command** is `npx wrangler preview`, and preview builds are enabled. Cloudflare should upload the compiled `css/style.css` and generated gallery manifest; test a preview's `/css/style.css` endpoint if styling is missing.

The Cloudflare Worker serves static assets and the secure `/api/instagram` endpoint. The `_redirects` file handles obsolete portfolio URLs, while the original `wrangler.jsonc` remains unchanged.

## Mobile performance

The hero initially loads a real WebP installation photo directly from HTML at high priority; the rotating slideshow starts later. The Leaflet map library, stylesheets, tiles and saved `data/service-isochrone.geojson` boundary are fetched only when the map approaches the viewport. The static `_headers` file sets browser caching for images and generated assets, without caching HTML for long periods.

## Marketing and contact

The current phone number, contact email and service areas are in the homepage. The email link opens the customer's mail app with a pre-filled enquiry, rather than a web contact form.

Instagram uses a Cloudflare secret `INSTAGRAM_ACCESS_TOKEN`. Never commit that token. The frontend requests `/api/instagram` and provides a fallback profile link when it is unavailable.

## SEO

Only the homepage is indexable; `sitemap.xml` correctly lists one URL. See `SEO-AND-PUBLISHING.md` for checks after deployment.

When changing DNS, preserve existing business-email MX, SPF, DKIM and DMARC records.
