// Occupation domain - School and work logic

import { randInt, randChoice, deepClone } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";
import { getOccupationLabelForAge } from "../utils/lifeStages.js";
import { addStudyMomentum, applyGradeDelta } from "./schoolProgress.js";

export function handleStudyHarder(life) {
  const updated = deepClone(life);
  const gain = randInt(2, 5);
  const stageKey = getOccupationLabelForAge(updated.age, updated.origin);

  if (!updated.progressFlags) {
    updated.progressFlags = {};
  }
  if (!updated.progressFlags.studyStressStages) {
    updated.progressFlags.studyStressStages = {};
  }

  const alreadyPaidStressCost = Boolean(updated.progressFlags.studyStressStages[stageKey]);
  const stressGain = alreadyPaidStressCost ? randInt(0, 1) : randInt(2, 4);

  updated.intelligence = Math.min(100, updated.intelligence + gain);
  updated.stress = Math.min(100, updated.stress + stressGain);
  applyGradeDelta(updated, randInt(2, 5), "studyHarder");
  addStudyMomentum(updated, 1);
  updated.progressFlags.studyStressStages[stageKey] = true;
  addHistory(updated, "I studied harder. My brain expanded.");
  return updated;
}

export function handleSlackOff(life) {
  const updated = deepClone(life);
  updated.intelligence = Math.max(0, updated.intelligence - randInt(1, 3));
  updated.stress = Math.max(0, updated.stress - randInt(5, 10));
  updated.happiness = Math.min(100, updated.happiness + randInt(5, 10));
  applyGradeDelta(updated, -randInt(2, 5), "slackOff");
  addStudyMomentum(updated, -1);
  addHistory(updated, "I slacked off. Brain cells on vacation.");
  return updated;
}

export function generateFreelanceGig(type) {
  const gigTypes = {
    tutor: {
      titles: [
        "Tutor middle school student in Math",
        "Help elementary student with homework",
        "Tutor high school student in English",
      ],
      hourlyRange: [15, 30],
      hoursRange: [2, 5],
    },
    mowLawn: {
      titles: [
        "Mow neighbor's lawn",
        "Lawn care for local family",
        "Yard work and grass cutting",
      ],
      hourlyRange: [10, 20],
      hoursRange: [1, 3],
    },
  };

  const gig = gigTypes[type];
  const title = randChoice(gig.titles);
  const hourlyRate = randInt(gig.hourlyRange[0], gig.hourlyRange[1]);
  const hours = randInt(gig.hoursRange[0], gig.hoursRange[1]);
  const totalPay = hourlyRate * hours;

  return {
    title,
    description: `${hours} hour${hours > 1 ? "s" : ""} of work`,
    hourlyRate,
    hours,
    totalPay,
    type,
  };
}

export function acceptFreelanceGig(life, gigData) {
  const updated = deepClone(life);
  updated.money += gigData.totalPay;
  updated.actionLimits.freelanceGigs += 1;
  addHistory(updated, `${gigData.title} - Earned $${gigData.totalPay}.`);
  return updated;
}

// 11.11.2025 - Phase 2.2: Updated popularity with clique integration
export function calculatePopularity(life) {
  // Use clique-based calculation if clique exists
  if (life.clique && life.age >= 12 && life.age < 18) {
    const { calculatePopularityWithClique } = require("./cliques.js");
    return calculatePopularityWithClique(life);
  }

  // Fallback to basic classmate bond system for younger ages
  if (life.classmates.length === 0) return 0;
  const totalBond = life.classmates.reduce((sum, c) => sum + c.bond, 0);
  const avgBond = totalBond / life.classmates.length;
  const randomFactor = randInt(-10, 10);
  return Math.min(100, Math.max(0, avgBond + randomFactor));
}
