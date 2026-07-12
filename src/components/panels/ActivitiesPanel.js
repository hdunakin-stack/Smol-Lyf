import React, { useState } from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import MassageModal from "../modals/MassageModal.js";
import AccordionSection from "../layout/AccordionSection.js";
import { getActivityGroups } from "../../domains/activities.js";
import { getContentStageLabel } from "../../utils/contentStage.js";

export default function ActivitiesPanel({ life, onActivity }) {
  const groups = getActivityGroups(life);
  const [expandedSections, setExpandedSections] = useState(() => ({
    early: true,
    mindBody: true,
    mind: false,
    shopping: false,
    cosmetics: false,
  }));
  const [showMassageModal, setShowMassageModal] = useState(false);

  if (!life) return null;

  function toggleSection(sectionKey) {
    setExpandedSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  }

  function handleAction(action) {
    if (action.modal === "massage") {
      setShowMassageModal(true);
      return;
    }

    onActivity(action.type);
  }

  return (
    <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Activities</Text>

      {groups.length ? (
        groups.map((group) => (
          <AccordionSection
            key={group.key}
            title={group.title}
            rightText={group.key === "early" ? getContentStageLabel(life.age) : null}
            expanded={expandedSections[group.key]}
            onToggle={() => toggleSection(group.key)}
          >
            <View style={styles.sectionShell}>
              <View style={styles.stackedButtonGroup}>
                {group.actions.map((action) => (
                  <TouchableOpacity key={action.type} style={styles.actionButton} onPress={() => handleAction(action)}>
                    <Text style={styles.actionButtonText}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </AccordionSection>
        ))
      ) : (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Activities are quiet</Text>
          <Text style={styles.placeholderBody}>This chapter does not have any available self-directed actions yet.</Text>
        </View>
      )}

      <MassageModal
        visible={showMassageModal}
        onAccept={(price) => {
          onActivity("massage", price);
          setShowMassageModal(false);
        }}
        onClose={() => setShowMassageModal(false)}
      />
    </ScrollView>
  );
}
