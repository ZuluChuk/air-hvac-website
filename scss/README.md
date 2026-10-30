# AIR HVAC styles

Edit `scss/style.scss` instead of `css/style.css`. The browser uses the compiled `css/style.css` file.

```sh
npm install
npm run watch:css  # local development
npm run build      # compile once
npm run deploy     # compile then deploy to Cloudflare Workers
```

Commit the generated `css/style.css` alongside any SCSS changes. The existing Cloudflare command `npx wrangler deploy` does not automatically run Sass, so either switch the Cloudflare deploy command to `npm run deploy` or commit the generated CSS before deployment.

Existing styles have been copied into SCSS without changing their appearance. Future styling can be split into partials and use Sass variables, nesting, and mixins.
