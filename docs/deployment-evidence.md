# Cloudflare Pages deployment

Verified on 6 October 2026.

- GitHub repository: https://github.com/brookesy26/azeroth-revisited
- Cloudflare Pages project: `azeroth-revisited`
- Production address: https://azeroth-revisited.pages.dev
- Production branch: `main`
- Native GitHub integration is connected to this repository. No Cloudflare API token is stored in GitHub Actions.
- Build command: `npm run content:sync && npm run assets:talents && npm run build`
- Output directory: `out`
- Node version: `24`, configured for production and preview builds.
- Next.js exports static pages. This deployment does not create Pages Functions, databases, paid Workers services, or a paid domain.

## Initial status

The project and native GitHub connection were created successfully through the Cloudflare API. Automatic deployments are temporarily disabled until the implementation has passed verification. The production address is reserved; creation of the project alone does not mean that a site is live.

## Deployment flow

Once automatic deployments are enabled, pushes to `main` build and publish production. Other branches produce preview deployments. The build refreshes source data and prepares any missing talent icons before exporting the site. Failed source requests retain the last validated snapshot according to the content synchronisation script.

The site does not require a Cloudflare API token in its source code or repository. Local maintenance can use an existing Wrangler login. Credentials stay in the local Wrangler configuration and must never be copied into repository files.

## Automatic published content refresh

The Pages deploy hook `scheduled-content-refresh` targets `main`. Its secret URL has been encrypted into the repository Actions secret `CLOUDFLARE_PAGES_BUILD_HOOK`. This restricted URL can request a rebuild of this project; it is not a broad account API token. It must not appear in source files, logs or documentation. Delete and replace the hook in Cloudflare if the URL is exposed.

`.github/workflows/published-content-refresh.yml` invokes the hook every three hours at minute 17 UTC, and supports manual dispatch. The hook rebuilds production from `main`; the build runs the source synchronisation script before exporting. This allows newly published news to reach the public site without a manual merge. The separate snapshot-update workflow creates reviewed source-data pull requests.

The schedule requests at most 248 builds in a 31-day month. Code pushes, previews and builds from other Pages projects on this account share the 500-build allowance. GitHub scheduled jobs can run late; this is a periodic refresh target, not a guarantee of instantaneous updates. The schedule activates after its workflow is merged to the default branch. The secret's presence was verified; the hook was not triggered during setup.

[Cloudflare deploy-hook documentation](https://developers.cloudflare.com/pages/configuration/deploy-hooks/)

## Free plan boundaries

Cloudflare documents 500 builds per month, one concurrent build per account, a 20-minute build timeout, 20,000 files per site and a 25 MiB maximum per asset on the Free plan. Keep automated content refreshes comfortably within the monthly build allowance, taking other projects on the account into account.

Official references:

- [Pages limits](https://developers.cloudflare.com/pages/platform/limits/)
- [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- [Build image and Node version](https://developers.cloudflare.com/pages/configuration/build-image/)
- [Create project API](https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/create/)

## Rollback

Use Cloudflare Pages deployment history to promote an earlier successful production deployment, or revert the source commit and push the correction to `main`. Preview deployments cannot be rollback targets. The first launch has no earlier production deployment to roll back to. Build configuration and source data are version controlled so changes can be reviewed.

[Cloudflare rollback instructions](https://developers.cloudflare.com/pages/configuration/rollbacks/)

## Build verification still required

Project creation confirms the GitHub source, output directory, build command and Node override. The first native preview must still confirm successful dependency installation, source-data refreshes in Cloudflare's network environment, static export and public page responses. Outbound provider requests can fail independently; the published source status must accurately show the retained snapshot when this happens.
