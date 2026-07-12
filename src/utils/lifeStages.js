export const STARTING_STAGE_AGES = {
  infant: 0,
  child: 8,
  teen: 15,
  adult: 25,
};

export function normalizeStartingStage(value) {
  return STARTING_STAGE_AGES[value] != null ? value : "infant";
}

export function getStartingAgeForStage(stage) {
  return STARTING_STAGE_AGES[normalizeStartingStage(stage)];
}

export function getStageLabelFromAge(age) {
  const numericAge = Number(age || 0);
  if (numericAge <= 4) return "Infant";
  if (numericAge <= 12) return "Childhood";
  if (numericAge <= 17) return "Teen";
  return "Adult";
}

export function getOccupationLabelForAge(age, origin = "USA") {
  const numericAge = Number(age || 0);
  const isUS = origin === "USA";
  const primarySchool = isUS ? "Elementary School" : "Primary School";
  const middleSchool = isUS ? "Middle School" : "Secondary School";
  const highSchool = isUS ? "High School" : "Secondary School";

  if (numericAge <= 4) return "Infant";
  if (numericAge <= 11) return `${primarySchool} Student`;
  if (numericAge <= 13) return `${middleSchool} Student`;
  if (numericAge <= 17) return `${highSchool} Student`;
  return "Adult";
}

export function getStageSummary(life) {
  const age = Number(life?.age || 0);
  const city = life?.city || "your hometown";

  if (age <= 4) {
    return `An early chapter centered on family, comfort, and first memories in ${city}.`;
  }

  if (age <= 12) {
    return `Growing up in ${city}, learning quickly, and building early connections.`;
  }

  if (age <= 17) {
    return `Balancing school, identity, and social momentum in ${city}.`;
  }

  return `Building an adult life in ${city}, with work, relationships, and bigger decisions ahead.`;
}

export function getAvailableAppearanceTabs(stage) {
  switch (normalizeStartingStage(stage)) {
    case "infant":
      return ["face", "hair"];
    case "child":
      return ["face", "hair", "clothing"];
    case "teen":
      return ["body", "face", "hair", "clothing"];
    case "adult":
    default:
      return ["body", "face", "hair", "clothing", "makeup", "accessories"];
  }
}

export function getAppearanceVisibility(stage) {
  const normalized = normalizeStartingStage(stage);
  return {
    body: normalized === "teen" || normalized === "adult",
    makeup: normalized === "adult",
    accessories: normalized === "adult",
    clothing: normalized !== "infant",
    facialHair: normalized === "adult",
  };
}

export function isRouteRelevantForStage(route, life) {
  const age = Number(life?.age || 0);

  if (route === "profile" || route === "timeline") return true;
  if (route === "relationships") return age >= 0;
  if (route === "occupation") return age >= 5;
  if (route === "activities") return age >= 0;
  if (route === "assets") return false;
  return true;
}
