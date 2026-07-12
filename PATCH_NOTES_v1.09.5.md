# SmolLyfe v1.09.5

## Overview
- Mobile stability pass.
- Fixed duplicate save creation on age-up.
- Tightened phone-safe layout, modal containment, early-life route gating, and feed rhythm.

## Changes
- Added stable `lifeId` creation and storage matching in [src/core/gameState.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/core/gameState.js) and [src/utils/storage.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/utils/storage.js).
- Migrated save/select/delete flows to use `lifeId` in [src/App.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/App.js) and [src/components/modals/AllLivesModal.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/components/modals/AllLivesModal.js).
- Centralized route availability and infant/toddler gating in [src/utils/feed.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/utils/feed.js).
- Hid early impossible routes from the chip rail and suggested actions in [src/components/feed/LifeFeed.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/components/feed/LifeFeed.js).
- Added horizontal chip affordance and normalized timeline card rhythm in [src/components/feed/LifeFeed.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/components/feed/LifeFeed.js) and [src/utils/feed.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/utils/feed.js).
- Rebuilt character creation/customization modal containment for phone in [src/components/modals/CharCreationModal.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/components/modals/CharCreationModal.js) and [src/components/modals/CharacterCustomizationModal.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/components/modals/CharacterCustomizationModal.js).
- Strengthened shared overlay, spacing, and safe-area layout rules in [src/styles/AppStyles.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/styles/AppStyles.js) and [src/styles/tokens.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/styles/tokens.js).
- Added defensive activity locking for early-life stages in [src/components/panels/ActivitiesPanel.js](/C:/Users/Hailey/Desktop/SmolLyfe_Game_Dev/src/components/panels/ActivitiesPanel.js).

## QA
- Passed `node --check` on all modified files.
- Re-checked for route-gating hooks, `lifeId` wiring, and remaining mojibake in touched UI files.

## Next
- Test on Expo/Snack iPhone and Android viewports.
- Verify save replacement, chip visibility by age, character customization scroll, and route header safe-area spacing.
