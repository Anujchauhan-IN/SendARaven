# Product Specification
**Status:** Detailed requirements, with explicit unresolved decisions.  
**Priority labels:** MUST = agreed core; SHOULD = strong recommendation; PROPOSED = needs confirmation.  
**Never infer approval from a prototype or illustrative copy.**

## 1. Actors
- **Visitor:** Can view limited public information, not private letters or tracking.
- **Registered user:** Owns a Username, rookery, letters, settings, contacts, and friends.
- **Recipient:** User addressed by a sender.
- **Moderator/admin:** Restricted staff capability for reports, sanctions and abuse response; not ordinary private-letter browsing.

## 2. Authentication and onboarding
**MUST:** Email/password and Google OAuth. Each user has an immutable internal UUID and an immutable, case-insensitively unique public Username. Usernames are 3–24 lowercase Latin letters, digits or underscores and require reserved-name protections. A profile includes selected city, signet and preferences and may include an optional display name distinct from the Username. Email verification and OAuth callback handling must be secure.

**MUST:** Manual city search/selection or permission-based approximate location. Browser geolocation is optional, never mandatory. Convert permitted coordinates to a city and discard raw coordinates unless strictly needed transiently; store a stable city ID and geographic centroid. Explain that city may be visible as part of a flight route to correspondents.

**PROPOSED:** City change limits for active missions need a rule (recommended: mission snapshots keep origin/destination fixed).

## 3. Raven inventory
**MUST:** Up to five ravens per user; the planned initial set contains five different types:
| Type | Delivery speed | Notes |
|---|---:|---|
| Phantom Raven | Instant | Fictional special case |
| Swift Raven | 500 km/h | Fictional |
| Courier Raven | 250 km/h | Fictional |
| Wanderer Raven | 100 km/h | Fictional |
| Old Raven | 50 km/h | Fictional |

**MUST:** Each raven can dispatch **no more than once in any rolling 24-hour period** and cannot dispatch until its current mission, including the return leg, is complete. Server time and transactional locks decide eligibility. A raven may be available after 24 hours only if already returned; a long mission may exceed 24 hours.

**PROPOSED:** Everyone begins with one of each type; no breeding, buying, upgrading, or monetized speed boosts. The Phantom Raven delivers instantly but cannot dispatch again for 24 hours. Its return can be treated as instantaneous, with daily cooldown still applying.

**PROPOSED:** All other ravens fly home at their outward speed; time = route distance / speed for each leg. No weather, fatigue or terrain modifiers initially. Arrival and return timestamps are fixed at dispatch.

**MUST:** The Raven Rookery shows all five birds, individual status, next eligibility, and current mission where applicable. Bird choice at dispatch must not depend on frontend state alone.

## 4. Composing letters
**MUST:** Two modes:
- **Typed:** Normal editable Unicode text, rendered in a readable handwriting-style font on textured parchment. Save actual text; allow a readable-font accessibility view.
- **Handwritten:** Finger, stylus and mouse strokes recorded on a parchment surface; normalize coordinates, preserve page dimensions and ordered strokes, support undo/redo, eraser and multipage composition. Store a safe bounded stroke representation; do not use raster image as sole source.

**MUST:** No attachments, inline photos, voice clips or files in letters. User-uploaded **signet emblems** are a separate profile asset, not a letter attachment.

**MUST:** The editor should look like direct writing on parchment, not a boxed form. It must remain usable when Android's software keyboard is open; freehand mode must distinguish drawing from scrolling/zooming.

**PROPOSED:** Typed letters max 10,000 Unicode characters; handwritten max 5 pages with bounded points/strokes and payload size. Confirm these limits before implementation. Draft autosave locally or server-side is desirable but not yet agreed.

**SHOULD:** Plain-text alternative/transcription for handwritten letters to improve accessibility; do not fabricate transcriptions automatically.

## 5. Dispatch
**MUST:** The composer recipient field is labelled `Address your letter to…` and accepts the recipient's Username. The sender composes the letter, chooses an eligible raven, and dispatches. Backend validates authenticated identity, recipient existence, blocked relationships, content limits, raven availability, recipient rules, and location availability. A raven is exclusively the carrier, never the recipient's identity.

**MUST:** Dispatch is atomic: create letter/mission, snapshot sender/recipient city and seal design, reserve raven, and set timestamps together. Idempotency key prevents duplicate dispatch on retries. Do not consume a raven on failed dispatch.

**MUST:** A blocked sender cannot dispatch to that recipient. When a block occurs during flight, the letter must not be delivered to that recipient; use a privacy-preserving failure state and return the raven.

**PROPOSED:** No recall after dispatch. Failure/return behavior for deleted recipient accounts or moderation sanctions must be specified before backend work.

## 6. Journey calculation and tracking
**MUST:** Sender-only access to active mission, raven position and ETA. Recipient must see no pending message, notification, count, flight marker or existence of letter until delivery.

**MUST:** Travel time derives from a geographic distance and the selected raven speed; Phantom Raven is immediate. Map should show geographically accurate coastlines in historical styling, and label **only origin and destination cities** for the selected flight. No modern road networks, political borders or incidental place labels.

**SHOULD:** Great-circle distance from city centroids, with deterministic interpolated route points. Position is derived from immutable timestamps; no always-on simulation. On refresh, position is recomputed. Return leg is visible to sender as raven returning.

**PROPOSED:** A minimal nonzero duration for non-instant local/city-to-same-city journeys to avoid zero-time travel. Decide exact minimum before implementation.

## 7. Arrival and privacy
**MUST:** No advance notice to recipient. Delivery occurs at scheduled arrival, not when sender clicks dispatch. Before arrival, recipient-side queries, counts, subscriptions, notifications, and API responses must reveal nothing.

**MUST:** Letter is classified on arrival according to recipient rules, not by showing it early. Known contacts/friends may route to inbox; unknown senders may route to **Letter Requests**.

**MUST:** For Contacts Only, a non-contact's letter still travels and arrives as a request; the recipient may read, delete or block. Reading does not automatically add the sender to contacts or friends. Delete does not automatically block.

**MUST:** No 'Nobody' setting. Blocking is available and overrides normal delivery.

**PROPOSED privacy UI:** `Everyone`, `Contacts Only`, `Friends Only`. In Everyone, all nonblocked letters enter inbox; in Contacts Only, saved contacts enter inbox and others enter requests; in Friends Only, friends enter inbox and others enter requests. A separate `Message Requests` option was discussed but overlaps with Contacts Only; **do not implement a fourth mode without confirmation**.

**MUST:** The sender can learn delivered/failed status, not read/open/delete/request status. No read receipts by default. A request is still 'delivered' from the sender's perspective.

**PROPOSED:** When recipient changes privacy setting midflight, classify at arrival; if they block sender, suppress delivery. Exact handling of contact removal after arrival needs a rule.

## 8. Contacts, friends and blocks
**MUST:** Contacts are unilateral saved accounts addressed by Username, with an optional private nickname; saving does not require approval and does not override the recipient's rules. Relationships continue to bind immutable account UUIDs internally.
**MUST:** Friends require mutual acceptance; support send, accept, decline and cancel request.
**MUST:** Block by immutable account UUID, not Username or optional display name; block prevents new letters and friendship interactions; report/block options from letters and requests.
**SHOULD:** Rate limit requests and avoid account-enumeration leaks.

## 9. Receiving and replying
**MUST:** Delivered letters appear as sealed folded parchment with sender's signet. User opens a letter to read typed text or original handwritten strokes. Wax-breaking/unfolding animation is a visual enhancement, not a security mechanism.
**MUST:** Letter Requests offer read, delete, block. Inbox allows read, delete and reply. Reply is a **new dispatch** requiring an eligible raven, not an instant chat response.
**PROPOSED:** 'Accept sender' could add contact, but must be explicit and separate from reading.

## 10. Signet system
**MUST:** Unique personal signet with Username/initials and emblem; users may upload a custom emblem **strictly under 50 KB**. Emblem types: safe raster PNG/WebP; no SVG/HTML uploads from users. Validate signature, dimensions, decompression limits and content server-side, normalize/re-encode and render monochrome relief preview.
**MUST:** Store signet snapshot or immutable version reference with each dispatched letter, so historical seals do not change retroactively.
**PROPOSED:** Initials-only fallback; Username truncated or initials used if ring text is too long; limited wax palette.

## 11. Notifications
**MUST:** Browser notification only after delivery, with explicit user permission and no message contents in notification body by default. In-app inbox updates also only after delivery.
**SHOULD:** Email notification if a low-cost, compliant provider is available; opt-in, rate-limited, no private content. Email sending is not assumed free/unlimited.
**MUST:** Notification failure must not undo a delivered letter; retry safely.

## 12. Safety, moderation and administration
**MUST:** Report sender/letter; block; admin can suspend/ban abusive accounts and remove abusive content. Admin auth and authorization separated from ordinary users, audit all sanctions, never trust a frontend 'admin' flag.
**MUST:** Private letters not routinely exposed to admins. A report explicitly supplies the relevant letter or excerpt for review with minimal necessary access.
**SHOULD:** Rate limits, spam prevention, abuse case management, appeals policy, retention policy, account deletion workflow, and anti-impersonation measures before launch.
**OPEN:** Content rules, retention periods, report categories, appeals, legal notices and age policy require explicit approval.

## 13. Screen inventory
1. Landing/intro and authentication
2. Onboarding: Username, city, signet
3. Raven Rookery (five slots and statuses)
4. Compose: recipient, typed/freehand parchment, raven selection, seal/dispatch
5. Sender flight tracking map
6. Inbox and letter reading
7. Letter Requests
8. Contacts, friends, friend requests, blocked users
9. Profile, signet editor, privacy, notification settings
10. Administrator report queue and account actions
11. Error, empty, loading and offline states

## 14. Functional acceptance scenarios
1. Two users register with distinct Usernames; duplicates fail case-insensitively.
2. User dispatches using eligible Swift Raven; cannot dispatch Swift Raven again during outbound, return or 24-hour window.
3. Two concurrent dispatch requests for one raven yield exactly one successful mission.
4. Recipient's API responses, unread counts, subscriptions and notifications reveal no inbound letter before arrival.
5. At arrival, stranger's letter appears in requests under Contacts Only; contact's letter appears in inbox.
6. Recipient can read a request without becoming a contact; delete without blocking; block prevents later dispatch.
7. Sender sees delivery, not request/read/deletion details.
8. Sender's map computes position from timestamps; refresh does not restart journey.
9. User changes signet; old letter retains old seal.
10. Handwritten letter remains legible on another device size; typed text remains selectable.
11. Reporting makes selected content available to authorized moderation only; other private letters remain inaccessible.
12. Block during flight suppresses delivery and resolves raven mission safely.
13. Failed notification does not lose a delivered letter.
14. Phantom Raven is instant but cannot be reused within the daily cooldown.

## 15. Explicit open decisions
- Typed character cap, handwriting page/point limits, and drafts.
- Exact privacy labels and whether a fourth 'Requests' mode exists.
- Minimum flight time for same-city dispatch.
- Phantom Raven return behavior and whether users can name individual birds.
- Account deletion, moderation retention and appeal policy.
- Notification service and whether email is opt-in.
- User-facing delivery failures and whether sent letters can be archived.
- City directory data source and update strategy.
- Real-world clock behavior: fixed 24-hour rolling cooldown is recommended over local calendar days.

Record decisions here before implementing the affected module.
