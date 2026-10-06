# Visual baselines

These three images preserve the initial reviewed homepage desktop/mobile layout and Warrior talent-calculator detail. `manifest.json` records browser, viewport, route and state. They are reference images for regression review, not a claim of pixel identity across browsers.

Before changing a baseline, build the proposed change, capture the same route/state in the same viewport and browser, and compare the current image with the committed reference. Inspect a side-by-side or difference image for changed spacing, text wrapping, scenery overlays, control placement, icon rendering, overflow and clipping. Explain intended differences in the pull request. A changed news headline or countdown may alter pixels without being a layout defect.

Do not replace a baseline merely because a screenshot differs. Obtain human review of intentional visual changes first, then update the image and its manifest together. Keep the prior baseline in Git history. Re-run route screenshots and relevant keyboard/contrast checks after a layout change.

The homepage images are full-page captures. The Warrior image captures the calculator component with Improved Heroic Strike selected and one talent point allocated at level 60; recreate that state before comparison. Full-page captures with fixed navigation can differ from component captures, so compare like with like.
