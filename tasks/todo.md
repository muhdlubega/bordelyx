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
