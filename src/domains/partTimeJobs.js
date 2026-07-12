// Part-Time Jobs Domain - Teen employment system (ages 14-18)
// 11.11.2025 - Phase 2.1: Part-time jobs implementation
// 11.11.2025 - Updated to 8-16 hours/week for part-time jobs

import { randInt, randChoice, deepClone } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";

// Part-time job definitions with requirements, pay, and characteristics
export const PART_TIME_JOBS = {
  retail: {
    title: "Retail Cashier",
    emoji: "🛒",
    description: "Work as a cashier at a local retail store",
    minAge: 14,
    requirements: {
      intelligence: 20,
      attractiveness: 30,
    },
    hourlyPay: [9, 13],
    hoursPerWeek: [8, 16], // 11.11.2025 - Updated to 8-16 hours
    stressPerShift: [5, 10],
    skillGains: {
      intelligence: [1, 3],
      attractiveness: [1, 2], // Customer service skills
    },
    workExperience: "Retail",
  },
  fastFood: {
    title: "Fast Food Worker",
    emoji: "🍔",
    description: "Work at a fast food restaurant",
    minAge: 14,
    requirements: {
      intelligence: 15,
    },
    hourlyPay: [8, 12],
    hoursPerWeek: [10, 16], // 11.11.2025 - Updated to 8-16 hours
    stressPerShift: [8, 15],
    skillGains: {
      intelligence: [1, 2],
      stress: [5, 10], // High stress environment
    },
    workExperience: "Food Service",
  },
  tutor: {
    title: "Private Tutor",
    emoji: "📚",
    description: "Tutor younger students in various subjects",
    minAge: 15,
    requirements: {
      intelligence: 60,
    },
    hourlyPay: [15, 25],
    hoursPerWeek: [8, 14], // 11.11.2025 - Updated to 8-16 hours
    stressPerShift: [3, 7],
    skillGains: {
      intelligence: [2, 5],
      happiness: [2, 5], // Fulfilling work
    },
    workExperience: "Education",
  },
  babysitter: {
    title: "Babysitter",
    emoji: "👶",
    description: "Watch over children for local families",
    minAge: 14,
    requirements: {
      intelligence: 25,
      attractiveness: 20, // Trustworthy appearance
    },
    hourlyPay: [10, 18],
    hoursPerWeek: [8, 14], // 11.11.2025 - Updated to 8-16 hours
    stressPerShift: [4, 12],
    skillGains: {
      intelligence: [1, 2],
      happiness: [1, 4],
    },
    workExperience: "Childcare",
  },
  barista: {
    title: "Barista",
    emoji: "☕",
    description: "Make coffee and serve customers at a café",
    minAge: 15,
    requirements: {
      intelligence: 30,
      attractiveness: 35,
    },
    hourlyPay: [10, 15],
    hoursPerWeek: [8, 16], // 11.11.2025 - Updated to 8-16 hours
    stressPerShift: [6, 11],
    skillGains: {
      intelligence: [1, 3],
      attractiveness: [1, 3], // Customer interaction
    },
    workExperience: "Food Service",
  },
  lifeguard: {
    title: "Lifeguard",
    emoji: "🏊",
    description: "Watch over swimmers at the local pool",
    minAge: 16,
    requirements: {
      intelligence: 40,
      health: 60,
      attractiveness: 30,
    },
    hourlyPay: [12, 18],
    hoursPerWeek: [12, 16], // 11.11.2025 - Updated to 8-16 hours
    stressPerShift: [5, 10],
    skillGains: {
      health: [2, 5],
      attractiveness: [1, 3], // Physical fitness
    },
    workExperience: "Safety & Recreation",
  },
  stockClerk: {
    title: "Stock Clerk",
    emoji: "📦",
    description: "Stock shelves and organize inventory",
    minAge: 14,
    requirements: {
      intelligence: 15,
      health: 50,
    },
    hourlyPay: [9, 13],
    hoursPerWeek: [10, 16], // 11.11.2025 - Updated to 8-16 hours
    stressPerShift: [4, 8],
    skillGains: {
      health: [1, 3], // Physical work
      intelligence: [1, 2],
    },
    workExperience: "Warehouse",
  },
  movieTheater: {
    title: "Movie Theater Usher",
    emoji: "🎬",
    description: "Work at the local movie theater",
    minAge: 15,
    requirements: {
      intelligence: 20,
      attractiveness: 25,
    },
    hourlyPay: [9, 14],
    hoursPerWeek: [8, 16], // 11.11.2025 - Updated to 8-16 hours
    stressPerShift: [3, 7],
    skillGains: {
      happiness: [2, 5], // Fun work environment
      intelligence: [1, 2],
    },
    workExperience: "Entertainment",
  },
};

// Generate a part-time job offer
export function generateJobOffer(jobType, life) {
  const job = PART_TIME_JOBS[jobType];
  if (!job) return null;

  // Check if player meets requirements
  const meetsAge = life.age >= job.minAge;
  const meetsInt = !job.requirements.intelligence || life.intelligence >= job.requirements.intelligence;
  const meetsAttr = !job.requirements.attractiveness || life.attractiveness >= job.requirements.attractiveness;
  const meetsHealth = !job.requirements.health || life.health >= job.requirements.health;

  const eligible = meetsAge && meetsInt && meetsAttr && meetsHealth;

  const hourlyPay = randInt(job.hourlyPay[0], job.hourlyPay[1]);
  const hoursPerWeek = randInt(job.hoursPerWeek[0], job.hoursPerWeek[1]);

  return {
    type: jobType,
    ...job,
    hourlyPay,
    hoursPerWeek,
    eligible,
    requirements: job.requirements,
    reasonsIneligible: {
      age: !meetsAge ? `Must be at least ${job.minAge} years old` : null,
      intelligence: !meetsInt ? `Need ${job.requirements.intelligence}+ Intelligence` : null,
      attractiveness: !meetsAttr ? `Need ${job.requirements.attractiveness}+ Attractiveness` : null,
      health: !meetsHealth ? `Need ${job.requirements.health}+ Health` : null,
    },
  };
}

// Apply for a part-time job
export function applyForJob(life, jobType) {
  const updated = deepClone(life);
  const job = PART_TIME_JOBS[jobType];

  if (!job) {
    addHistory(updated, "I tried to apply for a job that doesn't exist. Awkward.");
    return updated;
  }

  // Check eligibility
  const meetsAge = updated.age >= job.minAge;
  const meetsInt = !job.requirements.intelligence || updated.intelligence >= job.requirements.intelligence;
  const meetsAttr = !job.requirements.attractiveness || updated.attractiveness >= job.requirements.attractiveness;
  const meetsHealth = !job.requirements.health || updated.health >= job.requirements.health;

  if (!meetsAge || !meetsInt || !meetsAttr || !meetsHealth) {
    addHistory(updated, `I applied to be a ${job.title} but didn't meet the requirements.`);
    return updated;
  }

  // Success chance based on stats (with some randomness)
  const successChance = 0.5 + (updated.intelligence / 200) + (updated.attractiveness / 300);
  const hired = Math.random() < successChance;

  if (hired) {
    const hourlyPay = randInt(job.hourlyPay[0], job.hourlyPay[1]);
    const hoursPerWeek = randInt(job.hoursPerWeek[0], job.hoursPerWeek[1]);

    updated.partTimeJob = {
      type: jobType,
      title: job.title,
      emoji: job.emoji,
      hourlyPay,
      hoursPerWeek,
      totalShiftsWorked: 0,
      workExperience: job.workExperience,
      hiredAt: updated.age,
    };

    addHistory(updated, `${job.emoji} I got hired as a ${job.title}! I'll make $${hourlyPay}/hour working ${hoursPerWeek} hours per week.`);
  } else {
    const rejections = [
      `I applied to be a ${job.title} but didn't get a callback.`,
      `The ${job.title} position was filled before I could interview.`,
      `I bombed the interview for ${job.title}. They said "we'll call you" (they won't).`,
      `I applied for ${job.title} but was rejected. They want someone with "more experience."`,
    ];
    addHistory(updated, randChoice(rejections));
  }

  return updated;
}

// Work a shift at current part-time job
export function workShift(life) {
  const updated = deepClone(life);

  if (!updated.partTimeJob) {
    addHistory(updated, "I tried to work a shift but I don't have a job.");
    return updated;
  }

  // Check shift limit (max 4 shifts per year to prevent farming)
  if (!updated.actionLimits.partTimeShifts) {
    updated.actionLimits.partTimeShifts = 0;
  }

  if (updated.actionLimits.partTimeShifts >= 4) {
    addHistory(updated, "I've already worked enough shifts this year. Time to focus on other things.");
    return updated;
  }

  const job = PART_TIME_JOBS[updated.partTimeJob.type];
  const earnings = updated.partTimeJob.hourlyPay * updated.partTimeJob.hoursPerWeek;

  // Apply stress
  const stressGain = randInt(job.stressPerShift[0], job.stressPerShift[1]);
  updated.stress = Math.min(100, updated.stress + stressGain);

  // Apply skill gains
  Object.keys(job.skillGains).forEach((skill) => {
    const gain = randInt(job.skillGains[skill][0], job.skillGains[skill][1]);
    if (skill === "intelligence") {
      updated.intelligence = Math.min(100, updated.intelligence + gain);
    } else if (skill === "attractiveness") {
      updated.attractiveness = Math.min(100, updated.attractiveness + gain);
    } else if (skill === "health") {
      updated.health = Math.min(100, updated.health + gain);
    } else if (skill === "happiness") {
      updated.happiness = Math.min(100, updated.happiness + gain);
    }
  });

  // Add money
  updated.money += earnings;

  // Track shifts worked
  updated.partTimeJob.totalShiftsWorked += 1;
  updated.actionLimits.partTimeShifts += 1;

  // Random work events
  const workEvents = [
    `I worked my shift at ${updated.partTimeJob.title}. Made $${earnings}.`,
    `${updated.partTimeJob.emoji} Another shift down. Pocketed $${earnings}.`,
    `I clocked in, did my time, earned $${earnings}. The grind continues.`,
    `Worked at ${updated.partTimeJob.title}. Earned $${earnings}. My manager actually smiled at me today.`,
    `Shift complete. $${earnings} richer, but my soul feels a little emptier.`,
  ];

  addHistory(updated, randChoice(workEvents));

  // Rare special events (10% chance)
  if (Math.random() < 0.1) {
    const specialEvents = {
      retail: [
        "A customer yelled at me for 10 minutes over a $2 coupon.",
        "I caught someone trying to shoplift. Security handled it.",
        "My manager complimented my customer service today!",
      ],
      fastFood: [
        "The ice cream machine broke again. Customers were not happy.",
        "Someone ordered 50 burgers at closing time. I hate people.",
        "I got free food today because of a mistake order!",
      ],
      tutor: [
        "My student finally understood fractions! So rewarding.",
        "The parent gave me a $20 tip for helping their kid ace a test.",
        "Student cancelled last minute. Still got paid though.",
      ],
      babysitter: [
        "The kid threw up on me. Hazard pay should be a thing.",
        "The parents tipped me extra for staying late. Nice!",
        "I helped the kid with homework and they actually listened.",
      ],
      barista: [
        "Someone left a $10 tip in the jar!",
        "I made latte art that actually looked good for once.",
        "A customer asked for my number. Awkward but flattering.",
      ],
      lifeguard: [
        "I had to blow the whistle at rowdy teens all day.",
        "Saved a kid from the deep end. Parents were grateful.",
        "Got a killer tan during my shift today.",
      ],
      stockClerk: [
        "Dropped an entire pallet of boxes. My boss was NOT happy.",
        "Found $20 on the floor while stocking. Finders keepers.",
        "Finished inventory early. Got to leave 30 minutes early!",
      ],
      movieTheater: [
        "I watched half of the new blockbuster during my shift.",
        "Cleaned up spilled popcorn for 2 hours straight.",
        "Free movie tickets as employee perk!",
      ],
    };

    const events = specialEvents[updated.partTimeJob.type] || [];
    if (events.length > 0) {
      addHistory(updated, randChoice(events));
    }
  }

  return updated;
}

// Quit current part-time job
export function quitJob(life) {
  const updated = deepClone(life);

  if (!updated.partTimeJob) {
    addHistory(updated, "I tried to quit a job I don't have. Peak comedy.");
    return updated;
  }

  const jobTitle = updated.partTimeJob.title;
  addHistory(updated, `I quit my job as a ${jobTitle}. Freedom!`);

  // Save work experience before deleting
  if (!updated.workHistory) {
    updated.workHistory = [];
  }
  updated.workHistory.push({
    title: updated.partTimeJob.title,
    type: updated.partTimeJob.workExperience,
    shiftsWorked: updated.partTimeJob.totalShiftsWorked,
    workedFrom: updated.partTimeJob.hiredAt,
    workedTo: updated.age,
  });

  delete updated.partTimeJob;
  return updated;
}

// Get all available part-time jobs for the player's current situation
export function getAvailableJobs(life) {
  const available = [];
  Object.keys(PART_TIME_JOBS).forEach((jobType) => {
    const offer = generateJobOffer(jobType, life);
    if (offer) {
      available.push(offer);
    }
  });
  return available;
}
