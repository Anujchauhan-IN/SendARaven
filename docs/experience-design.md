# SendARaven — Experience Design Specification

**Status:** Experience direction established; Username terminology is approved, while screen compositions and production assets still require explicit product-owner approval.
**Document role:** Defines how approved product behavior becomes one coherent, immersive and accessible medieval correspondence world.  
**Authority:** `docs/vision.md` and approved `MUST` requirements in `docs/product.md` remain authoritative. This document does not approve unresolved product, architecture or visual decisions.  
**Related documents:** `docs/design.md` defines the material system and asset constraints; `docs/architecture.md` defines trusted application state and security boundaries; `docs/decision-register.md` records unresolved choices.

## 1. Experience premise

SendARaven is a place for deliberate correspondence, not a conventional messaging interface wearing medieval colours. The user should feel that they enter a working stone-and-timber rookery, prepare a physical letter, entrust it to a limited carrier, and wait for a real journey to finish.

Immersion comes from coherent materials, space, language, soundless physical feedback and meaningful time. It must never come from obscuring controls, inventing fictional system activity, delaying necessary actions, or misrepresenting server state.

### Experience principles

1. **The world is functional.** Every physical metaphor represents a real action or state. A sealed letter is dispatch-ready or dispatched; an empty perch reflects actual raven availability; an arriving letter exists only after committed delivery.
2. **Correspondence is the hero.** Writing, sealing, sending, waiting and reading dominate the experience. Navigation, statistics and account controls remain quiet and secondary.
3. **Materials carry the setting.** Parchment, ink, wax, aged wood, stone and iron replace generic cards and dashboard chrome, but never reduce legibility.
4. **Time has meaning.** Travel and cooldowns create anticipation. The interface does not add artificial waiting or accelerate approved server-authoritative timing.
5. **Privacy shapes the scene.** The sender may observe an active journey. The recipient receives no hint, count, marker, animation or notification before committed delivery.
6. **Restraint creates credibility.** The world is lived-in rather than theatrical: no fantasy ornament for its own sake, no franchise imitation and no constant ambient animation.
7. **Plain meaning outranks flavour.** Interface language may feel crafted and warm, but actions, errors, privacy and destructive consequences remain explicit.
8. **Accessibility is part of the fiction's craft.** Keyboard operation, readable text, touch ergonomics, motion alternatives and assistive semantics are first-class ways into the same world, not a separate simplified product.

## 2. Consistent world-building rules

### 2.1 Spatial model

The application behaves like connected places within one correspondence house:

- **Threshold:** landing, authentication and onboarding.
- **Rookery:** raven inventory, status and active journeys.
- **Writing chamber:** recipient addressing, typed and handwritten composition, folding, sealing and dispatch preparation.
- **Chart table:** sender-only map and journey details.
- **Receiving table:** delivered letters and Letter Requests.
- **Correspondence ledger:** contacts, friends, requests and blocked people.
- **Household records:** profile, signet, privacy, notifications and account settings.

These names guide visual composition; they do not require every route or navigation label to use metaphorical wording. Navigation must remain immediately understandable to a first-time user.

### 2.2 Physical truth

- Objects retain scale, lighting direction, wear and material behaviour across screens.
- Parchment bends, folds and casts softer shadows than wood or stone. Wax has thickness, edge irregularity and relief. Iron is used for hinges, latches and restrained structural details, not decorative borders around everything.
- A control may resemble a tab, tag, clasp or tool only when its affordance remains clear through text, focus, hover/pressed state and accessible naming.
- Decorative objects never impersonate active controls.
- Physical transitions confirm a state change; they do not authorize or create it.

### 2.3 Living-world restraint

The world may feel inhabited through subtle evidence: worn writing areas, repaired timber, quiet depth, a resting bird shifting weight after user focus, or a map route appearing as ink. It must not use unrelated moving flames, drifting particles, looping birds, shaking UI or decorative sound to demand attention.

Spend motion on the correspondence act itself: placing a letter, pressing a seal, releasing a raven, unfolding parchment. When nothing changes, the interface should be still.

### 2.4 Interface language

- Use sentence case and direct verbs: `Write a letter`, `Choose a raven`, `Seal letter`, `Dispatch`, `Open letter`, `Delete`, `Block sender`.
- Avoid pseudo-archaic copy such as “thou”, “hath”, “missive failed to take wing”, or vague role-play errors.
- A small amount of grounded vocabulary is appropriate where meaning is obvious: rookery, parchment, signet, seal, dispatch, return journey and Letter Request.
- Security, consent and recovery language must be modern and exact.
- The same action keeps the same name before and after activation. `Dispatch` produces `Letter dispatched`, not an unrelated flourish.

## 3. Major experiences

### 3.1 Rookery and raven lifecycle

The rookery is the product's home and clearest expression of meaningful scarcity. It should read as a plausible open structure of weathered stone, timber beams, perches and nesting recesses, not a set of five product cards.

Each raven occupies a stable place so users learn the flock spatially. Type, speed, status and next eligibility are available without turning the scene into a statistics dashboard. A details surface may unfold beside or beneath the selected perch.

The required user-visible lifecycle conditions map to presentation as follows; exact persisted status values remain subject to approved backend decisions:

| Application state | Immersive presentation | Required clarity |
|---|---|---|
| Available | Raven present, attentive and selectable | Explicit `Available`; type and speed readable |
| Outbound | Perch visibly vacant or marked with the active journey | Sender-only destination and arrival estimate where authorized |
| Returning | Raven remains absent; return route/status is available to sender | Explicit `Returning`; no suggestion it can dispatch |
| Returned but within rolling cooldown | Raven present and resting | Exact next eligibility based on trusted server time |
| Unavailable/error | Perch and status remain visible without inventing a cause | Explain whether data could not load or the raven is ineligible |

The interface must support empty or partial inventory until initial allocation is approved. It must not invent raven acquisition, breeding, replacement or naming mechanics.

Selection uses a clear pressed/selected state, text and focus—not colour or animation alone. On mobile, a single strong raven view with adjacent perch navigation may be preferable to shrinking five birds into illegibility.

### 3.2 Writing chamber and handwritten correspondence

The writing chamber is quiet and task-focused. The parchment is the actual editing surface and receives the largest share of the viewport. The surrounding desk or chamber provides context without competing with the letter.

#### Typed correspondence

- Text appears as ink on parchment, not inside a bordered textarea.
- Caret, selection, IME composition and browser editing behaviour remain familiar.
- The handwriting-style face must remain readable; a readable-font view is always available.
- Line length, margins and pagination resemble a composed letter rather than an infinite chat input.
- User text is rendered as text, never as unsafe HTML.

#### Handwritten correspondence

- Finger, stylus and mouse strokes appear directly under the pointer with low latency.
- Drawing and scrolling are deliberately separated. The current tool and gesture mode are always evident.
- Undo, redo, eraser, page navigation and zoom remain reachable when the Android keyboard or tool controls are present.
- Pressure may enrich strokes when available but is never required for usable output.
- Original vector strokes remain the source; raster previews are not the sole stored letter.
- Any accessible transcription is author-provided. Automatic fabricated transcription is forbidden.

Draft-save state is communicated plainly (`Saving`, `Saved`, `Offline`, `Conflict needs review`) only after the draft policy is approved and implemented. A decorative quill movement must never imply persistence.

### 3.3 Letter folding and wax sealing

Folding and sealing create a moment of commitment between composition and dispatch.

- A review step confirms addressee, chosen raven, letter format and signet before dispatch.
- Folding transforms the existing letter representation; it does not discard or flatten content.
- The signet is shown as a physical impression with readable identity text nearby. Seal artwork is never the only identity cue.
- Pressing the seal may use a short tactile animation and pressed feedback. Reduced-motion mode replaces it with an immediate state change and static sealed result.
- A seal preview is not proof of persistence or dispatch. The interface distinguishes `Ready to dispatch` from `Dispatched`.
- If validation fails, the letter returns to an editable/reviewable state with a precise correction. It is not visually “sent” and then retracted.

Final wax colours, shapes, inscription fallback and motion remain unresolved under the existing signet decision.

### 3.4 Raven selection and dispatch

Raven selection explains consequences before commitment: travel speed, current eligibility and expected outward/return timing where trusted calculations are available.

The dispatch action has three distinct moments:

1. **Prepared:** letter, addressee, signet and raven are selected locally.
2. **Committing:** the application is awaiting the atomic server transaction. Controls prevent accidental duplicate activation, but the scene does not show a successful departure.
3. **Dispatched:** only after server success may the raven depart, the perch change state and the sender receive mission details.

If dispatch fails, the raven remains visually present and the letter remains available. Error wording must not expose private recipient state. Retry behaviour must respect the approved idempotency contract.

The departure animation should be brief, directional and naturally proportioned. It is confirmation, not a loading screen, and must be skippable or replaced by an immediate transition under reduced motion.

### 3.5 Medieval flight map

The chart table is a sender-only view of a real journey. It combines verifiable geography with historical-chart styling.

- Coastlines are geographically accurate and rendered on restrained chart parchment.
- Only the selected mission's origin and destination cities are labelled.
- Political borders, roads, incidental labels, modern map chrome and decorative fantasy geography are absent.
- Route and position derive from immutable mission timestamps and deterministic route points. Refreshing never restarts or moves a raven arbitrarily.
- Outbound and return legs are visually distinct through direction and text, not only colour.
- A textual status gives departure, destination, scheduled arrival/return and current phase without requiring map vision.
- Recipient and unrelated users receive no map, ETA, marker or mission-existence signal.

Late worker processing must not be disguised by fake arrival motion. The display distinguishes a scheduled estimate from committed delivery where necessary, according to the eventual approved timing policy.

### 3.6 Receiving, opening and reading letters

The receiving table is calm until committed delivery. There is no approaching-raven placeholder, disabled envelope, count increment, shadow item or ambient cue before delivery.

After delivery:

- A letter appears as folded parchment bearing the dispatch-time signet version and textual sender identity.
- Letter Requests remain visibly distinct through placement and action labels, not alarming colour alone.
- Opening uses a short seal-break and unfold sequence that can be skipped, interrupted or bypassed by assistive technology.
- Content authorization does not depend on completing an animation.
- Typed content remains selectable and supports a readable-font view. Handwriting scales without distortion and may offer an approved author-supplied text alternative.
- Read, opened, deleted and request placement remain recipient-private.
- Reply begins a new letter and requires an eligible raven; the interface never becomes a chat thread with instant-response expectations.

Delete and block are separate actions. Reading never silently creates a contact or friendship. Any future `Accept sender` action must remain explicit and separately approved.

### 3.7 Correspondents and identity

People are represented through an immutable public Username, an optional display name where provided, city-level identity where appropriate, and signet—not profile-picture chat bubbles. Username and display name must remain visibly distinct.

The correspondence ledger should feel like a practical bound register or set of written entries, while preserving efficient search, sorting, keyboard navigation and touch targets. Decorative handwriting must not make names hard to scan.

Approved relationship meanings remain unchanged:

- **Contact:** a unilateral saved account addressed by Username, optionally with a private nickname; the relationship binds the immutable account UUID.
- **Friend:** a mutually accepted relationship.
- **Blocked person:** identified internally by immutable account UUID; blocking overrides normal delivery.
- **Correspondent:** a proposed umbrella interface term for a person with whom the user writes or may write. It does not replace Contact or Friend semantics.

Identity lookup by Username must avoid account-enumeration leakage. Public presentation may be immersive; errors such as unknown or unavailable addressee remain privacy-safe and plain.

### 3.8 Settings, authentication, notifications and error states

Utility screens belong to the same world but prioritize speed and comprehension over theatrical treatment.

#### Authentication and onboarding

- The threshold into the world may use a gate, entry desk or register composition, but email/password, Google OAuth, verification and recovery controls remain conventional and recognizable.
- Password managers, autofill, paste, visible labels and browser validation must work.
- City selection explains city-level route visibility and optional location permission before requesting it.
- Signet creation feels personal without blocking account recovery or essential setup.

#### Settings

Settings may resemble household records or a ledger, but use stable sections, form controls and explicit save state. Privacy language must describe actual consequences; metaphor never replaces policy.

#### Notifications

Permission is requested in context and only after explaining delivery-only notifications. Notification copy remains generic and contains no private letter content. A notification appears only after committed delivery.

#### Loading, empty, offline and failure

- Loading uses quiet structural placeholders or a restrained progress indication, not fictional ravens carrying unknown data.
- Empty states explain what can happen next without fabricating correspondence.
- Offline state distinguishes locally editable work from actions requiring trusted server confirmation.
- Errors state what failed, what remains safe, and what the user can do next.
- Security-sensitive errors do not reveal whether another account, block, privacy mode or request placement exists.

## 4. Visual language

### 4.1 Medieval architecture and environments

Architecture is grounded in a working correspondence outpost: thick stone, repaired timber, practical ironwork, shelves, map tables and writing surfaces. Spaces should feel connected through consistent construction and light, not like unrelated themed backdrops.

Use architecture to establish hierarchy:

- Stone and timber frame the application shell and rookery.
- Parchment owns writing, reading, records and maps.
- Wax marks identity and commitment.
- Iron appears at structural or control points such as hinges and clasps.

Avoid castle clichés, heraldic clutter, tavern props, fantasy weapons, gold filigree and excessive arches.

### 4.2 Material behaviour

- **Parchment:** visible fibres and tonal variation with a clean reading field; distinct writing, envelope, map and interface variants.
- **Ink:** near-dark brown/black with sufficient contrast; secondary ink remains readable and is not used to hide essential information.
- **Wood:** aged grain and joinery at structural scale; not a repeating brown background behind every control.
- **Stone:** low-frequency texture and depth, kept away from dense text.
- **Metal:** sparse, cool and structurally motivated, with restrained highlights.
- **Wax:** dense colour, thickness and impression relief; not a flat circular badge.

Materials require coherent scale, light direction, edge treatment and wear. Texture must never substitute for information hierarchy.

### 4.3 Typography and readability

- Use at most two primary type families plus the user's original handwriting strokes.
- A historical serif may provide place and title character; body and control text use the most readable approved face for the supported scripts.
- Do not use calligraphy, blackletter or distressed lettering for instructions, buttons, form labels or long passages.
- Body text starts at a practical 16 CSS px minimum on mobile, supports browser zoom and remains usable at 200% text scaling.
- Letter reading targets comfortable line lengths, approximately 45–75 characters where layout permits.
- Multilingual fallback, diacritics and unsupported-script behaviour must be evaluated before font approval.

### 4.4 Lighting, depth, illustration and textures

A screen has one dominant light direction. Shadows explain stacking, folds and recesses rather than decorating every element. Depth is shallow enough that controls remain crisp and mobile rendering remains efficient.

Ravens must be realistic, naturally proportioned and part of one art family. Illustration style, map rendering and material photography/painting must not collide. Generated collages remain mood references only and may not be cropped into production components.

### 4.5 Mobile-first layout and navigation

Mobile is a close, tactile view into the world rather than a compressed desktop room.

- One primary task or physical object dominates each viewport.
- Secondary details open in sheets, drawers or expanded sections without hiding the primary action.
- Persistent navigation, if used, is compact, textually clear and safe-area aware.
- At 320–390 px widths, parchment remains writable, ravens remain identifiable and destructive actions remain separated.
- Desktop may reveal more environmental context and adjacent tools, but must not become a dashboard grid.
- Orientation changes and the Android software keyboard must not discard content or trap controls.

### 4.6 Animation and feedback

Motion follows force and cause: a press depresses wax, a fold changes paper geometry, a raven departs after success, and a letter unfolds when opened.

- User-triggered feedback begins promptly.
- Micro-interactions should generally finish within 150–300 ms; authored physical sequences should remain brief and usually within 500–1100 ms, subject to visual testing.
- No required information is revealed only through motion.
- `prefers-reduced-motion` removes travel across the viewport, wing cycles, seal cracking and unfolding while preserving immediate state confirmation.
- Interrupted animations settle into the correct committed state.
- Looping motion is exceptional and must stop when off-screen, backgrounded or unnecessary.

## 5. Terminology guide and approved identity decision

### 5.1 Fixed semantic rules

- A **raven** is always a carrier bird, never the human recipient, account holder or public identity.
- A **sender** dispatches a letter.
- A **recipient** or **addressee** is the person addressed by that letter.
- A **correspondent** is a human participant in correspondence; it may be used as an umbrella interface term without changing Contact or Friend rules.
- A **rookery** contains the user's ravens; it is not the user's public identity.
- A **signet** is the user's seal identity asset; it does not replace readable identity text.

### 5.2 Username

**APPROVED:** The human public identifier is **Username**. A Username is immutable, case-insensitively unique, 3–24 lowercase Latin letters, digits or underscores, and protected by reserved-name rules. Internal relationships continue to use immutable account UUIDs rather than Username or display name.

An optional display name is presentation text only. It does not replace the Username, need not be present, and must never be used as an authorization or relationship key.

### 5.3 Addressing and relationship language

Approved and retained interface language:

- The composer recipient field uses `Address your letter to…`.
- Recipient lookup accepts Username.
- `Choose a correspondent` may be used when selecting an existing known person.
- `Contacts`, `Friends`, `Friend requests` and `Blocked` retain their approved meanings.
- `Correspondents` may label the combined relationship area, but must not imply that every correspondent is a Contact or Friend.
- A raven always means the carrier bird, never the human recipient or their identity.

## 6. Complete user journeys

### 6.1 Entering the world and becoming addressable

1. Visitor reaches a focused threshold that communicates slow, private correspondence without a long decorative prelude.
2. Visitor chooses email/password or Google OAuth using recognizable controls.
3. Verification and callback states explain progress and recovery plainly.
4. User chooses an immutable Username and city; an optional display name may be offered but is not required. City-level route visibility is explained.
5. User creates or confirms a signet using readable identity text and safe imagery.
6. User enters the rookery and receives a clear explanation of raven availability without assuming unresolved initial allocation rules.

### 6.2 Writing and dispatching correspondence

1. User starts `Write a letter` from the rookery, correspondence ledger or a reply action.
2. User uses `Address your letter to…` to enter the recipient's Username or selects a known correspondent.
3. User types or writes by hand directly on parchment, moving between pages without losing content.
4. User reviews the letter, addressee and signet, then folds and seals it.
5. User chooses an actually eligible raven and reviews travel information.
6. User activates `Dispatch`; the interface waits for atomic server confirmation.
7. On success, the raven departs and the sender can open the chart table. On failure, the letter and raven remain unconsumed and a privacy-safe correction is shown.

### 6.3 Watching and completing a journey

1. Sender sees only their own active mission with immutable origin, destination, scheduled timing and time-derived position.
2. Refresh, reconnect and device changes reconstruct the same journey rather than restarting animation.
3. Recipient sees nothing before committed delivery.
4. After outward arrival commits, the sender sees only an allowed delivered/failed outcome; request placement remains private.
5. The raven begins or completes its return according to the eventually approved return semantics.
6. After return, the rookery still enforces the independent rolling 24-hour eligibility rule.

### 6.4 Discovering and reading correspondence

1. A committed delivery creates an envelope in Inbox or Letter Requests according to trusted recipient rules.
2. A post-delivery notification may announce new correspondence without exposing content.
3. Recipient opens the sealed envelope or bypasses the animation through reduced-motion/assistive access.
4. Recipient reads selectable typed text or scalable handwriting, with approved accessibility alternatives where available.
5. Recipient may reply, delete or block according to placement. Reading alone changes no relationship.
6. Reply begins a new composition and dispatch; it does not become instant chat.

### 6.5 Handling a Letter Request safely

1. Unknown sender's delivered envelope appears only after arrival in Letter Requests.
2. Recipient can identify the sender through approved public identity and signet text without exposing unnecessary profile data.
3. Recipient may read, delete or block through distinct actions.
4. Delete does not block; read does not accept; block overrides later delivery.
5. Sender learns only an allowed delivered/failed status and never learns request placement or recipient actions.

## 7. Application-state integrity

| Experience event | Trusted state requirement | Prohibited illusion |
|---|---|---|
| Draft appears saved | Approved local/server persistence has succeeded | Quill/checkmark implying an unsaved draft is durable |
| Letter appears sealed | Local review state is complete | Treating a seal preview as dispatch success |
| Raven departs | Atomic dispatch committed | Departure during a pending or failed request |
| Flight position changes | Derived from immutable trusted timestamps | Client animation that restarts or invents progress |
| Recipient sees envelope/count | Delivery transition committed | Pre-arrival placeholder, count, subscription or notification |
| Letter appears opened | Recipient has authorized content access | Animation used as authorization gate |
| Raven appears returned | Trusted return transition/timestamp permits it | Cosmetic return that makes an ineligible raven selectable |
| Raven appears available | Return complete and rolling cooldown satisfied | Enabling selection from stale client time |
| Notification appears | Delivery committed and outbox/provider processing allows it | Notification that predicts or precedes arrival |

Offline and stale states must be labelled. The client may display the last trusted state but must not simulate authoritative changes while disconnected.

## 8. Accessibility requirements

### 8.1 Touch and Android

- Interactive targets are approximately 44 by 44 CSS px minimum with adequate separation.
- Primary actions remain reachable one-handed where practical without placing destructive actions beside them.
- Composer controls remain usable with the Android keyboard open; viewport resizing must not cover the caret, page controls or save state.
- Handwriting supports finger and stylus, pointer cancellation and clear separation between drawing and page movement.
- Orientation changes preserve draft content, selected page and tool state.

### 8.2 Keyboard and assistive technology

- Every action is operable by keyboard with visible focus and logical order.
- Physical metaphors expose standard semantic roles, names, states and errors.
- Raven status, map progress, seal state and delivery placement have complete textual equivalents.
- Opening and folding animations can be skipped without losing access.
- Focus is moved only when necessary and returns predictably after dialogs or sheets close.

### 8.3 Text and visual access

- Support browser zoom and at least 200% text scaling without lost content or horizontal page scrolling.
- Do not encode state only by colour, texture, position, wax shape or bird animation.
- Maintain readable contrast over real textures by controlling the text field beneath content rather than adding heavy outlines to every glyph.
- Offer a readable-font mode for typed letters and an approved author-provided alternative for handwriting when available.
- Destructive, privacy and permission language remains plain regardless of visual theme.

### 8.4 Motion and cognitive access

- Respect `prefers-reduced-motion` at initial render and when preference changes.
- Avoid parallax, camera movement, flashing, rapid wing cycles and nonessential looping motion.
- Keep navigation and action labels stable across screens.
- Break long processes into clear stages without forcing users to remember hidden selections.

## 9. Performance requirements

Immersion must survive constrained Android hardware and networks.

- Core content and controls render before nonessential environmental art.
- No interaction waits for decorative textures, raven frames or map ornament to load.
- Use responsive, compressed, independently reusable assets with declared dimensions to avoid layout shifts.
- Lazy-load off-screen rooms, inactive raven animation frames, full map geometry and opening sequences.
- Pause animation and route updates when hidden or backgrounded.
- Handwriting input should visually track the pointer without noticeable lag; expensive smoothing or serialization runs outside the immediate input path.
- Prefer CSS/SVG/Canvas techniques according to measured cost, not novelty. Avoid hydrating static decoration.
- Preserve drafts and recoverable work before memory pressure or navigation can discard it, according to the approved draft policy.

**Initial measurement targets, subject to representative-device validation:**

- Largest Contentful Paint at or below 2.5 seconds on the agreed mobile test profile.
- Interaction to Next Paint at or below 200 ms for ordinary controls.
- No unexpected layout shift from fonts, textures or illustrations.
- User-triggered animation targets smooth presentation but degrades to fewer/static frames rather than blocking input.
- Each phase defines route-level asset, font, hydration and map budgets before production assets are approved.

## 10. Design validation and approval gates

For every major experience, validate actual rendered states at approximately 360 px, 390 px, 768 px and 1280 px, including short, long, empty, loading, offline, failure, high-text-scale and reduced-motion variants.

Review must answer:

- Does the screen feel like part of the same working correspondence world?
- Does the primary action remain obvious without dashboard conventions?
- Does every physical effect correspond to true application state?
- Can touch, keyboard, screen-reader and reduced-motion users complete the same task?
- Are textures and illustration cohesive, licensed, optimized and secondary to content?
- Does the screen preserve arrival secrecy and sender-only tracking?

No screen, term, production asset or animation is approved merely because it appears in this specification. Rendered interfaces and final assets require explicit product-owner approval under the existing roadmap gates.

## 11. Conflicts and unresolved design decisions

### Approved terminology dependency

- `Username` replaces `Raven ID` in product language and future contracts. Existing application placeholder copy still requires a later implementation change; this documentation update does not implement it.
- A raven remains exclusively the carrier. Relationships remain bound to immutable account UUIDs.

### Product decisions that continue to constrain experience design

- Initial raven allocation, individual naming and inventory lifecycle.
- Phantom and non-instant return semantics; same-city minimum travel duration.
- Draft persistence, autosave, expiry and conflict recovery.
- Typed and handwritten content limits and handwriting accessibility workflow.
- Exact privacy modes/labels and relationship changes during flight or after delivery.
- Recall and recipient-ineligibility failure behaviour.
- Sent archive and user-facing failure detail.
- Optional `Accept sender` action.

### Visual and interaction decisions still requiring approval

- Final screen compositions and navigation labels.
- Fonts, multilingual coverage and licensing.
- Production textures, raven art, rookery architecture, envelope construction and wax presentation.
- Map renderer, chart style and route treatment.
- Motion sequences, timings and any optional sound policy.
- Numeric route-level performance budgets after representative Android measurement.
