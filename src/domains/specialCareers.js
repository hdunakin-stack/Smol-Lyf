// Special Careers - Fame-based and high-risk paths
// 11.11.2025 - Phase 3D: Singer, Rapper, Band, NFL, NBA, Mobster, Gang Member
// These careers have unique mechanics separate from regular full-time jobs

import { randInt, randChoice, deepClone } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";

// Special career definitions
export const SPECIAL_CAREERS = {
  singer: {
    title: "Singer",
    emoji: "🎤",
    description: "Professional solo vocal artist",
    requirements: {
      age: 18,
      musical: 80,
      attractiveness: 60,
      fame: 20,
    },
    activityRequired: ["choir"],
    earningsType: "variable", // Income varies based on fame and gigs
    baseIncome: [30000, 100000],
    hoursPerWeek: 35,
    stressImpact: 45,
    fameMultiplier: 2.5, // Gains fame faster
    progression: ["Local Singer", "Recording Artist", "Chart-Topper", "Music Icon"],
    managerEligible: true, // Can hire manager at fame 50+
  },
  rapper: {
    title: "Rapper",
    emoji: "🎙️",
    description: "Hip-hop artist and lyricist",
    requirements: {
      age: 18,
      musical: 70,
      influence: 50,
      fame: 15,
    },
    activityRequired: null, // No specific activity required
    earningsType: "variable",
    baseIncome: [25000, 150000],
    hoursPerWeek: 30,
    stressImpact: 40,
    fameMultiplier: 3.0, // High fame growth
    progression: ["Underground Rapper", "Signed Artist", "Platinum Rapper", "Hip-Hop Legend"],
    managerEligible: true,
  },
  bandMember: {
    title: "Band Member",
    emoji: "🎸",
    description: "Play in a professional band",
    requirements: {
      age: 18,
      musical: 75,
      fame: 20,
    },
    activityRequired: ["band"],
    earningsType: "variable",
    baseIncome: [20000, 80000],
    hoursPerWeek: 40,
    stressImpact: 35,
    fameMultiplier: 2.0,
    progression: ["Band Member", "Touring Musician", "Headliner", "Rock Legend"],
    managerEligible: true,
  },
  nflPlayer: {
    title: "NFL Player",
    emoji: "🏈",
    description: "Professional American football player",
    requirements: {
      age: 21,
      athleticism: 90,
      health: 85,
      fame: 30,
    },
    activityRequired: ["football"],
    earningsType: "salary", // Structured contracts
    baseIncome: [700000, 15000000],
    hoursPerWeek: 60,
    stressImpact: 55,
    fameMultiplier: 4.0, // Very high fame
    progression: ["Rookie", "Starter", "Pro Bowler", "Hall of Famer"],
    managerEligible: true,
    injuryRisk: 0.15, // 15% chance of injury per year
  },
  nbaPlayer: {
    title: "NBA Player",
    emoji: "🏀",
    description: "Professional basketball player",
    requirements: {
      age: 19,
      athleticism: 92,
      health: 85,
      fame: 30,
    },
    activityRequired: ["basketball"],
    earningsType: "salary",
    baseIncome: [900000, 40000000],
    hoursPerWeek: 55,
    stressImpact: 50,
    fameMultiplier: 4.5, // Highest fame growth
    progression: ["Rookie", "Rotation Player", "All-Star", "MVP/Legend"],
    managerEligible: true,
    injuryRisk: 0.12, // 12% chance of injury per year
  },
  mobster: {
    title: "Mobster",
    emoji: "🤵",
    description: "Organized crime family member",
    requirements: {
      age: 21,
      influence: 60,
      attractiveness: 40,
    },
    activityRequired: null,
    earningsType: "criminal", // Illegal income
    baseIncome: [60000, 500000],
    hoursPerWeek: 50,
    stressImpact: 60,
    fameMultiplier: 0.5, // Stays underground
    progression: ["Associate", "Made Man", "Capo", "Boss"],
    managerEligible: false,
    crimeRisk: 0.20, // 20% chance of arrest/violence per year
    moralityImpact: -15, // Degrades morality
  },
  gangMember: {
    title: "Gang Member",
    emoji: "🔫",
    description: "Street gang affiliate",
    requirements: {
      age: 16,
      influence: 30,
      stress: 40, // High stress backgrounds
    },
    activityRequired: null,
    earningsType: "criminal",
    baseIncome: [15000, 150000],
    hoursPerWeek: 40,
    stressImpact: 70,
    fameMultiplier: 0.3, // Street reputation, not fame
    progression: ["Affiliate", "Soldier", "Lieutenant", "OG"],
    managerEligible: false,
    crimeRisk: 0.35, // 35% chance of violence/arrest per year
    moralityImpact: -20,
  },
};

// Check if player meets requirements for special career
export function isEligibleForSpecialCareer(life, careerKey) {
  const career = SPECIAL_CAREERS[careerKey];
  if (!career) return { eligible: false, reasons: ["Career not found"] };

  const reasons = [];

  // Age check
  if (life.age < career.requirements.age) {
    reasons.push(`Must be at least ${career.requirements.age} years old`);
  }

  // 11.19.2025 - NBA/NFL eligibility rules (college athlete OR 18yr phenomenon)
  if (careerKey === "nbaPlayer" || careerKey === "nflPlayer") {
    const hasCollegeAthletics = life.collegeAthlete && life.collegeAthlete.sport === (careerKey === "nbaPlayer" ? "basketball" : "football");
    const is18Phenomenon = life.age === 18 && life.athleticism >= 95 && life.fame >= 80;
    const isDraftEligible = life.draftEligible || life.declaredForDraft;

    if (!hasCollegeAthletics && !is18Phenomenon && !isDraftEligible) {
      reasons.push("Must play college sports OR be an 18-year-old phenomenon (95+ athleticism, 80+ fame)");
    }

    // Block if currently enrolled in college but not draft-eligible
    const isInCollege = life.occupation && life.occupation.includes("University Student");
    if (isInCollege && !isDraftEligible && !life.declaredForDraft) {
      reasons.push("Cannot pursue professional sports while enrolled (declare for draft first)");
    }
  }

  // Stat requirements
  for (const [stat, value] of Object.entries(career.requirements)) {
    if (stat === "age") continue;
    if ((life[stat] || 0) < value) {
      reasons.push(`Need ${value}+ ${stat} (current: ${life[stat] || 0})`);
    }
  }

  // Activity requirement
  if (career.activityRequired) {
    const hasActivity = career.activityRequired.some(activity =>
      life.extracurriculars?.includes(activity) ||
      life.extracurricularDetails?.[activity]
    );
    if (!hasActivity) {
      reasons.push(`Must have participated in: ${career.activityRequired.join(" or ")}`);
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
}

// Start a special career
export function startSpecialCareer(life, careerKey) {
  const updated = deepClone(life);
  const career = SPECIAL_CAREERS[careerKey];

  if (!career) {
    addHistory(updated, "Career path not found.");
    return updated;
  }

  // Check eligibility
  const { eligible, reasons } = isEligibleForSpecialCareer(updated, careerKey);
  if (!eligible) {
    addHistory(updated, `I tried to pursue ${career.title} but: ${reasons[0]}`);
    return updated;
  }

  // Calculate initial income
  const baseIncome = randInt(career.baseIncome[0], career.baseIncome[1]);
  const fameBonus = Math.floor(baseIncome * ((updated.fame || 0) / 200)); // Fame adds up to 50% more
  const income = baseIncome + fameBonus;

  updated.specialCareer = {
    key: careerKey,
    title: career.title,
    emoji: career.emoji,
    income: income,
    hoursPerWeek: career.hoursPerWeek,
    stressImpact: career.stressImpact,
    level: 0, // Start at first progression
    yearsActive: 0,
    performance: 50, // Base performance metric
  };

  updated.occupation = career.progression[0];
  updated.stress = Math.min(100, updated.stress + career.stressImpact);

  // Fame careers get immediate fame boost
  if (career.managerEligible) {
    updated.fame = Math.min(100, (updated.fame || 0) + randInt(10, 20));
  }

  const startMessages = {
    singer: [
      `🎤 I signed my first record deal! I'm officially a ${career.progression[0]}. Income: $${income.toLocaleString()}/year.`,
      `🎤 My music career begins! Signed as a ${career.progression[0]}. This is my shot at stardom.`,
    ],
    rapper: [
      `🎙️ I got signed to a label! ${career.progression[0]} status unlocked. Time to drop bars for $${income.toLocaleString()}/year.`,
      `🎙️ The rap game is mine now. ${career.progression[0]} making $${income.toLocaleString()}/year.`,
    ],
    bandMember: [
      `🎸 The band got signed! We're official ${career.progression[0]}s now. $${income.toLocaleString()}/year split.`,
      `🎸 My band landed a record deal! ${career.progression[0]} life begins.`,
    ],
    nflPlayer: [
      `🏈 DRAFTED TO THE NFL! ${career.progression[0]} contract: $${income.toLocaleString()}/year. Dreams came true.`,
      `🏈 I made it to the NFL! ${career.progression[0]} making $${income.toLocaleString()}/year. The hard work paid off.`,
    ],
    nbaPlayer: [
      `🏀 NBA DRAFT PICK! ${career.progression[0]} contract: $${income.toLocaleString()}/year. I'm in the league!`,
      `🏀 I'm playing in the NBA! ${career.progression[0]} earning $${income.toLocaleString()}/year. Legendary.`,
    ],
    mobster: [
      `🤵 I got inducted into the family. ${career.progression[0]} now. This life chose me. Income: $${income.toLocaleString()}/year.`,
      `🤵 I'm officially made. ${career.progression[0]} of the organization. No turning back now.`,
    ],
    gangMember: [
      `🔫 I'm running with the set now. ${career.progression[0]} status. Streets raised me. $${income.toLocaleString()}/year.`,
      `🔫 Pledged allegiance to the gang. ${career.progression[0]} life. It's survival out here.`,
    ],
  };

  addHistory(updated, randChoice(startMessages[careerKey] || [`Started career as ${career.title}.`]));

  return updated;
}

// Work at special career (monthly income + events)
export function workSpecialCareer(life) {
  const updated = deepClone(life);

  if (!updated.specialCareer) {
    addHistory(updated, "I don't have a special career.");
    return updated;
  }

  const career = SPECIAL_CAREERS[updated.specialCareer.key];
  const monthlyIncome = Math.floor(updated.specialCareer.income / 12);

  // Add income
  updated.money += monthlyIncome;

  // Apply stress
  updated.stress = Math.min(100, updated.stress + randInt(5, 15));

  // Fame growth (for fame careers)
  if (career.managerEligible) {
    const fameGain = randInt(1, Math.floor(career.fameMultiplier * 2));
    updated.fame = Math.min(100, (updated.fame || 0) + fameGain);
  }

  // Performance fluctuation
  updated.specialCareer.performance += randInt(-5, 10);
  updated.specialCareer.performance = Math.max(0, Math.min(100, updated.specialCareer.performance));

  addHistory(updated, `Another month as ${updated.occupation}. Earned $${monthlyIncome.toLocaleString()}.`);

  // INJURY CHECK (Athletes)
  if (career.injuryRisk && Math.random() < career.injuryRisk / 12) { // Monthly check
    const injuries = [
      "I suffered a minor injury. Missing 2 weeks of play.",
      "Injured during practice. Recovery time needed.",
      "Season-ending injury. This is devastating.",
      "Tweaked my ankle. Should be back soon.",
    ];
    addHistory(updated, randChoice(injuries));
    updated.health = Math.max(0, updated.health - randInt(10, 30));
    updated.stress = Math.min(100, updated.stress + randInt(15, 30));
  }

  // CRIME RISK CHECK (Criminal careers)
  if (career.crimeRisk && Math.random() < career.crimeRisk / 12) { // Monthly check
    const crimeEvents = [
      "The cops raided our spot. I barely got away.",
      "Things went south during a job. Lost some money.",
      "Rival gang tried to jump me. Survived but shaken.",
      "Police surveillance is getting heavy. Laying low.",
      "Got into it with a rival. Violence escalated.",
    ];
    addHistory(updated, randChoice(crimeEvents));
    updated.stress = Math.min(100, updated.stress + randInt(20, 40));
    updated.money = Math.max(0, updated.money - randInt(5000, 20000));
  }

  // Morality degradation (Criminal careers)
  if (career.moralityImpact) {
    if (!updated.morality) updated.morality = 50;
    updated.morality = Math.max(0, updated.morality + (career.moralityImpact / 12));
  }

  return updated;
}

// Quit special career
export function quitSpecialCareer(life) {
  const updated = deepClone(life);

  if (!updated.specialCareer) {
    addHistory(updated, "I don't have a special career to quit.");
    return updated;
  }

  const title = updated.specialCareer.title;

  // Save to career history
  if (!updated.careerHistory) updated.careerHistory = [];
  updated.careerHistory.push({
    title: title,
    yearsActive: updated.specialCareer.yearsActive,
    endAge: updated.age,
  });

  updated.specialCareer = null;
  updated.occupation = "Unemployed";
  updated.stress = Math.max(0, updated.stress - 30);

  addHistory(updated, `I walked away from my ${title} career. Time for something new.`);

  return updated;
}
