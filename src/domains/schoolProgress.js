import { randChoice, randInt, deepClone } from "../utils/random.js";

function addSchoolHistory(lifeObj, text) {
  const age = Number(lifeObj.age || 0);
  if (!lifeObj.history) lifeObj.history = {};
  if (!lifeObj.history[age]) lifeObj.history[age] = [];
  lifeObj.history[age].unshift(text);
}

export function isSchoolAge(lifeOrAge) {
  const age = typeof lifeOrAge === "number" ? lifeOrAge : Number(lifeOrAge?.age || 0);
  return age >= 5 && age < 18;
}

export function clampGradePercent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value || 0))));
}

export function getGradeLetter(percent) {
  const value = clampGradePercent(percent);
  if (value >= 90) return "A";
  if (value >= 80) return "B";
  if (value >= 70) return "C";
  if (value >= 60) return "D";
  return "F";
}

export function ensureSchoolState(lifeObj) {
  if (!lifeObj.school || typeof lifeObj.school !== "object") {
    lifeObj.school = {};
  }

  if (typeof lifeObj.school.gradePercent !== "number") {
    lifeObj.school.gradePercent = 70;
  } else {
    lifeObj.school.gradePercent = clampGradePercent(lifeObj.school.gradePercent);
  }

  if (typeof lifeObj.school.studyMomentum !== "number") {
    lifeObj.school.studyMomentum = 0;
  }

  return lifeObj.school;
}

export function getGradePercent(life) {
  if (!life?.school || typeof life.school.gradePercent !== "number") return 70;
  return clampGradePercent(life.school.gradePercent);
}

export function getGradeSummary(life) {
  const percent = getGradePercent(life);
  return {
    percent,
    letter: getGradeLetter(percent),
    label: `${percent}% / ${getGradeLetter(percent)}`,
  };
}

export function applyGradeDelta(lifeObj, delta, source = "school") {
  if (!isSchoolAge(lifeObj)) return 0;
  const school = ensureSchoolState(lifeObj);
  const before = clampGradePercent(school.gradePercent);
  const after = clampGradePercent(before + Number(delta || 0));
  school.gradePercent = after;
  school.lastGradeDelta = after - before;
  school.lastGradeSource = source;
  return after - before;
}

export function addStudyMomentum(lifeObj, delta) {
  if (!isSchoolAge(lifeObj)) return 0;
  const school = ensureSchoolState(lifeObj);
  school.studyMomentum = Math.max(-6, Math.min(8, Number(school.studyMomentum || 0) + Number(delta || 0)));
  return school.studyMomentum;
}

function gradeChangeLine(delta) {
  if (!delta) return null;
  return `${delta > 0 ? "+" : ""}${delta} Grade`;
}

function progressSchoolSport(updated) {
  const sport = (updated.extracurriculars || []).find((activity) => ["basketball", "soccer", "football"].includes(activity));
  if (!sport || Math.random() > 0.7) return;

  if (!updated.extracurricularDetails) updated.extracurricularDetails = {};
  const details = updated.extracurricularDetails[sport] || { progress: 40, teammates: [], position: "Member" };
  updated.extracurricularDetails[sport] = details;

  const labels = {
    basketball: "basketball",
    soccer: "soccer",
    football: "football",
  };

  const event = randChoice(["coach", "rivalry", "breakthrough", "strain", "nerves", "team"]);
  if (event === "coach") {
    const gain = randInt(2, 6);
    details.progress = Math.min(100, Number(details.progress || 0) + gain);
    addSchoolHistory(updated, `My ${labels[sport]} coach gave me direct feedback, and the season felt more serious.`);
  } else if (event === "rivalry") {
    updated.stress = Math.min(100, Number(updated.stress || 0) + randInt(1, 4));
    addSchoolHistory(updated, `A teammate rivalry made ${labels[sport]} practice feel sharper than usual.`);
  } else if (event === "breakthrough") {
    const gain = randInt(3, 8);
    details.progress = Math.min(100, Number(details.progress || 0) + gain);
    details.conditioning = Math.min(100, Number(details.conditioning || 35) + randInt(3, 7));
    addSchoolHistory(updated, `Conditioning finally clicked in ${labels[sport]}. I could feel the difference.`);
  } else if (event === "strain") {
    if (Math.random() < 0.35 && Number(updated.health || 100) < 70) {
      updated.health = Math.max(0, Number(updated.health || 0) - 1);
      updated.stress = Math.min(100, Number(updated.stress || 0) + 2);
      addSchoolHistory(updated, `A minor ${labels[sport]} strain slowed me down for a bit, but it did not derail the season.`);
    }
  } else if (event === "nerves") {
    updated.happiness = Math.max(0, Number(updated.happiness || 0) - 1);
    updated.stress = Math.min(100, Number(updated.stress || 0) + 2);
    addSchoolHistory(updated, `Game-day nerves hit hard before ${labels[sport]}, but I got through it.`);
  } else {
    const teammate = details.teammates?.length ? randChoice(details.teammates) : null;
    if (teammate) teammate.bond = Math.min(100, Number(teammate.bond || 40) + randInt(2, 5));
    updated.happiness = Math.min(100, Number(updated.happiness || 0) + randInt(1, 4));
    addSchoolHistory(updated, teammate ? `${teammate.firstName} and I had a team moment after ${labels[sport]} practice.` : `The ${labels[sport]} team started feeling more familiar.`);
  }
}

export function progressSchoolYear(life) {
  const updated = deepClone(life);
  if (!isSchoolAge(updated)) {
    return { updated, actionResult: null };
  }

  const school = ensureSchoolState(updated);
  const before = clampGradePercent(school.gradePercent);
  const intelligence = Number(updated.intelligence || 50);
  const stress = Number(updated.stress || 0);
  const activityLoad = (updated.extracurriculars || []).length;

  let delta = 0;
  if (intelligence >= 85) delta += 3;
  else if (intelligence >= 70) delta += 2;
  else if (intelligence < 45) delta -= 3;
  else if (intelligence < 55) delta -= 1;

  if (stress >= 80) delta -= 4;
  else if (stress >= 65) delta -= 2;
  else if (stress <= 20) delta += 1;

  if (activityLoad > 1) delta -= Math.min(3, activityLoad - 1);
  delta += Number(school.studyMomentum || 0);
  delta += randInt(-2, 3);

  const actualDelta = applyGradeDelta(updated, delta, "yearlyReport");
  school.studyMomentum = 0;

  const after = clampGradePercent(school.gradePercent);
  const beforeLetter = getGradeLetter(before);
  const afterLetter = getGradeLetter(after);
  const changedLetter = beforeLetter !== afterLetter;

  const positiveEvents = [
    "A teacher noticed the effort and the report card moved in the right direction.",
    "School clicked a little better this year, and the grade showed it.",
    "The year ended with academic momentum instead of panic.",
  ];
  const negativeEvents = [
    "The report card slipped, and school felt harder to ignore.",
    "Grades dipped enough that the year had an academic warning light.",
    "The work did not fully land this year, and the grade took the hit.",
  ];
  const steadyEvents = [
    "The report card held steady. Not dramatic, but not a collapse either.",
    "School stayed about where it was, which counted as its own kind of stability.",
    "The grade barely moved this year.",
  ];

  const eventText = actualDelta > 1
    ? randChoice(positiveEvents)
    : actualDelta < -1
      ? randChoice(negativeEvents)
      : randChoice(steadyEvents);

  addSchoolHistory(updated, `${eventText} Grade: ${after}% / ${afterLetter}.`);
  progressSchoolSport(updated);

  const shouldPopup = changedLetter || Math.abs(actualDelta) >= 4 || after < 65 || after >= 88;
  if (!shouldPopup) {
    return { updated, actionResult: null };
  }

  return {
    updated,
    actionResult: {
      title: actualDelta >= 0 ? "Report card landed" : after < 60 || actualDelta <= -4 ? "Report card warning" : "Report card slipped",
      message: eventText,
      changes: [gradeChangeLine(actualDelta), `Grade ${after}% / ${afterLetter}`].filter(Boolean),
      callout: "Grades now move naturally each school year, but study choices and stress can still push them around.",
    },
  };
}
