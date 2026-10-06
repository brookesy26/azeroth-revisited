# Azeroth Revisited

An independent WoW Forever guide for returning Vanilla/Classic players and people moving from Retail. Every gameplay guide covers Forever. The Retail page is a transition guide, not a guide to playing Retail.

The approved visual direction uses Warcraft scenery, orange and gold accents, stone textures, class icons and readable long-form guides. TestSite is a separate project.

## Run locally

Use Node 24.16.0 and npm. Install dependencies with `npm ci`, then run `npm run dev`. The development server prints its local address. Node must be at least 24.15 within the 24 LTS line; `.nvmrc` and CI pin the verified runtime.

Selected stable framework versions: Next.js 16.3.8, React 19.3.0, TypeScript 5, Tailwind CSS 4, Redux Toolkit 2.13 and React Redux 9.3. `package-lock.json` records the exact compatible dependency tree. The deployment uses static export and does not need an OpenNext runtime adapter.

| Command                | Purpose                                                                      |
| ---------------------- | ---------------------------------------------------------------------------- |
| `npm run lint`         | Check code conventions                                                       |
| `npm run typecheck`    | Check TypeScript                                                             |
| `npm test`             | Verify countdown, content and talent rules                                   |
| `npm run build`        | Export the complete static site to `out/`                                    |
| `npm run preview`      | Serve the static export locally at port 3100 (or the PORT environment value) |
| `npm run test:e2e`     | Test navigation and interactive features in three browser engines            |
| `npm run content:sync` | Refresh attributed news and maintained talent data                           |

Install test browsers with `npx playwright install`. To use an installed Microsoft Edge for local Chromium checks, set `PW_CHANNEL=msedge` and pass `--project chromium`. For tests against an existing static export, set `PW_STATIC=1`. These flags describe supported verification methods, not evidence that checks have passed.

## Content and maintenance

Guides, citations, news snapshots and maintained community talent data live in `src/content/`. The build reads and validates them before rendering. News is linked and attributed; source articles are not copied. Beta guide text needs editorial review when announcements change. A feed refresh cannot automatically verify a class guide or encounter strategy.

The countdown uses an explicit UTC launch instant. Its source is the Blizzard panel recap; conflicting source times must be reviewed before any date change. Talent data is a community beta compilation with its own build and attribution. It does not certify a build as optimal.

Scheduled published refreshes request a Cloudflare Pages build every three hours. The production build command runs content sync before exporting, so a successful build publishes current snapshots without waiting for a content pull request. This requires the configured build-hook secret and account connection. A separate daily workflow proposes source-controlled snapshot updates for review. GitHub schedules may be delayed. See [operations](docs/operations.md).

## Deployment

The app uses Next.js App Router with `output: 'export'`. The production site is live at [azeroth-revisited.pages.dev](https://azeroth-revisited.pages.dev). Cloudflare Pages builds the `out/` directory using `npm run content:sync && npm run assets:talents && npm test && npm run build` and Node 24.16.0. Every publish validates refreshed source snapshots with the unit tests before exporting. It needs no running Next.js server. See [deployment evidence](docs/deployment-evidence.md) for the verified release and automation boundaries.

## Accessibility and credits

See the [accessibility evidence register](docs/accessibility.md) for criterion-level status and remaining manual checks. No whole-site WCAG conformance claim is made. Blizzard owns Warcraft imagery and game content; [artwork sources](docs/artwork-sources.json) records provenance. The fan site does not imply Blizzard endorsement.

See [architecture](docs/architecture.md), [content policy](docs/content-policy.md), and [verification](docs/verification.md).

See [design system](docs/design-system.md) for component and palette guidance. Routes are in `src/app`, shared presentation in `src/components`, browser behaviours in `src/features`, schema-checked JSON in `src/content`, server-only access in `src/lib/content`, Redux in `src/store`, shared models in `src/types`, scripts in `scripts`, and tests in `tests`.

To edit content, change the matching guide or class JSON, update its review date and sources, then run the checks. To replace local JSON with an API, keep the repository functions and returned types, replace their internal reads with validated server-side fetches, and retain visible source age and failure behaviour. Request-time endpoints would require reassessing static hosting; do not put private API credentials into Client Components.
