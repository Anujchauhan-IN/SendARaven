# Decision Register

**Status:** Consolidated unresolved product and architecture decisions, with approved outcomes retained where they close a recorded decision.
**Authority:** A listed option is not approval. Decisions become binding only when explicitly approved and recorded in the authoritative product or architecture documentation.  
**Priority:** `P0` must be resolved before the affected Phase 3 initial schema/migration; `P1` blocks a later core phase; `P2` may safely wait for a later forward-only migration or implementation phase if omitted from earlier contracts.

## Approved rules that are not open for reconsideration

- Up to five ravens per user; the approved catalogue contains Phantom (instant), Swift (500 km/h), Courier (250 km/h), Wanderer (100 km/h) and Old (50 km/h).
- Each raven dispatches at most once per rolling 24 hours and cannot be reused until it returns. Server time and transactional locking are authoritative.
- Phantom delivery is instant, while its exact return-state representation remains unresolved.
- Recipient must not know a letter exists before committed delivery.
- Only the sender can track a mission in flight.
- Contacts Only strangers still travel and arrive as Letter Requests.
- There is no `Nobody` privacy option; blocking overrides normal delivery.
- Sender cannot learn request placement, read/open/delete state, or receive default read receipts.
- Blocks bind immutable account UUIDs and are rechecked at arrival.
- Letters have no attachments; signet emblems are separate profile assets.
- Signet uploads are safe PNG/WebP, strictly under 50 KB, normalized server-side, and historically versioned.
- Replies are new dispatches requiring an eligible raven.
- Notifications occur only after delivery and failure cannot undo delivery.
- Admin private-letter access is report-scoped, minimal and audited.
- The human public identifier is Username. Usernames are immutable, case-insensitively unique, 3–24 lowercase Latin letters/digits/underscores, and protected by reserved-name rules.
- A raven is exclusively a letter carrier, never a person's identity. Relationships bind immutable account UUIDs internally.

## P0 — Resolve before affected Phase 3 initial schema

A P0 decision may be deferred only if its affected tables, constraints and API/state-machine contracts are deliberately omitted from the initial schema. Do not create guessed enums, placeholder columns or speculative transitions.

### DEC-P0-01 — Initial raven allocation and inventory lifecycle

**Blocks:** Phase 2 final rookery states; Phase 3 inventory schema; Phase 6 inventory creation.  
**Unresolved source:** `docs/product.md` §3/§15; `docs/roadmap.md` Phase 3 gate.

**Reasonable options:**
- Give every new user one of each approved type, as currently proposed.
- Approve another fixed initial allocation.
- Create no automatic inventory until a separate allocation flow is approved.
- Permit or omit individual raven names.
- Define a fixed inventory with no acquisition/replacement, or reserve lifecycle support for a later approved feature.

**Technical implications:** `user_ravens` provisioning, maximum-five and per-type uniqueness constraints, empty/partial inventory states, naming columns, replacement/deactivation history, signup transaction, RLS and seed data.

### DEC-P0-02 — Phantom and non-instant return semantics

**Blocks:** Phase 3 mission state/schema; Phase 6 timestamps and cooldown; Phase 7 worker transitions; Phase 9 return tracking.

**Reasonable options:**
- Phantom delivery and return are both instantaneous while cooldown remains active.
- Phantom delivery is instantaneous but return is represented as a distinct transition.
- Non-instant ravens return at outward speed, as proposed.
- Approve another deterministic return model; weather/fatigue modifiers are not currently approved.

**Technical implications:** mission states, `arrival_at`/`return_at` nullability and ordering, worker jobs, `returning`/`resting` presentation, cooldown independence, sender tracking and integration tests.

### DEC-P0-03 — Same-city minimum delivery duration

**Blocks:** Phase 3 timestamp/state constraints if encoded initially; Phase 6 travel calculation.

**Reasonable options:**
- Use an approved fixed nonzero minimum for non-instant ravens.
- Permit distance-derived zero/near-zero duration.
- Use another deterministic minimum rule.

**Technical implications:** arrival/return timestamp constraints, worker scheduling, local-route UX, cooldown tests, map interpolation and privacy timing.

### DEC-P0-04 — Draft persistence, autosave and conflict behavior

**Blocks:** Phase 2 final draft behavior; Phase 3 draft schema; Phase 6 persistence.

**Reasonable options:**
- Local-only drafts.
- Server-only drafts.
- Local plus server synchronization.
- Explicit save or autosave with an approved interval.
- Persistent or expiring drafts.
- Last-write-wins, optimistic revision conflict, or explicit conflict recovery.

**Technical implications:** whether a `drafts` table exists initially, revision columns, ownership RLS, private handwriting storage, offline synchronization, cleanup jobs, stale-write behavior and draft-to-dispatch transaction.

### DEC-P0-05 — Typed and handwritten content limits

**Blocks:** Phase 2 validation; Phase 3 letter/handwriting schema; Phase 6 persistence.

**Reasonable options:**
- Approve the proposed 10,000 Unicode-character maximum or another bounded cap.
- Approve the proposed five-page maximum or another bounded cap.
- Set explicit stroke, point, coordinate, serialized-payload and request-size limits.
- Store bounded vector JSON in Postgres or private object storage.

**Technical implications:** column/storage types, check constraints, request and transaction size, resource exhaustion controls, rendering performance, worker throughput and boundary/malicious-payload tests.

### DEC-P0-06 — Username syntax, mutability and reserved names

**Status: APPROVED.**

**Decision:** The public identifier is Username. Usernames are immutable, case-insensitively unique, 3–24 lowercase Latin letters, digits or underscores, with reserved-name protections. Immutable internal account UUIDs remain the relationship keys. Optional display names are presentation data and are not identifiers.

**Technical implications:** normalized Username column, case-insensitive unique index, concurrent signup protection, reserved-name validation, lookup RPCs, enumeration resistance and audit/rate limiting. No rename history or redirect contract is required.

### DEC-P0-07 — Durable privacy-mode representation

**Blocks:** Phase 3 only if a constrained value is introduced; Phase 5 settings; Phase 7 classification.

**Reasonable options:**
- Approve the proposed `Everyone`, `Contacts Only`, `Friends Only` semantics.
- Use text/check or a lookup table instead of a PostgreSQL enum until values stabilize.
- Omit durable privacy settings from the initial schema until approved.
- A fourth requests mode requires explicit approval; `Nobody` remains forbidden.

**Technical implications:** enum migration difficulty, defaults, arrival worker queries, relationship joins, RLS, in-flight changes and tests. UI labels may change without changing stored semantic keys if designed separately.

### DEC-P0-08 — Recall and recipient-ineligibility failure behavior

**Blocks:** Phase 3 letter/mission states and foreign-key behavior; Phases 6, 7 and 11.

**Reasonable options:**
- Approve proposed no-recall behavior.
- Permit recall with a defined cutoff and return transition.
- Treat deleted/suspended/banned recipient as privacy-preserving undeliverable.
- Retain a tombstone identity sufficient to complete active missions.
- Define archive/removal behavior separately from sender-visible status.

**Technical implications:** letter/mission status values, foreign-key deletion actions, tombstones/anonymization, dispatch/arrival checks, sender-visible failure, return scheduling, retries, retention and moderation.

### DEC-P0-09 — Initial schema boundaries and status ownership

**Blocks:** Phase 3 and every persisted backend phase.

**Reasonable options:**
- Add tables incrementally by phase rather than creating the entire proposed logical model initially.
- Separate sender-visible delivery state from recipient-private placement/open/delete state in separate tables/views, or use another reviewed structure with equivalent anti-leak guarantees.
- Derive mission states primarily from immutable timestamps, or persist constrained explicit states where workers require transitions.
- Define which transitions are performed only through security-definer functions.

**Technical implications:** migration scope, RLS complexity, joins/counts/realtime leakage, state-transition constraints, query plans, admin report access, deletion behavior and long-term compatibility.

### DEC-P0-10 — Atomic dispatch and idempotency contract

**Blocks:** Phase 3 RPC/security design; Phase 6 dispatch.

**Reasonable options:**
- A narrow security-definer database RPC owns the full transaction.
- A server endpoint invokes an equivalently reviewed transactional database function.
- Persist idempotency keys and return the original successful result on retry.
- Define conflicting payload reuse as a conflict or another privacy-safe rejection.

**Technical implications:** row locking, isolation level, one-active-mission constraint, validation ordering, snapshot writes, fixed `search_path`, explicit grants, retry semantics and rollback guarantees.

## P1 — Resolve before later core feature finalization

### DEC-P1-01 — City dataset, licence and update strategy

**Blocks:** Phases 4, 6 and 9.

**Reasonable options:** versioned curated city dataset with approved geographic coverage; manual search only or optional coordinate-to-city lookup; chosen source/licence and update cadence.

**Technical implications:** stable city IDs, source versions, ambiguous names, centroid precision, seed/update process, geolocation disposal, mission snapshots and map compatibility. A generic city contract may be designed before production data is selected.

### DEC-P1-02 — Arrival classification under relationship/privacy changes

**Blocks:** Phases 5 and 7.

**Reasonable options:** classify using arrival-time contact/friend/privacy state, as proposed; define handling for contact/friend removal and privacy changes after dispatch or after delivery. Blocks must still be rechecked and override delivery.

**Technical implications:** worker transaction consistency, concurrent relationship changes, historical placement, inbox/request transitions and anti-leak tests.

### DEC-P1-03 — Handwriting accessibility alternative

**Blocks:** Phase 2 final accessibility design; Phase 7 reading; Phase 3 only if persisted initially.

**Reasonable options:** optional author-supplied transcription; another author-provided readable alternative; defer fields until workflow approval. Automatic fabricated transcription is not allowed.

**Technical implications:** editor UX, related columns/table, ownership RLS, recipient access, validation and accessibility tests.

### DEC-P1-04 — User-facing failure and sent-letter archive behavior

**Blocks:** Phases 6 and 7.

**Reasonable options:** generic delivered/failed status only; define whether failed/sent letters remain in a sender archive; decide which failure details remain private.

**Technical implications:** sender-visible status model, retention, queries, failure copy, storage lifecycle and leakage tests.

### DEC-P1-05 — Worker schedule, timing tolerance and late processing

**Blocks:** Phases 7 and 12.

**Reasonable options:** different bounded cron frequencies and lateness tolerances; explicit delayed presentation or no special user-visible state; chosen retry/dead-letter thresholds.

**Technical implications:** scheduled versus actual timestamps, batch size, `SKIP LOCKED` claims, retry limits, stuck-mission reconciliation, metrics, alerts and cost.

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