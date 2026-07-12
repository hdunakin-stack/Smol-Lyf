const fs = require("fs");
const path = require("path");

const configDir = path.join(process.cwd(), "src", "config");
const outputPath = path.join(configDir, "characterCustomization.js");
const bodyManifestPath = path.join(configDir, "characterBodyAssets.js");
const hairManifestPath = path.join(configDir, "characterHairAssets.js");

const skinTones = [
  { id: "ST01", name: "Light", swatch: "#F1C4A4" },
  { id: "ST02", name: "Medium", swatch: "#DCA173" },
  { id: "ST03", name: "Deep", swatch: "#A76540" },
];

const hairColors = [
  { id: "HAIR_BLACK", name: "Black", swatch: "#1B1717" },
  { id: "HAIR_DARK_BROWN", name: "Dark Brown", swatch: "#3A2720" },
  { id: "HAIR_MEDIUM_BROWN", name: "Medium Brown", swatch: "#5A3B28" },
  { id: "HAIR_LIGHT_BROWN", name: "Light Brown", swatch: "#8A5B3A" },
  { id: "HAIR_DARK_BLONDE", name: "Dark Blonde", swatch: "#A87D4B" },
  { id: "HAIR_GOLDEN_BLONDE", name: "Golden Blonde", swatch: "#D3A462" },
  { id: "HAIR_SILVER", name: "Silver", swatch: "#C7C6D5" },
];

const bodyModels = [
  {
    id: "BODY_INFANT_BASE",
    name: "Infant Baseline",
    ageModelGroup: "infant",
    supportedStages: ["infant"],
    defaultsByGender: { Male: true, Female: true },
    assets: {
      ST01: "body/body_infant_st01.png",
      ST02: "body/body_infant_st02.png",
      ST03: "body/body_infant_st03.png",
    },
  },
  {
    id: "BODY_TODDLER_BASE",
    name: "Toddler Baseline",
    ageModelGroup: "toddler",
    supportedStages: ["toddler", "child"],
    defaultsByGender: { Male: true, Female: true },
    assets: {
      ST01: "body/body_toddler_st01.png",
      ST02: "body/body_toddler_st02.png",
      ST03: "body/body_toddler_st03.png",
    },
  },
  {
    id: "BODY_ADULT_FEM_BASE",
    name: "Adult Frame A",
    ageModelGroup: "adult",
    supportedStages: ["teen", "adult", "senior"],
    defaultsByGender: { Female: true },
    assets: {
      ST01: "body/body_adult_fem_st01.png",
      ST02: "body/body_adult_fem_st02.png",
      ST03: "body/body_adult_fem_st03.png",
    },
  },
  {
    id: "BODY_ADULT_MASC_BASE",
    name: "Adult Frame B",
    ageModelGroup: "adult",
    supportedStages: ["teen", "adult", "senior"],
    defaultsByGender: { Male: true },
    assets: {
      ST01: "body/body_adult_masc_st01.png",
      ST02: "body/body_adult_masc_st02.png",
      ST03: "body/body_adult_masc_st03.png",
    },
  },
];

const hairStyles = [
  { id: "HAIR_NONE", name: "No Hair", ageModelGroup: "all", assetPrefix: null },
  { id: "HAIR_AFRO", name: "Afro", ageModelGroup: "adult", assetPrefix: "hair/hair_afro" },
  { id: "HAIR_BRAIDS", name: "Braids", ageModelGroup: "adult", assetPrefix: "hair/hair_braids" },
  { id: "HAIR_BUZZCUT", name: "Buzzcut", ageModelGroup: "adult", assetPrefix: "hair/hair_buzzcut" },
  { id: "HAIR_CESAR", name: "Cesar", ageModelGroup: "adult", assetPrefix: "hair/hair_cesar" },
  { id: "HAIR_CORNROWS", name: "Cornrows", ageModelGroup: "adult", assetPrefix: "hair/hair_cornrows" },
  { id: "HAIR_CURLYFADE", name: "Curly Fade", ageModelGroup: "adult", assetPrefix: "hair/hair_curlyfade" },
  { id: "HAIR_DREADS", name: "Dreads", ageModelGroup: "adult", assetPrefix: "hair/hair_dreads" },
  { id: "HAIR_EMILY", name: "Emily", ageModelGroup: "adult", assetPrefix: "hair/hair_emily" },
  { id: "HAIR_FEM_BLOWOUT", name: "Blowout", ageModelGroup: "adult", assetPrefix: "hair/hair_fem_blowout" },
  { id: "HAIR_FRONTBANG_MASC", name: "Front Bang", ageModelGroup: "adult", assetPrefix: "hair/hair_frontbang_masc" },
  { id: "HAIR_GUSTAVO", name: "Gustavo", ageModelGroup: "adult", assetPrefix: "hair/hair_gustavo" },
  { id: "HAIR_HAILEY", name: "Hailey", ageModelGroup: "adult", assetPrefix: "hair/hair_hailey" },
  { id: "HAIR_HIGH_AND_TIGHT", name: "High and Tight", ageModelGroup: "adult", assetPrefix: "hair/hair_high_and_tight" },
  { id: "HAIR_HIGH_BUN", name: "High Bun", ageModelGroup: "adult", assetPrefix: "hair/hair_high_bun" },
  { id: "HAIR_HIGH_BUN_BRAIDS", name: "High Bun Braids", ageModelGroup: "adult", assetPrefix: "hair/hair_high_bun_braids" },
  { id: "HAIR_LOCS_MASC", name: "Locs", ageModelGroup: "adult", assetPrefix: "hair/hair_locs_masc" },
  { id: "HAIR_MEATBALLS", name: "Meatballs", ageModelGroup: "adult", assetPrefix: "hair/hair_meatballs" },
  { id: "HAIR_SLICK_BOB", name: "Slick Bob", ageModelGroup: "adult", assetPrefix: "hair/hair_slick_bob" },
  { id: "HAIR_SWOOP_MASC", name: "Swoop", ageModelGroup: "adult", assetPrefix: "hair/hair_swoop_masc" },
  { id: "HAIR_WAVY_FEM", name: "Wavy", ageModelGroup: "adult", assetPrefix: "hair/hair_wavy_fem" },
  { id: "HAIR_TODDLER_SWOOP", name: "Toddler Swoop", ageModelGroup: "toddler", assetPrefix: "hair/hair_toddler_swoop" },
  { id: "HAIR_TODDLER_BOB", name: "Toddler Bob", ageModelGroup: "toddler", assetPrefix: "hair/hair_toddler_bob" },
  { id: "HAIR_TODDLER_BOWL", name: "Toddler Bowl", ageModelGroup: "toddler", assetPrefix: "hair/hair_toddler_bowl" },
  { id: "HAIR_TODDLER_CORNROWS", name: "Toddler Cornrows", ageModelGroup: "toddler", assetPrefix: "hair/hair_toddler_cornrows" },
  { id: "HAIR_TODDLER_CURLYFADE", name: "Toddler Curly Fade", ageModelGroup: "toddler", assetPrefix: "hair/hair_toddler_curlyfade" },
  { id: "HAIR_TODDLER_EMILY", name: "Toddler Emily", ageModelGroup: "toddler", assetPrefix: "hair/hair_toddler_emily" },
  { id: "HAIR_TODDLER_GUSTAVO", name: "Toddler Gustavo", ageModelGroup: "toddler", assetPrefix: "hair/hair_toddler_gustavo" },
  { id: "HAIR_TODDLER_LOCS", name: "Toddler Locs", ageModelGroup: "toddler", assetPrefix: "hair/hair_toddler_locs" },
  { id: "HAIR_TODDLER_LONG", name: "Toddler Long", ageModelGroup: "toddler", assetPrefix: "hair/hair_toddler_long" },
  { id: "HAIR_TODDLER_PIGTAILS", name: "Toddler Pigtails", ageModelGroup: "toddler", assetPrefix: "hair/hair_toddler_pigtails" },
];

function toVarName(prefix, id) {
  return `${prefix}${id
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")}`;
}

function renderObject(items, mapper) {
  return `{\n${items.map((item) => mapper(item)).join(",\n")}\n}`;
}

function writeManifestFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

const bodyManifestContent = `export const BODY_IMAGE_ASSETS = {
${bodyModels
  .map((body) => {
    const toneLines = skinTones
      .map((tone) => `    ${tone.id}: require("../assets/character/body/${path.basename(body.assets[tone.id])}")`)
      .join(",\n");

    return `  ${body.id}: {\n${toneLines}\n  }`;
  })
  .join(",\n")}
};
`;

const hairManifestContent = `export const HAIR_IMAGE_ASSETS = {
${hairStyles
  .map((hair) => {
    if (!hair.assetPrefix) {
      return `  ${hair.id}: {}`;
    }

    const colorLines = hairColors
      .map((color) => `    ${color.id}: require("../assets/character/hair/${path.basename(`${hair.assetPrefix}_${color.id.toLowerCase()}.png`)}")`)
      .join(",\n");

    return `  ${hair.id}: {\n${colorLines}\n  }`;
  })
  .join(",\n")}
};
`;

const bodyObject = renderObject(bodyModels, (body) => {
  return `  ${body.id}: {
    id: "${body.id}",
    name: "${body.name}",
    ageModelGroup: "${body.ageModelGroup}",
    supportedStages: ${JSON.stringify(body.supportedStages)},
    defaultsByGender: ${JSON.stringify(body.defaultsByGender)},
    layer: { x: 0, y: 0, scale: 1, zIndex: 1 },
    assets: BODY_IMAGE_ASSETS.${body.id}
  }`;
});

const hairObject = renderObject(hairStyles, (hair) => {
  const supportedStages =
    hair.ageModelGroup === "adult"
      ? ["teen", "adult", "senior"]
      : hair.ageModelGroup === "toddler"
        ? ["infant", "toddler", "child"]
        : ["infant", "toddler", "child", "teen", "adult", "senior"];

  return `  ${hair.id}: {
    id: "${hair.id}",
    name: "${hair.name}",
    ageModelGroup: "${hair.ageModelGroup}",
    supportedStages: ${JSON.stringify(supportedStages)},
    layer: { x: 0, y: 0, scale: 1, zIndex: 4 },
    variants: HAIR_IMAGE_ASSETS.${hair.id}
  }`;
});

const content = `import { BODY_IMAGE_ASSETS } from "./characterBodyAssets.js";
import { HAIR_IMAGE_ASSETS } from "./characterHairAssets.js";

const STAGE_GROUPS = {
  infant: "infant",
  toddler: "toddler",
  child: "toddler",
  teen: "adult",
  adult: "adult",
  senior: "adult",
};

export const AGE_MODEL_GROUPS = {
  infant: { id: "infant", name: "Infant" },
  toddler: { id: "toddler", name: "Toddler" },
  adult: { id: "adult", name: "Adult" },
};

export const SKIN_TONES = {
  ${skinTones.map((tone) => `${tone.id}: { id: "${tone.id}", name: "${tone.name}", swatch: "${tone.swatch}" }`).join(",\n  ")}
};

export const HAIR_COLORS = {
  ${hairColors.map((color) => `${color.id}: { id: "${color.id}", name: "${color.name}", swatch: "${color.swatch}" }`).join(",\n  ")}
};

export const BODY_MODELS = ${bodyObject};

export const HAIR_STYLES = ${hairObject};

export const FACE_OPTIONS = {
  FACE_DEFAULT: { id: "FACE_DEFAULT", name: "Default" },
};

export const CLOTHING_OPTIONS = {
  TOP_NONE: { id: "TOP_NONE", name: "None" },
  BOTTOM_NONE: { id: "BOTTOM_NONE", name: "None" },
  SHOES_NONE: { id: "SHOES_NONE", name: "None" },
};

export const ACCESSORY_OPTIONS = {
  NONE: { id: "NONE", name: "None" },
};

const DEFAULT_BODY_BY_STAGE = {
  infant: "BODY_INFANT_BASE",
  toddler: "BODY_TODDLER_BASE",
  child: "BODY_TODDLER_BASE",
  teen: { Male: "BODY_ADULT_MASC_BASE", Female: "BODY_ADULT_FEM_BASE" },
  adult: { Male: "BODY_ADULT_MASC_BASE", Female: "BODY_ADULT_FEM_BASE" },
  senior: { Male: "BODY_ADULT_MASC_BASE", Female: "BODY_ADULT_FEM_BASE" },
};

const DEFAULT_HAIR_BY_GROUP = {
  infant: "HAIR_NONE",
  toddler: "HAIR_NONE",
  adult: { Male: "HAIR_CESAR", Female: "HAIR_HAILEY" },
};

export const DEFAULT_APPEARANCE_BY_STAGE = {
  infant: { skinTone: "ST02", bodyModel: "BODY_INFANT_BASE", hairStyle: "HAIR_NONE", hairColor: "HAIR_DARK_BROWN" },
  toddler: { skinTone: "ST02", bodyModel: "BODY_TODDLER_BASE", hairStyle: "HAIR_NONE", hairColor: "HAIR_DARK_BROWN" },
  child: { skinTone: "ST02", bodyModel: "BODY_TODDLER_BASE", hairStyle: "HAIR_TODDLER_BOWL", hairColor: "HAIR_DARK_BROWN" },
  teen: { skinTone: "ST02", bodyModel: "BODY_ADULT_FEM_BASE", hairStyle: "HAIR_HAILEY", hairColor: "HAIR_DARK_BROWN" },
  adult: { skinTone: "ST02", bodyModel: "BODY_ADULT_FEM_BASE", hairStyle: "HAIR_HAILEY", hairColor: "HAIR_DARK_BROWN" },
  senior: { skinTone: "ST02", bodyModel: "BODY_ADULT_FEM_BASE", hairStyle: "HAIR_HAILEY", hairColor: "HAIR_DARK_BROWN" },
};

export function normalizeAppearanceStage(stage = "adult") {
  return STAGE_GROUPS[stage] ? stage : "adult";
}

function inferStageFromAppearance(input) {
  if (!input || typeof input !== "object") return "adult";
  if (input.ageModelGroup === "infant") return "infant";
  if (input.ageModelGroup === "toddler") return "toddler";
  if (input.ageModelGroup === "adult") return "adult";
  if (input.bodyModel && BODY_MODELS[input.bodyModel]) {
    const supportedStages = BODY_MODELS[input.bodyModel].supportedStages || [];
    return supportedStages[0] || "adult";
  }
  return "adult";
}

export function getAgeModelGroupForStage(stage = "adult") {
  return STAGE_GROUPS[normalizeAppearanceStage(stage)];
}

export function getDefaultBodyModel(gender = "Female", stage = "adult") {
  const normalizedStage = normalizeAppearanceStage(stage);
  const defaults = DEFAULT_BODY_BY_STAGE[normalizedStage];
  if (typeof defaults === "string") return defaults;
  return defaults[gender] || defaults.Female || "BODY_ADULT_FEM_BASE";
}

export function getDefaultHairStyle(gender = "Female", stage = "adult") {
  const group = getAgeModelGroupForStage(stage);
  const defaults = DEFAULT_HAIR_BY_GROUP[group];
  if (typeof defaults === "string") return defaults;
  return defaults[gender] || defaults.Female || "HAIR_HAILEY";
}

export function getBodyOptionsForStage(stage = "adult") {
  const normalizedStage = normalizeAppearanceStage(stage);
  return Object.values(BODY_MODELS).filter((body) => body.supportedStages.includes(normalizedStage));
}

export function getHairOptionsForStage(stage = "adult") {
  const normalizedStage = normalizeAppearanceStage(stage);
  return Object.values(HAIR_STYLES).filter((hair) => hair.supportedStages.includes(normalizedStage));
}

export function getSkinToneOptions() {
  return Object.values(SKIN_TONES);
}

export function getHairColorOptions() {
  return Object.values(HAIR_COLORS);
}

export function getStageForAge(age = 0) {
  const numericAge = Number(age || 0);
  if (numericAge <= 1) return "infant";
  if (numericAge <= 4) return "toddler";
  if (numericAge <= 12) return "child";
  if (numericAge <= 17) return "teen";
  if (numericAge <= 64) return "adult";
  return "senior";
}

export function createDefaultAppearance({ gender = "Female", stage = "adult" } = {}) {
  const normalizedStage = normalizeAppearanceStage(stage);
  const bodyModel = getDefaultBodyModel(gender, normalizedStage);
  const hairStyle = getDefaultHairStyle(gender, normalizedStage);
  const ageModelGroup = getAgeModelGroupForStage(normalizedStage);

  return {
    version: 2,
    skinTone: "ST02",
    bodyModel,
    ageModelGroup,
    face: {
      preset: "FACE_DEFAULT",
      eyes: null,
      nose: null,
      lips: null,
      brows: null,
    },
    hair: {
      style: hairStyle,
      color: "HAIR_DARK_BROWN",
      backLayer: null,
      frontLayer: hairStyle,
    },
    clothing: {
      top: null,
      bottom: null,
      shoes: null,
    },
    accessories: [],
  };
}

export function normalizeAppearance(input, { gender = "Female", stage = null } = {}) {
  const resolvedStage = stage || inferStageFromAppearance(input);
  const base = createDefaultAppearance({ gender, stage: resolvedStage });
  if (!input || typeof input !== "object") return base;

  const legacyHairStyle = input.hair?.style || input.hairStyle || base.hair.style;
  const legacyHairColor = input.hair?.color || input.hair?.baseColor || input.hairColor || base.hair.color;
  const legacyBodyModel = input.bodyModel || getDefaultBodyModel(gender, resolvedStage);
  const normalizedStage = normalizeAppearanceStage(resolvedStage);

  const output = {
    version: 2,
    skinTone: SKIN_TONES[input.skinTone] ? input.skinTone : base.skinTone,
    bodyModel: BODY_MODELS[legacyBodyModel] ? legacyBodyModel : base.bodyModel,
    ageModelGroup: getAgeModelGroupForStage(normalizedStage),
    face: {
      preset: input.face?.preset || "FACE_DEFAULT",
      eyes: input.face?.eyes || null,
      nose: input.face?.nose || null,
      lips: input.face?.lips || null,
      brows: input.face?.brows || null,
    },
    hair: {
      style: HAIR_STYLES[legacyHairStyle] ? legacyHairStyle : base.hair.style,
      color: HAIR_COLORS[legacyHairColor] ? legacyHairColor : base.hair.color,
      backLayer: input.hair?.backLayer || null,
      frontLayer: HAIR_STYLES[legacyHairStyle] ? legacyHairStyle : base.hair.frontLayer,
    },
    clothing: {
      top: input.clothing?.top || null,
      bottom: input.clothing?.bottom || null,
      shoes: input.clothing?.shoes || null,
    },
    accessories: Array.isArray(input.accessories) ? [...input.accessories] : [],
  };

  const allowedBodyIds = new Set(getBodyOptionsForStage(normalizedStage).map((body) => body.id));
  if (!allowedBodyIds.has(output.bodyModel)) {
    output.bodyModel = base.bodyModel;
  }

  const allowedHairIds = new Set(getHairOptionsForStage(normalizedStage).map((hair) => hair.id));
  if (!allowedHairIds.has(output.hair.style)) {
    output.hair.style = base.hair.style;
    output.hair.frontLayer = base.hair.frontLayer;
  }

  return output;
}

export function createRandomAppearance({ gender = "Female", stage = "adult" } = {}) {
  const bodyOptions = getBodyOptionsForStage(stage);
  const hairOptions = getHairOptionsForStage(stage);
  const toneOptions = getSkinToneOptions();
  const colorOptions = getHairColorOptions();
  const appearance = createDefaultAppearance({ gender, stage });

  appearance.skinTone = toneOptions[Math.floor(Math.random() * toneOptions.length)].id;
  appearance.bodyModel = bodyOptions[Math.floor(Math.random() * bodyOptions.length)].id;
  appearance.hair.style = hairOptions[Math.floor(Math.random() * hairOptions.length)].id;
  appearance.hair.frontLayer = appearance.hair.style;
  appearance.hair.color = colorOptions[Math.floor(Math.random() * colorOptions.length)].id;

  return appearance;
}

export function getBodyLayerSource(appearance) {
  const body = BODY_MODELS[appearance?.bodyModel];
  if (!body) return null;
  return body.assets[appearance.skinTone] || body.assets.ST02 || null;
}

export function getHairLayerSource(appearance) {
  const hair = HAIR_STYLES[appearance?.hair?.style];
  if (!hair) return null;
  return hair.variants[appearance.hair.color] || hair.variants.HAIR_DARK_BROWN || null;
}

export function getAppearanceSummary(appearance, options = {}) {
  const safe = normalizeAppearance(appearance, options);
  const tone = SKIN_TONES[safe.skinTone]?.name || "Medium";
  const body = BODY_MODELS[safe.bodyModel]?.name || "Baseline";
  const hairStyle = HAIR_STYLES[safe.hair.style]?.name || "Hair";
  const hairColor = HAIR_COLORS[safe.hair.color]?.name || "Dark Brown";
  if (safe.hair.style === "HAIR_NONE") {
    return \`\${tone} skin, \${body.toLowerCase()}, no hair.\`;
  }
  return \`\${tone} skin, \${body.toLowerCase()}, \${hairColor.toLowerCase()} \${hairStyle.toLowerCase()}.\`;
}
`;

writeManifestFile(bodyManifestPath, bodyManifestContent);
writeManifestFile(hairManifestPath, hairManifestContent);
writeManifestFile(outputPath, content);
console.log(`Wrote ${bodyManifestPath}`);
console.log(`Wrote ${hairManifestPath}`);
console.log(`Wrote ${outputPath}`);
