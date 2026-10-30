# Bordelyx

A browser geography strategy arcade built with Next.js, TypeScript, Tailwind, Motion, Three.js and Zustand. Seven modes, one shared tactical toolkit, and a deterministic three-round Daily World Circuit.

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
- **Ghost Route:** only the fixed start and destination markers appear over the map grid. Type your route from memory; country shapes and the route are revealed after the run. Scout and Pulse are disabled in this mode.
- **Pinpoint:** locate a named country with one map selection. Scores use distance between country centers, not click coordinates.

All route modes require **full typed country names**. Country labels, country hover names, map selection and passive neighboring-country highlights are disabled. ISO shortcuts and autocomplete are not accepted. Accents and familiar names such as Turkey / Türkiye and Czech Republic / Czechia are supported. Only Pinpoint allows selection on an unlabeled map. Blind hides the atlas until results; Fog reveals local territory; Time Rush, Hardcore, Limited Moves, One-Way Route and Chaos change the rules. One-Way is excluded from Heist because required detours can revisit countries. Ghost Route excludes Blind/Fog and all map-revealing hints. Pinpoint only offers compatible modifiers. Country names and route geometry are revealed after a run.

Dash crosses up to two land borders in one action. Shield absorbs one danger wave. Scout reveals the next wave and fogged territory. Reroute opens a blocked region or clears adjacent danger. Pulse highlights valid moves. Ability charges are limited; undo never refunds time or charges.

## Daily and social play

The Daily World Circuit uses `CIRCUIT-YYYY-MM-DD` with a **UTC** reset. Heist → Royale → Chain; accumulated score and remaining abilities carry forward. A complete circuit earns a streak day once, even on retries. Profile scores, badges and streak dates are stored on the current device using localStorage. Clearing browser data clears the passport.

Practice runs generate seeds. Codes such as `royale:WORLD42` recreate the same standard-rule challenge. Share copies a result and challenge URL; daily links start today's circuit. Codes use standard rules so stale practice modifiers cannot alter a shared challenge. Streamer mode enlarges key HUD information and challenge codes. This version has no server leaderboard, accounts, multiplayer synchronization or anti-cheat; viewer competition happens through shared codes/results.

## Geography and rendering

The game engine is independent of rendering: `lib/engine.ts` uses the explicit graph in `lib/geography.ts`. Current play covers **58 countries in Europe, North Africa and western Asia**, including microstates. This is a regional atlas, not a full worldwide adjacency dataset. Borders follow the included simplified country-level model; no ferries or overseas connections. Country-level graphs combine a country's disconnected territory. Displayed boundaries are cartographic data, not a statement about sovereignty or border access.

The homepage renders the supplied `public/art/globe.glb` in a local Three.js scene through `GLTFLoader`. The model rotates slowly; scrolling progressively moves the camera closer while the hero remains pinned for its opening section. Rendering pauses offscreen/in background tabs, caps pixel density, respects reduced motion, and disposes GPU resources on unmount. If WebGL is unavailable, a lightweight CSS globe appears. No bitmap is used for the live hero.

The default atlas renders bundled public-domain Natural Earth 1:110m polygons in SVG. No map token or per-play network API is required. Routes, fog, hazard fills and tactical markers are custom components. Both SVG and Mapbox adapters use one map-visibility policy; a rendering change cannot re-enable route selection or country labels. The world map data is served by the app itself.

Set `NEXT_PUBLIC_MAPBOX_TOKEN` to opt into the Mapbox GL JS adapter. It uses a local style and the same bundled GeoJSON, without remote tiles, sprites or glyphs. The SVG atlas is retained for restricted modifiers and as a WebGL/source-error fallback. The optional token-based adapter was typechecked; it was not verified with a live token.

`npm run preprocess` validates graph symmetry and connectivity and writes `public/data/borders.json`. Edit `lib/geography.ts` to extend the supported graph. Polygons are in `public/world.geojson` from [Natural Earth](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson).

## Project structure

- `app/`: homepage, arcade selection, run HUD, setup and result flows; responsive visual system.
- `components/`: Three.js hero scene, custom icons, illustrated game posters, SVG atlas and optional Mapbox adapter.
- `lib/engine.ts`: deterministic challenges, path rules, abilities, danger, scoring and results.
- `lib/map-policy.ts`: shared country-label, selection and endpoint-only rendering rules.
- `lib/country-input.ts`: full-name entry and common-name aliases.
- `lib/progress.ts`: persisted player passport and UTC streak calculations.
- `tests/`: border, seeded solvability, ability, modifier, endless and streak regression checks.
- `public/art/`: supplied 3D globe and model credits. The earlier generated bitmap is retained as an unused project asset.
- `.openai/hosting.json`: private Site identity and static output configuration.

Motion respects `prefers-reduced-motion`; sound is opt-in. All seven modes are playable without a paid AI service. The supplied model is rendered locally; no AI calls occur in the product.

## Validation

TypeScript, production static export and 26 automated tests pass. Seed tests cover 160 route/survival solutions, 30 Ghost Route completions and additional Heist checkpoint-order cases. Regression tests enforce unlabeled typed-only maps, endpoint-only visibility, explicit Pulse hints and full-name parsing. Browser checks cover desktop/phone layout, custom-code start, typed border movement, a complete Rush run, result view, route replay, and a full three-round daily circuit with score/ability carry-over and saved streak/badges. The refinement was also browser-tested at 1440px, 390px and 319px: the supplied globe loads, rotates and zooms on scroll; route maps contain zero labels/selectable territories/passive hints; ISO shortcuts are rejected; full-name entry completes a Rush run; Ghost Route retains exactly two fixed markers after movement. Optional Mapbox token mode is not runtime verified.

## Supplied globe credits

“Airports around the world” by [famousandfaded](https://sketchfab.com/famousandfaded), supplied as `globe.glb`. Embedded source: [Sketchfab model](https://sketchfab.com/3d-models/airports-around-the-world-e58f56a352b540469fd209abf0c37bc5). Embedded license: [Sketchfab Standard](https://sketchfab.com/licenses). Model geometry, textures and materials are preserved.
