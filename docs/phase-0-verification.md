# Phase 0 Baseline Verification

**Status:** Automated application-shell baseline completed in local Chromium. This is not production feature, final visual, real-device or assistive-technology approval.

## Environment

- Workspace: `/public/SendARaven`
- Git: repository root on `main`, tracking `origin/main`
- Runtime: Acode terminal environment
- Browser tooling: local Chromium through Playwright
- Tested routes: `/`, `/write`, `/flights`, `/inbox`, `/contacts`, `/settings`

## Automated verification

| Check | Coverage | Result |
|---|---|---|
| Astro/type diagnostics | `npm run check` | Passed: 0 errors, warnings or hints |
| Production static build | `npm run build` | Passed: 6 routes generated |
| Unit tests | `npm test` | Passed: 4 tests |
| Full browser suite | `npm run test:e2e` | Passed: 26; skipped: 13 intentional project-inapplicable cases |
| Responsive shell matrix | 320×720, 360×780, 390×844, 768×1024, 1280×900 | Passed across all 6 routes |
| Horizontal overflow | Document width on every route at each baseline viewport | No horizontal document overflow detected |
| Keyboard navigation | Global skip link and first 7 tab stops on composer | Passed with visible focus indicators |
| Focus visibility | Links, buttons, `summary`, inputs, selects and editable text | Baseline CSS and automated checks passed |
| Accessible names | Links, buttons, menu summary, inputs, select and editable text on all routes | No unnamed tested controls detected |
| Image baseline | Existing `<img>` elements require `alt`, `width` and `height` | Passed |
| High text zoom | Simulated 200% root text size at 320px | No horizontal document overflow detected |
| Reduced motion | Chromium `prefers-reduced-motion: reduce` emulation | Media preference recognized; no current essential motion depends on animation |
| Rendered screenshots | Rookery and composer at all 5 baseline widths | Generated; representative 320px, 390px, 768px and 1280px renders inspected |

The initial 768px screenshot exposed overlapping desktop navigation. The application-shell breakpoint was moved so tablet width uses the mobile navigation pattern; the rerun passed and the corrected screenshot was inspected.

## Basic accessibility changes made

- Added one global “Skip to main content” link and focusable target.
- Added visible focus treatment for the menu `summary` element.
- Added a visually hidden `h1` to the writing route.
- Added spellcheck suppression for the then-labelled `Raven ID` field (now approved as Username; source copy remains to be updated in Phase 4) and a `name` for the raven selector.
- Marked the composer wordmark as non-translatable.
- Kept existing explicit image dimensions, decorative alternative text, control labels, touch targets, safe-area CSS and reduced-motion handling.

## Checks not available in the current environment

The following were **not** manually verified and must not be inferred from Chromium automation:

- Real Android software-keyboard opening, viewport resizing, orientation changes and safe-area/notch hardware.
- TalkBack, VoiceOver, NVDA, JAWS or another real screen reader.
- Hardware keyboard behavior on an Android device.
- Stylus behavior, pressure accuracy, pinch/zoom and drawing-versus-scroll gestures on a physical touch device.
- Browser text-only zoom behavior outside the simulated 200% root font-size check.
- Safari, Firefox and non-Chromium Android browsers.
- Colour contrast using a calibrated manual audit or dedicated automated contrast engine.
- CI execution on GitHub-hosted runners; the workflow is locally reasoned from scripts and Playwright configuration but will be proven only by an actual workflow run.

These limitations remain required checks for the affected later UI phases and launch readiness. They do not establish product feature completion or visual approval.

## Web interface guideline review

Reviewed the application shell, navigation, rookery and composer against the current Web Interface Guidelines. Baseline issues fixed in this task are listed above. Remaining later-phase concerns include final screen-reader validation, destructive-action behavior when those features exist, unsaved-draft navigation warnings for the approved local-plus-server draft model, final colour/contrast review, and production asset licensing/approval.
