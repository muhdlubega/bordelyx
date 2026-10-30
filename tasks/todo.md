# Bordelyx build
- [x] Establish Next.js app, custom artwork and visual system.
- [x] Build offline geography engine and verify border, hazard, ability and modifier rules.
- [x] Connect all six modes, daily circuit, custom codes, practice and streamer settings.
- [x] Add saved scores, achievements, streaks and share results.
- [x] Verify production build, game engine and responsive browser flows.
- [x] Write setup and architecture notes and prepare private Site publication.

## Review
- 19 automated tests pass, including 160 seeded route/survival solves and checkpoint-order coverage.
- TypeScript passes; webpack production static export passes. Turbopack build worker port restriction avoided with the supported webpack builder.
- Browser verified desktop and 390px phone layouts with no horizontal overflow; completed Rush and all three daily circuit rounds. Score/ability carry-over, one-day streak, 9,099-point personal best and badges verified in the passport.
- Bundled atlas supports 58 countries. Optional token-based Mapbox adapter is typechecked but not runtime-tested.
- Private deployment is performed through Sites from this prepared source.

## Requested refinement
- [x] Replace the hero bitmap with the supplied Three.js globe, slow rotation, and scroll-driven zoom.
- [x] Consolidate typography, icon sizing, spacing, surfaces, and responsive layouts.
- [x] Default route maps to no labels and typed country entry; prevent map selection and passive neighbor hints.
- [x] Add Ghost Route with only start and end map markers.
- [x] Verify model rendering, scrolling, typed routes, mode rules, mobile layout, and production build; prepare the existing Site update.

### Refinement review
- Supplied GLB loads and rotates in the live Three.js scene; camera zoom changes progressively from 1.0 to 1.589 during scrolling.
- 26 tests pass, including Ghost Route rendering policy, solvability and full-name input.
- Browser checks confirm no labels, clickable territory roles or passive neighbor fills; a typed Rush run completes.
- Ghost Route retains exactly two markers after a valid typed move, with zero country shapes or route trails.
- Desktop (1440px), phone (390px) and narrow pane (319px) layouts verified without horizontal overflow.
- Release packaging uses a clean source/output checkout so the unchanged local secret check does not scan ignored development dependencies; the existing user development server is preserved.

## Footer, policy and free-entry update
- [x] Add visible Sketchfab model credit and shared footer on all pages.
- [x] Add accurate privacy policy and terms routes with footer links.
- [x] Remove the cosmetic streamer mode toggle and styling.
- [x] Accept worldwide country guesses with explicit correct/wrong feedback and consistent penalties.
- [x] Verify global borders, unknown guesses, footer navigation, responsive layout and production build; prepare the existing Site publication.

### Footer and input review
- Added shared footer credit and /privacy/ and /terms/ pages, verified through browser navigation. Policies reflect current local storage and hosting behavior without invented contact details.
- Removed streamer state, toggle and CSS; normal challenge sharing remains.
- 250 local country/territory names and 323 symmetric land borders; seeded challenges retain the original 58-country objective pool.
- 38 tests pass; TypeScript and production static export include both new policy pages.
- Browser verified Canada as a wrong border guess (red ×, retained field), Atlantis as an unknown guess, and valid Poland → Russia → China movement (green feedback, world atlas framing).

## Globe tint and desktop framing
- [x] Apply a green runtime tint while retaining texture detail.
- [x] Center the desktop globe behind the hero copy and fit the closest camera position to the whole model.
- [x] Verify zoom framing, text readability and mobile layout; build and prepare the existing private Site update.

### Globe framing review
- Runtime shader color grading produces a green tint while preserving the original texture detail and mesh lighting.
- Desktop canvas spans the full hero behind centered text; camera framing bounds every transformed mesh with a fitted closest endpoint.
- Browser verified the full sphere at maximum 1.5× desktop zoom with a 1.16 fit margin, legible text, and no renderer errors.
- Mobile 390px rendering fits without horizontal overflow; TypeScript and production static export pass.

## Toolkit removal and map points
- [x] Remove tactical abilities, dock, undo, ability metrics and obsolete instructions.
- [x] Add consistent start, finish, current-position, visited, intel, blocked and danger markers to SVG and Mapbox maps.
- [x] Preserve typed-only maps, hidden country names, Ghost endpoints, Fog and Pinpoint answer concealment.
- [x] Verify marker visibility on desktop/mobile, regressions and production build; publish the existing Site.

### Toolkit and marker review
- Removed tactical powers, undo, ability metrics and all obsolete game instructions; normal typed land-border movement remains solvable.
- Shared semantic marker icons distinguish start, finish, current position, numbered visits, intel, blocked points and danger in both renderers. Coincident roles are separated, with a matching legend.
- 45 automated tests pass; TypeScript and production static export pass. Browser completed a seven-move Heist and confirmed Ghost Route retains only two endpoint markers after movement.
- Desktop and 390px mobile layouts verified; mobile map reserves space for its wrapped legend. Existing private Site publication prepared from the verified output.

## Larger desktop globe and starfield
- [x] Increase the initial desktop globe size while preserving fitted scroll zoom.
- [x] Add faint mint stars, sparse constellation lines and twinkling, plus one randomized shooting star every ten seconds.
- [x] Verify responsive rendering, reduced motion, production build and publish the existing private Site.

### Globe and starfield review
- Desktop starts roughly 30% larger using a closer camera, retaining the fitted scroll endpoint and existing mobile framing.
- Sitewide decorative sky uses 132 seeded mint stars, 21 sparse constellation segments, staggered twinkles and a single 620ms randomized shooting star every ten visible seconds.
- Pointer-transparent decoration stays behind content. Reduced-motion preferences and hidden tabs stop animation; hydration uses deterministic star positions.
- Browser verified desktop and 390px phone appearance, zero mobile overflow, changing twinkle opacity and successive randomized shooting positions. TypeScript and production static export pass.

## Reconnecting constellations
- [x] Fade constellation groups out and reconnect different nearby star points before fading back in.
- [x] Preserve faint styling, responsive layout and reduced-motion/hidden-tab pause behavior.
- [x] Verify changing endpoints, production build and publish the existing Site.

### Constellation animation review
- Seven independently staggered groups fade out completely before choosing a different starting star and nearby chain, then fade back in over 9–14 second cycles.
- Browser confirmed six groups changed endpoints between observations, with simultaneous fade/hidden states. All42 line endpoints match visible stars on390px mobile.
- Reduced motion keeps static lines; hidden tabs pause the CSS lifecycle. Focused peer review, TypeScript and production export pass.
