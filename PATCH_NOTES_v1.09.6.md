# SmolLyfe v1.09.6

## Overview
- Focused enhancement pass for responsiveness, timeline UX, starting-stage creation, semantic stats, and shared UI hierarchy.

## Changes
- Added centralized helper layers for life stages, semantic stat tones, and backward-compatible history snapshots.
- Added `Timeline` route with expandable age-by-age history cards.
- Upgraded recent timeline cards with `See all`, chapter-style previews, and per-age open affordances.
- Added starting chapter selection to character creation:
  - Infant = 0
  - Child = 8
  - Teen = 15
  - Adult = 25
- Made appearance customization stage-aware without changing the saved appearance shape.
- Improved modal shells with shared scroll/body/footer structure for safer browser overflow behavior.
- Refined card tiers, button hierarchy, and floating age CTA dock layering.
- Updated status bars to use metric-aware semantic coloring.
- Cleaned visible player-facing copy in profile, assets, and appearance summaries.

## Compatibility
- Existing history stored as plain strings still renders through the new history adapter.
- Existing appearance object structure is preserved; the UI only filters visible controls by stage.
- Core aging flow, relationship logic, route structure, and save identity remain intact.

## QA
- `node --check` passed on all modified files.
