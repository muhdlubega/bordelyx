# Bordelyx

A browser geography strategy arcade built with Next.js, TypeScript, Tailwind, Motion, Three.js and Zustand. Seven modes, clear map markers, typed country routes, and a deterministic three-round Daily World Circuit.

## Run locally

Requires Node.js 20.9+ and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open the Local URL printed by Next.js. No environment variables are required. `npm run build` creates a portable static site in `out/`.

```sh
npm run typecheck
npm test
npm run preprocess
npm run build
```

## Play

- **Border Royale:** reach extraction while danger spreads every two moves.
- **Border Heist:** collect two off-route intel caches, then extract. Both collection orders are considered in the shortest-route comparison.
- **Border Rush:** connect the start and destination using real land borders.
- **Country Chain:** connect 12 unique countries, or enable Endless to continue until trapped, the clock expires, or all supported countries are visited.
- **Map Escape:** escape a danger wave that spreads every move.
- **Ghost Route:** only the fixed start and destination markers appear over the map grid. Type your route from memory; country shapes and the route are revealed after the run.
- **Pinpoint:** locate a named country with one map selection. Scores use distance between country centers, not click coordinates.

All route modes require **full typed country names**. Country labels, country hover names, map selection and passive neighboring-country highlights are disabled. The field is unrestricted and has no options list or autocomplete. Common names and aliases such as UK and USA are accepted; raw ISO codes are not used as a country-name shortcut. Incorrect or unknown guesses remain in the field with a red × and an explanation; valid moves get a green check. Wrong guesses deduct 50 points (to a minimum of zero) and end Hardcore runs. Accents and familiar names such as Turkey / Türkiye and Czech Republic / Czechia are supported. Only Pinpoint allows selection on an unlabeled map. Blind hides the atlas until results; Fog reveals local territory; Time Rush, Hardcore, Limited Moves, One-Way Route and Chaos change the rules. One-Way is excluded from Heist because required detours can revisit countries. Ghost Route excludes Blind/Fog and shows only its fixed start and finish markers. Pinpoint only offers compatible modifiers. Country names and route geometry are revealed after a run.

Each valid land-border crossing costs one move. The tactical toolkit and its powers have been removed. Start and finish flags, a current-position arrow, numbered visited stops, intel diamonds, and blocked/danger symbols distinguish map points by shape as well as color.

## Daily and social play

The Daily World Circuit uses `CIRCUIT-YYYY-MM-DD` with a **UTC** reset. Heist → Royale → Chain; accumulated score carries forward. A complete circuit earns a streak day once, even on retries. Profile scores, badges and streak dates are stored on the current device using localStorage. Clearing browser data clears the passport.

Practice runs generate seeds. Codes such as `royale:WORLD42` recreate the same standard-rule challenge. Share copies a result and challenge URL; daily links start today's circuit. Codes use standard rules so stale practice modifiers cannot alter a shared challenge. This version has no server leaderboard, accounts, multiplayer synchronization or anti-cheat; viewer competition happens through shared codes/results.

## Geography and rendering

The game engine is independent of rendering: `lib/engine.ts` uses the bundled graph in `lib/geography.ts`. Country input recognizes **250 countries and territories**, with **323 symmetric land borders**. Daily and practice objectives retain the original 58-country expedition pool, while players may travel through any valid country in the worldwide graph. Separate islands and landmasses remain disconnected. The map switches to a world view when a route leaves the initial region. Browser checks verified a wrong Canada guess, an unknown Atlantis guess and a valid Poland → Russia → China route with world framing. Borders follow the included simplified country-level model; no ferries or overseas connections. Country-level graphs combine a country's disconnected territory. Displayed boundaries are cartographic data, not a statement about sovereignty or border access.

The homepage renders the supplied `public/art/globe.glb` in a local Three.js scene through `GLTFLoader`. The model has a runtime green tint and rotates slowly. On desktop it sits behind the centered hero text; scrolling moves the camera closer to a fitted limit that keeps every mesh inside the canvas. The hero remains pinned for its opening section. Rendering pauses offscreen/in background tabs, caps pixel density, respects reduced motion, and disposes GPU resources on unmount. If WebGL is unavailable, a lightweight CSS globe appears. No bitmap is used for the live hero.

The default atlas renders bundled public-domain Natural Earth 1:110m polygons in SVG. No map token or per-play network API is required. Routes, fog, hazard fills and tactical markers are custom components. Both SVG and Mapbox adapters use one map-visibility policy; a rendering change cannot re-enable route selection or country labels. The world map data is served by the app itself.

Set `NEXT_PUBLIC_MAPBOX_TOKEN` to opt into the Mapbox GL JS adapter. It uses a local style and the same bundled GeoJSON, without remote tiles, sprites or glyphs. The SVG atlas is retained for restricted modifiers and as a WebGL/source-error fallback. The optional token-based adapter was typechecked; it was not verified with a live token.

`npm run preprocess` derives shared-boundary adjacency from the bundled Natural Earth polygons, applies documented small-border and territory corrections, validates symmetry and the connected expedition pool, and writes the world graph plus `public/data/borders.json`. Sources and modeling decisions are documented in `public/data/README.md`. Polygons are in `public/world.geojson` from [Natural Earth](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson).

## Project structure

- `app/`: homepage, arcade selection, run HUD, setup/results, `/privacy/` and `/terms/` policy pages.
- `components/`: Three.js hero scene, shared footer with visible Sketchfab credit, policy layout, custom icons, illustrated game posters and map renderers.
- `lib/engine.ts`: deterministic challenges, path rules, danger, scoring and results.
- `lib/map-policy.ts`: shared country-label, selection and endpoint-only rendering rules.
- `lib/country-input.ts`: full-name entry and common-name aliases.
- `lib/progress.ts`: persisted player passport and UTC streak calculations.
- `tests/`: border, seeded solvability, modifier, endless and streak regression checks.
- `public/art/`: supplied 3D globe and model credits. The earlier generated bitmap is retained as an unused project asset.
- `.openai/hosting.json`: private Site identity and static output configuration.

Motion respects `prefers-reduced-motion`; sound is opt-in. All seven modes are playable without a paid AI service. The supplied model is rendered locally; no AI calls occur in the product.

## Validation

TypeScript, production static export and 45 automated tests pass. Seed tests cover 160 route/survival solutions, 30 Ghost Route completions and additional Heist checkpoint-order cases. Regression tests enforce unlabeled typed-only maps, endpoint-only visibility, marker visibility and full-name parsing. Browser checks cover desktop/phone layout, custom-code start, typed border movement, a complete Rush run, result view, route replay, and a full three-round daily circuit with score carry-over and saved streak/badges. The refinement was also browser-tested at 1440px, 390px and 319px: the supplied globe loads, rotates and zooms on scroll; route maps contain zero labels/selectable territories/passive hints; ISO shortcuts are rejected; full-name entry completes a Rush run; Ghost Route retains exactly two fixed markers after movement. Optional Mapbox token mode is not runtime verified.

## Supplied globe credits

“Airports around the world” by [famousandfaded](https://sketchfab.com/famousandfaded), supplied as `globe.glb`. Embedded source: [Sketchfab model](https://sketchfab.com/3d-models/airports-around-the-world-e58f56a352b540469fd209abf0c37bc5). Embedded license: [Sketchfab Standard](https://sketchfab.com/licenses). Model geometry, textures and materials are preserved.

## Policy and footer pages

Every page includes model attribution to famousandfaded on Sketchfab, Privacy policy, Terms of use and How to play. Policies describe the actual browser-local game records, explicit sharing and separate hosting/access-provider processing. No operator contact information is invented; the current policy directs site questions to the person or organization that shared the site. The former presentation-only streamer toggle has been removed; shared challenge codes remain.

## Map marker guide

Start uses a mint flag, finish a cyan checkered flag, current position an ivory arrow, and visited countries numbered dots. Intel checkpoints use amber briefcase diamonds and change to a check when collected. A coral crossed square marks a blocked country; a warning triangle marks danger. SVG and optional Mapbox use one marker descriptor/icon set. Marker sizes remain consistent in screen pixels and overlapping roles use separated badges with leader lines. Ghost Route keeps only its two endpoints; Pinpoint hides all answer-related markers during play. Sound is available in Pause. There is no tactical toolkit or undo control.
