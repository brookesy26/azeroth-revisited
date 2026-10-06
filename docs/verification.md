# Verification

Status: verification is being performed during the initial build. This file lists coverage and outstanding checks, not a blanket pass certificate.

Initial local checks on 6 October 2026: `npm test` passed 31 tests across three files; `npm run typecheck` passed; Playwright test discovery loaded 18 cases across three configured engines. Discovery is not browser execution. Later changes require the relevant checks to be repeated.

Initial visual automation on Microsoft Edge 154 captured 28 exported routes at six viewport sizes (168 screenshots) and found no page-level horizontal overflow or JavaScript page errors. Route-level axe scans using WCAG A/AA tags reported zero detected violations on all 28 routes. This is automated coverage; the entire screenshot set has not been manually certified. The initial static preview returned missing segmented Next.js prefetch resources, which require correction and a targeted repeat before release. Raw warm-cache reload load events ranged from approximately 46 to 95 milliseconds on the local server and are not representative of real-user hosting performance. Initial report: `test-results/visual-review/initial-report.json`.

Unit tests cover countdown boundaries and zero-clamping, schema validation, citation integrity, roster structure, talent prerequisites, tier gates, point budgets and shared builds. Browser tests exercise navigation, search, mobile dialog focus, talent interaction, share import and automated accessibility checks. The configuration includes Chromium, Firefox and WebKit; an installed Edge channel can provide a local Chromium fallback.

Run checks against the static export as well as development when releasing. Review unexpected console errors, failed resources and narrow viewport overflow. Record exact command, date, browser and result in a release note. Do not describe unexecuted test projects as passed.

Manual work still includes assistive-technology reading order, keyboard focus across complete journeys, 200%/400% zoom, custom text spacing, high contrast, reduced motion, touch targets and content readability. Automated accessibility scanning cannot establish WCAG AAA conformance. See the criterion register for honest pending states.

`node scripts/visual-review.mjs` discovers every exported route and captures full-page images at widths 320, 375, 768, 1024 and 1440 plus an 844×390 landscape view. It also captures mobile navigation and selected/invalid calculator states. The local preview must already be running at port 3100. Results stay in `test-results/visual-review/`; its JSON records overflow, browser errors, failed resources, route-level axe findings and warm-cache local document timing. Screenshots need visual inspection. Timing is raw local measurement, not a Lighthouse score or a prediction of hosted performance.

Current development dependency review: the initial audit identifies five high-severity findings in the development-only dependency chain involving `braces` 3.0.3. A patch is still pending; do not downgrade Next.js to conceal that finding. The production-only audit reported zero findings when inspected during initial development. Re-run the audits before release because dependency advisories can change. These audit results do not establish overall security.
