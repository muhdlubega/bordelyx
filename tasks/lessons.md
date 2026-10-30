# Design and gameplay lessons

- Standardize the type, icon and spacing scales before adding decorative UI. Small one-off captions and floating status ornaments create clutter; keep one focal visual and a clear primary action.
- Route games test country knowledge. Country labels, clickable territories and always-highlighted neighbors must not reveal valid next moves. Require typed country names by default and reserve explicit hints for limited-use abilities.
- Prefer a supplied 3D asset when requested; inspect its format, embedded materials and attribution, then verify rotation and scroll behavior in the browser.
- Open country-name inputs must accept worldwide country names, not merely a preselected regional list. Validate gameplay rules after submission and show a visible wrong-answer state; do not silently discard unfamiliar or invalid guesses.
- Remove presentation-only settings that imply functionality the product does not provide. Show third-party model attribution in the visible footer, not just repository documentation.
- Camera zoom must be bounded by the actual transformed model sphere and the canvas's limiting field of view. Enlarging a model in a narrow side-panel canvas creates avoidable clipping; use a full-width backdrop when it should sit behind hero text.
- Remove rejected mechanics throughout the product, including instructions, daily carry-over and result metrics, rather than merely hiding their controls.
- Map points need recognizable shapes and a matching legend, with persistent start/finish markers and a separate current-position marker. Keep icon size readable at mobile map scale and avoid overlapping badges at the same country.
