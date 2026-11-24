# Decision Register

**Status:** Consolidated unresolved product and architecture decisions, with approved outcomes retained where they close a recorded decision.
**Authority:** A listed option is not approval. Decisions become binding only when explicitly approved and recorded in the authoritative product or architecture documentation.  
**Priority:** `P0` must be resolved before the affected Phase 3 initial schema/migration; `P1` blocks a later core phase; `P2` may safely wait for a later forward-only migration or implementation phase if omitted from earlier contracts.

## Approved rules that are not open for reconsideration

- Every account receives exactly one Phantom, Swift, Courier, Wanderer and Old raven; custom names, acquisition and replacement are not supported initially.
- The approved catalogue speeds are Phantom (instant), Swift (500 km/h), Courier (250 km/h), Wanderer (100 km/h) and Old (50 km/h).
- Each raven dispatches at most once per rolling 24 hours and cannot be reused until it returns. Server time and transactional locking are authoritative.
- Phantom delivery and return are instantaneous. Non-instant ravens return at their outward speed. Every non-instant travel leg lasts at least 10 minutes.
- Recipient must not know a letter exists before committed delivery.
- Only the sender can track a mission in flight.
- Incoming privacy modes are `Everyone`, `Contacts Only` and `Friends Only`; Contacts Only strangers still travel and arrive as Letter Requests.
- Arrival classification uses current privacy and relationship state, with no automatic post-delivery reclassification. There is no `Nobody` privacy option; blocking overrides normal delivery.
- Sender cannot learn request placement, read/open/delete state, or receive default read receipts.
- Blocks bind immutable account UUIDs and are rechecked at arrival.
- Letters have no attachments; signet emblems are separate profile assets.
- Signet uploads are safe PNG/WebP, strictly under 50 KB, normalized server-side, and historically versioned.
- Replies are new dispatches requiring an eligible raven; dispatched letters cannot be recalled.
- Ineligible recipients cause suppressed delivery, a generic sender-visible failure and safe raven return.
- Notifications occur only after delivery and failure cannot undo delivery.
- Admin private-letter access is report-scoped, minimal and audited.
- The human public identifier is Username. Usernames are immutable, case-insensitively unique, 3–24 lowercase Latin letters/digits/underscores, and protected by reserved-name rules.
- A raven is exclusively a letter carrier, never a person's identity. Relationships bind immutable account UUIDs internally.

## P0 — Resolve before affected Phase 3 initial schema

A P0 decision may be deferred only if its affected tables, constraints and API/state-machine contracts are deliberately omitted from the initial schema. Do not create guessed enums, placeholder columns or speculative transitions.

### DEC-P0-01 — Initial raven allocation and inventory lifecycle

**Status: APPROVED.**

**Decision:** Every account receives exactly one Phantom, Swift, Courier, Wanderer and Old raven. Custom raven names, acquisition and replacement are not supported initially.

**Technical implications:** Seed the immutable five-type catalogue and create the five `user_ravens` rows transactionally and idempotently during account provisioning. Enforce one raven per owner/type and at most five per owner. Do not add naming, acquisition, replacement or lifecycle-history columns before a later approved feature requires them.

### DEC-P0-02 — Phantom and non-instant return semantics

**Status: APPROVED.**

**Decision:** Phantom delivery and return are instantaneous while its rolling 24-hour cooldown remains active. Every non-instant raven returns at its outward speed. Weather, fatigue and terrain modifiers are not part of the initial model.

**Technical implications:** Phantom may commit dispatch, delivery and return in one transaction while remaining cooldown-ineligible. Non-instant missions persist outward and return timestamps fixed at dispatch. Eligibility requires both committed return and cooldown expiry.

### DEC-P0-03 — Same-city minimum delivery duration

**Status: APPROVED.**

**Decision:** Every non-instant outward or return leg has a minimum duration of 10 minutes, including same-city and very short routes. Phantom remains instantaneous.

**Technical implications:** Compute each non-instant leg as `max(10 minutes, distance / speed)` using trusted server inputs and deterministic rounding. Apply the minimum independently to outward and return legs.

### DEC-P0-04 — Draft persistence, autosave and conflict behavior

**Status: APPROVED.**

**Decision:** The editor keeps a local working draft and autosaves to the server. Drafts persist until successful dispatch or explicit deletion. Server saves use optimistic revision protection; stale writes must not silently overwrite a newer revision.

**Technical implications:** Include owner-scoped draft persistence with a monotonic revision, schema version and updated timestamp. Keep local recovery data when offline or conflicted. Exact debounce timing, retry backoff and conflict-resolution presentation are technical details, not product blockers.

### DEC-P0-05 — Typed and handwritten content limits

**Status: APPROVED.**

**Decision:** Typed content is limited to 10,000 Unicode characters. A handwritten letter is limited to five pages, 200 strokes per page and 2,000 points per stroke. Canonical serialized content for any letter is limited to 1 MiB.

**Technical implications:** Count typed characters deterministically as Unicode scalar values across client and server. Require finite normalized coordinates and bounded tool values. Enforce the 1 MiB limit on canonical serialized content, with a separately bounded transport envelope. Postgres JSON versus private object storage remains an implementation choice subject to the same ACL and limits.

### DEC-P0-06 — Username syntax, mutability and reserved names

**Status: APPROVED.**

**Decision:** The public identifier is Username. Usernames are immutable, case-insensitively unique, 3–24 lowercase Latin letters, digits or underscores, with reserved-name protections. Immutable internal account UUIDs remain the relationship keys. Optional display names are presentation data and are not identifiers.

**Technical implications:** normalized Username column, case-insensitive unique index, concurrent signup protection, reserved-name validation, lookup RPCs, enumeration resistance and audit/rate limiting. No rename history or redirect contract is required.

### DEC-P0-07 — Durable privacy-mode representation

**Status: APPROVED.**

**Decision:** The incoming privacy modes are `Everyone`, `Contacts Only` and `Friends Only`. There is no `Nobody` mode and no fourth requests mode. Store stable semantic keys separately from localizable UI labels.

**Technical implications:** A constrained text value or lookup table may represent `everyone`, `contacts_only` and `friends_only`; a PostgreSQL enum is not required. Arrival classification joins current privacy and relationship state transactionally.

### DEC-P0-08 — Recall and recipient-ineligibility failure behavior

**Status: APPROVED.**

**Decision:** A dispatched letter cannot be recalled. If the recipient is deleted, suspended, banned or otherwise ineligible at arrival, suppress delivery, expose only a generic sender-visible failure and return the raven safely. Retain only the minimal account tombstone or immutable mission references needed to preserve mission integrity and privacy.

**Technical implications:** No recall transition is present. Account lifecycle and foreign-key behavior must preserve active mission processing without retaining unnecessary profile data. Broader retention, anonymization and appeals policy remains under DEC-P2-03.

### DEC-P0-09 — Initial schema boundaries and status ownership

**Status: APPROVED.**

**Decision:** Build the schema incrementally. Keep sender-visible delivery outcomes separate from recipient-private inbox/request placement, open/read and deletion state. Sensitive lifecycle transitions occur only through reviewed transactional functions; timestamps remain immutable snapshots while explicit constrained states are used where workers require committed transitions.

**Technical implications:** The initial migration contains only approved foundational domains. Later feature migrations add dispatch, delivery, notifications and moderation tables when their implementation begins. RLS, views, counts, joins and realtime publication must preserve the state separation.

### DEC-P0-10 — Atomic dispatch and idempotency contract

**Status: APPROVED.**

**Decision:** An authenticated server endpoint invokes a narrow transactional database function for dispatch. An identical retry with the same idempotency key replays the original result; reuse of that key with a different canonical request is rejected as a privacy-safe conflict.

**Technical implications:** Persist an idempotency key, canonical request fingerprint and result reference in the dispatch transaction. Lock the selected raven, enforce one active mission, use fixed `search_path` and explicit grants, and roll back every dispatch write on failure.

## P1 — Resolve before later core feature finalization

### DEC-P1-01 — City dataset, licence and update strategy

**Status: APPROVED.**

**Decision:** Use licensed, versioned city data with stable city IDs and centroids. Initial onboarding uses manual city search. Optional permission-based coordinate lookup may be added later without retaining raw coordinates.

**Technical implications:** Record dataset source/version, validate ambiguous names and coordinate bounds, and snapshot mission geography so later dataset updates cannot rewrite journeys. Selecting the concrete licensed dataset and update cadence remains an implementation procurement task.

### DEC-P1-02 — Arrival classification under relationship/privacy changes

**Status: APPROVED.**

**Decision:** Classify a deliverable letter at arrival using the recipient's current privacy mode and current contact/friend relationship. Recheck blocks and eligibility in the same transaction. Once delivered, later relationship or privacy changes do not automatically reclassify it.

**Technical implications:** Arrival processing needs a transactionally consistent relationship/privacy snapshot and immutable initial placement. Recipient actions may change private presentation state without changing sender-visible delivery outcome.

### DEC-P1-03 — Handwriting accessibility alternative

**Status: APPROVED.**

**Decision:** Authors may optionally provide a plain-text transcription for a handwritten letter. Automatic or fabricated transcription is not allowed.

**Technical implications:** Store the optional transcription with the letter content under the same ownership and delivery ACL, validate it as plain text, and expose it only with the authorized letter.

### DEC-P1-04 — User-facing failure and sent-letter archive behavior

**Status: APPROVED.**

**Decision:** Provide a sender archive for sent letters. Sender-visible status is limited to privacy-safe delivery outcomes and must never disclose inbox/request placement, reading, opening, deletion or other recipient-private activity.

**Technical implications:** Archive queries use sender-owned immutable content and sender-visible status only. Generic failure behavior follows DEC-P0-08; retention duration remains part of later policy work.

### DEC-P1-05 — Worker schedule, timing tolerance and late processing

**Status: APPROVED.**

**Decision:** Persist scheduled timestamps separately from actual processing timestamps. Delivery/return processing uses bounded retries and includes stuck-mission detection and recovery.

**Technical implications:** Workers claim bounded batches transactionally, record attempts and actual transition times, and support reconciliation without duplicate delivery. Exact cadence, batch size, retry count and alert thresholds are operational details for Phases 7 and 12.

### DEC-P1-06 — Optional “Accept sender” action

**Blocks:** Phase 7 request UX.

**Reasonable options:** omit; explicitly add sender as unilateral contact; keep action separate from opening/reading.

**Technical implications:** contact transaction, duplicate handling, confirmation and tests proving reading alone changes no relationship.

### DEC-P1-07 — Signet fallback and presentation values

**Blocks:** Phase 4 signet finalization and Phase 8 envelope/seal interface; does not block core upload security.

**Reasonable options:** initials-only fallback; approved long-inscription truncation/initials behavior; limited wax palette and shape choices.

**Technical implications:** persisted presentation values versus render-only values, immutable signet versions, accessibility identity text and migration risk if provisional enums are stored.

### DEC-P1-08 — Human public-identifier terminology

**Status: APPROVED.**

**Decision:** The human public identifier is **Username**. The composer recipient field uses `Address your letter to…`. A raven is exclusively a letter carrier and never the recipient's identity. Internal relationships continue using immutable account UUIDs.

**Related approved constraints:** Usernames are immutable, case-insensitively unique, 3–24 lowercase Latin letters, digits or underscores, with reserved-name protections. Optional display names remain distinct presentation data and are not required identifiers.

**Technical implications:** onboarding and lookup copy, accessibility labels, localization, support language, analytics/event names and documentation use Username. Profile/schema contracts use `username` for the public identifier while relationships use account UUIDs. Existing source placeholder copy remains an implementation dependency for Phase 4 and was not changed by this documentation decision.

## P2 — Safe to defer when omitted from earlier contracts

### DEC-P2-01 — Map renderer and asset pipeline

**Blocks:** Phase 9 only.  
**Options:** SVG, Canvas, MapLibre, or another approved renderer using self-hosted licensed data.  
**Implications:** geometry format, mobile performance, accessibility alternative, pan/zoom, hydration, antimeridian rendering, asset size and deployment.

### DEC-P2-02 — Push implementation and optional email provider

**Blocks:** Phase 10.  
**Options:** standards-based web push implementation; approved provider if needed; optional compliant opt-in email provider; no email if none is suitable.  
**Implications:** subscription schema, encrypted keys, secrets, adapters, stale endpoints, cost, quotas, deliverability and rate limits. Delivery outbox semantics should remain provider-neutral.

### DEC-P2-03 — Moderation categories, retention, deletion, appeals and legal policy

**Blocks:** Phase 11 and launch.  
**Options:** require explicit product/legal approval; no default is authorized.  
**Implications:** report reason representation, retention jobs, audit access, deletion/anonymization, backups, appeal workflow and legal notices. Core deleted-recipient mission behavior must be resolved earlier under DEC-P0-08.

### DEC-P2-04 — Operational budgets, staging and monitoring

**Blocks:** Phases 12 and 13.  
**Options:** project-appropriate worker frequency, quotas, service targets, alert thresholds and environment topology.  
**Implications:** cost, environment configuration, backup/restore, log retention, privacy-conscious metrics, incident response and recovery drills.

### DEC-P2-05 — Final visual assets and animation sequences

**Blocks:** affected Phase 1/2/8/9 interface completion and launch, but not unrelated backend work.  
**Options:** user-approved fonts, textures, raven art, rookery structure, signet palette, map style and motion sequences.  
**Implications:** licensing, asset metadata, byte budgets, responsive variants, visual regression baselines and reduced-motion behavior. Provisional assets must not become silently approved persisted choices.

## Decision workflow

For each decision:

1. Record the explicit user-approved outcome in `docs/product.md` when it changes product behavior, privacy, delivery semantics or policy.
2. Record architecture rationale in `docs/architecture.md` when it changes schema, RLS, transactions, workers, providers or operations.
3. Update `docs/requirements-matrix.md` and `docs/roadmap.md` phase gates.
4. Add or update acceptance tests before marking the affected phase complete.
5. Keep the decision open when approval is absent; do not infer approval from a prototype, fixture, option list or recommended default.