# Architecture and Security Design
**Status:** Frontend foundation implemented locally; Phase 3 database/RLS contracts are approved, while backend implementation and deployment configuration remain pending.
**Selected implementation baseline:** Astro + React islands + strict TypeScript + Tailwind v4; Supabase Auth/Postgres/RLS/Storage; Cloudflare Workers; browser Canvas/SVG; optional self-hosted cartography assets.

## 1. Principles
- Server is authoritative for identity, delivery time, privacy, raven eligibility and moderation.
- Client renders physical interactions and time-derived positions, but cannot authorize dispatch/delivery.
- All sensitive queries use authenticated request-scoped sessions; no service-role credentials in the browser.
- Minimize background jobs and external paid dependencies.
- Keep frontend, business rules, SQL/RLS and assets modular and testable.
- Never infer permissions from UI visibility.

## 2. Application boundaries
**Astro:** Routing, layouts, SSR pages, server endpoints.  
**React islands:** Letter editor, handwriting canvas, rookery interactions, map tracking, seal preview, notifications settings.  
**Supabase Auth:** Email/password, Google OAuth, verified sessions.  
**Postgres:** Canonical accounts, contacts, ravens, missions, letters, delivery statuses, blocks, reports and audit events.  
**RLS:** Deny-by-default table access, narrow policies; use audited security-definer functions for atomic dispatch and transitions.  
**Supabase Storage:** Normalized signet emblems, private as appropriate; never accept arbitrary SVG/HTML.  
**Cloudflare Worker/Cron:** Idempotent processing of due deliveries, return completion and notification outbox.  
**Browser:** Rendering/animation; service worker for web push with user permission.

## 3. Proposed repository structure
```text
src/
  components/{layout,rookery,letters,signets,map,contacts,ui}/
  layouts/
  pages/{auth,rookery,letters,flights,contacts,settings,admin}/
  lib/{auth,db,delivery,geography,validation,notifications}/
  styles/
  types/
  tests/
public/assets/{textures,ravens,seals,maps,fonts}/
supabase/{migrations,tests,seed}/
workers/{delivery}/
docs/{vision,product,design,architecture,roadmap}.md
AGENTS.md
```
Do not create all empty folders merely for appearance; add them when needed.

### Implemented frontend foundation
- Astro owns the page shell and static routing; the interactive letter composer is a hydrated React island.
- The local editor model uses schema-versioned multipage documents with editable text and ordered normalized vector strokes on independent layers.
- Reducer history provides undo/redo for document edits; page switching does not discard content.
- The portrait parchment is a procedural project asset pending visual approval. No letter persistence or dispatch authority exists in the client.
- Vitest covers document behavior and normalization; Playwright covers mobile/desktop composition, coexistence, pagination and overflow.

## 4. Logical data model (proposed)
| Table | Important fields | Notes |
|---|---|---|
| `profiles` | user_id PK, username UNIQUE normalized, display_name nullable, city_id, signet_version, account_state | Auth-owned UUID; Username is immutable; retain only minimal tombstone state when required |
| `city_data_versions` | id, source, licence, version, imported_at | Licensed dataset provenance and update boundary |
| `cities` | id, dataset_version_id, stable_source_id, name, country_code, latitude, longitude, active | Stable city identity and validated centroids; no street addresses |
| `raven_types` | id, name, speed_kmh, instant | Immutable five-type catalog |
| `user_ravens` | id, owner_id, type_id, last_dispatched_at, active_mission_id | Exactly one of each type provisioned; unique owner/type; max five |
| `signet_versions` | id, owner_id, inscription, emblem_storage_path, wax_style, created_at | Immutable snapshots |
| `contacts` | owner_id, contact_user_id, nickname | Unilateral, unique pair |
| `friend_requests` | id, requester_id, recipient_id, status | Controlled transitions |
| `friendships` | user_a, user_b, created_at | Canonical ordered pair |
| `blocks` | blocker_id, blocked_id, created_at | Immutable UUID relationships |
| `user_privacy` | user_id, incoming_mode, notify_push, notify_email | Constrained semantic key: `everyone`, `contacts_only`, `friends_only` |
| `drafts` | id, owner_id, schema_version, revision, document, updated_at | Server autosave with optimistic revision; persistent until dispatch/deletion |
| `letters` | id, sender_id, recipient_id/tombstone_ref, format, typed_body OR handwriting_ref, transcription, signet_version_id, sender_status, sent_at | Immutable content and sender-visible outcome only |
| `recipient_letter_state` | letter_id, recipient_id, placement, opened_at, deleted_at | Created/exposed only after committed delivery; never readable by sender |
| `handwriting_pages` | letter_id, page_index, normalized_strokes | Bounded validated JSON or private object under letter ACL |
| `missions` | id, raven_id, letter_id, city/version and centroid snapshots, distance_km, departed_at, scheduled_arrival_at, actual_arrival_at, scheduled_return_at, actual_return_at, status | Immutable journey inputs plus committed worker transitions |
| `delivery_outbox` | id, letter_id, event_type, due_at, processed_at, attempts | Notification job idempotency |
| `push_subscriptions` | id, user_id, endpoint, keys_encrypted, created_at | Secure lifecycle |
| `reports` | id, reporter_id, reported_user_id, letter_id?, reason, status | Report-bound access |
| `moderation_actions` | id, actor_admin_id, target_id, action, reason, created_at | Append-only audit |
| `idempotency_keys` | user_id, key, operation, request_fingerprint, result_ref | Identical retry replay; conflicting reuse rejected |

These are **logical** tables, not final SQL. Define exact columns, indexes, constraints, deletion policies and RLS during the database-design phase.

### Approved initial migration boundary
The first Phase 3 migration should contain only the approved foundations needed by Phases 4 and 5: profile/account-state ownership and Username constraints; `city_data_versions` and `cities`; immutable `raven_types`; transactionally provisioned `user_ravens`; `user_privacy`; `contacts`; `friend_requests`; `friendships`; `blocks`; `signet_versions`; and owner-scoped `drafts`. Include supporting constraints, indexes, updated-at/revision mechanics and deny-by-default RLS for those tables.

Add `letters`, `recipient_letter_state`, `handwriting_pages`, `missions`, `idempotency_keys` and dispatch functions in a reviewed Phase 6 forward migration. Add delivery/outbox processing in Phase 7, notifications in Phase 10, and reports/moderation tables in Phase 11. Do not create speculative columns for later phases.

## 5. Core state machines
### Raven / mission
Non-instant missions follow `available → outbound → returning → available`, with cooldown potentially presenting the returned raven as `resting`. Phantom dispatch, delivery and return commit instantaneously, then remain cooldown-ineligible until 24 hours after dispatch.

Do not use client-updated statuses as canonical. Prefer timestamps and transactional state changes. Ensure a raven has at most one active mission; enforce with unique/partial indexes or a lockable row.

### Letter
Drafts remain separate revisioned owner records until successful dispatch or explicit deletion. Dispatched letters keep sender-visible `in_flight → delivered | failed` outcomes separate from recipient-private `inbox | request`, `opened` and `deleted` state. The sender cannot query or infer recipient-private state.

### Moderation/block during flight
Recheck blocks and account eligibility at arrival. If blocked or otherwise ineligible, suppress delivery, expose only a generic sender-visible failure and schedule return. Otherwise classify with current privacy/relationship state. Do not leak request/inbox placement, and do not automatically reclassify after delivery.

## 6. Dispatch transaction (critical)
An authenticated server endpoint invokes a narrow security-definer database function. Inside that transaction:
1. Authenticate caller; verify sender and recipient IDs.
2. Check sender account standing, recipient existence, block constraints and request rate limits.
3. Validate format and size of letter payload.
4. Lock selected `user_ravens` row (`FOR UPDATE`).
5. Reject if active mission exists, return not completed, or `now() < last_dispatched_at + interval '24 hours'`.
6. Snapshot cities, raven speed/type and signet version.
7. Compute trusted distance/ETA on server using validated city centroids.
8. Create immutable letter and mission; set last-dispatch timestamp and active mission.
9. Commit; return only sender-appropriate mission details.
10. Persist the idempotency key and canonical request fingerprint in the same transaction. An identical retry returns the original result; conflicting reuse is rejected.

Use DB constraints and isolation tests; RLS alone is not sufficient for concurrency.

## 7. Geography and travel
- Use licensed, versioned city data with stable IDs and validated centroids; initial selection is manual search. Validate country/city ambiguity, duplicate names, latitude `[-90, 90]` and longitude `[-180, 180]`.
- Calculate great-circle distance from server-owned city centroids using Haversine or equivalent.
- Phantom duration is zero. Each non-instant leg is `max(10 minutes, distance_km / speed_kmh)`, rounded deterministically to integer seconds without permitting early arrival.
- Snapshot city/version identity and centroids, then persist exact scheduled arrival and return timestamps; avoid recomputing after city changes or dataset updates.
- Route rendering: deterministic great-circle interpolation, including antimeridian handling; map display may differ from raw shortest-line geometry.
- Avoid claiming raven speeds are physically realistic.
- No third-party location permission until explicit user action; do not retain exact GPS data.

## 8. Delivery processing
A scheduled worker queries due missions in bounded batches:
- Lock due rows with `FOR UPDATE SKIP LOCKED` or equivalent transaction-safe claim.
- For outbound due: recheck block/account status; mark letter delivered to inbox/request according to **arrival-time** privacy state, or mark undeliverable; transition raven to returning.
- For returning due: complete mission, clear active mission; daily cooldown remains independently enforced.
- Insert notification event only after committed delivery.
- Use retry-safe idempotency, bounded attempts, stuck-mission detection/recovery and operational metrics.
- Store scheduled arrival/return separately from actual processing timestamps. Never expose a recipient letter until a trusted transition has committed. Instant Phantom Raven dispatch may deliver and return atomically in the dispatch transaction, still with no pre-arrival signal.

Exact worker cadence, batch size, retry thresholds and late-processing presentation remain operational details. Prefer reliable server-side gating over strict second-level guarantees.

## 9. RLS and anti-leak design
- Sender can select own outgoing letters and missions, but not recipient-private opened/request/delete flags.
- Recipient can select incoming letters **only after delivery transition**; never merely based on `arrival_at` in client-side filters.
- Recipient cannot select in-flight missions addressed to them, including via joins, counts, realtime events, RPC error messages or push subscriptions.
- Signet/public profile data only expose intentionally public fields. Username is the immutable public identifier; any display name is optional presentation data. Private email, auth data and precise coordinates remain hidden.
- Block relationships and contact lists should not be broadly enumerable.
- Private handwritten payload and storage object access must follow same letter ACL.
- Admins receive narrow report-based content access; no unrestricted reading through application interfaces.
- Security-definer functions use fixed `search_path`, explicit grants, validated caller and reviewed ownership.

## 10. Handwriting storage and safety
- Use Pointer Events and normalized coordinates; preserve stroke order, tool, width and optional pressure.
- Enforce five pages, 200 strokes per page, 2,000 points per stroke and a 1 MiB canonical serialized-content limit both client- and server-side. Typed content is limited to 10,000 Unicode scalar values.
- Require finite normalized coordinates in `[0, 1]`, reject NaN/infinity and bound tool, width, pressure and numeric precision.
- Use vector replay for rendering; store an optional author-provided plain-text transcription under the same letter ACL. Never fabricate transcription.
- Avoid HTML injection; typed letters are displayed as text, not raw user HTML.
- Ensure zooming/resizing never corrupts saved strokes.

## 11. Signet upload security
- Client previews and may resize, but server checks actual bytes, format, dimensions and decompression limits.
- Reject SVG, scripts, HTML, polyglot or invalid images.
- Decode/re-encode to standardized PNG/WebP; max uploaded file size **strictly less than 50 KB**.
- Store versions immutably; refer to the chosen version from letters.
- Use controlled storage policies; no direct user write into other accounts' paths.

## 12. Authentication/session model
- Use Supabase SSR session handling appropriate for Astro/Cloudflare.
- Store the approved immutable public identifier as normalized `username`; enforce case-insensitive uniqueness, syntax and reserved-name validation transactionally. Optional `display_name` is nullable presentation data only.
- Request-scoped server clients; validate identity on every protected action and use immutable account UUIDs for relationships and authorization.
- Google OAuth with CSRF/state and correct redirect URI handling.
- Protect `/admin/**` with server authorization, not just client routing.
- Do not put service role, notification private keys, OAuth secrets or admin tokens in public env vars.

## 13. Notifications
- Browser push through service worker after opt-in; support unsubscribe and stale endpoint cleanup.
- Notify only after committed arrival; generic message text, no body preview.
- Optional email via external provider after explicit provider selection and opt-in.
- Use outbox pattern so notification retries do not duplicate delivery or block dispatch.
- Push delivery is best-effort; the inbox remains authoritative.

## 14. Tests required
- Unit: distances, travel times, interpolation, date/cooldown boundaries, text/stroke validation.
- DB: RLS for sender/recipient/stranger/admin, private payload, blocks, friendship rules.
- Concurrency: same raven simultaneous dispatch, duplicate idempotency key, two workers claiming same delivery.
- Integration: dispatch → flight → delivery → return → cooldown, block during flight, privacy change during flight.
- E2E: mobile compose, handwriting touch/pointer, seal preview, request read/delete/block, notification permissions, accessibility.
- Security: direct API enumeration, pre-arrival leaks through counts/joins/realtime, unsafe upload, XSS, CSRF, privilege escalation.
- Visual regression: actual screenshots at mobile/tablet/desktop widths against approved references.

## 15. Deployment and cost
- Cloudflare Workers + static assets; Supabase database/auth/storage.
- Prefer self-hosted optimized textures, fonts and map data.
- Verify current free-tier limits, scheduled execution quotas, storage and email pricing **before** choosing production plans.
- Separate development/staging/production environments; migrations are forward-only and tested.
- Do not enable production email/push or deploy until security and deliverability tests pass.

## 16. Architecture decisions pending
1. Final table/RPC SQL, indexes, query plans and reviewed RLS policy text.
2. Autosave debounce, retry/backoff and conflict-recovery presentation.
3. Concrete licensed city source, geographic coverage and update cadence within the approved versioned-data contract.
4. Scheduled-worker cadence, batch size, retry thresholds, alerting and late-processing presentation.
5. Map renderer (SVG/Canvas vs MapLibre) and asset pipeline.
6. Push provider implementation and email provider/cost.
7. Postgres JSON versus private object storage for bounded handwriting payloads.
8. Data retention, anonymization, moderation and appeal policies beyond minimal mission-safe tombstones.
9. Operational budgets, staging setup and monitoring.
