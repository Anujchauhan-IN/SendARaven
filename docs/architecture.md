# Architecture and Security Design
**Status:** Frontend foundation implemented locally; backend and deployment architecture remain proposed.  
**Stack direction:** Astro + React islands + strict TypeScript + Tailwind v4; Supabase Auth/Postgres/RLS/Storage; Cloudflare Workers; browser Canvas/SVG; optional self-hosted cartography assets.

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
| `profiles` | user_id PK, username UNIQUE normalized, display_name nullable, city_id, signet_version | Auth-owned UUID; Username is immutable and relationships use `user_id` |
| `cities` | id, name, country_code, latitude, longitude, source_version | City centroids, no street addresses |
| `raven_types` | id, name, speed_kmh, instant | Immutable catalog |
| `user_ravens` | id, owner_id, type_id, last_dispatched_at, active_mission_id | Max five enforced in DB |
| `signet_versions` | id, owner_id, inscription, emblem_storage_path, wax_style, created_at | Immutable snapshots |
| `contacts` | owner_id, contact_user_id, nickname | Unilateral, unique pair |
| `friend_requests` | id, requester_id, recipient_id, status | Controlled transitions |
| `friendships` | user_a, user_b, created_at | Canonical ordered pair |
| `blocks` | blocker_id, blocked_id, created_at | Immutable UUID relationships |
| `user_privacy` | user_id, incoming_mode, notify_push, notify_email | Explicit enum |
| `letters` | id, sender_id, recipient_id, format, typed_body OR handwriting_ref, signet_version_id, status, sent_at, delivered_at | Restrict recipient reads until delivered |
| `handwriting_pages` | letter_id, page_index, normalized_strokes | Bounded validated JSON or private object |
| `missions` | id, raven_id, letter_id, origin_city_id, destination_city_id, distance_km, departed_at, arrival_at, return_at, status | Immutable journey snapshot |
| `delivery_outbox` | id, letter_id, event_type, due_at, processed_at, attempts | Notification job idempotency |
| `push_subscriptions` | id, user_id, endpoint, keys_encrypted, created_at | Secure lifecycle |
| `reports` | id, reporter_id, reported_user_id, letter_id?, reason, status | Report-bound access |
| `moderation_actions` | id, actor_admin_id, target_id, action, reason, created_at | Append-only audit |
| `idempotency_keys` | user_id, key, operation, result_ref | Retry safety |

These are **logical** tables, not final SQL. Define exact columns, indexes, constraints, deletion policies and RLS during the database-design phase.

## 5. Core state machines
### Raven / mission
`available → outbound → returning → available`, with daily cooldown potentially keeping raven `resting` after return. Instant delivery skips outward travel time, not cooldown.

Do not use client-updated statuses as canonical. Prefer timestamps and transactional state changes. Ensure a raven has at most one active mission; enforce with unique/partial indexes or a lockable row.

### Letter
`draft → dispatched → delivered_inbox | delivered_request`, with additional recipient-side `opened`, `deleted`, and admin removal flags. **Important:** recipient read/delete state must not be visible to sender. Consider splitting sender-visible delivery status from recipient-private presentation status to prevent leakage.

### Moderation/block during flight
Recheck blocks and account eligibility at arrival. If blocked, mark mission undeliverable without exposing the reason; schedule return. Do not leak request/inbox placement.

## 6. Dispatch transaction (critical)
Inside a database transaction / narrow RPC:
1. Authenticate caller; verify sender and recipient IDs.
2. Check sender account standing, recipient existence, block constraints and request rate limits.
3. Validate format and size of letter payload.
4. Lock selected `user_ravens` row (`FOR UPDATE`).
5. Reject if active mission exists, return not completed, or `now() < last_dispatched_at + interval '24 hours'`.
6. Snapshot cities, raven speed/type and signet version.
7. Compute trusted distance/ETA on server using validated city centroids.
8. Create immutable letter and mission; set last-dispatch timestamp and active mission.
9. Commit; return only sender-appropriate mission details.
10. On retry, idempotency key returns original result rather than creating duplicate letter.

Use DB constraints and isolation tests; RLS alone is not sufficient for concurrency.

## 7. Geography and travel
- Start with a versioned, curated city dataset; validate country/city ambiguity and duplicate names.
- Calculate great-circle distance from city centroids using Haversine or equivalent.
- `duration_hours = distance_km / speed_kmh`, except Phantom Raven.
- Persist exact `arrival_at` and `return_at`; avoid recomputing after city changes.
- Route rendering: deterministic great-circle interpolation, including antimeridian handling; map display may differ from raw shortest-line geometry.
- Avoid claiming raven speeds are physically realistic.
- No third-party location permission until explicit user action; do not retain exact GPS data.

## 8. Delivery processing
A scheduled worker queries due missions in bounded batches:
- Lock due rows with `FOR UPDATE SKIP LOCKED` or equivalent transaction-safe claim.
- For outbound due: recheck block/account status; mark letter delivered to inbox/request according to **arrival-time** privacy state, or mark undeliverable; transition raven to returning.
- For returning due: complete mission, clear active mission; daily cooldown remains independently enforced.
- Insert notification event only after committed delivery.
- Use retry-safe idempotency, bounded attempts and operational metrics.
- Scheduled tasks can run late; store **scheduled arrival** separately from actual processing time. Never expose a recipient letter until a trusted transition has committed. Instant Phantom Raven dispatch may deliver atomically in the dispatch transaction, still with no pre-arrival signal.

**Open design question:** exact delivery timing tolerance and late-worker behavior. Prefer reliable server-side gating over strict second-level guarantees.

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
- Validate numeric bounds, stroke/page/point limits and serialized payload size both client- and server-side.
- Use vector replay for rendering; keep an accessible alternative if supplied.
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
1. Final table/RPC SQL and delivery processing design.
2. Scheduled-worker frequency and failure monitoring.
3. City dataset/licence, geographic coverage, and geolocation-to-city lookup.
4. Map renderer (SVG/Canvas vs MapLibre) and asset pipeline.
5. Push provider implementation and email provider/cost.
6. Handwriting data schema, caps, draft policy and accessibility.
7. Data retention, deletion, moderation and appeal policies.
8. Operational budgets, staging setup and monitoring.
