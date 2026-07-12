// University Domain
// 11.11.2025 - University application and enrollment logic

import { randInt, randChoice, deepClone } from "../utils/random.js";
import { addHistory } from "../core/gameState.js";
import { getGradePercent } from "./schoolProgress.js";

export function applyForScholarship(life) {
  const updated = deepClone(life);

  // Calculate scholarship chance based on intelligence, athleticism, and extracurriculars
  const intelligence = updated.intelligence || 50;
  const athleticism = updated.athleticism || 30;
  const gradePercent = getGradePercent(updated);
  const hasAthletics = updated.extracurriculars?.some(a => a === "basketball" || a === "soccer" || a === "football");
  const hasAcademics = intelligence >= 80;

  let scholarshipChance = 0.2; // Base 20%

  // Academic scholarship
  if (intelligence >= 90) {
    scholarshipChance += 0.5; // 70% chance
  } else if (intelligence >= 80) {
    scholarshipChance += 0.3; // 50% chance
  } else if (intelligence >= 70) {
    scholarshipChance += 0.15; // 35% chance
  }

  if (gradePercent >= 92) {
    scholarshipChance += 0.25;
  } else if (gradePercent >= 85) {
    scholarshipChance += 0.15;
  } else if (gradePercent < 70) {
    scholarshipChance -= 0.1;
  }

  // Athletic scholarship
  if (hasAthletics && athleticism >= 80) {
    scholarshipChance += 0.5; // 70% chance
  } else if (hasAthletics && athleticism >= 70) {
    scholarshipChance += 0.3; // 50% chance
  }

  const awarded = Math.random() < scholarshipChance;

  if (awarded) {
    updated.occupation = "University Student (Scholarship)";
    updated.education = "Bachelor's Degree (In Progress)";
    updated.studentDebt = 0;
    addHistory(updated, "🎓 I received a scholarship! University is fully covered. Dreams do come true!");
  } else {
    addHistory(updated, "I applied for a scholarship but was rejected. Need to find another way to pay for university.");
  }

  return { updated, awarded };
}

export function payTuitionSelf(life) {
  const updated = deepClone(life);
  const tuitionCost = 20000;

  if (updated.money >= tuitionCost) {
    updated.money -= tuitionCost;
    updated.occupation = "University Student";
    updated.education = "Bachelor's Degree (In Progress)";
    updated.studentDebt = 0;
    addHistory(updated, `💰 I paid $${tuitionCost.toLocaleString()} for university tuition from my savings. Time to hit the books!`);
    return { updated, success: true };
  } else {
    addHistory(updated, "I don't have enough money to pay for university.");
    return { updated, success: false };
  }
}

export function payTuitionParents(life) {
  const updated = deepClone(life);
  const tuitionCost = 20000;

  // Find parents
  const mother = updated.relationships?.find(r => r.relation === "Mother");
  const father = updated.relationships?.find(r => r.relation === "Father");

  if (!mother && !father) {
    addHistory(updated, "I don't have parents to ask for help with tuition.");
    return { updated, success: false };
  }

  // Calculate chance based on parent bond and occupation
  const parentBond = Math.max(mother?.bond || 0, father?.bond || 0);
  const hasWorkingParent = mother?.occupation || father?.occupation;

  let payChance = 0.3; // Base 30%

  if (parentBond >= 80) {
    payChance += 0.4; // 70% chance
  } else if (parentBond >= 60) {
    payChance += 0.2; // 50% chance
  }

  if (hasWorkingParent) {
    payChance += 0.2; // More likely if parents have jobs
  }

  const willPay = Math.random() < payChance;

  if (willPay) {
    updated.occupation = "University Student";
    updated.education = "Bachelor's Degree (In Progress)";
    updated.studentDebt = 0;
    const parentName = mother?.firstName || father?.firstName;
    addHistory(updated, `👨‍👩‍👦 My ${mother ? "mother" : "father"} ${parentName} agreed to pay for my university tuition! I'm so grateful.`);
    if (mother) mother.bond = Math.min(100, mother.bond + 10);
    if (father) father.bond = Math.min(100, father.bond + 10);
    return { updated, success: true };
  } else {
    const denials = [
      "My parents said they can't afford to pay for university right now.",
      "My parents told me I need to find my own way to pay for college.",
      "My parents said 'Money doesn't grow on trees.' I need another plan.",
    ];
    addHistory(updated, randChoice(denials));
    return { updated, success: false };
  }
}

export function takeStudentLoan(life) {
  const updated = deepClone(life);
  const loanAmount = 20000;

  updated.occupation = "University Student";
  updated.education = "Bachelor's Degree (In Progress)";
  updated.studentDebt = loanAmount;
  updated.monthlyLoanPayment = 200; // $200/month payment

  addHistory(updated, `🏦 I took out $${loanAmount.toLocaleString()} in student loans. I'll be paying $200/month until it's paid off.`);

  return updated;
}

export function skipUniversity(life) {
  const updated = deepClone(life);
  addHistory(updated, "I decided not to go to university right now. Time to figure out my next move.");
  return updated;
}

// 11.13.2025 - v1.06.0: University progression system
export function progressUniversity(life) {
  const updated = deepClone(life);

  // Only process if in university
  if (!updated.occupation || !updated.occupation.includes("University Student")) {
    return updated;
  }

  // Initialize progress if not exists
  if (!updated.universityProgress) {
    updated.universityProgress = 0;
  }
  if (!updated.universityProbation) {
    updated.universityProbation = false;
  }
  if (!updated.universityProbationCount) {
    updated.universityProbationCount = 0;
  }

  // Calculate yearly progress based on intelligence and stress
  const intelligence = updated.intelligence || 50;
  const stress = updated.stress || 0;

  // Base progress: 25 points per year (4 years = 100)
  let yearlyProgress = 25;

  // Intelligence modifier
  if (intelligence >= 85) {
    yearlyProgress += 10; // Fast track
  } else if (intelligence >= 70) {
    yearlyProgress += 5; // Ahead
  } else if (intelligence < 50) {
    yearlyProgress -= 10; // Struggling
  } else if (intelligence < 60) {
    yearlyProgress -= 5; // Behind
  }

  // Stress penalty
  if (stress >= 80) {
    yearlyProgress -= 10; // Burnout
  } else if (stress >= 60) {
    yearlyProgress -= 5; // Stressed
  }

  // Add random variation
  yearlyProgress += randInt(-5, 5);

  // Check for probation (poor performance) - Made rarer
  // 11.19.2025 - Changed from 15 to 10 threshold, and expulsion from 2 to 3 strikes
  if (yearlyProgress < 10 && !updated.universityProbation) {
    updated.universityProbation = true;
    updated.universityProbationCount += 1;
    addHistory(updated, "⚠️ I was put on academic probation for poor performance. I need to improve or risk expulsion.");
    updated.stress = Math.min(100, updated.stress + 20);
  } else if (yearlyProgress >= 10 && updated.universityProbation) {
    // Off probation
    updated.universityProbation = false;
    addHistory(updated, "✅ I'm off academic probation! My performance improved.");
    updated.happiness = Math.min(100, updated.happiness + 15);
  } else if (yearlyProgress < 10 && updated.universityProbation) {
    // Still on probation - risk expulsion
    updated.universityProbationCount += 1;
    if (updated.universityProbationCount >= 3) {
      // Expelled - now requires 3 strikes instead of 2
      updated.occupation = "Unemployed";
      updated.education = null;
      updated.universityProgress = 0;
      updated.universityProbation = false;
      updated.universityProbationCount = 0;
      addHistory(updated, "❌ I was expelled from university due to continued poor academic performance. This is a major setback.");
      updated.stress = Math.min(100, updated.stress + 30);
      updated.happiness = Math.max(0, updated.happiness - 30);
      return updated;
    } else {
      const yearsLeft = 3 - updated.universityProbationCount;
      addHistory(updated, `⚠️ I'm still on academic probation. ${yearsLeft} more year(s) like this and I'll be expelled.`);
      updated.stress = Math.min(100, updated.stress + 15);
    }
  }

  // Apply progress
  updated.universityProgress += yearlyProgress;

  // Progress messages
  if (yearlyProgress >= 35) {
    addHistory(updated, `🎓 Excellent year at university! Made ${yearlyProgress} points of progress. (Total: ${updated.universityProgress}/100)`);
  } else if (yearlyProgress >= 25) {
    addHistory(updated, `📚 Solid year at university. Made ${yearlyProgress} points of progress. (Total: ${updated.universityProgress}/100)`);
  } else if (yearlyProgress >= 15) {
    addHistory(updated, `📖 Struggled a bit but passed. Made ${yearlyProgress} points of progress. (Total: ${updated.universityProgress}/100)`);
  } else {
    addHistory(updated, `😰 Really tough year. Only made ${yearlyProgress} points of progress. (Total: ${updated.universityProgress}/100)`);
  }

  // Check for graduation
  if (updated.universityProgress >= 100) {
    updated.occupation = "Unemployed"; // Graduated, need new job
    updated.education = "Bachelor's Degree";
    updated.universityProgress = 0;
    updated.universityProbation = false;
    updated.universityProbationCount = 0;

    // Remove student debt if it was paid off during school
    // (Keep debt if still exists)

    addHistory(updated, "🎓 I GRADUATED from university with a Bachelor's Degree! Time to start my career.");
    updated.happiness = Math.min(100, updated.happiness + 30);
    updated.influence = Math.min(100, (updated.influence || 0) + 15);
  }

  return updated;
}
