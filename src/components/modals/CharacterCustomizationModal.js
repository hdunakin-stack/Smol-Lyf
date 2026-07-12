import React, { useMemo, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import {
  getBodyOptionsForStage,
  getHairColorOptions,
  getHairOptionsForStage,
  getSkinToneOptions,
  normalizeAppearance,
} from "../../config/characterCustomization.js";
import { getDefaultAppearance, generateRandomAppearance } from "../../domains/characterAppearance.js";
import { styles } from "../../styles/AppStyles.js";
import CharacterSprite from "../character/CharacterSprite.js";

function sortByName(a, b) {
  return a.name.localeCompare(b.name);
}

export default function CharacterCustomizationModal({
  visible,
  gender,
  startingStage = "adult",
  initialAppearance,
  onSave,
  onCancel,
}) {
  const [activeTab, setActiveTab] = useState("body");
  const [appearance, setAppearance] = useState(initialAppearance || getDefaultAppearance({ gender, stage: startingStage }));
  const { width } = useWindowDimensions();
  const compactLayout = width < 430;

  const bodyOptions = useMemo(
    () => getBodyOptionsForStage(startingStage).sort(sortByName),
    [startingStage]
  );
  const hairOptions = useMemo(
    () => getHairOptionsForStage(startingStage).sort(sortByName),
    [startingStage]
  );
  const skinToneOptions = useMemo(() => getSkinToneOptions(), []);
  const hairColorOptions = useMemo(() => getHairColorOptions(), []);

  React.useEffect(() => {
    if (!visible) return;
    setAppearance(normalizeAppearance(initialAppearance || getDefaultAppearance({ gender, stage: startingStage }), { gender, stage: startingStage }));
    setActiveTab("body");
  }, [visible, initialAppearance, gender, startingStage]);

  function updateAppearance(patch) {
    setAppearance((current) =>
      normalizeAppearance(
        {
          ...current,
          ...patch,
        },
        { gender, stage: startingStage }
      )
    );
  }

  function updateHair(field, value) {
    setAppearance((current) =>
      normalizeAppearance(
        {
          ...current,
          hair: {
            ...current.hair,
            [field]: value,
          },
        },
        { gender, stage: startingStage }
      )
    );
  }

  function randomizeAll() {
    setAppearance(generateRandomAppearance({ gender, stage: startingStage }));
  }

  function renderSelectionButton(option, selected, onPress, showSwatch = false) {
    return (
      <TouchableOpacity
        key={option.id}
        style={[
          styles.smallButton,
          styles.optionGridButton,
          styles.characterOptionButton,
          selected && styles.smallButtonActive,
        ]}
        onPress={onPress}
      >
        {showSwatch ? <View style={[styles.colorSwatch, { backgroundColor: option.swatch }]} /> : null}
        <Text style={styles.smallButtonText}>{option.name}</Text>
      </TouchableOpacity>
    );
  }

  function renderBodyTab() {
    return (
      <ScrollView style={styles.customizationScroll} contentContainerStyle={styles.customizationScrollContent}>
        <View style={styles.customizationSection}>
          <Text style={styles.subsectionTitle}>Skin Tone</Text>
          <View style={styles.optionGrid}>
            {skinToneOptions.map((tone) =>
              renderSelectionButton(
                tone,
                appearance.skinTone === tone.id,
                () => updateAppearance({ skinTone: tone.id }),
                true
              )
            )}
          </View>
        </View>

        <View style={styles.customizationSection}>
          <Text style={styles.subsectionTitle}>Body Baseline</Text>
          <View style={styles.optionGrid}>
            {bodyOptions.map((body) =>
              renderSelectionButton(
                body,
                appearance.bodyModel === body.id,
                () => updateAppearance({ bodyModel: body.id })
              )
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  function renderHairTab() {
    return (
      <ScrollView style={styles.customizationScroll} contentContainerStyle={styles.customizationScrollContent}>
        <View style={styles.customizationSection}>
          <Text style={styles.subsectionTitle}>Hairstyle</Text>
          <View style={styles.optionGrid}>
            {hairOptions.map((hair) =>
              renderSelectionButton(
                hair,
                appearance.hair?.style === hair.id,
                () => updateHair("style", hair.id)
              )
            )}
          </View>
        </View>

        <View style={styles.customizationSection}>
          <Text style={styles.subsectionTitle}>Hair Color</Text>
          <View style={styles.optionGrid}>
            {hairColorOptions.map((color) =>
              renderSelectionButton(
                color,
                appearance.hair?.color === color.id,
                () => updateHair("color", color.id),
                true
              )
            )}
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.customizationModalCard}>
          <Text style={styles.modalTitle}>Customize Appearance</Text>

          <View style={[styles.characterCustomizerPreviewWrap, compactLayout && styles.characterCustomizerPreviewWrapCompact]}>
            <CharacterSprite appearance={appearance} stage={startingStage} size={compactLayout ? 170 : 210} />
            <View style={styles.characterCustomizerInfo}>
              <Text style={styles.subsectionTitle}>Paper-doll Preview</Text>
              <Text style={styles.helperText}>
                Body baseline, skin tone, and hair layers update live. Face, clothing, and accessories stay scaffolded in the save data for later art drops.
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.customizationTabRail}
            contentContainerStyle={styles.customizationTabRailContent}
          >
            {[
              { id: "body", label: "Body" },
              { id: "hair", label: "Hair" },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabButton, activeTab === tab.id && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text style={[styles.tabButtonText, activeTab === tab.id && styles.tabButtonTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.customizationPanel}>
            {activeTab === "body" ? renderBodyTab() : null}
            {activeTab === "hair" ? renderHairTab() : null}
          </View>

          <View style={[styles.customizationFooter, compactLayout && styles.customizationFooterStack]}>
            <TouchableOpacity
              style={[styles.actionButtonSecondary, styles.footerButton, compactLayout && styles.footerButtonStacked]}
              onPress={randomizeAll}
            >
              <Text style={styles.actionButtonSecondaryText}>Randomize</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeButton, styles.footerButton, compactLayout && styles.footerButtonStacked]}
              onPress={onCancel}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.footerButton, compactLayout && styles.footerButtonStacked]}
              onPress={() => onSave(normalizeAppearance(appearance, { gender, stage: startingStage }))}
            >
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
