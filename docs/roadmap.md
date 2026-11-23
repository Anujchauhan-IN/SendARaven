# Development Roadmap

**Status:** Authoritative implementation plan. Product requirements remain governed by `docs/product.md`; this roadmap does not approve `PROPOSED` or `OPEN` choices.  
**Principle:** Build a complete, tested correspondence platform, not a visual demo or rushed public MVP. A page, fixture, disabled control, static build, or passing frontend test is not proof that its feature is complete.

## 1. Status definitions

- **Complete:** Implemented behavior is covered by appropriate tests and satisfies the currently applicable acceptance gate. Visual work is complete only after explicit user approval of rendered screens.
- **Partial:** Some real behavior exists, but required behavior, persistence, security, tests, assets, or approval is missing.
- **Not Started:** No substantive implementation exists. Placeholder routes, fixture copy, decorative assets, and disabled controls do not count.
- **Blocked:** Work must not be finalized until a named product, security, provider, asset, or architecture decision is approved.

Statuses describe the current repository, not the importance of a feature. Each phase must be reassessed when its gate is reviewed.

## 2. Verified project status

| Area | Status | Current evidence and limits |
|---|---|---|
| Repository foundation and application shell | **Partial** | Astro, React, strict TypeScript, Tailwind, shared layout, responsive navigation, build/check scripts, Vitest and Playwright exist. Navigation has mobile/desktop E2E coverage. The workspace is the initialized Git repository at `/public/SendARaven`, on `main` with `origin/main` configured. There is no production SSR adapter, backend environment, CI/CD, staging setup, monitoring, or deployment runbook. |
| Raven Rookery | **Partial** | `src/components/rookery/Rookery.tsx` presents five selectable ravens with responsive artwork and E2E coverage. Statuses, missions, and timers are fixtures; there is no authenticated inventory or server authority. Artwork and the rookery structure are not visually approved production assets. |
| Letter composer and handwriting | **Partial** | `LetterComposer.tsx` and `src/lib/letters/editor.ts` provide local typed text, normalized vector strokes, pen, eraser, undo/redo, multipage state, serialization, and focused unit/E2E tests. No draft persistence, autosave decision, production limits, accessible handwriting transcription path, server validation, or Android real-device/IME approval exists. |
| Authentication, Raven IDs, profiles and city | **Not Started** | No authentication provider integration, SSR sessions, onboarding, Raven ID storage, profile persistence, city dataset, or geolocation flow exists. Settings is a placeholder. |
| Signet storage and upload processing | **Not Started** | No signet editor, immutable versions, safe image processing, storage authorization, or upload tests exist. Decorative seal-like UI does not count. |
| Contacts, friendships, blocks and privacy | **Not Started** | The contacts route is placeholder content. No data model, authorization, privacy routing, request transitions, rate limits, or tests exist. |
| Raven inventory, dispatch, travel and cooldowns | **Not Started** | Composer dispatch is disabled and rookery timers are fixtures. There is no database inventory, atomic dispatch RPC, idempotency, mission state, distance calculation, return handling, or rolling 24-hour enforcement. |
| Inbox, requests, reading and replies | **Not Started** | Inbox is a placeholder. No delivered-letter persistence, request classification, sealed envelope, read/delete/block/reply flow, or sender/recipient status separation exists. |
| Flight map and sender tracking | **Not Started** | Flights is a placeholder. No geographic dataset, route interpolation, sender authorization, historical map renderer, or tracking tests exist. |
| Notifications | **Not Started** | No delivery outbox, in-app delivery update, service worker, push subscription, permission flow, retry handling, or email provider exists. |
| Moderation, administration and account lifecycle | **Blocked** | No reports, report-scoped private-content access, admin authorization, sanctions, audit log, abuse controls, lifecycle implementation, or operational tooling exists. Several policy choices remain explicitly open. |
| Accessibility, mobile and visual quality | **Partial** | Existing screens include useful semantic labels, focus styles, touch-sized controls, reduced-motion CSS, and tests at approximately 360px, 390px and desktop. There is no complete keyboard/screen-reader audit, 320px/tablet/high-zoom/rotation/Android-keyboard verification, automated accessibility suite, approved visual baseline, or production asset set. |
| Testing and production readiness | **Partial** | Local editor unit tests and frontend E2E tests exist. Database, migration, RLS, storage policy, concurrency, worker, integration, security, accessibility, performance, cross-browser, backup/restore and deployment tests do not yet exist. |

The `reference-prototype/` remains a functional reference only. `dist/` output proves that static pages can be built; it does not prove production functionality or security.

## 3. Cross-phase rules

Every phase must:

1. Map affected `MUST` requirements to implementation tasks and tests. Record any deferred `SHOULD` with a reason.
2. List relevant `PROPOSED`/`OPEN` choices before implementation. Do not encode unresolved choices into durable enums, migrations, APIs, delivery semantics, or final visual assets.
3. Use server authority for identity, letter access, privacy, dispatch, arrival, raven eligibility, moderation, and status visibility.
4. Add focused tests with the feature. Security, accessibility, mobile behavior, failure handling, and performance are not Phase 13-only concerns.
5. Test actual rendered UI at approximately 360px, 390px, 768px, and 1280px when a screen changes; additionally prevent horizontal scrolling at 320px. Verify safe areas, high text zoom, keyboard access, reduced motion, and Android virtual-keyboard behavior where relevant.
6. Keep provisional artwork, fixtures, mock data, and disabled controls explicitly labeled. A visual prototype must not imply backend completion.
7. Use forward-only reviewed migrations, deny-by-default authorization, least-privilege secrets, and reproducible environment configuration once backend work begins.
8. Treat phases as dependency and completion gates, not as an absolute ban on parallel work. Visual refinement may continue alongside backend work; database and authentication work may overlap after their contracts and authorization boundaries are established; tests and security controls must be developed with their associated features.
9. Do not finalize dependent functionality or claim a phase complete until its required product decisions, security controls, tests, and applicable visual approval are satisfied. Provisional assets may support development but remain explicitly unapproved.

## 4. Sequential implementation phases

### Phase 0 — Baseline, application shell and requirements traceability

**Current status: Complete**

**Purpose:** Establish a reliable foundation and remove stale assumptions before adding security-sensitive behavior.

**Dependencies:** None.

**Tasks:**
- Maintain the Astro/React/TypeScript/Tailwind application shell, shared layout, route conventions, navigation, error boundaries, and loading/empty/offline presentation patterns.
- Create and maintain [`docs/requirements-matrix.md`](requirements-matrix.md), linking every product `MUST` to a phase, acceptance criteria and tests; link each `SHOULD` to implementation or a documented deferral.
- Maintain [`docs/decision-register.md`](decision-register.md), with unresolved choices, options, implications, priorities and the phases each decision blocks.
- Record which routes are functional, fixture-driven, placeholder-only, or visually provisional.
- Maintain [`docs/environment-boundaries.md`](environment-boundaries.md) for local, test, staging and production isolation and secret handling.
- Maintain the lightweight GitHub Actions workflow in `.github/workflows/ci.yml` for dependency installation, Astro check, unit tests, production build and Playwright browser tests.
- Maintain [`docs/asset-inventory.md`](asset-inventory.md) with source, licence, dimensions, format, size, intended use and approval status.
- Verify whether the workspace is inside a Git repository and record the result. Verification confirms `/public/SendARaven` is the repository root, on branch `main`, with `origin/main` configured. Do not stage, commit, configure remotes or push without authorization.

**Verified Phase 0 progress:**
- Requirements traceability baseline created in `docs/requirements-matrix.md`, covering every approved product `MUST`, all `SHOULD` recommendations, acceptance criteria, test categories, implementation status and coverage gaps.
- Decision register created in `docs/decision-register.md`, prioritizing schema-affecting Phase 3 decisions and separating approved rules from unresolved options.
- Functional local editor/rookery behavior is distinguished from fixtures, placeholders, provisional visuals and unimplemented backend authority.
- Environment and secret boundaries are documented without creating credentials or provisioning services.
- A minimal no-secret CI workflow uses the existing reliable scripts and installs Playwright Chromium on the runner.
- Existing visual assets are inventoried; unknown provenance/licensing and provisional approval are explicit.
- Astro check, production build, unit tests and the full Playwright suite pass locally. Application-shell coverage includes 320px, 360px, 390px, 768px and 1280px, keyboard focus, skip navigation, horizontal overflow, simulated 200% text size, reduced-motion emulation, accessible names and image metadata.
- Rendered baseline screenshots were generated and representative mobile, tablet and desktop results inspected; the discovered 768px navigation collision was corrected and reverified.
- Git repository root, branch and remote tracking status are verified.

**Documented limitations carried to affected later gates:**
- Real Android software keyboard, orientation, hardware safe areas, TalkBack/other screen readers, stylus gestures, non-Chromium browsers and dedicated contrast tooling were not available. See [`docs/phase-0-verification.md`](phase-0-verification.md).
- The GitHub Actions workflow is locally validated through its component commands; its first hosted-run result remains to be observed after an authorized push.
- Asset provenance, licensing and final visual approval remain Phase 1/launch requirements, not Phase 0 omissions.

**Required tests and review:**
- Astro/type check and production build.
- Navigation and route smoke tests at mobile and desktop widths.
- Keyboard navigation, skip-link, focus visibility, 320px overflow, high text zoom, safe-area and reduced-motion review.
- Documentation review confirming that no proposal has been promoted to a requirement.

**Completion gate:**
- Current implementation status is evidence-based and reproducible.
- Every approved requirement has a planned phase and test category.
- Placeholder and fixture behavior is clearly distinguished from working functionality.
- The application shell passes baseline mobile, keyboard and build checks.
- Git repository root, branch and remote tracking status are documented.

---

### Phase 1 — Material system and core visual prototypes

**Current status: Partial**

**Purpose:** Develop and validate the distinctive medieval material direction without unnecessarily blocking unrelated engineering. Visual work is a parallel workstream: provisional assets may support implementation, but affected production interfaces are not final until reviewed and approved.

**Dependencies:** Phase 0 baseline conventions. Unfinished artwork, textures, animations, or whole-screen approval do not block unrelated database, authentication, security, or domain engineering. A later phase depends on Phase 1 only where it genuinely requires an approved asset, interaction contract, or visual behavior.

**Tasks:**
- Produce independent, optimized, licensed parchment, wood, stone, raven, wax, envelope and map-style assets; do not crop generated collages into components.
- Define provisional design tokens and typography with multilingual fallbacks and self-hosting/licensing plans.
- Prototype the writing surface, rookery structure, sealed envelope, signet impression, map surface, loading/error/empty states, and navigation as one coherent material family.
- Keep screen-specific dimensions, fonts, palette, animation timings and illustration choices provisional until reviewed.
- Ensure textures remain legible at 1x/2x pixel density and under high text zoom.
- Define per-screen asset and hydration budgets suitable for low-end Android devices.

**Required tests and review:**
- Rendered screenshot review at approximately 360px, 390px, 768px and 1280px.
- Keyboard, touch-target, contrast, readable typography, high zoom, reduced-motion and no-horizontal-scroll review.
- Asset metadata, licence, responsive variant and byte-size audit.
- Low-end Android loading and interaction spot checks.

**Completion gate:**
- User explicitly approves the affected production interfaces and final visual assets before those interfaces are declared complete and before launch.
- Production assets are independently reusable, licensed, optimized and recorded.
- Screens do not resemble generic dashboard cards or flat beige forms.
- Outstanding visual work is tracked without blocking unrelated engineering that does not depend on it.

**Do not:** Treat the current parchment SVG, raven images, fixtures, prototype, or screenshots as approved final design. Do not delay unrelated backend or security work solely because provisional visual assets remain.

---

### Phase 2 — Rookery, local composer, handwriting and draft design

**Current status: Partial**

**Purpose:** Complete the local interaction proof for the two most distinctive product surfaces without pretending local state is authoritative.

**Dependencies:** Phase 0 interaction and accessibility conventions. Phase 1 may proceed in parallel. Approved visual assets are required only before the affected composer or rookery production interface is finalized, not before local behavior, data-contract, validation, accessibility, or test work begins.

**Decision gates before finalization:**
- Exact typed-character, page, stroke, point and serialized-payload limits.
- Draft persistence policy: local, server-side, or both; autosave timing; expiry and conflict behavior.
- Accessible alternative/transcription workflow for handwritten letters.
- Final initial raven allocation remains `PROPOSED`; do not assume every user starts with one of each until approved.

**Tasks — Rookery interaction:**
- Present up to five ravens with available, outbound, returning and resting states that do not rely only on colour.
- Support keyboard, touch and screen-reader selection and a clear details view.
- Separate fixture status demonstrations from future authenticated server state.
- Define loading, empty, partial-inventory and unavailable states without inventing acquisition mechanics.

**Tasks — Composer interaction:**
- Preserve editable Unicode text, text selection, caret position, IME composition, readable-font accessibility view, and page navigation.
- Preserve normalized ordered vector strokes across resizing; support finger, stylus and mouse, pressure where available, eraser, undo/redo and multipage composition.
- Distinguish drawing from scrolling/zooming and keep controls usable while the Android keyboard is open.
- Validate bounded local data once limits are approved; reject invalid numeric values and unsafe serialized documents.
- Design draft recovery, stale/conflicting edits, offline behavior and explicit draft deletion only after the draft policy is approved.
- Keep attachments absent. A signet emblem is profile data, not letter content.

**Required tests and review:**
- Unit tests for reducer history, text/stroke coexistence, normalization, serialization, invalid payloads, limit boundaries and resize fidelity.
- E2E tests for sequential typing, IME/text selection, multipage content, undo/redo, pen/eraser, touch/pointer cancellation and viewport resizing.
- Real or representative Android tests for keyboard-open layout, orientation change, stylus/finger behavior and accidental scrolling.
- Accessibility tests for labels, reading order, keyboard operation, readable typed view and any approved transcription path.
- Screenshot review of short, long, empty, error and multipage states.

**Completion gate:**
- Local rookery and composer interactions satisfy mobile, accessibility and usability criteria; affected production visuals receive explicit approval before this phase is declared complete.
- Data structures are documented and safe to persist, but no client state is described as dispatch authority.
- Draft behavior and payload limits are approved before persistence implementation begins.
- Provisional artwork remains labeled and may continue improving alongside later engineering.

---

### Phase 3 — Database, migrations, RLS and server security foundation

**Current status: Not Started**

**Purpose:** Establish data ownership and authorization before authentication-dependent product features are built.

**Dependencies:** Phase 0 traceability and Git prerequisite; the schema-affecting decision gate below. Phase 3 may overlap with Phase 4 authentication contract work, but no production user data or authorization-dependent feature may be finalized before the relevant migrations, constraints and RLS policies pass review.

**Pre-migration product decision gate:**

Resolve these choices before creating the initial migrations for the affected tables, constraints, state machines or transactional functions:
- Initial raven allocation, inventory creation and any rule about naming, acquisition or replacement that changes inventory cardinality or lifecycle.
- Phantom Raven return semantics; outbound and return travel behavior for all raven types; and the same-city minimum delivery time.
- Draft persistence location, autosave timing, expiry/recovery and conflict behavior.
- Typed text, page, stroke, point and serialized-payload limits used by columns, constraints, validation and storage design.
- Raven ID normalization/change rules if profile identifiers or uniqueness constraints depend on them.
- Privacy-mode values if they are represented by a durable database enum.
- Recall, deleted/sanctioned-recipient failure handling, or other unresolved choices that alter letter/mission states, timestamps, ownership, idempotency or rollback behavior.

Decisions may be deferred to later forward-only migrations when their tables and constraints are deliberately omitted from the initial schema and no existing state machine or API contract depends on them. Examples include notification provider fields, final map renderer details, final visual assets, moderation categories/retention fields, and operational settings introduced only with their later phase. Deferral must be recorded; placeholder columns or guessed enums must not be added merely to anticipate future work.

**Tasks:**
- Finalize the logical schema for profiles, cities, raven catalogue/inventory, signet versions, contacts, friendships, blocks, privacy, drafts, letters, handwriting pages, missions, delivery outbox, push subscriptions, reports, moderation actions and idempotency records as they become necessary.
- Document state machines and ownership of sender-visible versus recipient-private status. Do not expose request placement, opened, read or deleted state to senders.
- Add forward-only migrations with constraints, indexes, canonical relationship keys, foreign-key behavior and deletion rules.
- Enforce at database level where practical: case-insensitive Raven ID uniqueness, maximum five ravens, one active mission per raven, valid state transitions, unique relationship pairs and immutable snapshots.
- Implement deny-by-default RLS and storage policies by actor: visitor, owner/sender, recipient after delivery, unrelated user and restricted admin.
- Design narrowly scoped security-definer functions with fixed `search_path`, explicit grants, validated caller identity and reviewed ownership.
- Separate browser-safe configuration from service role, OAuth, push, worker and admin secrets.
- Define migration recovery, seed/test data, database backup expectations and local/staging isolation.
- Produce a threat and data-flow model covering enumeration, pre-arrival leakage, status leakage, unsafe uploads, XSS, CSRF, privilege escalation and concurrency.

**Required tests and review:**
- Migration-from-empty and migration-forward tests.
- RLS matrix tests for every introduced table and storage bucket.
- Direct API tests for unauthorized rows, joins, counts, errors, realtime/subscription channels and storage objects.
- Constraint tests for duplicate Raven IDs, relationship pairs, raven maximum and invalid state transitions.
- Security review of every security-definer function, grant and secret boundary.

**Completion gate:**
- The schema and authorization model are reviewed before production user data is introduced.
- Unauthorized actors cannot infer private records or pre-arrival letters through any supported access path.
- Migrations are reproducible in isolated environments and have a documented recovery approach.

---

### Phase 4 — Authentication, Raven IDs, profiles, cities and signets

**Current status: Not Started**

**Dependencies:** Phase 3 contracts for identity, profile ownership, sessions and RLS. Phase 4 implementation may overlap with Phase 3 once those contracts are established, but protected production flows and persisted user data cannot be finalized until the relevant Phase 3 migrations and authorization tests pass.

**Decision gates before durable implementation:**
- Raven ID syntax, length, reserved-name and impersonation rules.
- City dataset, licence, geographic coverage, update/version strategy and geolocation-to-city lookup.
- Signet fallback, long-inscription behavior, palette and final visual options.
- City-change behavior for active missions must not mutate mission snapshots; any additional restrictions remain unresolved.

**Tasks:**
- Implement email/password and Google OAuth with email verification, secure callback handling, state/CSRF protections and request-scoped SSR sessions.
- Implement onboarding for unique case-insensitive Raven ID, display name, manual city selection, optional permission-based approximate location, signet and preferences.
- Explain city-level route visibility. Discard raw coordinates after transient city lookup; store only approved city identity and centroid data.
- Define public and private profile fields and enumeration-resistant lookup behavior.
- Implement signet versions and safe upload processing: strictly under 50 KB, valid PNG/WebP bytes only, bounded dimensions/decoded size, decompression safeguards, decode/re-encode normalization, monochrome relief preview, no SVG/HTML/polyglots.
- Prevent cross-account storage writes/reads and preserve immutable historical signet versions.
- Add signup, login, lookup and upload throttles appropriate to the abuse surface.
- Provide account/session error, offline and recovery states without leaking account existence.

**Required tests and review:**
- Auth integration tests for verification, login/logout, expired sessions, OAuth state/callback failures and protected routes.
- Case-insensitive Raven ID race/uniqueness and enumeration tests.
- City search, ambiguous names, denied geolocation, coordinate disposal and profile isolation tests.
- Unsafe image corpus, exact 50 KB boundary, malformed file, dimension/decode limit and cross-account storage policy tests.
- Responsive, keyboard, screen-reader, high-zoom and Android form/keyboard review.

**Completion gate:**
- Two isolated users can securely authenticate and maintain separate profiles.
- Raven IDs and city data follow approved rules.
- Signet uploads are normalized safely and historical versions cannot be altered retroactively.
- No private secret or precise location is exposed to the browser.

---

### Phase 5 — Contacts, friendships, blocking and privacy

**Current status: Not Started**

**Dependencies:** Phase 4 authenticated profiles and Phase 3 authorization foundation.

**Decision gates:**
- Final privacy UI labels/enums. `Everyone`, `Contacts Only`, and `Friends Only` remain proposed UI; do not add a fourth mode or `Nobody`.
- Contact-removal behavior for already delivered letters.
- Optional “Accept sender” behavior remains proposed and must be explicit if approved.

**Tasks:**
- Implement unilateral contacts with optional private nickname.
- Implement friend requests with send, accept, decline and cancel transitions and canonical mutual friendship records.
- Implement blocks by immutable account UUID; blocking prevents new letters and friendship interactions.
- Implement approved privacy preferences without allowing a frontend setting to override server authorization.
- Make contacts, friendships, blocks and privacy records non-enumerable to unrelated users.
- Add duplicate-transition protection, request throttling, spam controls and privacy-preserving errors.
- Provide clear confirmation and recovery for destructive actions.

**Required tests and review:**
- RLS/authorization matrix for owners, counterparties and strangers.
- State-transition tests for duplicate, crossed, cancelled, declined and blocked requests.
- Rate-limit and account-enumeration tests.
- Tests proving contacts do not automatically create friendship and reading/deleting never automatically creates a contact or block.
- Mobile, keyboard, screen-reader and long-list performance tests.

**Completion gate:**
- Relationship state is transactionally consistent and server-enforced.
- Blocking overrides normal interactions.
- Privacy data and relationship lists cannot be enumerated by unrelated accounts.

---

### Phase 6 — Persistent letters, raven inventory, atomic dispatch, travel and cooldowns

**Current status: Not Started**

**Dependencies:** Phases 2–5 gates; approved payload limits and delivery-semantic decisions below.

**Decision gates:**
- Phantom Raven return behavior; its instant delivery and rolling 24-hour cooldown are approved, but exact return semantics remain proposed.
- Non-instant return assumptions remain proposed.
- Minimum nonzero same-city/non-instant duration.
- Recall policy remains proposed.
- Failure behavior for deleted recipients or moderation sanctions.

**Tasks — persistence and inventory:**
- Persist typed text and bounded vector handwriting with server-side validation matching approved limits.
- Persist approved drafts with conflict/recovery behavior from Phase 2.
- Create authenticated raven inventory without assuming unapproved acquisition or starting-allocation mechanics.
- Show server-derived raven status, active mission and next eligibility in the rookery.

**Tasks — dispatch transaction:**
- Authenticate the sender and validate account standing, recipient, blocks, content, locations, approved privacy-related eligibility and selected raven.
- Lock the raven row and reject if it has an active mission, has not returned, or is inside its rolling 24-hour dispatch window.
- Compute trusted distance and timestamps on the server from versioned city centroids and immutable raven speed/type.
- Atomically create the letter and mission, reserve the raven, record the idempotency key, and snapshot sender/recipient cities and signet version.
- Ensure failed dispatch consumes neither a raven nor a new letter/mission.
- Return only sender-appropriate mission data and privacy-preserving errors.

**Tasks — travel rules:**
- Implement approved Haversine/great-circle distance and deterministic route-point calculations, including antimeridian behavior.
- Store immutable `departed_at`, `arrival_at` and `return_at`; city/profile changes must not rewrite a mission.
- Enforce five-raven maximum, one active mission per raven, return-before-reuse and one dispatch per rolling 24 hours using database constraints/locks, not disabled buttons.

**Required tests and review:**
- Unit tests for distance, travel time, route interpolation, antimeridian, same-city rule, clock boundaries and long missions exceeding 24 hours.
- Payload validation tests for Unicode, XSS-safe rendering, vector bounds and size limits.
- Concurrency test: two dispatches for one raven yield exactly one success.
- Idempotency tests for retry and conflicting payload under the same key.
- Transaction rollback tests proving no raven/letter is consumed on failure.
- Authorization, block, banned-account, invalid recipient/location and direct API tests.
- Integration test from authenticated draft through dispatched outbound mission.

**Completion gate:**
- Two real accounts can dispatch a valid letter exactly once using an eligible raven.
- Raven availability cannot be bypassed by stale clients, concurrent requests or direct database/API access.
- Every mission has immutable, trusted snapshots and timestamps.

---

### Phase 7 — Scheduled arrival, return, inbox, requests and correspondence

**Current status: Not Started**

**Dependencies:** Phase 6 dispatch and Phase 5 relationships/privacy.

**Decision gates:**
- Arrival classification when contact/friend state changes midflight, beyond the approved rule that blocks are rechecked.
- Failure wording/status for deleted, banned or otherwise ineligible recipients.
- Worker timing tolerance and late-processing presentation.

**Tasks — delivery processing:**
- Build idempotent scheduled processing for outbound arrivals and returns in bounded batches.
- Claim due missions transactionally using row locks/skip-locked or an equivalent reviewed mechanism.
- At arrival, recheck blocks and account eligibility, then classify into inbox/request using approved arrival-time rules.
- Suppress blocked/undeliverable letters without revealing the private reason; transition the raven safely toward return.
- Store scheduled timestamps separately from actual processing time.
- Support retry after worker failure, bounded attempts, dead/stuck mission detection and reconciliation.

**Tasks — recipient experience:**
- Reveal letters only after a trusted delivery transition commits.
- Implement inbox and Letter Requests without any pre-arrival count, item, event, notification or subscription signal.
- Render typed text as text and replay original vector handwriting at different sizes.
- Requests support read, delete and block. Inbox supports read, delete and reply; reply creates a new dispatch and consumes an eligible raven.
- Keep recipient-private request/open/read/delete state separate from sender-visible delivered/failed state.
- Provide loading, empty, offline, long-content, deleted and error states.

**Required tests and review:**
- Two-worker contention and duplicate-delivery tests.
- Integration tests: dispatch → arrival → inbox/request → return → cooldown.
- Block-during-flight, privacy/relationship-change-during-flight, deleted/sanctioned-recipient and worker-outage recovery tests after decisions are approved.
- Anti-leak tests through row access, joins, counts, errors, realtime, subscriptions, handwriting storage and cached responses.
- Tests proving sender cannot infer request placement, read/open/delete state, contact state or privacy setting.
- Recipient read/delete/block/reply E2E tests on mobile and desktop.
- Accessibility review for reading order, readable-font view, handwriting alternative, destructive confirmations and long letters.

**Completion gate:**
- Recipients cannot know a letter exists before committed delivery.
- Delivered letters route correctly, remain private, and can be handled safely.
- Sender-visible status reveals delivery/failure only, never recipient-private behavior.
- Worker retries and outages do not duplicate delivery or strand ravens without detection.

---

### Phase 8 — Wax seals, envelopes and opening interactions

**Current status: Not Started**

**Dependencies:** Phase 4 immutable signets and Phase 7 delivered-letter reading.

**Tasks:**
- Render each delivered item as folded parchment/envelope with the dispatch-time signet snapshot and textual sender identity.
- Implement seal preview, physical wax relief, long-inscription fallback according to approved signet rules, and consistent material styling.
- Add brief, skippable wax-breaking and unfolding interactions; never use animation as authorization or hide content behind it.
- Preserve opened/unopened presentation without exposing that state to the sender.
- Support reduced motion, interruption, refresh, keyboard activation and direct accessible access to letter contents.
- Keep request actions visible and safe around the opening interaction.

**Required tests and review:**
- Snapshot-version test proving a changed profile signet does not alter old letters.
- Keyboard, screen-reader, reduced-motion, interrupted-animation and refresh tests.
- Mobile performance and visual review at all target widths.
- Tests proving open/read state is recipient-private.

**Completion gate:**
- User approves the rendered envelope, wax and opening experience.
- Opening interactions are accessible, performant, optional/skippable and security-neutral.

---

### Phase 9 — Sender-only flight tracking and geographic maps

**Current status: Not Started**

**Dependencies:** Phase 6 mission timestamps; Phase 1 map direction; approved geographic decisions.

**Decision gates:**
- Production city/coastline dataset and licence.
- Map renderer and asset pipeline.
- Final map visual style and raven flight asset.

**Tasks:**
- Render geographically accurate coastlines in historical styling without political boundaries, roads, incidental labels or modern map chrome.
- Label only the selected mission's origin and destination cities.
- Derive outward/return position from immutable timestamps and deterministic route points; refresh must not restart a journey.
- Restrict mission details, ETA and position to the sender. The recipient must receive no flight marker or existence signal.
- Support mobile pan/zoom if needed, keyboard alternatives, reduced motion and a nonvisual textual status.
- Optimize map geometry, raven animation and hydration for low-end Android devices.

**Required tests and review:**
- Geography fixture verification, interpolation, antimeridian and timestamp-position unit tests.
- Sender/recipient/stranger authorization and pre-arrival anti-leak tests.
- Refresh, offline/reconnect, outbound/return, completed and delayed-worker states.
- Keyboard, screen-reader, reduced-motion, mobile gesture and performance tests.
- Rendered screenshot and motion review at mobile, tablet and desktop sizes.

**Completion gate:**
- Geography is verifiable and visually approved.
- Only the sender can access flight data through UI or direct API/database access.
- Map movement is deterministic, accessible and performant.

---

### Phase 10 — Delivery notifications

**Current status: Not Started**

**Dependencies:** Phase 7 committed delivery and outbox behavior.

**Decision gates:**
- Push implementation/provider details.
- Email provider, compliance and cost; email remains conditional and must not be assumed available.

**Tasks:**
- Create notification outbox events only after committed delivery.
- Implement explicit browser permission flow, subscribe/unsubscribe, service worker handling and stale endpoint cleanup.
- Use generic notification text without private letter contents.
- Ensure push failure never rolls back delivery; retry safely with deduplication and bounded attempts.
- Update in-app inbox state only after delivery.
- If separately approved, implement opt-in, rate-limited email through the selected provider with no private content.
- Protect private notification credentials and subscription data from browser exposure and cross-account access.

**Required tests and review:**
- Permission granted/denied/dismissed, unsubscribe, stale endpoint, offline and multiple-device tests.
- Outbox deduplication, retry, provider failure and delivery-independence tests.
- Tests proving no pre-arrival push, email, count, event or in-app signal.
- Generic-content and privacy review.

**Completion gate:**
- Notifications occur only after committed delivery and reveal no message contents by default.
- Delivery remains authoritative and successful even when every notification channel fails.

---

### Phase 11 — Moderation, administration, abuse prevention and account lifecycle

**Current status: Blocked**

**Dependencies:** Relevant user, relationship and letter features; approved policy decisions.

**Decision gates:**
- Content rules, report categories, retention periods, deletion behavior, appeals, legal notices and age policy.
- Failure behavior for moderated/deleted accounts where not decided earlier.

**Tasks:**
- Implement report sender/letter flows that explicitly attach only the necessary reported letter or excerpt.
- Implement separately authorized admin access, report queue, sanctions, content removal where approved, and append-only audit events.
- Prevent ordinary admin browsing of unrelated private letters; require report-scoped access and record every sensitive action.
- Enforce suspension/ban behavior consistently across auth, friendships, dispatch, delivery and notifications.
- Implement approved retention, export/deletion and appeal workflows without silently inventing policy.
- Add abuse controls at every exposed surface: signup, Raven ID lookup, friend requests, dispatch, uploads, notifications and reports.
- Add operational dashboards/alerts for delivery lag, stuck missions, worker failures, notification failures, suspicious rates and admin actions without exposing private content unnecessarily.

**Required tests and review:**
- Admin authentication/authorization and privilege-escalation tests.
- Report-scoped private-content tests and audit-log integrity tests.
- Sanction propagation, blocked/banned account and in-flight behavior tests.
- Rate-limit, spam, report-abuse and impersonation tests according to approved policy.
- Data retention/deletion and backup interaction tests.
- Security and privacy review before any moderator receives access.

**Completion gate:**
- Policy decisions are explicitly approved and documented.
- Admins have only necessary audited access.
- Abuse and account-lifecycle controls behave consistently across the product.

---

### Phase 12 — Operational reliability, performance and recovery

**Current status: Not Started**

**Dependencies:** Core backend flows through Phase 11.

**Tasks:**
- Define service-level operational targets appropriate to project scale without unnecessary enterprise infrastructure.
- Add structured logs, privacy-conscious metrics and alerts for auth, dispatch, workers, delivery lag, mission reconciliation, notifications and moderation.
- Implement reconciliation for stuck missions/outbox events and documented manual recovery procedures.
- Test database indexes and query plans for inboxes, missions, contacts, worker batches and moderation queues.
- Establish asset, bundle, hydration, map, canvas, database and worker performance budgets.
- Configure development, test, staging and production isolation, secret rotation, backup schedules and restore procedures.
- Rehearse migration, rollback-by-forward-fix, worker outage, provider outage and database restore scenarios.

**Required tests and review:**
- Load/concurrency tests sized for expected launch usage.
- Low-end Android, slow-network, large-letter, maximum-stroke and long-list performance tests.
- Worker outage/restart, duplicate event, stuck mission and reconciliation drills.
- Backup restoration and migration rehearsal in a nonproduction environment.
- Secret/configuration audit.

**Completion gate:**
- Known failures are observable, recoverable and documented.
- Performance budgets are met on representative Android and desktop devices.
- A tested restore and migration procedure exists before launch preparation.

---

### Phase 13 — Comprehensive verification, deployment and launch readiness

**Current status: Blocked**

**Dependencies:** All applicable prior phase gates; explicit user authorization to deploy and launch.

**Tasks:**
- Run the complete unit, migration, database, RLS, storage, concurrency, integration, E2E, security, accessibility, visual and performance suites.
- Verify approved product acceptance scenarios with at least two real isolated accounts.
- Perform cross-browser testing on supported Android and desktop browsers.
- Review direct API/database attacks for enumeration, pre-arrival leakage, sender status leakage, XSS, CSRF, unsafe uploads and privilege escalation.
- Complete privacy, moderation, retention, backup/restore, incident response and operational runbooks.
- Verify production provider pricing/quotas, scheduled execution limits, storage, map data licences, push/email deliverability and monitoring.
- Deploy to staging first; execute smoke, migration, worker, notification and rollback/recovery checks.
- Deploy production only after the user explicitly authorizes launch.

**Required launch gate:**
- Full agreed feature set works reliably; no known critical security, privacy, data-loss or delivery blockers remain.
- Visual screens and production assets have explicit user approval.
- Recipient arrival secrecy and sender-only tracking survive direct access tests.
- Concurrent dispatch cannot double-use a raven.
- Backups restore successfully; migrations and worker recovery are rehearsed.
- Monitoring and an incident response path are active.
- Legal/policy decisions required for launch are approved and represented accurately.

**Do not:** Deploy publicly because a build succeeds, because fixture E2E tests pass, or because a visual prototype looks complete.

## 5. Open decisions and the phases they block

The following remain unresolved unless `docs/product.md` is explicitly updated by an approved decision:

| Decision | Blocks/finalizes |
|---|---|
| Raven ID syntax, length, reserved names and impersonation safeguards | Phase 4 validation and abuse controls |
| Initial raven allocation and inventory lifecycle rules | Phase 2 final rookery states; Phase 3 initial inventory schema; Phase 6 inventory creation |
| Phantom return behavior and outbound/return travel assumptions | Phase 3 mission state/schema; Phase 6 timestamps/state transitions |
| Same-city minimum travel duration | Phase 3 mission constraints if encoded there; Phase 6 travel calculation |
| Typed/handwritten page, stroke, point and payload limits | Phase 2 validation; Phase 3 initial letter/handwriting schema; Phase 6 persistence |
| Draft location, autosave, expiry, recovery and conflict policy | Phase 2 behavior; Phase 3 initial draft schema; Phase 6 persistence |
| Handwriting transcription/accessibility workflow | Phases 2 and 7 |
| Recall policy; deleted/sanctioned-recipient failure behavior | Phases 6, 7 and 11 |
| Exact privacy UI modes/labels and contact-removal effects | Phases 5 and 7 |
| Optional “Accept sender” action | Phase 7 |
| City dataset, licence, coverage and geolocation lookup | Phases 4, 6 and 9 |
| Map renderer and asset pipeline | Phase 9 |
| Worker timing tolerance and failure monitoring details | Phases 7 and 12 |
| Push implementation and optional email provider/cost | Phase 10 |
| Final fonts, textures, raven art, signet palette, map style and animation sequences | Phases 1, 2, 8 and 9 |
| Content rules, report categories, retention, deletion, appeals, legal notices and age policy | Phase 11 and launch |
| Operational budgets, staging and monitoring choices | Phases 12 and 13 |

Approved rules that must not be reopened accidentally include: up to five ravens; listed raven speeds; one dispatch per raven per rolling 24 hours and return-before-reuse; instant Phantom delivery; Contacts Only strangers arriving as requests; no `Nobody` privacy option; no advance recipient notice; sender-only tracking; no sender access to read/delete/request state; and signet uploads strictly under 50 KB.

## 6. Verified roadmap corrections and missing requirements

This revision corrects the prior roadmap by:

- Replacing the obsolete “create a minimal scaffold” starting point with the verified partial frontend status.
- Treating the rolling 24-hour dispatch rule as approved rather than awaiting wording confirmation.
- Preventing proposed letter limits, privacy enums, draft semantics and lifecycle policies from becoming implementation assumptions.
- Adding explicit database, migration, constraints, RLS, storage authorization and security-definer review before production data flows.
- Adding transaction locking, idempotency conflicts, rollback behavior, two-worker contention, outage recovery and reconciliation requirements.
- Expanding privacy tests beyond pre-arrival visibility to include sender status leakage, storage objects, joins, counts, errors, realtime and subscriptions.
- Moving abuse prevention into each feature phase instead of leaving it entirely for moderation.
- Requiring mobile, accessibility, performance and visual verification throughout development without making unfinished artwork a blanket blocker for unrelated engineering.
- Allowing controlled overlap between visual, database, authentication, testing and security work while retaining explicit finalization gates.
- Adding a pre-migration decision gate for schema-affecting product choices and distinguishing safe later migrations from guessed initial schema.
- Recording Git verification and requiring authorized repository initialization before substantial backend changes when Git is absent.
- Adding signet upload attack cases, immutable version tests, map data licensing, asset governance, backup restoration and staged deployment gates.

No contradiction requiring changes to `vision.md`, `product.md`, `design.md`, or `architecture.md` was verified. Their unresolved choices remain intentionally unresolved here.

## 7. Recommended next development phase

**Recommended next work: proceed with approved Phase 1/2 refinement in parallel with obtaining decisions for the Phase 3 schema gate. Do not create affected migrations until their P0 decisions are approved.**

Prerequisites before substantial backend implementation:

1. Maintain `docs/requirements-matrix.md`, `docs/decision-register.md`, environment boundaries and the asset inventory as later work changes them.
2. Resolve initial inventory, return/travel semantics, same-city timing, draft policy, content limits and other P0 schema decisions before creating their affected migrations.
3. Establish database/auth contracts before protected flows are finalized.
4. Observe the first hosted CI run after an authorized push and correct environment-specific failures if any.
5. Continue visual refinement in parallel; unfinished visual approval alone does not block unrelated engineering.

Phase 0 is **Complete** for its documentation and application-shell baseline. Real-device, screen-reader, production-asset and cross-browser checks remain explicit requirements of the affected later phases and launch readiness. Phase 3 migrations remain blocked by the P0 decisions in `docs/decision-register.md`.