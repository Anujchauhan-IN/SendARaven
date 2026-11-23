# Codex Working Agreement — SendARaven

## Required reading
Before a task, read `docs/vision.md`, then the relevant parts of `docs/product.md`, `docs/design.md`, `docs/architecture.md` and `docs/roadmap.md`. The `reference-prototype/` is a **functional reference only**, not a final approved design.

## Authority
- User-approved product requirements outrank examples, fixture text, mockups and suggested defaults.
- `MUST` = core requirement; `SHOULD` = recommendation; `PROPOSED`/`OPEN` = not authorized as a binding requirement.
- If an unresolved choice affects security, delivery semantics, privacy or visual direction, ask before implementing.
- Do not claim user approval of any screen or feature unless explicitly given.

## Working style
- Prefer short, scoped tasks and minimal progress chatter.
- Inspect only relevant files; reuse components and avoid unrelated refactoring.
- Never add an unnecessary library, paid dependency or third-party service.
- Do not implement future phases without authorization.
- Android-first development and testing; do not assume desktop access.
- Test changed behavior, type-check and build at appropriate milestones.
- Include a short final summary: changed files, checks, limitations, next decision.

## Skill and visual verification workflow
- Before creating or substantially redesigning a UI screen, read and apply the `frontend-design` skill.
- After significant UI changes, use `web-design-guidelines` to review accessibility, usability and responsive behavior.
- Consult `astro-docs` for framework-level decisions involving Astro, React islands, TypeScript, Tailwind CSS or routing.
- Use the existing Playwright installation to test important interactions and inspect actual rendered screenshots.
- When responsive layouts change, test at approximately 360px, 390px and desktop widths.
- A successful build is not sufficient evidence of visual quality; inspect the rendered interface and screenshots.
- Preserve SendARaven's distinctive medieval material design and avoid generic dashboard components.
- Keep implementation tasks narrowly scoped and do not add unnecessary dependencies.
- Do not install additional skills or MCP servers unless explicitly authorized.

## Visual constraints
- Material realism: textured parchment, dark ink, aged wood, weathered stone, physical wax.
- Raven artwork and flight animation must be realistic, cohesive and naturally proportioned.
- The Raven Rookery should read as a medieval structure of stone and wood.
- No generic SaaS cards or plain beige textarea pretending to be parchment.
- Avoid excessive decorations and inconsistent illustration styles.
- Screenshot-test actual mobile and desktop rendering; user approves visual gates.
- Do not crop generated collage images into production components.

## Security invariants
- Recipient must not know a letter exists until delivered.
- Only sender can track a raven in flight.
- All letter access and dispatch/return/cooldown checks are server-side.
- Five ravens maximum; one dispatch per raven per rolling 24h; must return first.
- Blocked sender cannot deliver; check blocks again at arrival.
- No read/delete/request status leakage to sender.
- No service role keys or private notification secrets in browser code.
- Admin access is audited and restricted; private letters accessed for moderation only when properly reported.
- Signet uploads are strictly under 50 KB and safely normalized.

## Documentation
Update docs when decisions change. Record architecture decisions and rationale. Do not silently rewrite requirements to match easier implementation.

## First-run instruction
If the user has only asked you to familiarize yourself with the project, **do not modify files**. Summarize your understanding and questions first.
