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
