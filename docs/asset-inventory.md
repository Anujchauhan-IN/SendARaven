# Asset Inventory

**Status:** Phase 0 inventory of files currently under `public/assets/`. Unknown source/licence information is explicitly unresolved. No asset listed as provisional is production-approved.

## Approval labels

- **Placeholder:** functional proof only; replacement expected.
- **Provisional:** may be used during development but lacks final provenance and/or visual approval.
- **Approved:** licensed, optimized and explicitly approved for production. No current visual asset has this status.

## Current assets

| Asset | Format | Dimensions | Size | Recorded source | Licence status | Intended use | Approval status |
|---|---:|---:|---:|---|---|---|---|
| `textures/parchment-portrait.svg` | SVG | viewBox 900×1200 | 2,819 B | Original project procedural placeholder; author/date not recorded | Project ownership/licence record incomplete | Composer parchment background and subtle page texture | **Placeholder** |
| `ravens/file_00000000877c8211a7aa196e8191c53b.png` | PNG RGBA | 1312×1199 | 1,212,845 B | Unknown | Unknown; must be resolved before production | Phantom Raven source image | **Provisional** |
| `ravens/file_00000000ad188211bca1bed0f7f7a36f.png` | PNG RGBA | 1312×1199 | 1,360,017 B | Unknown | Unknown; must be resolved before production | Swift Raven source image | **Provisional** |
| `ravens/file_000000006f0c821198a0cf569f89b094.png` | PNG RGBA | 1312×1199 | 1,233,660 B | Unknown | Unknown; must be resolved before production | Courier Raven source image | **Provisional** |
| `ravens/file_00000000a96c8211aee8428de84699b9.png` | PNG RGBA | 1312×1199 | 1,236,611 B | Unknown | Unknown; must be resolved before production | Wanderer Raven source image | **Provisional** |
| `ravens/file_00000000c7e88211b4c41cfde5562314.png` | PNG RGBA | 1312×1199 | 1,492,298 B | Unknown | Unknown; must be resolved before production | Old Raven source image | **Provisional** |
| `ravens/web/phantom-raven.webp` | WebP alpha | 800×731 | 87,358 B | Derived from corresponding PNG; conversion author/tool/date unknown | Inherits unresolved source licence | Responsive Phantom Raven fixture | **Provisional** |
| `ravens/web/swift-raven.webp` | WebP alpha | 800×731 | 98,942 B | Derived from corresponding PNG; conversion author/tool/date unknown | Inherits unresolved source licence | Responsive Swift Raven fixture; currently not rendered while away | **Provisional** |
| `ravens/web/courier-raven.webp` | WebP alpha | 800×731 | 84,124 B | Derived from corresponding PNG; conversion author/tool/date unknown | Inherits unresolved source licence | Responsive Courier Raven fixture | **Provisional** |
| `ravens/web/wanderer-raven.webp` | WebP alpha | 800×731 | 84,946 B | Derived from corresponding PNG; conversion author/tool/date unknown | Inherits unresolved source licence | Responsive Wanderer Raven fixture | **Provisional** |
| `ravens/web/old-raven.webp` | WebP alpha | 800×731 | 106,318 B | Derived from corresponding PNG; conversion author/tool/date unknown | Inherits unresolved source licence | Responsive Old Raven fixture | **Provisional** |

`public/assets/README.md` is asset documentation, not a production visual asset.

## Missing production asset families

No tracked production-approved files currently exist for interface parchment variants, envelope/folds, wax seal bases/masks, fonts, medieval rookery structure, map/coastline styling, raven flight frames, arrival motion or favicon.

## Required metadata before production approval

For every retained or replacement asset, record:

1. Human-readable filename and asset family.
2. Original creator/source and creation or acquisition date.
3. Licence text or documented project ownership and permitted uses.
4. Original and responsive dimensions, formats, compression settings and byte sizes.
5. Intended component/state and whether the asset is decorative or meaningful.
6. Accessibility treatment, including alternative text or assistive-technology hiding.
7. Performance budget and responsive variants.
8. Explicit visual approval date/reference.

Unknown-source raven files must not ship to production until provenance and licensing are resolved or they are replaced with approved assets.
