export function getContentStage(ageValue) {
  const age = Number(ageValue || 0);

  if (age <= 1) return "infant";
  if (age <= 4) return "toddler";
  if (age <= 11) return "child";
  if (age <= 13) return "preteen";
  if (age <= 17) return "teen";
  if (age <= 29) return "youngAdult";
  if (age <= 64) return "adult";
  return "elder";
}

export function isAtLeastStage(ageValue, minimumStage) {
  const order = ["infant", "toddler", "child", "preteen", "teen", "youngAdult", "adult", "elder"];
  return order.indexOf(getContentStage(ageValue)) >= order.indexOf(minimumStage);
}

export function getContentStageLabel(ageValue) {
  const labels = {
    infant: "Infancy",
    toddler: "Toddler",
    child: "Childhood",
    preteen: "Preteen",
    teen: "Teen",
    youngAdult: "Young adult",
    adult: "Adult",
    elder: "Elder",
  };

  return labels[getContentStage(ageValue)] || "Life";
}
