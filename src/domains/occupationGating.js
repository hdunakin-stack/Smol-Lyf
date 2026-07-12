// Occupation Gating Logic
// 11.13.2025 - v1.06.0: Centralized eligibility and visibility rules

// Check if user can see/apply for full-time jobs
export function canSeeFullTime(life) {
  if (life.age < 18) return false;

  // Block if in school (middle/high school or university)
  const inMiddleSchool = life.age >= 11 && life.age < 14 && !life.droppedOut;
  const inHighSchool = life.age >= 14 && life.age < 18 && !life.droppedOut;
  const inUniversity = life.occupation && life.occupation.includes("University Student");

  const inSchool = inMiddleSchool || inHighSchool || inUniversity;

  return !inSchool;
}

// Check if Income header should be visible
export function showIncome(life) {
  const hasJob = !!(life.fullTimeJob || life.partTimeJob || life.specialCareer);
  return life.age >= 12 || hasJob;
}

// Check if freelance gigs should be visible
export function showFreelance(life) {
  return life.age >= 12;
}

// Check if part-time jobs should be visible
export function showPartTime(life) {
  return life.age >= 15 && life.age < 18;
}

// Check if special careers should be visible
export function showSpecialCareers(life) {
  return life.age >= 18;
}

// Check if school section should be visible
export function showSchool(life) {
  if (life.droppedOut) return false;
  if (life.age >= 5 && life.age < 18) return true;
  return false;
}

// Check if university is active
export function isInUniversity(life) {
  return life.occupation && life.occupation.includes("University Student");
}
