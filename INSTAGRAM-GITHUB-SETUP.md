# GitHub + Instagram setup for AIR HVAC

## GitHub
1. Connect your GitHub account to ChatGPT if you want me to help update your repository.
2. Create a repository (e.g. `air-hvac-website`) and upload **the contents of this website folder**, with `index.html` at the repository root.
3. In Cloudflare dashboard, use **Workers & Pages > Create > Pages > Connect to Git** and select this repository. No framework/build command is needed; output directory is the repository root (`.`). Subsequent GitHub pushes redeploy automatically.
4. Your current `workers.dev` preview is a separate Workers deployment. Connecting a new Pages project will give a new `pages.dev` URL; it does **not** automatically update that existing Worker.

## Instagram: last four posts
The site fetches `/api/instagram` and renders the newest four media posts. If no feed is configured, it shows four illustrative placeholders that link to @airhvac_uk.

1. Use an Instagram **Professional** account and configure a supported Meta Instagram API application with the permissions needed to read the account's media.
2. Obtain the account's Instagram user ID and a valid long-lived or renewable access token through Meta's documented authentication process.
3. In Cloudflare **Pages** project settings, set `INSTAGRAM_USER_ID` as a variable and `INSTAGRAM_ACCESS_TOKEN` as an **encrypted secret**. Never commit the token to GitHub or add it to browser JS.
4. Redeploy the project and check `https://YOUR-PROJECT.pages.dev/api/instagram`. It should return a `posts` array. A `configured:false` response means the variables are missing. A 503 means the API request failed; check function logs, token scope, account type and Meta's current endpoint requirements.
5. Tokens can expire or be revoked; arrange renewal and check the feed periodically. Instagram media URLs can also expire; a cache/proxy strategy may be needed for higher reliability.

**Important:** This project uses Cloudflare **Pages Functions**. If you deploy as a standalone Cloudflare Worker with static assets, the `/functions/api/instagram.js` file is **not automatically mounted** as an endpoint. Deploy to Pages with Git integration, or adapt the handler to a Worker route.

## Notes
- `info@airhvac.co.uk` is unverified and the phone number is still missing.
- Project gallery images remain illustrative until Meta access is configured.
- Confirm your official business details before publishing the main domain.
