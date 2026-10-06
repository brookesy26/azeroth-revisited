# Ember and stone

The `/design-system/` page demonstrates real action, disabled, empty, error and content components. Primitives live in `components/atoms`; navigation and guide composition live in `components/organisms`. Interactive domain controls live in `features` rather than a generic component library.

The shared `--wow-*` palette in `globals.css`, with final accessible overrides in `site-enhancements.css`, uses background `#17120f`, panel `#241b15`, body text `#fff1d8`, muted text `#e0cdb5`, orange links `#ffc27b` and border `#674a2e`. Keep these values central and recheck contrast when changing them. Borders alone are not the selection indicator: current navigation, pressed talent controls and text/rank values supply additional meaning.

Georgia gives headings a familiar fantasy feel; Arial keeps long guide text readable without third-party font requests. The main text is 16px with a 1.65 line height. Guide grids adapt to available space, and the navigation changes to a native modal dialog on narrow screens. CSS media queries are the breakpoint reference; screenshots exercise 320, 375, 768, 1024, 1440 and landscape layouts.

Actions have distinct primary and secondary styles, visible keyboard focus, hover and disabled states. Links remain links; actions remain buttons. Do not substitute decorative icons for accessible labels. The native dialog handles modal focus; Escape and explicit close return focus to its opener. Talent detail is available by keyboard selection, not just mouse hover. Reduced-motion styles remove animation and smooth scrolling.

Source notes, beta dates and status notices use ordinary readable text. Scenery does not represent news evidence. New components should reuse the existing colours, reading spacing, bordered cards and focus treatment. Record a reviewed screenshot before changing the visual language. See `visual-baselines/README.md` for the baseline-review procedure.
