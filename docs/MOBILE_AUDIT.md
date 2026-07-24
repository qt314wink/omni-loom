# Omni-Loom Mobile Audit — July 23, 2026

## Verdict

The original page had a strong material identity but treated mobile as a late CSS compression pass. The largest defects were structural rather than cosmetic: six desktop navigation labels were moved into a cramped bottom bar, the radial manifesto retained desktop absolute positioning, the pipeline rail and cards competed for horizontal space, and desktop animation/audio work continued on coarse-pointer devices.

## High-impact findings and fixes

1. **Navigation — critical**
   - Original: six text links plus the logo occupied a fixed mobile bar.
   - Risk: tiny labels, collision, poor safe-area behavior, and no clear current context.
   - Fix: compact fixed header with a 44px+ menu control and an accessible drawer. Escape and link selection close the menu.

2. **Hero — high**
   - Original: `background-attachment: fixed`, `40vh` padding, and wide typographic assumptions produced unstable mobile height and excessive dead space.
   - Fix: `100svh/100dvh`, scroll-safe background, responsive title bounds, stacked proof points, and full-width CTAs.

3. **Problem statistics — high**
   - Original: three large stat blocks were forced into one inline grid with desktop sizing.
   - Fix: constrained type, minmax columns, and a one-column fallback below 390px.

4. **Morphism framework — medium**
   - Original: a horizontal carousel existed, but 200px cards and hover-first behavior weakened readability.
   - Fix: larger snap cards, visible spatial rhythm, keyboard focus, and touch-specific motion reduction.

5. **Pipeline — critical**
   - Original: cards became vertically stacked while the rail remained offset, creating loose relationships and potential clipping.
   - Fix: a two-column mobile rail (`44px + content`) with sticky stage markers and fluid card widths.

6. **Manifesto — critical**
   - Original: eight 150px absolute-positioned spokes surrounded a 200px center inside a square container; this necessarily overlaps on narrow screens.
   - Fix: semantic responsive grid. The IR becomes a full-width core card; modality adapters become readable cards.

7. **Roadmap — high**
   - Original: four flex children compressed into narrow columns.
   - Fix: 2-column tablet and 1-column phone layout with clear definitions of done.

8. **Performance and motion — high**
   - Original: hidden cursor trails were still created and animated; particles, connections, vibration, and hover sounds remained active on touch.
   - Fix: device-aware particle counts, no connections on coarse pointers, no hidden cursor work, and reduced-motion compliance.

9. **Credibility — high**
   - Original: JSON-LD claimed an aggregate rating of 4.8 from 127 ratings without visible evidence.
   - Fix: removed unsupported rating claims and reframed social proof as product properties and supported modalities.

## Acceptance criteria

- No horizontal document overflow at 320, 360, 390, 430, 768, or 1024 CSS pixels.
- All interactive controls are at least 44×44 CSS pixels.
- Navigation opens, closes, responds to Escape, and closes after selection.
- The pipeline preserves clear stage-to-card association at every breakpoint.
- The manifesto never uses absolute positioning below tablet size.
- Reduced-motion mode removes reveal dependence and hides audio controls.
- Coarse-pointer devices run at most 20 particles and no pairwise connection pass.
