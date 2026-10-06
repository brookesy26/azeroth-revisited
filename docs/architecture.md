# Architecture

Next.js App Router renders guide content into a static export. Each route has HTML available before JavaScript runs. Dynamic guide and class routes enumerate their paths at build time. Static export excludes server actions, request-time API handlers and automatic incremental regeneration.

`src/content/` contains source-controlled JSON. `src/types/content.ts` validates its shape. The repository module supplies it to server-rendered pages. Citation IDs connect guides with `sources.json`; tests catch missing references and duplicate routes. The source URL and review date stay visible to readers.

Client components implement the countdown, guide search, navigation state and talent planner. Redux handles shared UI preferences. Pure countdown and talent validation functions are independently testable. Talent allocation rules must apply to both interactions and shared build imports; imported data must not bypass the rules.

Artwork is prepared into local assets with explicit provenance in `artwork-sources.json`. Decorative scenery is separated from article evidence. Icons supplement class names and talent labels.

News and talent refreshes run outside the visitor's browser. A scheduled GitHub workflow opens source-controlled snapshot pull requests for review. A separate three-hour schedule requests a Cloudflare Pages build, whose production command syncs validated data before export. This avoids dependence on browser CORS and credentials. The last valid committed snapshot is the fallback if the refresh cannot provide valid data. Guide prose remains editorially maintained and does not change just because a feed refresh succeeds.

Cloudflare Pages serves `out/`. A preview is not deployment evidence. A live URL and checked production routes are needed to establish deployment success.
