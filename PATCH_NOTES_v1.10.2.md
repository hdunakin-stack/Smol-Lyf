## SmolLyfe v1.10.2

- refactored legacy Occupation surfaces onto the newer shell language across full-time work, part-time jobs, coworkers, detective cases, special careers, job-result feedback, and Greek life
- removed older emoji-led work UI and prototype-style `Career Path` copy in favor of cleaner progression language and shared section/card structure
- expanded the reusable NPC prompt system into multiple prompt families for school pressure, personal questions, team culture, coworker boundaries, and attraction ambiguity
- kept prompt outcomes lightweight and compatible by writing normal raw-history strings while returning the existing shared payload result shape
- added compatibility-safe prompt state tracking so prompts can throttle by age without changing raw history storage
- cleaned up lingering Occupation route behavior so related work/group flows no longer kick the player back to Home during normal use
- aligned coworker and job-management UI more closely with the shared inline metric, card, and button hierarchy already used elsewhere in the shell

### Architecture notes

- NPC prompts now use a small shared prompt object: `id`, `category`, `context`, `title`, `person`, `question`, and `choices`
- prompt resolution still returns `{ updated, actionResult }` so it plugs straight into the existing post-event payload system
- prompt sources are chosen dynamically from current school, team, work, and socially linked pools instead of one flat catch-all picker

### Intentionally deferred

- deeper specialty-work panels outside this pass may still need another copy polish sweep later
- the NPC prompt system is still intentionally lightweight and does not attempt a full romance or identity-system rewrite
