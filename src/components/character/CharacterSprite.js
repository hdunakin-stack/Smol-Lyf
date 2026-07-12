import React from "react";
import { Image, Text, View } from "react-native";
import {
  getAgeModelGroupForStage,
  getBodyLayerSource,
  getHairLayerSource,
  normalizeAppearance,
} from "../../config/characterCustomization.js";
import { colors, radius } from "../../styles/tokens.js";

export default function CharacterSprite({
  appearance,
  stage = "adult",
  ageModelGroup,
  size = 220,
  previewVariant = "card",
}) {
  const normalized = normalizeAppearance(appearance, { stage });
  const resolvedGroup = ageModelGroup || normalized.ageModelGroup || getAgeModelGroupForStage(stage);
  const bodySource = getBodyLayerSource(normalized);
  const hairSource = getHairLayerSource(normalized);
  const height = Math.round(size * 1.5);

  return (
    <View
      style={{
        width: size,
        alignSelf: "center",
      }}
    >
      <View
        style={{
          width: size,
          height,
          borderRadius: previewVariant === "card" ? radius.md : radius.sm,
          overflow: "hidden",
          backgroundColor: previewVariant === "card" ? colors.surface.cardMuted : "transparent",
          borderWidth: previewVariant === "card" ? 1 : 0,
          borderColor: colors.border.subtle,
        }}
      >
        {bodySource ? (
          <Image
            source={bodySource}
            resizeMode="contain"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size,
              height,
            }}
          />
        ) : null}
        {hairSource ? (
          <Image
            source={hairSource}
            resizeMode="contain"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size,
              height,
            }}
          />
        ) : null}
      </View>
      {previewVariant === "card" ? (
        <Text
          style={{
            marginTop: 8,
            textAlign: "center",
            fontSize: 12,
            fontWeight: "700",
            color: colors.text.muted,
            textTransform: "capitalize",
          }}
        >
          {resolvedGroup} preview
        </Text>
      ) : null}
    </View>
  );
}
