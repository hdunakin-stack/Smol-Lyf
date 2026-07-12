# SmolLyfe v1.09.7

Focused refinement pass based on the latest screen review.

## Updated

- Renamed the main progression route from `Career` to `Path` across the feed shell and route header.
- Replaced visible `Menu` labels with `Settings` and surfaced settings in the quick route chip rail.
- Added a lightweight back-stack so route `Back` now returns to the previous view, while occupation subpanels close one level at a time before leaving the route.
- Merged the top identity module and stats into one stronger hero/profile surface on the home feed and profile hub.
- Simplified recent timeline cards and full timeline cards:
  - `Open/Hide` now lives in a rounded top-right control
  - removed the bottom-right ellipsis affordance
  - removed redundant `+X more` footer copy
- Reworked the home social overview from granular relationship highlights into holistic `Family / Romance / Friends` health cards.
- Reworked the life-path area away from shallow `Current chapter` copy into stronger `Life path` and `Ongoing commitments` messaging.
- Removed `Age up` from suggested actions so recommendations stay contextual and story-aware.
- Simplified status bar semantics to mostly green/amber with cleaner metric-aware logic.
- Polished the `Friend Request Accepted` result modal with stronger hierarchy and cleaner reward messaging.
- Moved group visibility into Social by surfacing current clique/Greek life context and related members inside the relationships screen.
- Removed clique-signifying emojis from individual person cards in the main school/social surfaces that were touched in this pass.
- Rewrote school extracurricular copy to describe the immediate lived choice instead of exposing hidden destiny rails.
- Replaced `Little Sibling` generation with `Sibling` for cleaner relationship labeling going forward.
- Removed duplicate internal back-button patterns from the rebuilt activities and school surfaces touched in this pass.

## Compatibility

- No base life-sim loop or save flow was rewritten.
- Existing history storage remains backward-compatible.
- Existing relationship and appearance systems were preserved; this pass mainly changed presentation and navigation behavior.
