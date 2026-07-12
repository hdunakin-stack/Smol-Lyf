# SmolLyfe v1.09.1 - UI Polish Pass

**Release Date**: March 30, 2026

## Overview

Polished the new feed-first mobile UI without changing core game logic.
This pass focused on hierarchy, consistency, readability, and interaction feel.

## Changes

- Reordered the home feed:
  - live stats
  - recent timeline
  - relationship highlights
  - active moments
  - suggested actions
- Reduced the size and visual weight of the floating age CTA.
- Reworked suggested actions into stat-aware coaching cards.
- Simplified the profile hub so deep views read like destinations instead of a button wall.
- Standardized primary, secondary, and destructive button treatments.
- Tightened card spacing, radii, borders, and text hierarchy across the feed and profile surfaces.
- Improved settings and interaction modals for cleaner button hierarchy.
- Rebuilt the character creation and customization presentation so tabs, scroll areas, and footer actions feel more stable.
- Cleaned the part-time jobs presentation and removed duplicate-prop issues from that panel.

## QA

- `node --check src/components/feed/LifeFeed.js`
- `node --check src/components/feed/ProfileHub.js`
- `node --check src/utils/feed.js`
- `node --check src/components/modals/CharCreationModal.js`
- `node --check src/components/modals/CharacterCustomizationModal.js`
- `node --check src/components/modals/SettingsModal.js`
- `node --check src/components/modals/InteractionModal.js`
- `node --check src/components/panels/PartTimeJobsPanel.js`
- `node --check src/styles/AppStyles.js`

## Next

- Polish the remaining legacy drill-down panels, especially the full occupation screen, so the older surfaces fully match the new shell.
- Clean Expo lint/import warnings in the imported project copy separately from the local workspace polish work.
