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


## Room heating and cooling calculator

The on-page calculator at `/#calculator` provides **live, side-by-side summer cooling and winter heating estimates** as visitors enter room dimensions and conditions. The left panel is clearly marked **01 / Your room** and the right panel **02 / Your instant results**. There is no Calculate button; input and change events refresh both results automatically.

- **Cooling estimate:** 100 W/m² at a 2.4 m ceiling, adjusted for room use, insulation, summer sun and window size, plus 120 W per occupant beyond two.
- **Heating estimate:** a separate rough winter heat-loss proxy using 70 W/m² at a 2.4 m ceiling for average fabric, modified for insulation, glazing and some room types. Heating does **not** incorporate summer sun or occupant cooling gains. It is *not* a design-temperature room-by-room heat-loss calculation.
- **System size to discuss:** the first nominal domestic split size (2 / 2.5 / 3.5 / 4.2 / 5 / 6 / 7.1 kW) that nominally covers the **larger** of the two estimated loads, **only as an initial conversation starter**. Air-to-air heat pump heating capacity at local winter design temperatures must be checked against the selected model. It must not be assumed from the nominal cooling class.
- **Survey advised:** for conservatories, floor area above 50 m², ceilings over 3.3 m, or estimated loads above the common nominal size range. Unusual fabric, ventilation, room geometry, equipment gains and heat loss may also require a survey even where a number is shown.

The calculator displays both loads in kW and approximate BTU/h plus room floor area, with an email link carrying both loads and all inputs. It never saves or uploads details automatically; a visitor explicitly opens their email client before sharing. Reference for the *cooling* guidance: [Daikin UK air-conditioner size guide](https://www.daikin.co.uk/en_gb/residential/inspiration/articles/air-conditioner-size-guide.html). The multipliers are **heuristic only** and are not a substitute for a CIBSE-style cooling load or measured heat-loss/design assessment. Run `npm run test:calculator` to test the calculations.
