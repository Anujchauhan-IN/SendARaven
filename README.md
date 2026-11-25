# SendARaven

**Intended domain:** [sendaraven.in](https://sendaraven.in)

A medieval-inspired, real user-to-user correspondence application built around handwritten or typed parchment letters, personal wax signets, and virtual carrier ravens with travel time and limited availability.

## Current status
**Application foundation and letter-writing visual proof.** The repository now contains an Astro application with a React letter-editor island, strict TypeScript, Tailwind CSS v4, Vitest and Playwright. The included `reference-prototype/` remains a frontend-only reference and **not** an approved final design. No production backend, authentication, real messaging or notifications exist.

## Read first
1. [`docs/vision.md`](docs/vision.md) — product intent and experience
2. [`docs/product.md`](docs/product.md) — agreed rules and open decisions
3. [`docs/design.md`](docs/design.md) — visual direction and review criteria
4. [`docs/architecture.md`](docs/architecture.md) — proposed technical approach
5. [`docs/roadmap.md`](docs/roadmap.md) — phased plan and acceptance gates
6. [`docs/database-workflow.md`](docs/database-workflow.md) — migration CI, hosted deployment setup and recovery
7. [`AGENTS.md`](AGENTS.md) — Codex operating instructions

## Reference prototype
Open `reference-prototype/index.html` in a static file preview, or from the `reference-prototype` directory run:

```sh
python -m http.server 8000
```

Then visit `http://127.0.0.1:8000`. The prototype uses fixture raven states and has no real dispatch.

## Application commands
```sh
npm install
npm run dev
npm run check
npm test
npm run build
npm run test:e2e
```

The frontend foundation uses Astro, React islands, strict TypeScript and Tailwind CSS v4. Phase 3A includes Git-tracked Supabase migrations and database tests, verified through GitHub Actions; authentication UI, persistence flows, dispatch and scheduled delivery are not implemented.

## Starting with Codex
Open this directory in your editor and ask Codex to read `AGENTS.md` and `docs/*.md`, inspect the reference prototype, and report its understanding **without coding**. Resolve important open decisions and approve the first visual screen before implementation.

## Copyright and assets
No third-party franchise insignia are authorized. Concept images are mood references, not licensed production assets. Track licenses and provenance of any final art and fonts.
