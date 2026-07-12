// Game state management and life object operations

import { randInt, randChoice, deepClone } from "../utils/random.js";
import { getFirstName, getLastName } from "../config/names.js";
import { getCityByOrigin } from "../config/locations.js";
import { generateNPC, generateClassmate } from "./npc.js";
import { getDefaultAppearance, normalizeAppearance } from "../domains/characterAppearance.js";
import { getOccupationLabelForAge, getStartingAgeForStage, normalizeStartingStage } from "../utils/lifeStages.js";
import { ensureSchoolState, getGradeLetter } from "../domains/schoolProgress.js";

export function addHistory(lifeObj, text) {
  const age = lifeObj.age;
  if (!lifeObj.history[age]) lifeObj.history[age] = [];
  lifeObj.history[age].unshift(text);
}

function softlyGrowSharedBonds(list, minGain, maxGain) {
  return (list || []).map((person) => ({
    ...person,
    bond: Math.min(100, Number(person.bond || 0) + randInt(minGain, maxGain)),
  }));
}

function pickUniqueSiblingName(origin, gender, relationships, lastName) {
  const firstNames = getFirstName(origin, gender);
  const usedSiblingNames = new Set(
    (relationships || [])
      .filter((person) => String(person.relation || "").includes("Sibling"))
      .map((person) => `${person.firstName}|${person.lastName || lastName}`)
  );
  const availableNames = firstNames.filter((name) => !usedSiblingNames.has(`${name}|${lastName}`));
  return randChoice(availableNames.length ? availableNames : firstNames);
}

export function createNewLife(formData) {
  const { firstName, lastName, origin, gender, appearance, startingStage } = formData;
  const cityArr = getCityByOrigin(origin);
  const city = randChoice(cityArr);
  const motherAge = randInt(22, 35);
  const fatherAge = randInt(24, 37);
  const lifeId = `life-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
  const normalizedStage = normalizeStartingStage(startingStage);
  const startingAge = getStartingAgeForStage(normalizedStage);

  const mother = generateNPC("Mother", motherAge, origin, lastName, "Female");
  const father = generateNPC("Father", fatherAge, origin, lastName, "Male");

  // 11.11.2025 - Added part-time job and work history fields
  // 11.19.2025 - Added appearance system
  const newLife = {
    lifeId,
    firstName,
    lastName,
    origin,
    city,
    gender,
    appearance: normalizeAppearance(appearance || getDefaultAppearance({ gender, stage: normalizedStage }), { gender, stage: normalizedStage }), // 11.19.2025 - Character appearance
    startingStage: normalizedStage,
    age: startingAge,
    money: 0,
    intelligence: randInt(30, 70),
    attractiveness: randInt(30, 70),
    stress: randInt(5, 15),
    fame: 0,
    health: 100,
    happiness: randInt(60, 90),
    influence: 0, // 11.11.2025 - Influence stat for clubs/leadership
    athleticism: randInt(20, 50), // 11.11.2025 - Athletic ability for sports/cliques
    musical: randInt(20, 50), // 11.11.2025 - Musical talent for band/choir
    occupation: getOccupationLabelForAge(startingAge, origin),
    relationships: [mother, father],
    classmates: [],
    partTimeJob: null, // 11.11.2025 - Part-time job tracking
    workHistory: [], // 11.11.2025 - Work experience history
    extracurriculars: [], // 11.11.2025 - Active extracurriculars with progress
    clique: null, // 11.11.2025 - Phase 2.2: Social clique membership
    history: {},
    licenses: {},
    school: startingAge >= 5 && startingAge < 18 ? { gradePercent: 70, studyMomentum: 0 } : null,
    yearlyCounters: {},
    progressFlags: {
      studyStressStages: {},
    },
    promptState: {},
    actionLimits: {
      freelanceGigs: 0,
      partTimeShifts: 0, // 11.11.2025 - Part-time shift limit
      extracurricularPractice: 0, // 11.11.2025 - v1.00.11: Extracurricular practice limit (1x/year)
      relationshipInteractions: {},
      activities: 0,
      activityImpactCounts: {},
    },
  };

  if (startingAge === 0) {
    addHistory(newLife, "I was born. A whole new storyline just unlocked.");
    addHistory(newLife, `I was born at their home to my mother ${mother.firstName} ${mother.lastName} (age ${mother.age}) and my father ${father.firstName} ${father.lastName} (age ${father.age}). They are happily married.`);
  } else {
    addHistory(newLife, `This life begins in ${city} at age ${startingAge}. The story opens in motion instead of at the very start.`);
    addHistory(newLife, `My parents ${mother.firstName} and ${father.firstName} are still central figures in this chapter.`);
  }

  if (startingAge >= 5 && startingAge < 18) {
    ensureSchoolState(newLife);
    for (let i = 0; i < 8; i++) {
      newLife.classmates.push(generateClassmate(newLife.origin, newLife.age));
    }
    addHistory(newLife, "School is already part of the rhythm of this life.");
  }

  if (startingAge >= 18) {
    addHistory(newLife, "Adulthood begins with more freedom, more pressure, and more room to define the next move.");
  }

  return newLife;
}

export function ageUpLife(life) {
  const updated = deepClone(life);
  updated.age += 1;
  updated.yearlyCounters = {};
  // 11.11.2025 - Added partTimeShifts reset to actionLimits
  updated.actionLimits = {
    freelanceGigs: 0,
    partTimeShifts: 0, // 11.11.2025 - Reset part-time shift limit
    extracurricularPractice: 0, // 11.11.2025 - v1.00.11: Reset extracurricular practice limit
    relationshipInteractions: {},
    activities: 0,
    activityImpactCounts: {},
  };

  // Age family members
  updated.relationships.forEach(rel => {
    if (rel.relation === "Mother" || rel.relation === "Father" || rel.relation.includes("Sibling")) {
      rel.age += 1;
    }
  });

  // Age classmates
  updated.classmates.forEach(c => c.age += 1);

  if (updated.classmates?.length) {
    updated.classmates = softlyGrowSharedBonds(updated.classmates, 0, 1);
    updated.classmates.forEach((classmate) => {
      const relationshipMirror = updated.relationships.find((person) => person.id === classmate.id);
      if (relationshipMirror) {
        relationshipMirror.bond = classmate.bond;
      }
    });
  }
  if (updated.fullTimeJob?.coworkers?.length) {
    updated.fullTimeJob.coworkers = softlyGrowSharedBonds(updated.fullTimeJob.coworkers, 1, 3);
  }
  if (updated.extracurricularDetails) {
    Object.keys(updated.extracurricularDetails).forEach((key) => {
      const details = updated.extracurricularDetails[key];
      if (details?.teammates?.length) {
        details.teammates = softlyGrowSharedBonds(details.teammates, 0, 2);
      }
    });
  }

  // Life stage transitions
  if (updated.age === 1) {
    addHistory(updated, "I took my first steps. My parents went absolutely feral.");
  }
  if (updated.age === 2) {
    addHistory(updated, "Another year passed in the blur of early childhood.");
  }
  if (updated.age === 3) {
    addHistory(updated, "Nothing really happened this year.");
  }
  if (updated.age === 4) {
    addHistory(updated, "A quiet year passed without much changing.");
  }
  // 11.11.2025 - School naming based on origin
  const isUS = updated.origin === "USA";
  const primarySchool = isUS ? "Elementary School" : "Primary School";
  const middleSchool = isUS ? "Middle School" : "Secondary School";
  const highSchool = isUS ? "High School" : "Secondary School";
  const graduate = isUS ? "High School Graduate" : "Secondary School Graduate";

  if (updated.age === 5) {
    updated.occupation = `${primarySchool} Student`;
    ensureSchoolState(updated);
    addHistory(updated, "I met my classmates for the first time.");
    addHistory(updated, `My first day of ${primarySchool.toLowerCase()} felt huge. Everything suddenly felt bigger.`);
    // Generate classmates
    for (let i = 0; i < 8; i++) {
      updated.classmates.push(generateClassmate(updated.origin, updated.age));
    }
  }
  // 11.11.2025 - Middle/secondary school transition with new classmates
  if (updated.age === 12) {
    updated.occupation = `${middleSchool} Student`;
    ensureSchoolState(updated);
    addHistory(updated, `I stepped into ${middleSchool.toLowerCase()} and the whole social world changed overnight.`);
    // Generate new classmates
    const oldClassmates = updated.classmates.filter(c => c.relationshipStatus === "friend");
    updated.classmates = [...oldClassmates]; // Keep friends
    for (let i = 0; i < 10; i++) {
      updated.classmates.push(generateClassmate(updated.origin, updated.age));
    }
    addHistory(updated, `New faces everywhere. ${middleSchool} feels bigger, louder, and harder to read.`);

    // 11.11.2025 - Phase 2.2: Assign clique at age 12
    const { assignClique } = require("../domains/cliques.js");
    const withClique = assignClique(updated);
    Object.assign(updated, withClique);
  }
  // 11.11.2025 - High/secondary school transition with new classmates
  if (updated.age === 14) {
    updated.occupation = `${highSchool} Student`;
    ensureSchoolState(updated);
    addHistory(updated, `I started ${highSchool.toLowerCase()}. This chapter already feels more serious.`);
    // Generate new classmates
    const oldClassmates = updated.classmates.filter(c => c.relationshipStatus === "friend");
    updated.classmates = [...oldClassmates]; // Keep friends
    for (let i = 0; i < 12; i++) {
      updated.classmates.push(generateClassmate(updated.origin, updated.age));
    }
    addHistory(updated, `${highSchool} begins. New chapter, new people, and a lot more pressure.`);
  }
  // 11.11.2025 - Age 18 graduation - trigger university options, clear activities
  // 11.11.2025 - v1.03.0: Preserve clique as formerClique
  if (updated.age === 18) {
    if (updated.school && typeof updated.school.gradePercent === "number") {
      updated.school.completedGradePercent = updated.school.gradePercent;
      updated.school.completedGradeLetter = getGradeLetter(updated.school.gradePercent);
    }
    updated.occupation = graduate;
    updated.showUniversityOptions = true; // Flag to show modal
    // v1.03.0: Preserve clique history
    if (updated.clique) {
      updated.formerClique = updated.clique;
      updated.clique = null;
    }
    // Clear extracurriculars on graduation
    updated.extracurriculars = [];
    updated.extracurricularDetails = {};
    addHistory(updated, `I finished ${highSchool.toLowerCase()}. Diplomas are forever.`);
    if (updated.extracurriculars && updated.extracurriculars.length > 0) {
      addHistory(updated, "My school clubs and sports are over now. Time for a new chapter.");
    }
  }

  // 11.11.2025 - Phase 2.2: Trigger random clique events
  if (updated.age >= 12 && updated.age < 18 && updated.clique) {
    const { triggerRandomCliqueEvent } = require("../domains/cliques.js");
    const withEvent = triggerRandomCliqueEvent(updated);
    Object.assign(updated, withEvent);
  }

  // Random sibling births
  if (updated.age >= 3 && updated.age <= 10 && Math.random() < 0.15) {
    const siblingGender = Math.random() < 0.5 ? "boy" : "girl";
    const siblingGenderCap = siblingGender === "boy" ? "Male" : "Female";
    const siblingName = pickUniqueSiblingName(updated.origin, siblingGenderCap, updated.relationships, updated.lastName);
    const sibling = {
      id: Date.now() + Math.random(),
      firstName: siblingName,
      lastName: updated.lastName,
      relation: "Sibling",
      age: 0,
      occupation: null,
      bond: 100,
      relationshipStatus: "family",
    };
    updated.relationships.push(sibling);
    const motherName = updated.relationships.find(r => r.relation === "Mother").firstName;
    const fatherName = updated.relationships.find(r => r.relation === "Father").firstName;
    // 11.11.2025 - Fixed grammar for sibling birth
    addHistory(updated, `My parents ${motherName} and ${fatherName} had a baby ${siblingGender} named ${siblingName}, my new ${sibling.relation.toLowerCase()}.`);
  }

  // Only add generic message if no other events happened this year
  if ((!updated.history[updated.age] || updated.history[updated.age].length === 0) && !(updated.age >= 5 && updated.age < 18)) {
    addHistory(updated, randChoice([
      "Nothing really happened this year.",
      "Just a regular year of the same old same old.",
      "A quiet year passed without much changing.",
    ]));
  }

  return updated;
}
