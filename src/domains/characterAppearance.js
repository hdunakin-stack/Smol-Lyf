import {
  SKIN_TONES,
  BODY_MODELS,
  HAIR_STYLES,
  HAIR_COLORS,
  FACE_OPTIONS,
  CLOTHING_OPTIONS,
  ACCESSORY_OPTIONS,
  normalizeAppearance as normalizeAppearanceV2,
  createDefaultAppearance,
  createRandomAppearance,
  getAppearanceSummary,
  getStageForAge,
} from "../config/characterCustomization.js";

// Legacy export placeholders kept for compatibility with older UI modules.
export const BODY_TYPES = {
  BODY_BASELINE: { id: "BODY_BASELINE", name: "Baseline" },
};

export const HEIGHTS = {
  HEIGHT_STANDARD: { id: "HEIGHT_STANDARD", name: "Standard" },
};

export const FACE_SHAPES = FACE_OPTIONS;
export const NOSE_SHAPES = FACE_OPTIONS;
export const LIP_SHAPES = FACE_OPTIONS;
export const JAW_TYPES = FACE_OPTIONS;
export const CHIN_TYPES = FACE_OPTIONS;
export const EYE_SHAPES = FACE_OPTIONS;
export const EYE_COLORS = FACE_OPTIONS;
export const BROW_TYPES = FACE_OPTIONS;
export const FACIAL_HAIR = FACE_OPTIONS;
export const HAIR_TEXTURES = FACE_OPTIONS;
export const HAIR_BANGS = FACE_OPTIONS;
export const HAIR_ACCENT_COLORS = FACE_OPTIONS;
export const TOPS = CLOTHING_OPTIONS;
export const BOTTOMS = CLOTHING_OPTIONS;
export const ONEPIECES = CLOTHING_OPTIONS;
export const SHOES = CLOTHING_OPTIONS;
export const OUTERWEAR = CLOTHING_OPTIONS;
export const MAKEUP_EYELINER = FACE_OPTIONS;
export const MAKEUP_EYESHADOW = FACE_OPTIONS;
export const MAKEUP_LIPS = FACE_OPTIONS;
export const ACCESSORIES_JEWELRY = ACCESSORY_OPTIONS;
export const ACCESSORIES_FACE = ACCESSORY_OPTIONS;
export const ACCESSORIES_HEAD = ACCESSORY_OPTIONS;
export const ACCESSORIES_TECH = ACCESSORY_OPTIONS;
export const ACCESSORIES_BAGS = ACCESSORY_OPTIONS;

function normalizeArgs(genderOrOptions = "Female", maybeOptions = {}) {
  if (genderOrOptions && typeof genderOrOptions === "object") {
    return {
      gender: genderOrOptions.gender || "Female",
      stage: genderOrOptions.stage || genderOrOptions.startingStage || "adult",
    };
  }

  if (typeof maybeOptions === "string") {
    return {
      gender: genderOrOptions || "Female",
      stage: maybeOptions,
    };
  }

  return {
    gender: genderOrOptions || maybeOptions.gender || "Female",
    stage: maybeOptions.stage || maybeOptions.startingStage || "adult",
  };
}

export function getDefaultAppearance(genderOrOptions = "Female", maybeStage = "adult") {
  const { gender, stage } = normalizeArgs(genderOrOptions, maybeStage);
  return createDefaultAppearance({ gender, stage });
}

export function generateRandomAppearance(genderOrOptions = "Female", maybeOptions = {}) {
  const { gender, stage } = normalizeArgs(genderOrOptions, maybeOptions);
  return createRandomAppearance({ gender, stage });
}

export function generateSimpleAppearance(gender = "Female", options = {}) {
  const stage = options.stage || getStageForAge(options.age ?? 25);
  return createRandomAppearance({ gender, stage });
}

export function normalizeAppearance(appearance, options = {}) {
  const gender = options.gender || "Female";
  const stage = options.stage || getStageForAge(options.age ?? 25);
  return normalizeAppearanceV2(appearance, { gender, stage });
}

export function validateAppearance(appearance, options = {}) {
  const normalized = normalizeAppearance(appearance, options);
  return Boolean(
    normalized &&
      normalized.version === 2 &&
      SKIN_TONES[normalized.skinTone] &&
      BODY_MODELS[normalized.bodyModel] &&
      HAIR_STYLES[normalized.hair?.style] &&
      HAIR_COLORS[normalized.hair?.color]
  );
}

export function getAppearanceDescription(appearance, name = "They") {
  const summary = getAppearanceSummary(appearance);
  if (!summary) return `${name} appear ordinary.`;
  if (name === "You") return summary;
  return `${name} has ${summary.toLowerCase()}`;
}

export {
  SKIN_TONES,
  BODY_MODELS,
  HAIR_STYLES,
  HAIR_COLORS,
  FACE_OPTIONS,
  CLOTHING_OPTIONS,
  ACCESSORY_OPTIONS,
};
