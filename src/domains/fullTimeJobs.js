// Full-Time Jobs system - 40+ hours/week careers
// 11.11.2025 - Phase 3: Career paths with prerequisites

import { randInt, randChoice, deepClone } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";

// 11.11.2025 - 15 Career paths with degree requirements and progression
export const FULL_TIME_JOBS = {
  // No degree required
  retail: {
    title: "Retail Manager",
    emoji: "🛒",
    description: "Manage store operations and staff",
    requirements: { age: 18, intelligence: 40 },
    degreeRequired: null,
    salary: [35000, 45000],
    hoursPerWeek: 40,
    stressImpact: 25,
    progression: ["Sales Associate", "Shift Lead", "Store Manager", "District Manager"],
  },
  construction: {
    title: "Construction Worker",
    emoji: "🏗️",
    description: "Build structures and infrastructure",
    requirements: { age: 18, health: 65, athleticism: 50 },
    degreeRequired: null,
    salary: [40000, 55000],
    hoursPerWeek: 50,
    stressImpact: 30,
    progression: ["Laborer", "Skilled Worker", "Foreman", "Site Manager"],
  },
  server: {
    title: "Restaurant Server",
    emoji: "🍽️",
    description: "Serve food and provide excellent customer service",
    requirements: { age: 18, attractiveness: 50 },
    degreeRequired: null,
    salary: [25000, 35000], // Plus tips
    hoursPerWeek: 40,
    stressImpact: 35,
    progression: ["Server", "Head Server", "Restaurant Manager", "General Manager"],
  },

  // Bachelor's degree required
  teacher: {
    title: "School Teacher",
    emoji: "👨‍🏫",
    description: "Educate the next generation",
    requirements: { age: 22, intelligence: 75 },
    degreeRequired: "Bachelor's Degree",
    salary: [45000, 65000],
    hoursPerWeek: 45,
    stressImpact: 40,
    progression: ["Teacher", "Lead Teacher", "Department Head", "Principal"],
  },
  nurse: {
    title: "Registered Nurse",
    emoji: "👩‍⚕️",
    description: "Provide patient care and medical support",
    requirements: { age: 22, intelligence: 70, health: 70 },
    degreeRequired: "Bachelor's Degree",
    salary: [60000, 80000],
    hoursPerWeek: 40,
    stressImpact: 50,
    progression: ["RN", "Charge Nurse", "Nurse Manager", "Director of Nursing"],
  },
  engineer: {
    title: "Software Engineer",
    emoji: "💻",
    description: "Design and build software systems",
    requirements: { age: 22, intelligence: 85 },
    degreeRequired: "Bachelor's Degree",
    salary: [80000, 120000],
    hoursPerWeek: 45,
    stressImpact: 35,
    progression: ["Junior Engineer", "Software Engineer", "Senior Engineer", "Staff Engineer"],
  },
  accountant: {
    title: "Accountant",
    emoji: "💼",
    description: "Manage financial records and taxes",
    requirements: { age: 22, intelligence: 75 },
    degreeRequired: "Bachelor's Degree",
    salary: [55000, 75000],
    hoursPerWeek: 45,
    stressImpact: 30,
    progression: ["Junior Accountant", "Accountant", "Senior Accountant", "CFO"],
  },
  marketing: {
    title: "Marketing Manager",
    emoji: "📈",
    description: "Develop and execute marketing strategies",
    requirements: { age: 22, intelligence: 70, attractiveness: 60 },
    degreeRequired: "Bachelor's Degree",
    salary: [60000, 90000],
    hoursPerWeek: 45,
    stressImpact: 40,
    progression: ["Marketing Coordinator", "Marketing Manager", "Director", "CMO"],
  },
  journalist: {
    title: "Journalist",
    emoji: "📰",
    description: "Report news and investigate stories",
    requirements: { age: 22, intelligence: 75 },
    degreeRequired: "Bachelor's Degree",
    salary: [45000, 70000],
    hoursPerWeek: 50,
    stressImpact: 45,
    progression: ["Reporter", "Senior Reporter", "Editor", "Managing Editor"],
  },

  // Master's degree or higher required
  lawyer: {
    title: "Lawyer",
    emoji: "⚖️",
    description: "Represent clients in legal matters",
    requirements: { age: 25, intelligence: 90, influence: 60 },
    degreeRequired: "Master's Degree",
    salary: [90000, 150000],
    hoursPerWeek: 60,
    stressImpact: 60,
    progression: ["Associate", "Senior Associate", "Partner", "Managing Partner"],
  },
  doctor: {
    title: "Doctor",
    emoji: "🩺",
    description: "Diagnose and treat patients",
    requirements: { age: 28, intelligence: 95, health: 75 },
    degreeRequired: "Doctorate Degree",
    salary: [200000, 350000],
    hoursPerWeek: 60,
    stressImpact: 70,
    progression: ["Resident", "Attending Physician", "Senior Physician", "Chief of Medicine"],
  },

  // Law enforcement (special mechanics)
  police: {
    title: "Police Officer",
    emoji: "👮",
    description: "Serve and protect the community",
    requirements: { age: 21, health: 70, intelligence: 50 },
    degreeRequired: null,
    salary: [45000, 65000],
    hoursPerWeek: 45,
    stressImpact: 50,
    progression: ["Police Officer", "Senior Officer", "Sergeant", "Lieutenant"],
    canBecomeDetective: true, // Special path after 3+ years
  },
  detective: {
    title: "Detective",
    emoji: "🕵️",
    description: "Investigate complex criminal cases",
    requirements: { age: 25, intelligence: 75, influence: 50 },
    degreeRequired: null,
    requiresPriorJob: "police", // Must be police officer first
    salary: [65000, 95000],
    hoursPerWeek: 50,
    stressImpact: 60,
    progression: ["Detective", "Senior Detective", "Lead Detective", "Captain"],
    hasCaseSystem: true, // Special investigation mechanics
  },

  // Business/Entrepreneurship
  entrepreneur: {
    title: "Entrepreneur",
    emoji: "💡",
    description: "Build and run your own business",
    requirements: { age: 21, intelligence: 70, influence: 60 },
    degreeRequired: "Bachelor's Degree",
    salary: [40000, 500000], // Highly variable
    hoursPerWeek: 60,
    stressImpact: 70,
    progression: ["Startup Founder", "CEO", "Serial Entrepreneur", "Business Mogul"],
  },
};

// 11.11.2025 - Get eligible jobs based on life stats/education
export function getEligibleJobs(life) {
  const eligible = [];

  for (const [key, job] of Object.entries(FULL_TIME_JOBS)) {
    // Check age
    if (life.age < job.requirements.age) continue;

    // Check degree requirement
    if (job.degreeRequired && life.education !== job.degreeRequired) {
      // Also accept higher degrees
      if (job.degreeRequired === "Bachelor's Degree" &&
          (life.education !== "Master's Degree" && life.education !== "Doctorate Degree")) {
        continue;
      }
      if (job.degreeRequired === "Master's Degree" && life.education !== "Doctorate Degree") {
        continue;
      }
    }

    // Check stat requirements
    let meetsRequirements = true;
    for (const [stat, value] of Object.entries(job.requirements)) {
      if (stat === "age") continue; // Already checked
      if ((life[stat] || 0) < value) {
        meetsRequirements = false;
        break;
      }
    }

    if (!meetsRequirements) continue;

    // Check activity requirement
    if (job.activityRequired) {
      const hasActivity = job.activityRequired.some(activity =>
        life.workHistory?.some(work => work.extracurriculars?.includes(activity)) ||
        life.extracurriculars?.includes(activity)
      );
      if (!hasActivity) continue;
    }

    eligible.push({ key, ...job });
  }

  return eligible;
}

// 11.11.2025 - Apply for full-time job
// 11.13.2025 - v1.06.0: Returns result object for modal feedback
export function applyForFullTimeJob(life, jobKey) {
  const updated = deepClone(life);
  const job = FULL_TIME_JOBS[jobKey];

  if (!job) {
    addHistory(updated, "Job not found.");
    return { updated, success: false, job: { emoji: "❌", title: "Unknown" }, message: "Job listing not found." };
  }

  // Calculate success chance based on stats
  let successChance = 0.5; // Base 50%

  // Intelligence bonus
  if (updated.intelligence >= 80) successChance += 0.2;
  else if (updated.intelligence >= 60) successChance += 0.1;

  // Interview skills (attractiveness + influence)
  const interviewScore = (updated.attractiveness || 50) + (updated.influence || 0);
  successChance += Math.min(0.3, interviewScore / 200);

  // Work history bonus
  if (updated.workHistory && updated.workHistory.length > 0) {
    successChance += Math.min(0.2, updated.workHistory.length * 0.05);
  }

  const success = Math.random() < successChance;

  if (success) {
    // 11.11.2025 - v1.02.0: Generate manager quality
    const managerRoll = Math.random();
    let managerQuality;
    if (managerRoll < 0.2) {
      managerQuality = "poor"; // 20%
    } else if (managerRoll < 0.8) {
      managerQuality = "average"; // 60%
    } else {
      managerQuality = "excellent"; // 20%
    }

    const salary = randInt(job.salary[0], job.salary[1]);
    updated.fullTimeJob = {
      key: jobKey,
      title: job.title,
      emoji: job.emoji,
      salary: salary,
      hoursPerWeek: job.hoursPerWeek,
      stressImpact: job.stressImpact,
      level: 0, // Start at level 0 (first progression)
      tier: 1, // Career tier for coworker generation
      yearsWorked: 0,
      performance: 50, // Start at average performance
      // 11.11.2025 - v1.02.0: Manager system
      manager: {
        id: `manager_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
        quality: managerQuality,
        bond: 30, // Start with neutral relationship
        firstName: randChoice(["John", "Sarah", "Michael", "Emily", "David", "Jessica"]),
        lastName: randChoice(["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller"])
      },
      // 11.11.2025 - v1.02.0: Coworkers (generated after import)
      coworkers: [] // Will be populated by generateCoworkers
    };
    updated.occupation = job.progression[0]; // Start at first title
    updated.stress = Math.min(100, updated.stress + job.stressImpact);

    const managerQualityText = {
      poor: "My manager seems... difficult.",
      average: "My manager seems decent.",
      excellent: "My manager seems amazing!"
    };

    // 11.19.2025 - Enhanced feedback with more detail
    addHistory(updated, `💼 SUCCESS! I got hired as a ${job.progression[0]} at ${job.title}! Starting salary: $${salary.toLocaleString()}/year. ${managerQualityText[managerQuality]}`);

    updated.happiness = Math.min(100, updated.happiness + randInt(15, 25));

    // 11.13.2025 - v1.06.0: Return result for modal
    return {
      updated,
      success: true,
      job: { emoji: job.emoji, title: job.title },
      message: `Congratulations! You've been hired as a ${job.progression[0]}. Starting salary: $${salary.toLocaleString()}/year. ${managerQualityText[managerQuality]}`,
      salary
    };
  } else {
    // 11.13.2025 - v1.06.0: Flavorful rejection messages
    // 11.19.2025 - Enhanced with stress and more visible history
    const rejectionMessages = [
      "Unfortunately, we've decided to move forward with other candidates at this time.",
      "Thank you for your interest. We've chosen to pursue candidates with more experience.",
      "We appreciate your application, but the position has been filled by another candidate.",
      "After careful consideration, we don't feel you're the right fit for this role at the moment.",
      "We were impressed by your application, but ultimately selected someone with a stronger background."
    ];
    const message = randChoice(rejectionMessages);

    addHistory(updated, `❌ REJECTED: I applied for ${job.title} (${job.progression[0]}) but got rejected. The company said: "${message}"`);

    updated.happiness = Math.max(0, updated.happiness - randInt(5, 15));
    updated.stress = Math.min(100, updated.stress + randInt(10, 20));

    return {
      updated,
      success: false,
      job: { emoji: job.emoji, title: job.title },
      message
    };
  }
}

// 11.11.2025 - Work at full-time job (earns monthly salary)
export function workFullTimeJob(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob) {
    addHistory(updated, "I don't have a full-time job.");
    return updated;
  }

  const job = updated.fullTimeJob;
  const monthlySalary = Math.floor(job.salary / 12);

  updated.money += monthlySalary;
  updated.stress = Math.min(100, updated.stress + randInt(5, 15));

  const workEvents = [
    `Another month at ${job.title}. Earned $${monthlySalary.toLocaleString()}.`,
    `Worked hard this month. Paycheck: $${monthlySalary.toLocaleString()}.`,
    `Grinded through another month. Bank account +$${monthlySalary.toLocaleString()}.`,
  ];

  addHistory(updated, randChoice(workEvents));

  // Random promotion chance after 2+ years
  if (job.yearsWorked >= 2 && Math.random() < 0.15) {
    const jobData = FULL_TIME_JOBS[job.key];
    if (job.level < jobData.progression.length - 1) {
      job.level += 1;
      job.salary = Math.floor(job.salary * 1.3); // 30% raise
      updated.occupation = jobData.progression[job.level];
      addHistory(updated, `I got promoted to ${updated.occupation}! New salary: $${job.salary.toLocaleString()}/year.`);
    }
  }

  return updated;
}

// 11.11.2025 - Quit full-time job
export function quitFullTimeJob(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob) {
    addHistory(updated, "I don't have a job to quit.");
    return updated;
  }

  const jobTitle = updated.fullTimeJob.title;

  // Save to work history
  if (!updated.workHistory) updated.workHistory = [];
  updated.workHistory.push({
    title: jobTitle,
    yearsWorked: updated.fullTimeJob.yearsWorked,
    endAge: updated.age,
  });

  updated.fullTimeJob = null;
  updated.occupation = "Unemployed";
  updated.stress = Math.max(0, updated.stress - 20);

  addHistory(updated, `I quit my job as ${jobTitle}. Time for a new chapter.`);

  return updated;
}

// 11.11.2025 - Phase 3A: Job interactions

// Work overtime (extra income but higher stress)
export function workOvertime(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob) {
    addHistory(updated, "I need a job to work overtime.");
    return updated;
  }

  // Check overtime limit (max 4 times per year)
  if (!updated.actionLimits.overtime) {
    updated.actionLimits.overtime = 0;
  }

  if (updated.actionLimits.overtime >= 4) {
    addHistory(updated, "I've worked enough overtime this year. Time to rest.");
    return updated;
  }

  const baseHourly = Math.floor(updated.fullTimeJob.salary / 52 / 40);
  const overtimeHours = randInt(10, 20);
  const overtimePay = Math.floor(baseHourly * 1.5 * overtimeHours); // Time and a half

  updated.money += overtimePay;

  // 11.11.2025 - v1.02.0: Manager quality affects stress gain
  let stressGain = randInt(15, 25);
  const managerQuality = updated.fullTimeJob.manager?.quality || "average";
  if (managerQuality === "excellent") {
    stressGain = Math.floor(stressGain * 0.9); // -10% stress with great manager
  } else if (managerQuality === "poor") {
    stressGain = Math.floor(stressGain * 1.2); // +20% stress with poor manager
  }

  updated.stress = Math.min(100, updated.stress + stressGain);
  updated.fullTimeJob.hoursPerWeek += overtimeHours;
  updated.actionLimits.overtime += 1;

  // Performance boost
  if (!updated.fullTimeJob.performance) updated.fullTimeJob.performance = 50;
  updated.fullTimeJob.performance = Math.min(100, updated.fullTimeJob.performance + randInt(5, 10));

  addHistory(updated, `I worked ${overtimeHours} hours of overtime. Earned $${overtimePay.toLocaleString()} extra.`);

  return updated;
}

// Take a break (reduce stress, lose some performance)
export function takeBreak(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob) {
    addHistory(updated, "I need a job to take a break from.");
    return updated;
  }

  // Check break limit (max 3 per year)
  if (!updated.actionLimits.breaks) {
    updated.actionLimits.breaks = 0;
  }

  if (updated.actionLimits.breaks >= 3) {
    addHistory(updated, "I've taken enough breaks this year. Back to work.");
    return updated;
  }

  updated.stress = Math.max(0, updated.stress - randInt(20, 35));
  updated.happiness = Math.min(100, updated.happiness + randInt(10, 20));
  updated.actionLimits.breaks += 1;

  // Small performance penalty
  if (!updated.fullTimeJob.performance) updated.fullTimeJob.performance = 50;
  updated.fullTimeJob.performance = Math.max(0, updated.fullTimeJob.performance - randInt(3, 8));

  const breakEvents = [
    "I took a mental health day. Recharged and ready.",
    "I used my PTO to rest. Stress melted away.",
    "I took a break from the grind. Needed that.",
    "I stepped away from work for a bit. Clarity restored.",
  ];

  addHistory(updated, randChoice(breakEvents));

  return updated;
}

// Ask for raise (chance based on performance)
export function askForRaise(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob) {
    addHistory(updated, "I need a job to ask for a raise.");
    return updated;
  }

  // Check raise limit (max 2 per year)
  if (!updated.actionLimits.raiseRequests) {
    updated.actionLimits.raiseRequests = 0;
  }

  if (updated.actionLimits.raiseRequests >= 2) {
    addHistory(updated, "I've already asked for a raise this year. Don't want to seem greedy.");
    return updated;
  }

  const performance = updated.fullTimeJob.performance || 50;
  const yearsWorked = updated.fullTimeJob.yearsWorked || 0;

  // Calculate success chance
  let successChance = 0.3; // Base 30%
  if (performance >= 80) successChance += 0.3;
  else if (performance >= 60) successChance += 0.15;
  if (yearsWorked >= 3) successChance += 0.2;
  else if (yearsWorked >= 1) successChance += 0.1;

  updated.actionLimits.raiseRequests += 1;

  if (Math.random() < successChance) {
    const raisePercent = randInt(5, 15);
    const oldSalary = updated.fullTimeJob.salary;
    updated.fullTimeJob.salary = Math.floor(oldSalary * (1 + raisePercent / 100));
    const raise = updated.fullTimeJob.salary - oldSalary;

    addHistory(updated, `💰 I got a ${raisePercent}% raise! New salary: $${updated.fullTimeJob.salary.toLocaleString()}/year (+$${raise.toLocaleString()}).`);
    updated.happiness = Math.min(100, updated.happiness + randInt(10, 20));
  } else {
    const rejectionEvents = [
      "My boss said 'maybe next year' when I asked for a raise. Frustrating.",
      "I asked for a raise and got shut down. Not the answer I wanted.",
      "My raise request was denied. They said 'budget constraints.'",
      "I asked for more money. They laughed. Seriously considering my options.",
    ];
    addHistory(updated, randChoice(rejectionEvents));
    updated.stress = Math.min(100, updated.stress + randInt(10, 15));
    updated.happiness = Math.max(0, updated.happiness - randInt(5, 10));
  }

  return updated;
}

// Pursue promotion (requires good performance and time)
export function pursuePromotion(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob) {
    addHistory(updated, "I need a job to pursue promotion.");
    return updated;
  }

  const jobData = FULL_TIME_JOBS[updated.fullTimeJob.key];
  if (!jobData) {
    addHistory(updated, "Career progression not available.");
    return updated;
  }

  // Check if already at max level
  if (updated.fullTimeJob.level >= jobData.progression.length - 1) {
    addHistory(updated, "I'm already at the top of my career ladder.");
    return updated;
  }

  // Check promotion limit (max 1 per year)
  if (!updated.actionLimits.promotionAttempts) {
    updated.actionLimits.promotionAttempts = 0;
  }

  if (updated.actionLimits.promotionAttempts >= 1) {
    addHistory(updated, "I've already tried for promotion this year. Need to prove myself more.");
    return updated;
  }

  const performance = updated.fullTimeJob.performance || 50;
  const yearsWorked = updated.fullTimeJob.yearsWorked || 0;

  // Calculate success chance
  let successChance = 0.15; // Base 15%
  if (performance >= 85) successChance += 0.35;
  else if (performance >= 70) successChance += 0.2;
  else if (performance >= 50) successChance += 0.1;
  if (yearsWorked >= 4) successChance += 0.25;
  else if (yearsWorked >= 2) successChance += 0.15;

  // 11.11.2025 - v1.02.0: Manager quality affects promotion success
  const managerQuality = updated.fullTimeJob.manager?.quality || "average";
  if (managerQuality === "excellent") {
    successChance += 0.15; // +15% with great manager
  } else if (managerQuality === "poor") {
    successChance -= 0.15; // -15% with poor manager
  }

  updated.actionLimits.promotionAttempts += 1;

  if (Math.random() < successChance) {
    updated.fullTimeJob.level += 1;
    updated.fullTimeJob.salary = Math.floor(updated.fullTimeJob.salary * 1.35); // 35% raise
    updated.occupation = jobData.progression[updated.fullTimeJob.level];
    updated.influence = Math.min(100, (updated.influence || 0) + randInt(5, 15));

    addHistory(updated, `🎖️ PROMOTED to ${updated.occupation}! New salary: $${updated.fullTimeJob.salary.toLocaleString()}/year.`);
    updated.happiness = Math.min(100, updated.happiness + randInt(15, 30));
    updated.stress = Math.min(100, updated.stress + randInt(10, 20)); // More responsibility
  } else {
    addHistory(updated, "I was passed over for promotion. They gave it to someone else.");
    updated.stress = Math.min(100, updated.stress + randInt(15, 25));
    updated.happiness = Math.max(0, updated.happiness - randInt(10, 20));
  }

  return updated;
}

// Network with coworkers (build relationships, increase promotion chances)
export function networkAtWork(life) {
  const updated = deepClone(life);

  if (!updated.fullTimeJob) {
    addHistory(updated, "I need a job to network at.");
    return updated;
  }

  // Check networking limit (max 4 per year)
  if (!updated.actionLimits.networking) {
    updated.actionLimits.networking = 0;
  }

  if (updated.actionLimits.networking >= 4) {
    addHistory(updated, "I've networked enough this year. Don't want to seem desperate.");
    return updated;
  }

  updated.influence = Math.min(100, (updated.influence || 0) + randInt(3, 8));
  updated.attractiveness = Math.min(100, updated.attractiveness + randInt(1, 3)); // Social skills
  updated.actionLimits.networking += 1;

  // Performance boost from good relationships
  if (!updated.fullTimeJob.performance) updated.fullTimeJob.performance = 50;
  updated.fullTimeJob.performance = Math.min(100, updated.fullTimeJob.performance + randInt(3, 7));

  const networkingEvents = [
    "I grabbed lunch with colleagues. Built some rapport.",
    "I attended the company happy hour. Made connections.",
    "I networked with senior leadership. They noticed me.",
    "I helped a coworker with a project. Good karma.",
  ];

  addHistory(updated, randChoice(networkingEvents));

  return updated;
}
