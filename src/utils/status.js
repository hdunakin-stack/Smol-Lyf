import { colors } from "../styles/tokens.js";

function getZone(value) {
  if (value >= 67) return "high";
  if (value >= 34) return "mid";
  return "low";
}

export function getStatSemanticTone(statKey, value) {
  const zone = getZone(Number(value || 0));

  if (statKey === "stress") {
    if (zone === "low") return colors.status.positive;
    if (zone === "mid") return colors.accent.warm;
    return colors.status.warning;
  }

  if (statKey === "fame") {
    if (zone === "low") return colors.status.neutral;
    if (zone === "mid") return colors.status.positive;
    return colors.brand.primary;
  }

  if (zone === "low") return colors.accent.warm;
  if (zone === "mid") return colors.status.positive;
  return colors.status.positive;
}
