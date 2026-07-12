## SmolLyfe v1.10.3

- refactored the remaining school and extracurricular detail panels onto the shared accordion, card, and inline-metric shells
- cleaned up supporting school/work modals including freelance gigs, extracurricular entry, tryouts, college recruitment, and clique browsing so they match the current shell language more closely
- expanded NPC prompt coverage again with group-pressure and manager-pressure scenarios while keeping the same lightweight payload/history contract
- removed a few more brittle legacy patterns like ad hoc nested wrappers, noisy current-clique markers, and older modal action spacing

### Intentionally deferred

- a broader review of lower-traffic legacy modals like pregnancy and massage is still available for a later polish pass
- the NPC prompt framework is still intentionally incremental rather than a full social/identity rewrite
