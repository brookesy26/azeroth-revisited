# Cloudflare Pages deployment

Verified on 6 October 2026.

- GitHub repository: https://github.com/brookesy26/azeroth-revisited
- Cloudflare Pages project: `azeroth-revisited`
- Production address: https://azeroth-revisited.pages.dev
- Production branch: `main`
- Native GitHub integration is connected to this repository. No Cloudflare API token is stored in GitHub Actions.
- Build command: `npm run content:sync && npm run assets:talents && npm test && npm run build`
- Output directory: `out`
- Node version: `24.16.0`, configured for production and preview builds.
- Next.js exports static pages. This deployment does not create Pages Functions, databases, paid Workers services, or a paid domain.

## Verified production

The production site is live at https://azeroth-revisited.pages.dev. Deployment `844531e1-ac33-4120-b97a-fc5ed205a2eb` published merged-main commit `aa6ca59f38e65c4e4995b4b1aa9bbcf49dffbf3f` successfully on 6 October 2026 at 08:00 UTC (09:00 UK time). The restricted deploy hook triggered this initial build directly; this observation verifies the hook and Cloudflare publishing, separately from GitHub workflow execution.

Production logs confirm Node 24.16.0, refreshed news and talent data, 357 talent icons with no asset failures, all 34 unit tests passing across four files, static export and successful publication. All 26 sitemap routes returned HTTP 200. Sampled class and talent images, robots.txt, sitemap.xml and Next.js navigation payloads returned HTTP 200 with the expected content types. An unknown route returned the custom missing-page content with HTTP 404. CSP, HSTS, framing restrictions, MIME sniffing protection, referrer and permissions policies are configured; production does not carry Cloudflare's preview noindex header.

The subsequent [Verify site run 37433077193](https://github.com/brookesy26/azeroth-revisited/actions/runs/37433077193) completed successfully on `main`. Its completion automatically started [Refresh published content run 37433387460](https://github.com/brookesy26/azeroth-revisited/actions/runs/37433387460), which also succeeded using the encrypted repository hook secret. That workflow triggered production deployment `ec3ac50c-784c-4e1d-98c1-9b068f720b48` for the same commit. Cloudflare refreshed both source snapshots, passed all 34 unit tests and published successfully at 08:03:14 UTC (09:03 UK time). This verifies the GitHub workflow-to-hook-to-publication path independently of the initial direct trigger.

## Verified previews

The project and native GitHub source were created successfully through the Cloudflare API. Preview settings permit `codex/*` branches, and production builds are enabled. Native push webhook delivery was not observed during setup; the verified previews were explicitly requested through the Pages API. Production automation uses the restricted deploy-hook workflow so it does not depend on that unverified webhook.

Native preview https://fe7e826e.azeroth-revisited.pages.dev completed successfully for commit `2566358ff6c8c2b95176d1bc484eae65bb1600df`. Cloudflare's Linux build updated both `talents.json` and `news.json`, ran talent asset preparation, exported Next.js and uploaded 529 static files. No Functions directory was present. Every one of the 26 sitemap routes returned HTTP 200, as did robots.txt, sitemap.xml and sampled class and talent icons. Next.js navigation payloads returned HTTP 200 with a text/plain content type. An unknown route returned the custom missing-page content with HTTP 404. CSP, HSTS, framing restrictions, MIME sniffing protection, referrer and permissions policies were present in responses.

## Deployment flow

The published-content workflow requests a production build after the Verify site workflow succeeds for this repository's `main` branch. Its scheduled and manual triggers can also request builds. Preview builds can be requested through Pages when needed. The build refreshes source data, prepares any missing talent icons and runs unit tests before exporting the site. Failed source requests retain the last validated snapshot according to the content synchronisation script.

The site does not require a Cloudflare API token in its source code or repository. Local maintenance can use an existing Wrangler login. Credentials stay in the local Wrangler configuration and must never be copied into repository files.

## Automatic published content refresh

The Pages deploy hook `scheduled-content-refresh` targets `main`. Its secret URL has been encrypted into the repository Actions secret `CLOUDFLARE_PAGES_BUILD_HOOK`. This restricted URL can request a rebuild of this project; it is not a broad account API token. It must not appear in source files, logs or documentation. Delete and replace the hook in Cloudflare if the URL is exposed.

`.github/workflows/published-content-refresh.yml` invokes the hook every three hours at minute 17 UTC, and supports manual dispatch. The hook rebuilds production from `main`; the build runs the source synchronisation script before exporting. This allows newly published news to reach the public site without a manual merge. The separate snapshot-update workflow creates reviewed source-data pull requests.

The schedule requests at most 248 builds in a 31-day month. Code changes, previews and builds from other Pages projects on this account share the 500-build allowance. GitHub scheduled jobs can run late; this is a periodic refresh target, not a guarantee of instantaneous updates. The workflow is merged to the default branch and its secret is configured. Direct hook invocation and the automatic workflow-run path both produced successful production deployments. The first timer-driven execution has not yet occurred; it uses the same verified job and secret.

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

## Build environment

The initial native preview confirms dependency installation, source-data refreshes in Cloudflare's network environment, static export and public page responses. Outbound provider requests can fail independently; the published source status must accurately show the retained snapshot when this happens. Cloudflare resolved the initial `24` Node override to 24.13.1. Some development dependencies reported engine warnings requiring a newer minor release; the preview build nevertheless completed successfully. The Node override was subsequently pinned to 24.16.0 for both preview and production to match the local runtime and dependency requirements.
