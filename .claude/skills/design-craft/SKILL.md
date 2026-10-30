---
name: design-craft
description: Design, critique, audit and polish UI with a high craft bar. Combines Impeccable (mode-based direction, craft floor, audit/critique/polish workflow), Emil Kowalski's design-engineering rules (when and how to animate, easing, durations, performance, accessibility) and Taste Skill v2 (brief inference, anti-slop bans, density/motion/variance dials, dark-mode protocol). Use when building or reviewing any frontend, when asked to audit/critique/polish a design, or when touching CSS, motion, typography, colour or layout.
---

# design-craft

One skill, three lineages. Use it to **build** (shape → build → polish) or to **review** (critique → audit → report). Never skip the viewing step: judge the rendered result at the sizes it ships, not the code alone.

## 0. Before any UI edit

1. **Infer the brief.** State your reading in one line instead of asking. Ask only when a missing fact blocks the work.
2. **Pick the mode by surface, not product** (Impeccable):
   - **Persuade**: landing, marketing. Earn attention and action. Be bold and distinct.
   - **Operate**: apps, HUDs, settings, games in play. Scanability, consistency, native conventions. Ambition shows as precision and restraint.
   - **Read**: docs, legal, articles. Structure for comprehension.
   - **Experience**: portfolio/gallery/showcase. The artwork leads; chrome recedes.
   One product often has several surfaces. Name the mode per screen.
3. **Read the visual truth first.** Tokens, existing components, product docs. Refinement keeps identity, copy and behaviour. Do not change factual copy without asking.
4. **Set the dials** (Taste v2). Defaults 1-10, state them if they differ:
   - `VARIANCE` (layout experimentation): 4 for Operate, 7 for Persuade.
   - `MOTION` (amount of animation): 3 for Operate, 6 for Persuade.
   - `DENSITY` (info per screen): 6 for Operate, 3 for Persuade.
5. **Inventory what is ownable.** List 8-12 things that belong to this product and no competitor (name, domain objects, rules, numbers, rituals). The design idea comes from that list. Competitor test: if a rival could use the idea sentence, it is not an idea.

## 1. Craft floor (always)

**Type**
- One family is usually enough; two max. Load a real font, do not rely on the system stack for brand voice.
- At most 5 sizes per surface. Body 15-18px, leading 1.45-1.65, 45-75ch measure. Display: tracking -0.02 to -0.05em, leading 0.95-1.1.
- Never below 12px for readable text; 11px only for non-essential uppercase labels, and even then prefer 12. Use `tabular-nums` for changing numbers.
- Headlines at most two lines at every width. One `h1` per page, a heading per section.

**Colour**
- One ground, one ink, one accent (plus semantic: success/danger/warning). Extra hues need a job (e.g. mode identity) and must not carry meaning alone.
- Define colours as tokens. Tint neutrals toward the brand hue. Prefer OKLCH/`color-mix` for derived tones, not scattered hex alphas.
- Contrast: body text >= 4.5:1, large text and UI boundaries >= 3:1. Muted text counts. Check it, do not eyeball it.
- Separate surfaces by tone first, lines second.
- Meaning is never colour-only: pair with icon, shape or text.

**Dark-mode protocol** (Taste v2)
- Never pure `#000` ground or pure `#fff` text. Lift surfaces by lightness (bg < surface < raised), not by heavier shadows.
- Reduce accent saturation slightly on dark; large bright fills glare.
- Re-check contrast of every muted/disabled tone on each elevation level.
- Set `color-scheme` so native controls match.

**Space and layout**
- Spacing from a scale (4/8/12/16/24/32/48/64). Gaps between sections clearly larger than gaps inside them.
- Equal outer margins. No blank stretch taller than half a screen. Align to one grid.
- Touch targets >= 44px (24px absolute minimum with spacing). Inputs >= 16px font on mobile to avoid iOS zoom.
- Responsive means re-layout, not shrink. Test 1440, 768, 390 and 360.

**Interaction states**
- Every control: default, hover (pointer-fine only), focus-visible, active, disabled, loading, error. Focus ring never removed without replacement.
- Dialogs: focus moves in, is trapped, returns on close; `Esc` closes; `role="dialog"`, `aria-modal`, labelled.
- Dynamic feedback uses `aria-live`. Honour `prefers-reduced-motion` and `prefers-contrast` where cheap.

**Copy**
- Buttons name the action. Errors say what happened and what to do. No filler ("Unlock the power of…"). Consistent terms for the same thing.

## 2. Anti-slop bans (Taste v2 + Impeccable)

Flag and remove unless the brief explicitly asks for it:
- Icon-topped identical feature cards in rows; "01 / 02 / 03" decoration with no meaning.
- Tiny letter-spaced uppercase eyebrow above every heading; pill badges and "New" chips everywhere.
- Gradient text, gradient blobs, decorative glows on resting elements, glass blur as default surface, shadows on everything.
- Generic AI palette: cyan-on-dark neon, violet/indigo gradients, cream + terracotta.
- Emoji as icons, fake dashboards of grey bars, decorative shapes with no information.
- Styled accent word in every headline. Centre-aligning everything.
- Hover-lift on every card. Bounce/elastic easing on functional UI.
- Hidden content depending on JS (content must never stay invisible if a script fails).
- Invented proof (reviews, stats, logos).

Exceptions are fine when the product's identity earns them. A flagship hero may keep one signature glow. The test is "does it carry information or identity?", not "is it on the list?".

## 3. Motion (Emil Kowalski)

**Should it animate? By frequency**
| Seen | Decision |
|---|---|
| 100+/day, keyboard-initiated | none |
| tens/day (hover, list nav) | remove or minimal |
| occasional (modal, drawer, toast) | standard |
| rare / first time (onboarding, win) | may delight |

Valid purposes: spatial continuity, state change, explanation, feedback, preventing a jarring jump. "Looks cool" on a frequent element is not a purpose.

**Easing**: enter/exit `ease-out`; on-screen move `ease-in-out`; hover/colour `ease`; constant (progress) `linear`. Default `ease-out`. Never `ease-in` on UI.
- Strong out: `cubic-bezier(0.23, 1, 0.32, 1)`; strong in-out: `cubic-bezier(0.77, 0, 0.175, 1)`; drawer: `cubic-bezier(0.32, 0.72, 0, 1)`.

**Duration**: press 100-160ms; tooltip/small popover 125-200ms; dropdown 150-250ms; modal/drawer 200-500ms; UI < 300ms in general. Exit faster than enter. Stagger 30-80ms, decorative only, never blocks input.

**Rules**
- Pressable: `transform: scale(.97)` on `:active` (range .95-.98), transition `transform 160ms ease-out`.
- Enter from `scale(.95)` + `opacity:0`, never `scale(0)`.
- Popovers scale from the trigger (`transform-origin`); modals stay centred.
- Name exact properties. Never `transition: all`.
- Animate only `transform`/`opacity` (and `clip-path`/`filter` sparingly; blur < 20px). Never width/height/margin/padding.
- Interruptible, rapidly-triggered UI (toasts, tabs) use transitions or springs, not keyframes.
- Springs for gestures/drag/momentum: `{ type: 'spring', duration: .5, bounce: .2 }`; bounce 0.1-0.3, none in functional contexts.
- Hover effects wrapped in `@media (hover: hover) and (pointer: fine)`.
- `prefers-reduced-motion`: remove travel, keep opacity/colour cues. Do not blanket-kill state feedback.
- Framer/Motion: `x`/`y`/`scale` shorthands are not GPU-composited under load; use `transform` strings for heavy pages. Don't set CSS variables on parents in hot paths.
- Debug by slowing 2-5x and stepping frames; review again the next day.

## 4. Workflow commands

Run the one asked for; with no argument, do **critique** then **audit**.

- **critique**: heuristic UX review (hierarchy, clarity of the primary action, consistency, feedback, emotional fit, copy). Output: what works, ranked issues with *why it hurts the user*.
- **audit**: measurable checks. Contrast (compute it), type sizes, touch targets, focus/ARIA, responsive, motion rules above, performance (animated properties, blur cost, WebGL/canvas load), reduced-motion.
- **polish**: fix the small stuff that sums to feel: alignment, spacing rhythm, states, easing, copy.
- **distill / quieter / bolder**: remove, calm, or push, scaled to the mode.
- **harden**: empty, error, long-text, i18n, offline, rapid-input edge cases.
- **animate**: apply section 3 to a surface; justify each motion by frequency and purpose.
- **adapt**: re-layout per breakpoint and input type.

## 5. Report format

1. Mode(s), dials, one-line brief reading.
2. **Verdict** in 2-3 sentences.
3. Findings table: `ID | Severity (P0 broken, P1 hurts, P2 polish) | Where (file:line) | Problem | Fix`. Every finding cites evidence (a measured ratio, a selector, a screenshot).
4. What to keep (do not "fix" what is already good).
5. Ordered fix plan. Batch fixes so each pass addresses several issues.

## 6. Done checklist
- Viewed at 1440 / 768 / 390 (and 360), no horizontal scroll, no clipped text.
- Contrast computed for every text token on every surface it appears on.
- All interactive states and keyboard path verified; dialogs trap/restore focus.
- Motion justified, <300ms, only transform/opacity, reduced-motion honoured.
- No banned slop without an identity reason.
- Typecheck and tests pass if code changed.
