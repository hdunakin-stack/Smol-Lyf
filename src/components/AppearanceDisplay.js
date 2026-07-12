import React from "react";
import { Text, View } from "react-native";
import {
  BODY_MODELS,
  HAIR_COLORS,
  HAIR_STYLES,
  SKIN_TONES,
  getAppearanceSummary,
  normalizeAppearance,
} from "../config/characterCustomization.js";
import { styles } from "../styles/AppStyles.js";

export default function AppearanceDisplay({ appearance, detailed = false, style, age, gender }) {
  if (!appearance) {
    return (
      <Text style={[styles.helperText, style]}>
        No appearance data available
      </Text>
    );
  }

  const normalized = normalizeAppearance(appearance, { age, gender });
  const summary = getAppearanceSummary(normalized);

  if (!detailed) {
    return (
      <Text style={[styles.helperText, style]}>
        {summary}
      </Text>
    );
  }

  return (
    <View style={style}>
      <Text style={styles.helperText}>
        <Text style={{ fontWeight: "600" }}>Body:</Text> {BODY_MODELS[normalized.bodyModel]?.name || "Baseline"}
      </Text>
      <Text style={styles.helperText}>
        <Text style={{ fontWeight: "600" }}>Skin:</Text> {SKIN_TONES[normalized.skinTone]?.name || "Medium"}
      </Text>
      <Text style={styles.helperText}>
        <Text style={{ fontWeight: "600" }}>Hair:</Text> {HAIR_COLORS[normalized.hair?.color]?.name || "Dark Brown"} {HAIR_STYLES[normalized.hair?.style]?.name || "Hair"}
      </Text>
      <Text style={styles.helperText}>
        <Text style={{ fontWeight: "600" }}>Saved format:</Text> V{normalized.version || 1}
      </Text>
    </View>
  );
}
