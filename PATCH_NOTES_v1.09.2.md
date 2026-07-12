# SmolLyfe v1.09.2
## Overview
- Replaced the old dark shared theme with a warm editorial token system.
- Moved shared UI surfaces onto centralized palette, spacing, radius, shadow, and type tokens.
- Cleaned visible separator mojibake in core feed/profile/relationship/modal surfaces.

## Changes
- Rewrote `src/styles/tokens.js` into a semantic theme object using:
  - `#304F6D`
  - `#899481`
  - `#E07D54`
  - `#FFE1A0`
  - `#E2F3FD`
  - `#E6E1DD`
- Refactored `src/styles/AppStyles.js` to consume tokens instead of hard-coded shared colors.
- Updated shared card, button, tab, modal, status bar, feed, route, and profile styles to the new light palette.
- Patched high-traffic UI components to remove visible `Â·` separator issues.
- Normalized status bar inline border color and character creation placeholder text to theme tokens.

## QA
- `node --check src/styles/tokens.js`
- `node --check src/styles/AppStyles.js`
- `node --check src/components/feed/LifeFeed.js`
- `node --check src/components/feed/ProfileHub.js`
- `node --check src/components/layout/StatusBars.js`
- `node --check src/components/panels/RelationshipsPanel.js`
- `node --check src/components/modals/InteractionModal.js`
- `node --check src/components/modals/BefriendResultModal.js`
- `node --check src/components/modals/CharCreationModal.js`

## Next
- Apply the same token cleanup to remaining modal/panel one-off colors.
- Add the reusable post-action result modal on top of this theme system.
