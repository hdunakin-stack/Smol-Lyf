# SmolLyfe Development Roadmap
**Last Updated**: 11.11.2025
**Current Version**: v1.00.11
**Target Version**: v1.10.0 "Systems Awakening"

---

## 📋 **PHASE 4: Quality of Life & Polish (v1.01.0)**
**Timeline**: 1-2 days
**Focus**: Small UX improvements and feedback systems

### Features:
✅ **Befriend Feedback System**
- Modal popup for befriend success/failure
- Dynamic messaging based on bond level and stats
- "[NPC] didn't find you interesting and declined your follow request."
- "[NPC] said they wanted to be friends! We're friends now!"
- Redirect back to previous view after interaction

✅ **UI Consistency Pass**
- Unify progress-bar and stat-bar components into shared StatusBars.js submodule
- Ensure color and hierarchy consistency across all panels
- Code cleanup and DRY principles

### Technical Changes:
- `src/domains/relationships.js` - Add befriend outcome logic
- `src/components/modals/BefriendResultModal.js` (NEW)
- `src/components/shared/ProgressBar.js` (NEW - unified component)
- `src/App.js` - Wire befriend result modal

### Testing Checklist:
- [ ] Befriend modal appears with correct messaging
- [ ] Redirect works properly after befriend attempt
- [ ] Progress bars consistent across all panels

---

## 🏢 **PHASE 5A: Workplace Ecosystem (v1.02.0)**
**Timeline**: 3-4 days
**Focus**: Make careers social and alive

### Features:
✅ **Coworker Generation System**
- Spawn 3-6 NPCs tagged as "Coworker" when starting a job
- Attributes: morale, gossip level, rivalry, mentorship potential
- Different personalities: Mentor, Rival, Neutral, Friend
- Update on job tier promotion (new coworkers at higher levels)

✅ **Manager Quality System**
- Random manager quality on job start: Poor (20%), Average (60%), Excellent (20%)
- Affects promotion success rate: Poor (-15%), Average (0%), Excellent (+15%)
- Affects stress gain: Poor (+20%), Average (0%), Excellent (-10%)

✅ **Workplace Events** (5 events)
- `WORK_GOSSIP_01` - Promotion rumors
- `WORK_ROMANCE_02` - Office romance opportunity
- `WORK_MENTOR_03` - Mentorship offer
- `WORK_CONTROVERSY_04` - Manager takes credit
- `WORK_RETREAT_05` - Company retreat

### Technical Changes:
- `src/domains/coworkers.js` (NEW) - Coworker generation & management
- `src/domains/fullTimeJobs.js` - Add manager quality, integrate coworkers
- `src/domains/events/workplaceEvents.js` (NEW) - Event definitions
- `src/components/panels/CoworkerPanel.js` (NEW) - View coworkers
- Add "Coworkers" button to FullTimeJobsPanel

### Data Structure:
```javascript
life.fullTimeJob = {
  ...existingFields,
  manager: {
    quality: "excellent", // poor, average, excellent
    bond: 50
  },
  coworkers: [
    { id, firstName, lastName, bond, personality, morale }
  ]
}
```

---

## 🎭 **PHASE 5B: Cliques → Adult Networks (v1.03.0)**
**Timeline**: 2-3 days
**Focus**: Extend school cliques into adult life

### Features:
✅ **Network Origin Tags**
- Tag all classmates with "classmate_{clique}" (e.g., "classmate_popular")
- Persist after graduation in relationships
- Used for reunion and reconnection events

✅ **Alumni & Reunion Events** (5 events)
- `CLQ_REUNION_01` - Reunion invitation (age 25+)
- `CLQ_MANAGER_02` - Old friend is now talent manager
- `CLQ_RIVAL_03` - Rival gets promoted before you
- `CLQ_ROMANCE_04` - Rekindle romance at reunion
- `CLQ_NOSTALGIA_05` - Scroll through old photos

✅ **Network Influence Mechanic**
- Fame/wealth spreads 10% faster with connected NPCs from same clique
- Old popular friends boost your social opportunities
- Old nerd friends boost career opportunities in tech/academia

### Technical Changes:
- `src/core/npc.js` - Add network origin tagging
- `src/domains/cliques.js` - Add adult network functions
- `src/domains/events/cliqueEvents.js` (NEW) - Event definitions
- `src/domains/relationships.js` - Integrate network bonuses

---

## 🌟 **PHASE 6: Fame & Public Image (v1.04.0)**
**Timeline**: 4-5 days
**Focus**: Make fame a social environment

### Features:
✅ **Reputation Meter**
- New attribute: `reputation` (0-100, starts at 50)
- Affected by: scandals, charity, crime, media coverage
- Displayed on status bar for famous characters (Fame > 40)

✅ **Media Events** (5 events)
- `FAME_INTERVIEW_01` - Magazine interview
- `FAME_SCANDAL_02` - Leaked footage/scandal
- `FAME_CHARITY_03` - Charity gala invitation
- `FAME_TALKSHOW_04` - Talk show appearance
- `FAME_FAN_05` - Obsessed fan encounter

✅ **PR Decision System**
- Modal choices for scandal response: "Apologize" vs "Defend"
- Charity event: Accept (cost money, gain reputation) vs Decline
- Interview questions with multiple response options

✅ **Fan & Critic NPCs**
- Light-weight "Fan" relationships (don't clutter main relationship list)
- Influence fame velocity: +5% per 10 fans, -5% per 10 critics
- Random fan interactions at high fame levels

### Technical Changes:
- `src/core/gameState.js` - Add `reputation` attribute
- `src/domains/fame.js` - Expand fame mechanics
- `src/domains/events/fameEvents.js` (NEW) - Event definitions
- `src/components/modals/PRDecisionModal.js` (NEW)
- Update StatusBars to show reputation for famous characters

### Data Structure:
```javascript
life.reputation = 50; // 0-100
life.fans = []; // Array of lightweight fan objects
life.critics = []; // Array of lightweight critic objects
life.mediaHistory = []; // Track scandals, interviews, etc.
```

---

## 💰 **PHASE 7: Economic & Asset System (v1.05.0)**
**Timeline**: 3-4 days
**Focus**: Wealth management and investments

### Features:
✅ **Asset Tracking**
- New attribute: `netWorth` (calculated from money + assets)
- Asset types: Real Estate, Vehicles, Investments, Business Equity

✅ **Investment Events** (5 events)
- `ASSET_INVEST_01` - Tech startup investment
- `ASSET_CRYPTO_02` - Cryptocurrency gamble
- `ASSET_FLIP_03` - Property flip opportunity
- `ASSET_PARTNER_04` - Spouse business venture
- `ASSET_TAX_05` - IRS audit (high net worth)

✅ **Passive Income System**
- Real estate generates monthly rent
- Businesses generate variable monthly income
- Investments have yearly returns (can be negative)

✅ **Asset Management Panel**
- View all owned assets
- Sell assets for cash
- Track ROI and performance

### Technical Changes:
- `src/domains/assets.js` (NEW) - Asset management system
- `src/domains/events/assetEvents.js` (NEW) - Event definitions
- `src/components/panels/AssetsPanel.js` (NEW)
- Update handleAgeUp to process passive income

### Data Structure:
```javascript
life.assets = [
  {
    id,
    type: "realEstate", // or "vehicle", "investment", "business"
    name: "Downtown Condo",
    purchasePrice: 200000,
    currentValue: 250000,
    monthlyIncome: 1500 // for rentals/businesses
  }
];
life.netWorth = 0; // calculated
```

---

## 🧠 **PHASE 8: Mental & Physical Wellness (v1.06.0)**
**Timeline**: 3-4 days
**Focus**: Health consequences and wellness activities

### Features:
✅ **Health Attribute Integration**
- Rename existing health to be more visible
- Health degrades with: stress, age, injuries, poor choices
- Health affects: energy, performance, appearance, lifespan

✅ **Wellness Activities**
- Therapy session ($100-200, -20 stress, +10 health)
- Vacation (varies by destination, -30-50 stress)
- Gym membership ($50/month, +5 health)
- Meditation/yoga (free, -10 stress)

✅ **Wellness Events** (5 events)
- `WELL_BURNOUT_01` - Collapse from exhaustion
- `WELL_VACATION_02` - Spontaneous vacation
- `WELL_THERAPY_03` - Therapy consideration (midlife)
- `WELL_INJURY_04` - Training injury (athletes)
- `WELL_REFLECTION_05` - Mental health hiatus announcement

✅ **Burnout & Crisis System**
- Stress > 80 for 3+ years triggers burnout event
- Midlife crisis at age 40-50 if unhappy
- Career switch opportunities during crisis

### Technical Changes:
- `src/domains/wellness.js` (NEW) - Wellness activities & tracking
- `src/domains/events/wellnessEvents.js` (NEW) - Event definitions
- `src/components/panels/ActivitiesPanel.js` - Add wellness activities
- Update career performance calculations to factor in health

### Data Structure:
```javascript
life.wellnessTracking = {
  therapySessions: 0,
  lastVacation: null, // age of last vacation
  gymMembership: false,
  burnoutRisk: 0 // calculated value
};
```

---

## 🧬 **PHASE 9: Legacy Mode (v1.07.0)**
**Timeline**: 5-6 days
**Focus**: Generational gameplay

### Features:
✅ **Children System Expansion**
- Children age naturally (already exists, needs expansion)
- Children inherit blended stats: 50% parent average + 25% random + 25% education
- Children affected by parent reputation and wealth

✅ **Legacy Events** (5 events)
- `LEG_CHILDGROWS_01` - Child graduates (age 18)
- `LEG_HEIR_02` - Legacy transfer on death
- `LEG_PUBLICPERCEPT_03` - Child interviewed about parent
- `LEG_SCANDALINHERIT_04` - Child bullied over parent's past
- `LEG_RECONCILE_05` - Estranged child reunion

✅ **Playable Heir Toggle**
- On death, offer "Play as Heir" option
- Heir starts at age 18 with:
  - Inherited money (50-100% of parent wealth)
  - Inherited debts (if any)
  - Inherited fame (25% of parent fame)
  - Inherited reputation effects
  - Parent's full history accessible

✅ **Public Perception Memory**
- Track parent's major life events (scandals, achievements)
- Events trigger based on parent history
- "Child of..." prefix in certain contexts

### Technical Changes:
- `src/domains/legacy.js` - Expand legacy system
- `src/domains/children.js` (NEW) - Child aging & stat blending
- `src/domains/events/legacyEvents.js` (NEW) - Event definitions
- `src/components/modals/HeirSelectModal.js` (NEW)
- Update death handler to offer heir option

### Data Structure:
```javascript
life.children = [
  {
    id,
    firstName,
    lastName,
    age,
    baseStats: {}, // inherited from parents
    relationship: 100, // bond with parent
    awarenessOfParentPast: 0 // 0-100, grows with age
  }
];
life.legacyData = {
  parentName: null, // if playing as heir
  parentAchievements: [],
  parentScandals: [],
  inheritedWealth: 0,
  inheritedFame: 0
};
```

---

## 🔗 **PHASE 10: Cross-Domain Events (v1.08.0)**
**Timeline**: 4-5 days
**Focus**: Interconnected world building

### Features:
✅ **Event Engine 2.0**
- Multi-domain event system
- Events that reference multiple career paths, relationships, etc.
- Consequence chains (one event triggers another)

✅ **Cross-Domain Events** (5 events)
- `CROSS_DET_POLITICIAN` - Detective discovers your corruption
- `CROSS_MOB_ATHLETE` - Mob targets athlete
- `CROSS_INFLUENCER_JOURNALIST` - Spouse leaks to press
- `CROSS_DETECTIVE_FAMILY` - Child suspected in your case
- `CROSS_RAPPER_POLITICIAN` - Rapper disses you in song

✅ **Consequence Chains**
- Events can trigger follow-up events
- Choices have delayed consequences (manifest years later)
- Relationship ripple effects (affect multiple NPCs)

### Technical Changes:
- `src/domains/events/eventEngine.js` (NEW) - Central event manager
- `src/domains/events/crossDomainEvents.js` (NEW) - Event definitions
- Update all domain files to register with event engine
- `src/domains/consequences.js` (NEW) - Delayed consequence tracking

### Data Structure:
```javascript
life.eventHistory = [
  {
    eventId: "CROSS_DET_POLITICIAN",
    age: 35,
    choice: "expose", // or "silence"
    consequences: ["pending_consequence_id_1", "pending_consequence_id_2"]
  }
];
life.pendingConsequences = [
  {
    id,
    triggerAge: 40, // will trigger at this age
    consequenceEventId: "CONSEQUENCE_EXPOSED_REVENGE"
  }
];
```

---

## ⏳ **PHASE 11: Aging & Reflection (v1.09.0)**
**Timeline**: 3-4 days
**Focus**: Life cycle and mortality

### Features:
✅ **Yearly Reflection Modal**
- Appears every 10 years (age 10, 20, 30, etc.)
- Shows key milestones from past decade
- Awards "Wisdom" stat bonus (+5 per reflection)
- Option to write journal entry (saved to history)

✅ **Aging Effects**
- Age > 30: Slower stat growth (-10% gains)
- Age > 50: Health decline (-2 health per year)
- Age > 60: Performance decline in physical careers
- Age > 70: Memory/nostalgia events increase

✅ **Retirement System**
- Option to retire at age 60+ with sufficient wealth
- Retirement income = 50% of final salary (if had job 20+ years)
- Retirement activities unlock (golf, travel, volunteering)

✅ **Aging Events** (5 events)
- `AGE_REFLECTION_01` - Decade reflection
- `AGE_HEALTHDECLINE_02` - Body slowing down
- `AGE_RETIREMENT_03` - Retirement consideration
- `AGE_NOSTALGIA_04` - Grandchildren visit
- `AGE_FINALYEAR_05` - End of life approaching

### Technical Changes:
- `src/domains/aging.js` (NEW) - Aging mechanics
- `src/domains/retirement.js` (NEW) - Retirement system
- `src/domains/events/agingEvents.js` (NEW) - Event definitions
- `src/components/modals/ReflectionModal.js` (NEW)
- Update stat gain calculations to factor in age

### Data Structure:
```javascript
life.agingData = {
  wisdom: 0, // gained through reflections
  reflectionHistory: [], // journal entries
  retirementAge: null,
  retirementIncome: 0
};
```

---

## 🚀 **PHASE 12: Systems Integration & Polish (v1.10.0)**
**Timeline**: 5-7 days
**Focus**: Final integration and balancing

### Features:
✅ **Full System Integration**
- All systems working together seamlessly
- Cross-domain triggers functioning properly
- Event chains tested end-to-end

✅ **Balancing Pass**
- Review all stat gains/losses
- Ensure no exploits or farming opportunities
- Balance difficulty curve across age ranges
- Adjust event frequencies

✅ **Performance Optimization**
- Optimize relationship graph queries
- Reduce state object size where possible
- Implement lazy loading for large data structures

✅ **Testing & Bug Fixes**
- Full playthrough testing (birth to death)
- Test all career paths
- Test all event chains
- Fix edge cases and crashes

✅ **Documentation**
- Update all code comments
- Create player guide for new features
- Document all event IDs and triggers

### Technical Changes:
- All files - Code cleanup and optimization
- `GAMEPLAY_GUIDE.md` (NEW) - Player documentation
- `EVENT_CATALOG.md` (NEW) - Complete event reference
- Final patch notes for v1.10.0

---

## 📊 **Development Metrics**

### Timeline Summary:
- **Phase 4**: 1-2 days (v1.01.0)
- **Phase 5A**: 3-4 days (v1.02.0)
- **Phase 5B**: 2-3 days (v1.03.0)
- **Phase 6**: 4-5 days (v1.04.0)
- **Phase 7**: 3-4 days (v1.05.0)
- **Phase 8**: 3-4 days (v1.06.0)
- **Phase 9**: 5-6 days (v1.07.0)
- **Phase 10**: 4-5 days (v1.08.0)
- **Phase 11**: 3-4 days (v1.09.0)
- **Phase 12**: 5-7 days (v1.10.0)

**Total Estimated Time**: 34-48 days (5-7 weeks)

### Recommended Order:
1. Quick wins first (Phase 4)
2. Build social depth (Phase 5A, 5B)
3. Add prestige systems (Phase 6, 7)
4. Deepen consequences (Phase 8, 9)
5. Connect everything (Phase 10, 11)
6. Polish and ship (Phase 12)

### Parallel Development:
- Phases 5A and 5B can be developed in parallel (different systems)
- Phases 6 and 7 can be partially parallel (backend work)
- Event writing can be done async to implementation

---

## 🎯 **Success Metrics**

### Player Engagement:
- Average session time > 30 minutes
- Multiple playthroughs (different life paths)
- Discovery of hidden events/consequences

### Technical Health:
- No crash bugs in production
- Smooth performance (60fps on mobile)
- State size manageable (< 2MB per save)

### Content Depth:
- 50+ unique events implemented
- All career paths feel distinct
- Relationships matter mechanically
- Legacy mode functional

---

## 📝 **Notes**

- Prioritize player-facing features over backend refactors
- Each phase should be shippable (can release incrementally)
- Maintain backward compatibility with saves where possible
- Test on mobile devices frequently (primary platform)
- Gather user feedback after each major phase

---

**Happy Anniversary to Hailey and Layla! 🎉**
*This roadmap represents the "Systems Awakening" update - transforming SmolLyfe from a life sim into a living, breathing world.*
