# Operations

CI installs dependencies, checks lint and TypeScript, runs unit tests, exports the site, installs Chromium/Firefox/WebKit, then runs browser tests against the export. Test reports are uploaded even on failure. A green CI job only establishes the checks it actually ran.

The scheduled content workflow is configured to run daily and can be run manually. It refreshes news and community talent snapshots and proposes a pull request. Repository settings must allow GitHub Actions to create pull requests. Schedule timing is best-effort; the workflow is not proof of real-time updates. Review failed refreshes and stale timestamps.

The separate published-content workflow calls a secret Cloudflare Pages build hook every three hours. The repository secret `CLOUDFLARE_PAGES_BUILD_HOOK` is configured. The production build command is `npm run content:sync && npm run assets:talents && npm test && npm run build`. Each successful refresh validates the updated data with unit tests before exporting it into the hosted site automatically. The hook response only proves the request was accepted; check Pages deployment status and visible timestamps to verify publication. Never print the hook URL in logs or commit it.

The stored secret is the restricted deployment-hook URL. No general Cloudflare API token or long-lived OAuth credential is saved in this repository's scheduled-refresh configuration. Creating the hook and storing its secret does not itself establish a successful published refresh.

Eight refreshes a day means at most 248 scheduled builds in a 31-day month, leaving room within an account allocation of 500 builds for normal changes and previews. Other projects on the account consume the same allocation. Thirty-minute deployments would mean up to 1,488 builds a month, so published refreshes run every three hours and review snapshots run daily. Monitor account build usage and failed jobs. The [Cloudflare Pages limits](https://developers.cloudflare.com/pages/platform/limits/) document specifies 500 monthly builds for the Free plan (checked 6 October 2026).

The default GitHub Actions token can create the content pull request, but that action does not trigger other workflows. Run the verification workflow manually on its branch before merging, or configure a narrowly scoped `CONTENT_SYNC_TOKEN` secret that permits normal pull-request CI triggers. The sync workflow itself runs unit tests. It never automatically merges content.

Review content-update pull requests for changed source domains, suspicious titles, talent schema changes, prerequisite changes and unusually large removals. Run all validation before merging. Newly announced mechanics may need guide edits that the sync script cannot make.

Cloudflare Pages is connected to the repository with build command `npm run content:sync && npm run assets:talents && npm test && npm run build`, output directory `out`, and Node 24.16.0. The canonical production site is https://azeroth-revisited.pages.dev. Keep credentials in account or repository secrets rather than source files. Verify the homepage, a direct nested guide URL, a missing URL, mobile navigation, images and metadata on the published host. See [deployment evidence](deployment-evidence.md) for the release record.

Rollback uses the previous known-good commit or previous Pages deployment. Feed failure should not remove the last successful snapshot. A browser test report and production smoke check belong with a release record.

Verified GitHub repository settings allow Actions to create content-review pull requests. The published refresh workflow also requests a main-branch build after the Verify site workflow succeeds for this repository's main branch. This uses the restricted hook even if the native provider push webhook does not fire. Source cloning and previews were verified; native webhook delivery was not verified during initial setup.

For hosted smoke checks set PW_BASE_URL to the HTTPS site URL and run the browser suite; the configuration then skips starting a local web server.
