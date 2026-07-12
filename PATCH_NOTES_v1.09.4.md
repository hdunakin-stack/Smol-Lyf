# SmolLyfe v1.09.4
## Overview
- Added shared responsive guardrails for layout, spacing, and modal sizing.
- Tightened screen-width behavior so feed, route, and modal surfaces stay centered and readable across phone, tablet, and larger displays.
- Cleaned a final set of spacing and payload shell inconsistencies without touching gameplay logic.

## Changes
- Added shared layout caps in `src/styles/AppStyles.js` for:
  - screen content max width
  - feed content max width
  - hero width
  - start screen width
  - standard modal max width
  - wide modal max width
- Updated shared shells so feed, route headers, route content, scroll content, and modal containers use those guardrails.
- Improved payload layering by keeping all modals on the stronger shared overlay and centered shared container styles.
- Added footer separation to customization actions so the action row reads as its own stable control zone.
- Removed leftover component-level width overrides in:
  - `src/components/modals/CollegeRecruitmentModal.js`
  - `src/components/modals/GreekLifeModal.js`
  - `src/components/modals/PregnancyModal.js`
  - `src/components/modals/CharacterCustomizationModal.js`
- Cleaned `src/components/modals/AllLivesModal.js` so the modal shell and copy align with the current responsive system.

## QA
- `node --check` passed on all modified files
- Verified no remaining broken `Â·` / `â†` strings inside `src`

## Next
- If needed, the next UI pass should focus purely on responsive behavior inside older dense panels with heavy nested accordions, not on theme primitives.
