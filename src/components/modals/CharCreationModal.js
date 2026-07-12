// Character creation modal component

import React, { useCallback, useState } from "react";
import { Text, View, TouchableOpacity, TextInput, Modal, ScrollView, useWindowDimensions } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { getFirstName, getLastName } from "../../config/names.js";
import { ORIGIN_NAMES } from "../../config/locations.js";
import { randChoice } from "../../utils/random.js";
import { getDefaultAppearance, generateRandomAppearance, getAppearanceDescription } from "../../domains/characterAppearance.js";
import CharacterCustomizationModal from "./CharacterCustomizationModal.js";
import CharacterSprite from "../character/CharacterSprite.js";
import { colors } from "../../styles/tokens.js";
import { STARTING_STAGE_AGES, getStageLabelFromAge } from "../../utils/lifeStages.js";

export default function CharCreationModal({ visible, onCreateCharacter }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    origin: "USA",
    gender: "Male",
    startingStage: "infant",
  });
  const [appearance, setAppearance] = useState(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const { width } = useWindowDimensions();
  const compactLayout = width < 430;
  const singleColumnOptions = width < 340;

  const randomizeName = useCallback((origin = formData.origin, gender = formData.gender) => {
    const firstNames = getFirstName(origin, gender);
    const lastNames = getLastName(origin);

    setFormData((current) => ({
      ...current,
      origin,
      gender,
      firstName: randChoice(firstNames),
      lastName: randChoice(lastNames),
    }));
  }, [formData.gender, formData.origin]);

  React.useEffect(() => {
    if (!visible) return;

    if (!formData.firstName || !formData.lastName) {
      randomizeName(formData.origin, formData.gender);
    }

    if (!appearance) {
      setAppearance(getDefaultAppearance({ gender: formData.gender, stage: formData.startingStage }));
    }
  }, [
    visible,
    formData.firstName,
    formData.gender,
    formData.lastName,
    formData.origin,
    formData.startingStage,
    appearance,
    randomizeName,
  ]);

  React.useEffect(() => {
    if (!visible) return;
    setAppearance(getDefaultAppearance({ gender: formData.gender, stage: formData.startingStage }));
  }, [formData.gender, formData.startingStage, visible]);

  function handleOriginChange(newOrigin) {
    randomizeName(newOrigin, formData.gender);
  }

  function randomizeAppearance() {
    setAppearance(generateRandomAppearance({ gender: formData.gender, stage: formData.startingStage }));
  }

  function handleCreate() {
    onCreateCharacter({
      ...formData,
      appearance: appearance || getDefaultAppearance({ gender: formData.gender, stage: formData.startingStage }),
    });
  }

  const stageOptions = Object.keys(STARTING_STAGE_AGES).map((stage) => ({
    id: stage,
    label: getStageLabelFromAge(STARTING_STAGE_AGES[stage]),
    age: STARTING_STAGE_AGES[stage],
  }));

  return (
    <>
      <Modal visible={visible && !showCustomization} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.charCreationCard}>
            <Text style={styles.modalTitle}>Create Your Character</Text>

            <ScrollView
              style={styles.charCreationScroll}
              contentContainerStyle={styles.charCreationScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.charCreationSection}>
                <Text style={styles.charCreationSectionHeader}>Origin</Text>
                <View style={styles.optionGrid}>
                  {Object.keys(ORIGIN_NAMES).map((originKey) => (
                    <TouchableOpacity
                      key={originKey}
                      style={[
                        styles.smallButton,
                        styles.optionGridButton,
                        formData.origin === originKey && styles.smallButtonActive,
                        singleColumnOptions && styles.optionGridButtonCompact,
                      ]}
                      onPress={() => handleOriginChange(originKey)}
                    >
                      <Text style={styles.smallButtonText}>{ORIGIN_NAMES[originKey]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.charCreationSection}>
                <Text style={styles.charCreationSectionHeader}>Starting Chapter</Text>
                <View style={styles.optionGrid}>
                  {stageOptions.map((stage) => (
                    <TouchableOpacity
                      key={stage.id}
                      style={[
                        styles.smallButton,
                        styles.optionGridButton,
                        formData.startingStage === stage.id && styles.smallButtonActive,
                        singleColumnOptions && styles.optionGridButtonCompact,
                      ]}
                      onPress={() => setFormData((current) => ({ ...current, startingStage: stage.id }))}
                    >
                      <Text style={styles.smallButtonText}>{stage.label}</Text>
                      <Text style={styles.helperText}>Age {stage.age}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.charCreationSection}>
                <Text style={styles.charCreationSectionHeader}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="First Name"
                  placeholderTextColor={colors.text.muted}
                  value={formData.firstName}
                  onChangeText={(text) => setFormData((current) => ({ ...current, firstName: text }))}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name"
                  placeholderTextColor={colors.text.muted}
                  value={formData.lastName}
                  onChangeText={(text) => setFormData((current) => ({ ...current, lastName: text }))}
                />
                <TouchableOpacity style={styles.utilityInlineButton} onPress={() => randomizeName()}>
                  <Text style={styles.utilityInlineButtonText}>🎲 Randomize</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.charCreationSection}>
                <Text style={styles.charCreationSectionHeader}>Basic Details</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.smallButton, formData.gender === "Male" && styles.smallButtonActive]}
                    onPress={() => setFormData((current) => ({ ...current, gender: "Male" }))}
                  >
                    <Text style={styles.smallButtonText}>Male</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.smallButton, formData.gender === "Female" && styles.smallButtonActive]}
                    onPress={() => setFormData((current) => ({ ...current, gender: "Female" }))}
                  >
                    <Text style={styles.smallButtonText}>Female</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.charCreationSection, styles.charCreationAppearanceSection]}>
                <Text style={styles.charCreationSectionHeader}>Appearance</Text>
                {appearance ? (
                  <View style={styles.charCreationPreviewBlock}>
                    <CharacterSprite appearance={appearance} stage={formData.startingStage} size={compactLayout ? 130 : 150} />
                    <Text style={styles.helperText}>
                      {getAppearanceDescription(appearance, "You")}
                    </Text>
                  </View>
                ) : null}
                <View style={[styles.buttonRow, compactLayout && styles.compactButtonRow]}>
                  <TouchableOpacity
                    style={[styles.actionButtonSecondary, styles.charCreationHalfButton]}
                    onPress={() => setShowCustomization(true)}
                  >
                    <Text style={styles.actionButtonSecondaryText}>Customize</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButtonSecondary, styles.charCreationHalfButton]}
                    onPress={randomizeAppearance}
                  >
                    <Text style={styles.actionButtonSecondaryText}>Random Look</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={styles.charCreationFooter}>
              <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
                <Text style={styles.createButtonText}>Start Life</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CharacterCustomizationModal
        visible={visible && showCustomization}
        gender={formData.gender}
        startingStage={formData.startingStage}
        initialAppearance={appearance}
        onSave={(newAppearance) => {
          setAppearance(newAppearance);
          setShowCustomization(false);
        }}
        onCancel={() => setShowCustomization(false)}
      />
    </>
  );
}
