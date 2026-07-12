// Detective Case Progression System
// 11.11.2025 - Phase 3D: Investigation mechanics with overtime and outcomes

import { randInt, randChoice, deepClone } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";

// Case types with difficulty and rewards
export const CASE_TYPES = {
  robbery: {
    name: "Robbery Investigation",
    emoji: "💰",
    difficulty: 30,
    baseDuration: 3, // months
    solveReward: [5000, 15000],
    progressPerOvertimeShift: 15,
  },
  homicide: {
    name: "Homicide Investigation",
    emoji: "🔪",
    difficulty: 60,
    baseDuration: 6,
    solveReward: [10000, 30000],
    progressPerOvertimeShift: 10,
  },
  mafia: {
    name: "Organized Crime Investigation",
    emoji: "🤵",
    difficulty: 80,
    baseDuration: 12,
    solveReward: [25000, 75000],
    progressPerOvertimeShift: 8,
    dangerLevel: "high", // Risk of retaliation
  },
  cartel: {
    name: "Drug Cartel Investigation",
    emoji: "💊",
    difficulty: 85,
    baseDuration: 10,
    solveReward: [30000, 80000],
    progressPerOvertimeShift: 7,
    dangerLevel: "high",
  },
  corruption: {
    name: "Political Corruption Investigation",
    emoji: "🏛️",
    difficulty: 75,
    baseDuration: 8,
    solveReward: [20000, 60000],
    progressPerOvertimeShift: 9,
    dangerLevel: "medium", // Career risk, not physical
  },
  coldCase: {
    name: "Cold Case Investigation",
    emoji: "📁",
    difficulty: 70,
    baseDuration: 9,
    solveReward: [15000, 50000],
    progressPerOvertimeShift: 6,
  },
  fraud: {
    name: "Corporate Fraud Investigation",
    emoji: "💼",
    difficulty: 65,
    baseDuration: 7,
    solveReward: [15000, 45000],
    progressPerOvertimeShift: 11,
  },
};

// Generate a new case for detective
export function generateNewCase(life) {
  const caseTypes = Object.keys(CASE_TYPES);
  const caseType = randChoice(caseTypes);
  const caseData = CASE_TYPES[caseType];

  // Case difficulty affects initial progress
  const initialProgress = randInt(5, 20);

  return {
    type: caseType,
    name: caseData.name,
    emoji: caseData.emoji,
    progress: initialProgress,
    difficulty: caseData.difficulty,
    monthsActive: 0,
    overtimeHoursWorked: 0,
    breakthrough: false, // Major clue found
  };
}

// Assign case to detective
export function assignCase(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob || updated.fullTimeJob.key !== "detective") {
    addHistory(updated, "I need to be a detective to work cases.");
    return updated;
  }

  if (updated.activeCase) {
    addHistory(updated, `I'm already working the ${updated.activeCase.name}.`);
    return updated;
  }

  const newCase = generateNewCase(updated);
  updated.activeCase = newCase;

  addHistory(updated, `${newCase.emoji} New case assigned: ${newCase.name}. Time to crack this.`);

  return updated;
}

// Work overtime on case (increases progress faster but adds stress)
export function workCaseOvertime(life) {
  const updated = deepClone(life);

  if (!updated.activeCase) {
    addHistory(updated, "I don't have an active case to work.");
    return updated;
  }

  const caseData = CASE_TYPES[updated.activeCase.type];
  const progressGain = randInt(
    caseData.progressPerOvertimeShift - 3,
    caseData.progressPerOvertimeShift + 5
  );

  updated.activeCase.progress = Math.min(100, updated.activeCase.progress + progressGain);
  updated.activeCase.overtimeHoursWorked += randInt(10, 20);

  // Overtime stress (heavy workload)
  updated.stress = Math.min(100, updated.stress + randInt(10, 20));

  // Overtime pay (time and a half)
  const baseHourly = Math.floor(updated.fullTimeJob.salary / 52 / 40);
  const overtimePay = Math.floor(baseHourly * 1.5 * 15); // ~15 hours
  updated.money += overtimePay;

  addHistory(updated, `I worked overtime on the ${updated.activeCase.name}. Progress: ${updated.activeCase.progress}%. Earned $${overtimePay} overtime pay.`);

  // Chance of breakthrough
  if (updated.activeCase.progress > 40 && Math.random() < 0.2) {
    updated.activeCase.breakthrough = true;
    addHistory(updated, `Major breakthrough! I found a critical clue in the case.`);
    updated.intelligence = Math.min(100, updated.intelligence + randInt(2, 5));
  }

  // Check if case is solved
  if (updated.activeCase.progress >= 100) {
    return solveCase(updated);
  }

  return updated;
}

// Natural case progress (monthly, without overtime)
export function progressCase(life) {
  const updated = deepClone(life);

  if (!updated.activeCase) {
    return updated;
  }

  updated.activeCase.monthsActive += 1;

  // Slow natural progress
  const naturalProgress = randInt(3, 8);
  updated.activeCase.progress = Math.min(100, updated.activeCase.progress + naturalProgress);

  // Check if solved
  if (updated.activeCase.progress >= 100) {
    return solveCase(updated);
  }

  // Case going cold after too long
  const caseData = CASE_TYPES[updated.activeCase.type];
  if (updated.activeCase.monthsActive > caseData.baseDuration * 1.5) {
    if (Math.random() < 0.15) {
      addHistory(updated, `The ${updated.activeCase.name} went cold. Case closed without resolution.`);
      updated.stress = Math.min(100, updated.stress + randInt(15, 25));
      delete updated.activeCase;
    }
  }

  return updated;
}

// Solve case (rewards + outcomes)
function solveCase(life) {
  const updated = deepClone(life);
  const caseData = CASE_TYPES[updated.activeCase.type];

  const reward = randInt(caseData.solveReward[0], caseData.solveReward[1]);
  updated.money += reward;

  // Promotion chance after solving tough cases
  const promotionChance = Math.min(0.3, updated.activeCase.difficulty / 300);
  const promoted = Math.random() < promotionChance;

  if (promoted && updated.fullTimeJob.level < 3) {
    updated.fullTimeJob.level += 1;
    updated.fullTimeJob.salary = Math.floor(updated.fullTimeJob.salary * 1.25);
    const jobData = require("./fullTimeJobs.js").FULL_TIME_JOBS.detective;
    updated.occupation = jobData.progression[updated.fullTimeJob.level];
    addHistory(updated, `🎖️ PROMOTED to ${updated.occupation} for solving the ${updated.activeCase.name}! New salary: $${updated.fullTimeJob.salary.toLocaleString()}/year.`);
  }

  addHistory(updated, `✅ CASE SOLVED: ${updated.activeCase.name}. Reward: $${reward.toLocaleString()}. Justice served.`);

  // Fame and influence gain
  updated.fame = Math.min(100, (updated.fame || 0) + randInt(3, 10));
  updated.influence = Math.min(100, (updated.influence || 0) + randInt(5, 15));

  // Danger outcomes for high-risk cases
  if (caseData.dangerLevel === "high" && Math.random() < 0.15) {
    const dangerEvents = [
      "I received threats from the organization. My family is scared.",
      "My car was vandalized. They know where I live.",
      "An anonymous tip warned me to drop the case. Too late now.",
      "I survived an attempt on my life. This case made enemies.",
    ];
    addHistory(updated, randChoice(dangerEvents));
    updated.stress = Math.min(100, updated.stress + randInt(20, 40));
  }

  // Corruption exposure (political cases)
  if (updated.activeCase.type === "corruption" && Math.random() < 0.25) {
    addHistory(updated, "The investigation exposed high-level corruption. The media is all over this.");
    updated.fame = Math.min(100, updated.fame + randInt(10, 25));
  }

  delete updated.activeCase;

  return updated;
}

// Abandon case (give up)
export function abandonCase(life) {
  const updated = deepClone(life);

  if (!updated.activeCase) {
    addHistory(updated, "I don't have a case to abandon.");
    return updated;
  }

  addHistory(updated, `I abandoned the ${updated.activeCase.name}. Sometimes cases don't pan out.`);
  updated.stress = Math.max(0, updated.stress - 10);

  delete updated.activeCase;

  return updated;
}
