# SmolLyfe Patch Notes v1.09.9

- Kept `+ Age` route-sticky. Aging up now preserves the current screen instead of forcing the player back to Home.
- Added a reusable in-app milestone banner layer for age beats like age 5, age 10, teenager, and adult transitions.
- Expanded the shared post-event payload flow beyond relationships. Activities, tryouts, clique moves, and key school actions can now surface immediate response payloads through the same result shell.
- Cleaned timeline recap rules. Age summaries now render only for completed years, and expanded timeline cards reveal more raw history instead of repeating preview content.
- Reworked Life Path into a single guidance module. The old Ongoing Commitments card was removed, and the new guidance now derives from school, work, extracurriculars, stress, and relationship momentum.
- Added dynamic social pillar groundwork. Social health and the Social route can now surface extra domains like School, Team, Work, Clique, Band, or Choir when the current life actually belongs to them.
- Tightened interaction anti-spam on extracurricular actions with shared same-year action caps and neutral feedback when the player pushes the same move too far.
- Polished the All Lives modal spacing and brought the Close control back onto token-driven button styling.
- Cleaned the Activities accordion labels and added stronger path-aware action language groundwork through extracurricular detail flows and activity payload copy.

## Architecture Notes

- Universal payload system:
  Domain handlers can now return `{ updated, actionResult }`. `App.js` routes all of those through the shared `ActionResultModal`, so more domains can opt in without creating one-off result modals.
- Dynamic social pillars:
  Feed and Social now derive extra pillars from current life state. Family, Romance, and Friends remain the base set, then School, Team, Work, Clique, Band, or Choir can layer in only when relevant data exists.
- Life Path guidance:
  The Life Path card now derives its summary and support text from recent conditions like extracurricular membership, school strength, relationship strain, work pressure, and stress level instead of acting like a static placeholder.

## Deferred

- Dynamic NPC identity/social prompt modal system: groundwork is still intentionally deferred to a later pass so it can land cleanly instead of as a one-off event hack.
- Broader path-specific verb cleanup inside older legacy `OccupationPanel` sections still needs a dedicated cleanup pass.
