# SmolLyfe v1.09.0 - Feed UI Refactor

**Release Date**: March 30, 2026

## Overview

Shifted the app from a tab-first BitLife-style shell to a feed-first mobile layout.
Core simulation logic, event flow, and handlers were left intact.

## Changes

- Added a new vertical life feed with:
  - hero header
  - quick chips
  - live stats
  - active moments
  - suggested actions
  - relationship highlights
  - recent timeline
- Added a profile hub screen for deeper navigation.
- Kept dense legacy systems as drill-down routes:
  - career
  - social
  - activities
  - assets placeholder
- Kept existing event modals in place:
  - university
  - pregnancy
  - tryouts
  - job results
  - gigs
  - settings
  - all lives
- Added a frontend-only feed builder layer to map life state into UI cards.
- Re-skinned the visual system into a darker editorial mobile style.
- Moved the age-up CTA to a floating bottom action.
- Cleaned several visible UI text artifacts in the updated surfaces.

## QA

- `node --check src/App.js`
- `node --check src/components/feed/LifeFeed.js`
- `node --check src/components/feed/ProfileHub.js`
- `node --check src/utils/feed.js`
- `node --check src/components/panels/RelationshipsPanel.js`
- `node --check src/components/panels/ActivitiesPanel.js`
- `node --check src/components/layout/StatusBars.js`
- `node --check src/styles/AppStyles.js`

## Next

- Re-skin remaining legacy drill-down panels so their visual language fully matches the new feed shell.
- Run full Expo/Snack runtime QA once the app scaffold/runtime entry is available.
