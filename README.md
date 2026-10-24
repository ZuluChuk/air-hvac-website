# AIR HVAC — static website starter

Single-page responsive website built with HTML, CSS and vanilla JavaScript. No framework, database, CMS or build step.

## Preview locally

Open `index.html` directly or run `python3 -m http.server 8000` from this folder and visit http://localhost:8000.

## Important before publishing

- **Branding:** The logo in this starter is a *temporary text/monogram interpretation*, not the official AIR HVAC logo. Replace with your approved logo files, colours and fonts.
- **Images:** All images are SVG **illustrative placeholders**, not photographs of your work. Replace with your own optimised installation photos (WebP/AVIF, sensible dimensions) before launch.
- **Email:** `info@airhvac.co.uk` is **unverified**. Confirm it exists, or change both the visible address and `mailto:` target in `index.html` and `js/main.js`.
- **Contact form:** Currently launches the visitor's email app; it does not submit to a server. If you need a proper form, add Cloudflare Turnstile plus a Pages Function or an external form endpoint. Don't expose secret API keys in client-side JS.
- Check all claims, company details, insurance and service areas before launch. Add your legal company details and privacy/cookie information as applicable.

## Deploy to Cloudflare Pages

1. Create a GitHub repository and push the contents of this folder.
2. In Cloudflare, choose Workers & Pages → Create application → Pages → Connect to Git.
3. Select the repository. Choose **no framework**, **no build command**, and output directory `/` (repository root). Deploy.
4. Test the generated `*.pages.dev` preview URL.
5. In the Pages project, open **Custom domains** and add `www.airhvac.co.uk` (and optionally `airhvac.co.uk`). Follow Cloudflare's DNS instructions. For the apex domain, Cloudflare may require its nameservers; check your registrar and existing DNS first.
6. **Preserve existing MX, SPF, DKIM, DMARC, and other DNS records** so company email keeps working. Set a single canonical host redirect if using both apex and www.
7. Check HTTPS, mobile layout, contact email, and Search Console after cutover.

## Instagram gallery plan

The gallery currently shows **clearly illustrative placeholders** linked to https://www.instagram.com/airhvac_uk/. The browser JS tries to fetch `/api/instagram` and automatically swaps in real posts only if that endpoint exists.

Recommended production integration:

1. Confirm `@airhvac_uk` is a professional Instagram account and review the current Meta Instagram API account and permissions requirements. API products and access rules change.
2. Use a **server-side** Cloudflare Worker or Pages Function with an Instagram access token stored as a **Cloudflare secret**, never in public JavaScript or GitHub.
3. Retrieve permitted media metadata (caption, permalink, thumbnail/media URL), including thumbnails for videos as needed.
4. Cache the latest 6 approved posts in KV/R2 or another cache, refreshing on a scheduled Worker (e.g. every 6–12 hours). Respect API limits, token expiry and media URL expiry.
5. Expose a small `/api/instagram` JSON endpoint returning `{ "posts": [{ "imageUrl": "https://...", "permalink": "https://www.instagram.com/p/...", "caption": "..." }] }`. Avoid displaying unapproved posts if you prefer a curated portfolio.
6. Use the static fallback if the API is unavailable. Ensure images have descriptive alt text and use lazy loading.

**No API credentials are included in this starter.** Do not assume the Instagram integration is live until the backend is configured and tested.

## Files

- `index.html` — content, navigation, SEO metadata
- `css/style.css` — responsive styles
- `js/main.js` — menu, email enquiry and optional gallery endpoint
- `images/` — placeholder SVGs and favicon


## Official branding
The original supplied `AIR HVAC.eps` was converted into `images/air-hvac-logo.webp` and `images/favicon.png`. The header and footer now use the supplied logo; the colour palette reflects its navy, magenta and cyan colours.
