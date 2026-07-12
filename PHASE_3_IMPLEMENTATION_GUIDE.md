# Phase 3 Implementation Guide - Career Systems
## SmolLyfe v1.00.10 (In Progress)
### Date: 11.11.2025

---

## 📋 Table of Contents
1. [What's Been Built](#whats-been-built)
2. [File Structure](#file-structure)
3. [Systems Overview](#systems-overview)
4. [Integration Steps (Remaining)](#integration-steps-remaining)
5. [Testing Checklist](#testing-checklist)

---

## ✅ What's Been Built

### **Domain Logic Files (Backend)**

#### 1. **`src/domains/fullTimeJobs.js`**
- **15 Complete Careers** with degree requirements:
  - No Degree: Retail Manager, Construction Worker, Restaurant Server
  - Bachelor's Required: Teacher, Nurse, Software Engineer, Accountant, Marketing Manager, Journalist
  - Master's Required: Lawyer
  - Doctorate Required: Doctor
  - Law Enforcement: Police Officer, Detective (requires 3+ years as police)
  - Business: Entrepreneur

- **Each Career Has:**
  - 4-tier progression path (e.g., Junior → Mid → Senior → Executive)
  - Salary range
  - Hours per week (40-60)
  - Stress impact
  - Requirements (age, intelligence, health, degree)
  - Performance tracking system

- **6 Job Interaction Functions:**
  1. `workOvertime()` - Extra pay (1.5x hourly), +stress, +performance
  2. `takeBreak()` - Reduce stress -20-35, small performance penalty
  3. `askForRaise()` - 30-80% success chance based on performance/tenure
  4. `pursuePromotion()` - 15-75% success, 35% salary bump, requires good performance
  5. `networkAtWork()` - Build influence, boost performance
  6. `quitFullTimeJob()` - Leave job, save to work history

- **Helper Functions:**
  - `getEligibleJobs(life)` - Returns careers player qualifies for
  - `applyForFullTimeJob(life, jobKey)` - Apply with success chance
  - `workFullTimeJob(life)` - Monthly income + random promotion chance

---

#### 2. **`src/domains/specialCareers.js`**
- **7 Special Careers** (separate from regular jobs):

| Career | Key | Requirements | Income Range | Special Mechanic |
|--------|-----|--------------|--------------|------------------|
| Singer 🎤 | singer | Musical 80, Attractiveness 60, Fame 20, Choir activity | $30k-100k | Manager-eligible, Fame multiplier 2.5x |
| Rapper 🎙️ | rapper | Musical 70, Influence 50, Fame 15 | $25k-150k | Manager-eligible, Fame multiplier 3.0x |
| Band Member 🎸 | bandMember | Musical 75, Fame 20, Band activity | $20k-80k | Manager-eligible, Fame multiplier 2.0x |
| NFL Player 🏈 | nflPlayer | Athleticism 90, Health 85, Fame 30, Football activity | $700k-15M | 15% injury risk/year, Fame multiplier 4.0x |
| NBA Player 🏀 | nbaPlayer | Athleticism 92, Health 85, Fame 30, Basketball activity | $900k-40M | 12% injury risk/year, Fame multiplier 4.5x |
| Mobster 🤵 | mobster | Influence 60, Attractiveness 40 | $60k-500k | 20% crime risk/year, -15 morality/year |
| Gang Member 🔫 | gangMember | Influence 30, Stress 40 | $15k-150k | 35% crime risk/year, -20 morality/year |

- **Functions:**
  - `isEligibleForSpecialCareer(life, careerKey)` - Check requirements
  - `startSpecialCareer(life, careerKey)` - Begin special career
  - `workSpecialCareer(life)` - Monthly income + fame growth + risk checks
  - `quitSpecialCareer(life)` - Leave career, save to history

- **Special Mechanics:**
  - **Fame Careers**: Auto-generate fame, can hire managers at fame 50+
  - **Athletes**: Monthly injury checks, can end career
  - **Criminal Careers**: Monthly arrest/violence checks, morality degradation

---

#### 3. **`src/domains/detectiveCases.js`**
- **7 Case Types:**

| Case Type | Emoji | Difficulty | Duration | Reward | Danger Level |
|-----------|-------|------------|----------|--------|--------------|
| Robbery | 💰 | 30 | 3 months | $5k-15k | - |
| Homicide | 🔪 | 60 | 6 months | $10k-30k | - |
| Mafia | 🤵 | 80 | 12 months | $25k-75k | High |
| Cartel | 💊 | 85 | 10 months | $30k-80k | High |
| Corruption | 🏛️ | 75 | 8 months | $20k-60k | Medium |
| Cold Case | 📁 | 70 | 9 months | $15k-50k | - |
| Fraud | 💼 | 65 | 7 months | $15k-45k | - |

- **Case Mechanics:**
  - Progress bar (0-100%)
  - Natural progress ~3-8% per month
  - Overtime work: +6-15% progress per shift (varies by difficulty)
  - Cases can go cold if neglected too long
  - Breakthrough events (20% chance after 40% progress)

- **Functions:**
  - `generateNewCase(life)` - Create random case
  - `assignCase(life)` - Give detective new case
  - `workCaseOvertime(life)` - Work extra hours, faster progress, overtime pay
  - `progressCase(life)` - Natural monthly progress (called on age up)
  - `solveCase(life)` - Reward money, fame, influence, possible promotion
  - `abandonCase(life)` - Give up on case

- **Solving Cases:**
  - Automatic when progress hits 100%
  - Cash reward based on difficulty
  - Promotion chance (up to 30% for tough cases)
  - Fame +3-10, Influence +5-15
  - High-risk cases: 15% chance of threats/danger events
  - Corruption cases: Media exposure, extra fame

---

### **UI Components (Frontend)**

#### 1. **`src/components/panels/FullTimeJobsPanel.js`**
- **Two Views:**
  - **Browse Mode**: List all eligible careers with requirements
  - **Manage Mode**: Current job stats + 6 action buttons

- **Displayed Info:**
  - Job emoji + title
  - Current position in progression
  - Salary/year
  - Hours per week
  - Years worked
  - Performance bar (0-100)

- **Action Buttons:**
  - ⏰ Work Overtime
  - 🌴 Take a Break
  - 💰 Ask for Raise
  - 🎖️ Pursue Promotion
  - 🤝 Network with Colleagues
  - ❌ Quit Job
  - 🔍 Browse Other Jobs (if employed)

- **Props Required:**
  ```javascript
  {
    life,
    onApplyJob,
    onWorkOvertime,
    onTakeBreak,
    onAskRaise,
    onPursuePromotion,
    onNetwork,
    onQuitJob,
    onBack
  }
  ```

---

#### 2. **`src/components/panels/SpecialCareersPanel.js`**
- **Two Views:**
  - **Browse Mode**: All 7 special careers with eligibility check
  - **Manage Mode**: Current career stats

- **Displayed Info:**
  - Career emoji + title
  - Current status (progression level)
  - Income/year (variable)
  - Hours per week
  - Years active
  - Performance bar
  - Fame (if fame career)
  - Risk indicators (injury %, crime %)

- **Requirements Display:**
  - Shows all stat requirements
  - Green ✓ if met, Red ✗ if not met
  - Shows current stat values

- **Special Indicators:**
  - ⭐ Manager-eligible (fame careers)
  - ⚠️ Injury risk percentage (athletes)
  - 🚨 Arrest/violence risk (criminal)

- **Props Required:**
  ```javascript
  {
    life,
    onStartCareer,
    onQuitCareer,
    onBack
  }
  ```

---

#### 3. **`src/components/panels/DetectiveCasePanel.js`**
- **Two Views:**
  - **No Active Case**: Show available case types, assign new case
  - **Active Case**: Case progress, overtime work option

- **Active Case Display:**
  - Case emoji + name
  - Progress bar (0-100%)
  - Months active
  - Overtime hours worked
  - Breakthrough indicator (if achieved)
  - Difficulty rating
  - Solve reward range
  - Danger level warning

- **Action Buttons:**
  - ⏰ Work Overtime on Case
  - ❌ Abandon Case

- **Case Types Info:**
  - Shows all 7 case types with difficulty and rewards

- **Props Required:**
  ```javascript
  {
    life,
    onAssignCase,
    onWorkOvertime,
    onAbandonCase,
    onBack
  }
  ```

---

#### 4. **`src/components/panels/OccupationPanel.js` (UPDATED)**
- **New Section Added:** "Career Opportunities" (ages 18+)

- **3 New Buttons:**
  1. 💼 Full-Time Careers (shows current job if employed)
  2. ⭐ Special Careers (shows current career if active)
  3. 🕵️ Detective Cases (only visible if detective)

- **Updated Props Signature:**
  ```javascript
  export default function OccupationPanel({
    life,
    onOpenSchool,
    onOpenActivity,
    onOpenPartTimeJobs,
    onOpenFullTimeJobs,        // NEW
    onOpenSpecialCareers,       // NEW
    onOpenDetectiveCases,       // NEW
    onActivityAction,
    onFreelanceGig
  })
  ```

---

### **Additional Features**

#### **NPC Classmates Now Have Cliques (Completed)**
- `src/core/npc.js` - `generateClassmate()` updated
- All classmates ages 12+ assigned random clique
- Displayed in School → Classmates with emoji + name
- Social bonding mechanic: Befriending classmates in a clique gives +10% per friend when joining that clique

---

## 📁 File Structure

```
SmolLyfe_Game_Dev/
├── src/
│   ├── domains/
│   │   ├── fullTimeJobs.js          ✅ COMPLETE (15 careers + 6 interactions)
│   │   ├── specialCareers.js        ✅ COMPLETE (7 special careers)
│   │   ├── detectiveCases.js        ✅ COMPLETE (7 case types + mechanics)
│   │   ├── partTimeJobs.js          ✅ EXISTING (8 teen jobs)
│   │   └── cliques.js               ✅ UPDATED (social bonding)
│   │
│   ├── components/
│   │   ├── panels/
│   │   │   ├── FullTimeJobsPanel.js      ✅ NEW
│   │   │   ├── SpecialCareersPanel.js    ✅ NEW
│   │   │   ├── DetectiveCasePanel.js     ✅ NEW
│   │   │   ├── OccupationPanel.js        ✅ UPDATED (career nav buttons)
│   │   │   ├── SchoolPanel.js            ✅ UPDATED (classmate cliques)
│   │   │   └── PartTimeJobsPanel.js      ✅ EXISTING
│   │   │
│   │   └── modals/
│   │       └── CliqueBrowserModal.js     ✅ EXISTING (from v1.00.09)
│   │
│   ├── core/
│   │   └── npc.js                   ✅ UPDATED (classmate cliques)
│   │
│   └── App.js                       ⏳ PARTIALLY INTEGRATED
│       ├── Imports added            ✅
│       ├── State variables added    ✅
│       ├── Handlers needed          ❌ (~20 functions)
│       ├── Panel renders needed     ❌ (3 panels)
│       └── Props wiring needed      ❌ (OccupationPanel)
```

---

## 🔧 Integration Steps (Remaining)

### **Step 1: Add Handlers to App.js**

Need to add **20+ handler functions** after the existing job handlers (~line 300):

```javascript
// ========== FULL-TIME JOB HANDLERS ==========

function handleApplyFullTimeJob(jobKey) {
  const { applyForFullTimeJob } = require("./domains/fullTimeJobs.js");
  const updated = applyForFullTimeJob(life, jobKey);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setShowFullTimeJobsPanel(false);
  setActiveTab("home");
}

function handleWorkOvertime() {
  const { workOvertime } = require("./domains/fullTimeJobs.js");
  const updated = workOvertime(life);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setActiveTab("home");
}

function handleTakeBreak() {
  const { takeBreak } = require("./domains/fullTimeJobs.js");
  const updated = takeBreak(life);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setActiveTab("home");
}

function handleAskRaise() {
  const { askForRaise } = require("./domains/fullTimeJobs.js");
  const updated = askForRaise(life);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setActiveTab("home");
}

function handlePursuePromotion() {
  const { pursuePromotion } = require("./domains/fullTimeJobs.js");
  const updated = pursuePromotion(life);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setActiveTab("home");
}

function handleNetworkAtWork() {
  const { networkAtWork } = require("./domains/fullTimeJobs.js");
  const updated = networkAtWork(life);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setActiveTab("home");
}

function handleQuitFullTimeJob() {
  const { quitFullTimeJob } = require("./domains/fullTimeJobs.js");
  const updated = quitFullTimeJob(life);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setShowFullTimeJobsPanel(false);
  setActiveTab("home");
}

// ========== SPECIAL CAREER HANDLERS ==========

function handleStartSpecialCareer(careerKey) {
  const { startSpecialCareer } = require("./domains/specialCareers.js");
  const updated = startSpecialCareer(life, careerKey);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setShowSpecialCareersPanel(false);
  setActiveTab("home");
}

function handleQuitSpecialCareer() {
  const { quitSpecialCareer } = require("./domains/specialCareers.js");
  const updated = quitSpecialCareer(life);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setShowSpecialCareersPanel(false);
  setActiveTab("home");
}

// ========== DETECTIVE CASE HANDLERS ==========

function handleAssignCase() {
  const { assignCase } = require("./domains/detectiveCases.js");
  const updated = assignCase(life);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setActiveTab("home");
}

function handleWorkCaseOvertime() {
  const { workCaseOvertime } = require("./domains/detectiveCases.js");
  const updated = workCaseOvertime(life);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setActiveTab("home");
}

function handleAbandonCase() {
  const { abandonCase } = require("./domains/detectiveCases.js");
  const updated = abandonCase(life);
  const updatedLives = saveLifeToStorage(updated, allLives);
  setAllLives(updatedLives);
  setLife(updated);
  setShowDetectiveCasePanel(false);
  setActiveTab("home");
}
```

---

### **Step 2: Update OccupationPanel Rendering**

Find the OccupationPanel render (~line 410) and update props:

```javascript
<OccupationPanel
  life={life}
  onOpenSchool={() => setShowSchoolPanel(true)}
  onOpenPartTimeJobs={() => setShowPartTimeJobsPanel(true)}
  onOpenFullTimeJobs={() => setShowFullTimeJobsPanel(true)}      // NEW
  onOpenSpecialCareers={() => setShowSpecialCareersPanel(true)}   // NEW
  onOpenDetectiveCases={() => setShowDetectiveCasePanel(true)}    // NEW
  onActivityAction={handleActivityActionClick}
  onFreelanceGig={handleFreelanceGigClick}
/>
```

---

### **Step 3: Render New Panels**

Add panel render sections after the existing PartTimeJobsPanel (~line 445):

```javascript
{/* 11.11.2025 - Phase 3: Full-Time Jobs Panel */}
{activeTab === "occupation" && showFullTimeJobsPanel && (
  <FullTimeJobsPanel
    life={life}
    onApplyJob={handleApplyFullTimeJob}
    onWorkOvertime={handleWorkOvertime}
    onTakeBreak={handleTakeBreak}
    onAskRaise={handleAskRaise}
    onPursuePromotion={handlePursuePromotion}
    onNetwork={handleNetworkAtWork}
    onQuitJob={handleQuitFullTimeJob}
    onBack={() => setShowFullTimeJobsPanel(false)}
  />
)}

{/* 11.11.2025 - Phase 3: Special Careers Panel */}
{activeTab === "occupation" && showSpecialCareersPanel && (
  <SpecialCareersPanel
    life={life}
    onStartCareer={handleStartSpecialCareer}
    onQuitCareer={handleQuitSpecialCareer}
    onBack={() => setShowSpecialCareersPanel(false)}
  />
)}

{/* 11.11.2025 - Phase 3: Detective Case Panel */}
{activeTab === "occupation" && showDetectiveCasePanel && (
  <DetectiveCasePanel
    life={life}
    onAssignCase={handleAssignCase}
    onWorkOvertime={handleWorkCaseOvertime}
    onAbandonCase={handleAbandonCase}
    onBack={() => setShowDetectiveCasePanel(false)}
  />
)}
```

---

### **Step 4: Update handleAgeUp**

Add monthly job processing in handleAgeUp function:

```javascript
function handleAgeUp() {
  let updated = ageUpLife(life);

  // Existing code...

  // 11.11.2025 - Phase 3: Process full-time job
  if (updated.fullTimeJob) {
    updated.fullTimeJob.yearsWorked = (updated.fullTimeJob.yearsWorked || 0) + 1;

    // Auto-work full-time job (monthly income)
    const { workFullTimeJob } = require("./domains/fullTimeJobs.js");
    updated = workFullTimeJob(updated);
  }

  // 11.11.2025 - Phase 3: Process special career
  if (updated.specialCareer) {
    updated.specialCareer.yearsActive = (updated.specialCareer.yearsActive || 0) + 1;

    // Auto-work special career
    const { workSpecialCareer } = require("./domains/specialCareers.js");
    updated = workSpecialCareer(updated);
  }

  // 11.11.2025 - Phase 3: Progress detective case naturally
  if (updated.activeCase) {
    const { progressCase } = require("./domains/detectiveCases.js");
    updated = progressCase(updated);
  }

  // Rest of handleAgeUp...
}
```

---

## ✅ Testing Checklist

### **Full-Time Jobs**
- [ ] Browse careers at age 18
- [ ] Apply for job without degree (should succeed)
- [ ] Apply for job requiring Bachelor's without degree (should fail)
- [ ] Get hired, see job in OccupationPanel
- [ ] Work overtime (earn extra pay, gain stress)
- [ ] Take break (reduce stress)
- [ ] Ask for raise (test success/failure)
- [ ] Pursue promotion (test success/failure)
- [ ] Network with colleagues (gain influence)
- [ ] Quit job (save to work history)
- [ ] Age up with job (auto-earn monthly salary)

### **Special Careers**
- [ ] Browse special careers
- [ ] Check eligibility requirements (stat checks work)
- [ ] Start Singer career (requires Choir activity + stats)
- [ ] Start NBA Player career (requires Basketball activity)
- [ ] Start Gang Member career (criminal path)
- [ ] Age up with special career (auto-earn, check injury/crime risks)
- [ ] Quit special career

### **Detective Cases**
- [ ] Become detective (require police experience first)
- [ ] Assign new case
- [ ] Work overtime on case (progress increases)
- [ ] Case solves automatically at 100%
- [ ] Receive reward money
- [ ] Get promoted for solving tough case
- [ ] High-danger case triggers threat event
- [ ] Abandon case

### **Classmate Cliques**
- [ ] View classmates in School (ages 12+)
- [ ] See clique emoji and name next to classmates
- [ ] Befriend classmates in target clique
- [ ] Try to join clique (social bonus applies)

---

## 🚀 Future Enhancements (Option B - NOT YET IMPLEMENTED)

### **Coworker Generation System**
- Generate 3-5 coworkers when hired
- Bond/relationship tracking with coworkers
- Office romances, rivalries, mentors
- Coworker interactions boost performance
- Networking success tied to coworker bonds

### **Manager System (Fame Careers)**
- 3 Manager Tiers: Budget (5% cut), Standard (10% cut), Elite (15-20% cut)
- Unlocks at Fame 50+
- Manager brings opportunities:
  - TV appearances
  - Brand endorsements
  - Commercials
  - Movie auditions
  - Collaborations
- Manager quality affects deal frequency and quality
- Can fire/hire different managers

### **40-Hour Stress System**
- Track total weekly hours from all jobs/activities
- ≤40 hours: baseline stress
- >40 hours: compounding stress increase
- 60+ hours: burnout risk, health impact

---

## 📊 Statistics

**Lines of Code Added:** ~2,500+
**New Files Created:** 6
**Functions Created:** 35+
**UI Components:** 3 new panels
**Careers Available:** 15 full-time + 7 special = 22 total
**Job Actions:** 6 full-time interactions + case overtime
**Integration Remaining:** ~250 lines in App.js

---

## 💡 Notes for Implementation

1. **State Management:** All handlers follow same pattern (deepClone → modify → save → setState)
2. **Action Limits:** Already tracked in `life.actionLimits` object (reset yearly)
3. **Error Handling:** Functions check for job existence before actions
4. **Performance Metrics:** Stored in job object, affects promotion/raise chances
5. **Detective Path:** Requires police job first, then promotion to detective after 3+ years
6. **Special Careers:** Mutually exclusive with full-time jobs (player choice)
7. **Degree Checks:** Higher degrees satisfy lower requirements (Doctorate → Master's → Bachelor's)

---

**End of Phase 3 Implementation Guide**
