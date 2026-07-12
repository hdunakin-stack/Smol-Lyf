# SmolLyfe Patch Notes v1.09.8

## Focus
- Refined the feed-first shell without changing base save flow, age-up flow, or history storage compatibility.
- Strengthened timeline presentation, social grouping, post-action feedback, and stat readability.

## What Changed
- Added a derived yearly timeline summary layer on top of existing per-age history.
- Updated recent timeline and full timeline cards to lead with smarter annual recap copy instead of only raw event text.
- Simplified Suggested Actions to one strong CTA per card.
- Cleaned the horizontal chip rail to prioritize `Social`, `Occupation`, and `Activities`.
- Added infant-specific Life Path placeholder copy so early-life screens feel intentional.
- Reworked the Social route so `Family`, `Romance`, and `Friends` each own their expand/collapse behavior and reveal people directly underneath.
- Kept groups visible inside Social using existing clique/Greek-life data, without a breaking data migration.
- Added a reusable post-action result modal for interaction outcomes like spending time, asking for money, asking for help, dating attempts, compliments, gifts, insults, and arguments.
- Added lightweight romance groundwork metadata for future states like talking, FWB, committed, affair, and ex.
- Improved attribute bar contrast and simplified stat fill behavior so mid-state bars are easier to scan on light cards.
- Strengthened school transition history beats for elementary/primary, middle/secondary, and high school entry.
- Added more socially specific clique invitation flavor in the clique browser flow.
- Continued theme cleanup on Profile Hub and Social surfaces so embedded/stat areas feel less off-tone and more token-driven.

## Compatibility
- Existing plain-string history remains fully supported.
- Timeline summaries are derived at render time and do not rewrite stored history.
- Existing relationship objects still work; new romance metadata is additive.
- Existing route and back-stack behavior remain intact.

## QA
- `node --check` passed on all modified files.
