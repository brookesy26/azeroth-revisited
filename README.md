# Azeroth Revisited

An independent WoW Forever guide for returning Vanilla/Classic players and people moving from Retail. Every gameplay guide covers Forever. The Retail page is a transition guide, not a guide to playing Retail.

The approved visual direction uses Warcraft scenery, orange and gold accents, stone textures, class icons and readable long-form guides. TestSite is a separate project.

## Run locally

Use Node 24 and npm. Install dependencies with `npm ci`, then run `npm run dev`. The development server prints its local address.

| Command                          | Purpose                                                           |
| -------------------------------- | ----------------------------------------------------------------- |
| `npm run lint`                   | Check code conventions                                            |
| `npm run typecheck`              | Check TypeScript                                                  |
| `npm test`                       | Verify countdown, content and talent rules                        |
| `npm run build`                  | Export the complete static site to `out/`                         |
| `npm run preview -- --port 3100` | Serve the static export locally                                   |
| `npm run test:e2e`               | Test navigation and interactive features in three browser engines |
| `npm run content:sync`           | Refresh attributed news and maintained talent data                |

Install test browsers with `npx playwright install`. To use an installed Microsoft Edge for local Chromium checks, set `PW_CHANNEL=msedge` and pass `--project chromium`. For tests against an existing static export, set `PW_STATIC=1`. These flags describe supported verification methods, not evidence that checks have passed.

## Content and maintenance

Guides, citations, news snapshots and maintained community talent data live in `src/content/`. The build reads and validates them before rendering. News is linked and attributed; source articles are not copied. Beta guide text needs editorial review when announcements change. A feed refresh cannot automatically verify a class guide or encounter strategy.

The countdown uses an explicit UTC launch instant. Its source is the Blizzard panel recap; conflicting source times must be reviewed before any date change. Talent data is a community beta compilation with its own build and attribution. It does not certify a build as optimal.

Scheduled published refreshes request a Cloudflare Pages build every three hours. The production build command runs content sync before exporting, so a successful build publishes current snapshots without waiting for a content pull request. This requires the configured build-hook secret and account connection. A separate daily workflow proposes source-controlled snapshot updates for review. GitHub schedules may be delayed. See [operations](docs/operations.md).

## Deployment

The app uses Next.js App Router with `output: 'export'`. Cloudflare Pages can host the `out/` directory using `npm run build` and Node 24. It needs no running Next.js server. Repository creation, account connection and deployment are separate actions; this README does not claim they are complete.

## Accessibility and credits

See the [accessibility evidence register](docs/accessibility.md) for criterion-level status and remaining manual checks. No whole-site WCAG conformance claim is made. Blizzard owns Warcraft imagery and game content; [artwork sources](docs/artwork-sources.json) records provenance. The fan site does not imply Blizzard endorsement.

See [architecture](docs/architecture.md), [content policy](docs/content-policy.md), and [verification](docs/verification.md).
