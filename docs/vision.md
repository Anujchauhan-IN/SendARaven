# SendARaven — Vision
**Status:** Product vision approved in principle; visual design is NOT final.  
**Document role:** Why the product exists and the experience it must deliver.  
**Source of truth:** User decisions in planning discussions, 22 November 2026.

## One-sentence premise
A real person writes a letter on parchment, seals it with their own signet, chooses one of five ravens, and sends it to another person; only the sender watches the journey, while the recipient discovers the letter on arrival.

## Experience promise
SendARaven is a **real user-to-user correspondence platform**, not a chat reskin, fantasy role-playing game, or static illustration. Deliberate travel time, limited raven availability, handwritten letters, physical-looking seals, and the surprise of delivery make correspondence feel personal.

### Pillars
1. **Anticipation:** No incoming-flight hints for recipients. A letter is unknown until delivered.
2. **Tactility:** Real-looking paper, ink, wood, and wax; the writing surface is the parchment itself.
3. **Personal identity:** Raven ID and custom signet, not generic profile-picture chat bubbles.
4. **Meaningful constraints:** Five ravens maximum; each dispatches at most once per rolling 24 hours and must return before reuse.
5. **Privacy by design:** Only city-level journey locations; letter access and privacy enforced on the server.
6. **Accessible craft:** Visually evocative, but fast and usable on Android, desktop, keyboard, touch and assistive technology.

## The emotional arc
**Open rookery → choose correspondent → compose (type or handwrite) → choose raven → seal → dispatch → sender watches the map → raven arrives without advance notice → recipient discovers sealed letter or request → opens/reads/replies or deletes/blocks.**

The interface should evoke a grounded, lived-in medieval correspondence world, loosely in the spirit of historical fantasy such as *Game of Thrones*, without copying any franchise insignia or art. Avoid ornate medieval decoration for its own sake.

## What this product is not
- Not a WhatsApp clone with brown backgrounds.
- Not a real-time chat, with typing indicators, presence, chat bubbles or automatic read receipts.
- Not a social feed, marketplace, file-sharing tool, or attachments platform.
- Not an excuse for AI-generated decoration that reduces clarity.
- Not a throwaway MVP: aim for a complete, tested, production-quality experience before public release.

## Audience and usage
People who enjoy slow, expressive, personal correspondence. Mobile-first and international. A small engaged community is acceptable; optimize for quality of interaction, not addictive notifications or infinite engagement.

## Quality bar
A screen is **not complete** merely because it compiles. It must meet product behavior, security, accessibility, mobile ergonomics, asset consistency, and screenshot-based visual review. The existing HTML prototype is a **starting point, not final design approval**.

## Product decisions vs proposals
Approved decisions are documented in `product.md`. Suggested defaults must be labeled **PROPOSED** until confirmed. Do not silently promote proposals to requirements.

## Success criteria
- A new user can sign in, select a city, personalize a seal, and understand their rookery.
- Two real accounts can send, receive, and reply to text-only letters.
- Sender-only tracking and arrival secrecy hold even under direct API/database access.
- Dispatch/return/daily constraints cannot be bypassed by concurrent requests.
- Handwriting is usable on touch devices and accessible alternatives exist.
- Recipient can handle unsolicited requests safely.
- The product has a coherent medieval material identity across mobile and desktop.
