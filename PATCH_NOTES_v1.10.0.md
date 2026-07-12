# SmolLyfe v1.10.0

## What Changed
- Kept `+ Age` on the current route and added clearer year-advance confirmation when aging up away from Home.
- Added stronger orange milestone banners so age 5, 10, teen, and adult beats stand out more clearly.
- Locked infant social interaction flow to view-only. Babies can still inspect the Social tree, but active social actions are hidden in the interaction modal until they are older.
- Cleaned timeline filler language by removing the old `background character energy` fallback and replacing it with quieter empty-year copy only when a year was truly uneventful.
- Improved Social Health on Home so it now shows only the top 3 healthiest pillars, while `See all` still opens the full Social structure.
- Added guided social deep-linking from Suggested Actions. Social warnings now open the right relationship category and briefly highlight the relevant section or person.

## Path / Activities / Sports
- Rebuilt the main Path panel with cleaner section structure, stage-aware school naming, cleaner popularity formatting, and contextual activity verbs.
- Popularity now renders as a rounded percentage like `35%` instead of noisy decimal progress output.
- Added school sports support for Tennis and Wrestling.
- Added baseline sports guardrails:
  - female characters no longer receive football school options
  - team generation now respects player gender for school sports teammates
  - impossible multi-sport combinations continue to be blocked through the extracurricular rules
- Added Athleticism to the detailed profile stats so sports growth is actually visible.
- Reworked Activities so repeated actions still remain clickable, but the same activity only grants stat impact up to 3 times per age/year instead of hard-locking the whole route.

## Character Creation / UI Polish
- Polished the character creation surface:
  - `Identity` renamed to `Origin`
  - removed `Choose Origin`
  - tightened section spacing
  - made `Randomize Name`, `Customize`, and `Random Look` use a calmer, more consistent secondary treatment
  - made starting chapter buttons more uniform
- Added a compact route identity strip on deeper routes to keep the player name and cash visible while scrolling.
- Strengthened Social card hierarchy so the category label now reads more prominently than the status word.

## Baseline Architecture Notes
- Social deep-link guidance now uses a lightweight `focusTarget` object passed through route navigation.
- Activity anti-spam now uses per-activity yearly impact counts instead of a single route-level hard stop.
- Team/group baseline now covers Family, Romance, Friends, School, Team, Work, Clique, Band, and Choir without changing raw relationship storage.
- Timeline summaries remain derived at render time and raw history storage stays backward-compatible.

## Deferred
- No full downstream pro-athlete career build yet. This pass only adds baseline school-sport hooks and early NBA-direction guidance.
- No deeper romance-system expansion in this pass beyond preserving current groundwork.
- Older secondary panels outside the main feed/path/social shell may still benefit from another copy-and-spacing cleanup pass later.
