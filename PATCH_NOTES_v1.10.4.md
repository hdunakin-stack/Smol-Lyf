## SmolLyfe v1.10.4

- Replaced the `Assets` placeholder with a real baseline route that derives cash, active income, obligations, financial story copy, and recent work archive from existing life data.
- Brought `PregnancyModal`, `MassageModal`, and `AllLivesModal` onto the current shared modal rhythm with cleaner hierarchy, spacing, and button priorities.
- Added lightweight assets helpers without changing save shape, money mechanics, or raw history storage.
- Tightened life-card spacing in the archive modal so metadata and delete actions feel less cramped.

### QA

- `node --check` passed for all modified JS files in this pass.

### Still Deferred

- Broader finance simulation remains intentionally out of scope: no ledgers, budgeting, savings goals, or asset ownership systems yet.
- Other low-traffic legacy surfaces outside this exact modal/assets slice may still need future shell cleanup if they appear inconsistent during broader playtesting.
