# Design System — SendARaven
**Status:** Design direction agreed; **specific visual designs and production assets not yet approved**.  
**Existing prototype:** `reference-prototype/` is a useful interaction reference, not pixel-perfect authority.  
**Design goal:** A tactile, restrained medieval correspondence experience; physical materials instead of decorative UI chrome.
**Experience specification:** [`experience-design.md`](experience-design.md) defines the shared world-building, terminology, state-integrity, journey, accessibility and performance rules that all screen designs must follow.

## 1. Visual principles
1. **Material first:** Real paper texture, ink, wax and aged wood convey the theme.
2. **Writing is the hero:** Letter content occupies the largest visual area; controls are secondary.
3. **Restrained medieval:** No filigree, fantasy UI flourishes, vines, gold borders or excessive iconography.
4. **Readable:** Paper grain never competes with ink; text contrast, font size and line length are intentional.
5. **One coherent asset family:** Ravens, parchment, seals and map must share realistic lighting, scale and colour.
6. **Responsive composition:** Mobile is a designed experience, not a squeezed desktop illustration.

## 2. Reference hierarchy
1. This document's approved constraints.
2. Approved screen-specific visual references (to be created and recorded).
3. Production asset library with documented licences.
4. The current HTML prototype for functionality and general direction only.
5. Generated collage images for **mood only**, not exact component placement or ornamentation.

### Explicit prototype criticisms to fix
- Flat pale background and uniform beige cards feel like a generic website.
- Letter editor currently resembles a textarea in a box.
- Ravens are simple cartoonish SVGs, not cohesive realistic art.
- Sidebar/navigation and stat boxes are overly dashboard-like.
- Existing parchment texture is too subtle; needs a convincing but readable fibre/grain surface.

## 3. Material palette (PROVISIONAL tokens, adjust by screenshot review)
| Token | Starting value | Intended use |
|---|---|---|
| `--paper-base` | `#E7D5B1` | Warm parchment midtone |
| `--paper-light` | `#F0E3C9` | Letter centre, brighter reading area |
| `--paper-shadow` | `#C3A77B` | Edge wear and folds |
| `--ink-primary` | `#35281E` | Main text |
| `--ink-secondary` | `#6B5643` | Secondary labels |
| `--wax-red` | `#78372D` | Primary seal and select actions |
| `--wood-dark` | `#302117` | Navigation and rookery structure |
| `--wood-mid` | `#64452F` | Nest compartments |
| `--border-soft` | `#AD9470` | Subtle separators |

These are starting values, not a final palette. Avoid using wax red for every button and badge.

## 4. Typography (PROVISIONAL)
- **Display headings:** Readable historical serif, e.g. Cormorant Garamond, used sparingly.
- **Interface copy:** Highly legible sans or serif; do not use ornate calligraphy for controls.
- **Typed letter:** Curated legible handwriting font(s) with reliable Latin support; multilingual fallback is essential.
- **Handwritten letters:** Original vector strokes.
- Prefer self-hosted WOFF2 fonts with appropriate licensing, subset by supported scripts.
- Body text minimum practical mobile size ~16 CSS px; allow browser zoom and font scaling.
- No fake handwriting made illegible through excessive jitter.

## 5. Parchment asset specification
**Production requirement:** Use an actual optimized texture (e.g. WebP/AVIF), not only a flat colour or CSS noise. Texture should include subtle fibres, natural tonal irregularities and faint marks. It must tile or scale without obvious repetition. Separate variants:
- `parchment-writing`: clean central area, lightly worn edges, enough contrast for text.
- `parchment-envelope`: slightly darker and visibly folded.
- `parchment-map`: antique chart paper, compatible with geographical overlays.
- `parchment-interface`: lighter grain for general surfaces.

Do not simply crop the full AI concept collage. Produce independent reusable assets and review at 1x and 2x device pixel ratios. Use subtle CSS shadows and edge masks only where they improve physical believability. Keep dark stains away from actual letter text.

## 6. Writing page — highest-priority visual proof
### Layout
- Parchment is **the actual editable surface**. A transparent textarea/contenteditable overlay may provide keyboard input but must not appear as a conventional boxed form.
- Desktop: one central physical sheet with subtle surrounding desk context; recipient and raven controls adjacent or above/below without competing with paper.
- Mobile: sheet nearly full width with modest margins; no large decorative side panels; fixed toolbars must not hide content behind the keyboard.
- Provide clear recipient input and modes `Type` / `Write by hand` outside or along top edge of parchment.
- Text starts at natural inset margins, not edge-to-edge. Cursor and selection remain visible.
- For long typed letters, pagination should avoid splitting lines unnaturally. Page count/limits are product decisions.
- Handwriting: pressure where available, pointer capture, eraser, undo/redo, zoom/pan, page navigation; preserve strokes on resize.
- Keyboard focus, text selection, IME composition and screen-reader access must work. Offer readable plain-text view for typed letters.

### Wax seal
The seal should be a physical impression with controlled relief and subtle asymmetry, not a red circular icon. Custom uploaded silhouettes are transformed to monochrome and previewed. Long usernames shorten gracefully. Never rely on seal art as the only identity text.

## 7. Raven Rookery
- A plausible medieval rookery built from weathered stone and aged wood, not five floating modern product cards.
- Five individual birds with consistent perspective and scale.
- Bird state clearly readable: available / outbound / returning / resting.
- Raven selection is keyboard/touch accessible and does not depend solely on colour.
- On mobile use two-column or horizontal arrangement only if ravens remain legible; adapt rather than force identical desktop grid.
- Keep stats compact and secondary to the actual birds.

## 8. Inbox and requests
- Delivered items resemble folded parchment/envelopes with a wax seal.
- Requests have explicit Read, Delete and Block actions, with confirmation for destructive actions where appropriate.
- Unopened/opened states should be legible without excessive animation.
- The recipient sees no pre-arrival item or counter.
- No chat bubbles, presence dots or typing indicators.

## 9. Map
- Accurate coastline geometry from a verifiable geographical dataset (e.g. Natural Earth), styled like aged portolan/historical charts.
- No modern political boundaries, road lines, map labels, points of interest or Google-style controls.
- **Only origin and destination city labels** for the selected flight.
- Route and raven are clear, but not neon/modern. Map supports mobile zoom/pan and keyboard alternatives.
- Raven sprite/illustration must match other raven art.
- Do not use an inaccurate fantasy map as actual geographic routing data.

## 10. Navigation and responsive behavior
- Mobile: compact persistent navigation if appropriate; touch targets approximately 44x44 CSS px minimum.
- Desktop: considered navigation layout, not necessarily the prototype's sidebar.
- Avoid long hero copy, giant empty regions, or ornamental headers.
- Support 320px-wide viewports without horizontal scrolling; test typical Android sizes and tablet/desktop.
- Respect safe areas, virtual keyboards, orientation changes and high text zoom.

## 11. Motion
| Interaction | Approach | Desired character |
|---|---|---|
| Raven wing flap | Consistent sprite sequence or rigged SVG | Natural, restrained |
| Raven route movement | Time-derived position interpolation | Deterministic |
| Seal break | Short authored SVG/CSS sequence | Subtle physical crack |
| Letter unfold | CSS transforms with realistic shadows | Brief and skippable |
| Raven arrival | Short sprite sequence | Calm, not cartoonish |
| Stroke replay | Timed vector paths | Optional; user-controlled |

**PROPOSED** timing: 150–300 ms for micro-interactions; 500–1100 ms for seal/unfold; avoid blocking reading. `prefers-reduced-motion` must disable or simplify animations.

## 12. Asset production and governance
For every asset maintain:
- filename, dimensions, format, compression, source, licence, intended usage, approval status
- consistent lighting, edge treatment, perspective and palette
- performance budget and responsive variants
- no remote hotlinking to unstable image search results
- no copying copyrighted franchise insignia

**Initial assets to create/review:** 4 parchment textures; 5 cohesive, realistic ravens (plus naturalistic wing frames); one medieval stone-and-wood Raven Rookery structure; wax seal base/masks; foldable envelope; map background/coastline styling; favicon.

## 13. Screenshot-based acceptance
Review **actual rendered screenshots** on narrow Android (~360px), standard mobile (~390px), tablet (~768px) and desktop (~1280px). Check:
- writing area appears as paper, not a form box
- texture visibly reads as paper without obscuring text
- birds feel consistent and plausibly part of a rookery
- controls fit and are usable with keyboard open
- no clipped text, unwanted horizontal scrolling, or overlap with mobile navigation
- loading, error, empty and long-content states look intentional
- reduced-motion and keyboard navigation work

**Gate:** Do not declare design complete until the user explicitly approves the rendered screens. A generated mockup is not proof of implementability.

## 14. Visual decisions still pending
Exact fonts/licensing, approved texture files, raven illustration style, signet palette and shape, map rendering style, final screen references, animation sequences, and component dimensions. Human public-identifier terminology is also open: `experience-design.md` records why `Raven ID` conflicts with the carrier/human distinction and proposes alternatives without changing the approved product or backend contract. These decisions should be resolved by small visual prototypes and explicit product-owner approval rather than speculative large builds.
