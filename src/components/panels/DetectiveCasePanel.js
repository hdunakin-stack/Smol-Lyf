import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { colors } from "../../styles/tokens.js";
import AccordionSection from "../layout/AccordionSection.js";

export default function DetectiveCasePanel({
  life,
  onAssignCase,
  onWorkOvertime,
  onAbandonCase,
}) {
  const { CASE_TYPES } = require("../../domains/detectiveCases.js");

  if (!life.fullTimeJob || life.fullTimeJob.key !== "detective") {
    return (
      <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Cases unlock later</Text>
          <Text style={styles.placeholderBody}>This panel only activates once the life has moved into detective work.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Detective cases</Text>

      {life.activeCase ? (
        <>
          <View style={styles.sectionShell}>
            <Text style={styles.destinationCardTitle}>{life.activeCase.name}</Text>
            <Text style={styles.destinationCardBody}>A long investigation that moves with persistence, pressure, and the occasional breakthrough.</Text>
            <View style={styles.inlineMetricRow}>
              <Text style={styles.inlineMetricLabel}>Progress</Text>
              <View style={styles.inlineMetricTrack}>
                <View style={[styles.inlineMetricFill, { width: `${Math.round(Number(life.activeCase.progress || 0))}%`, backgroundColor: colors.accent.reward }]} />
              </View>
              <Text style={styles.inlineMetricValue}>{Math.round(Number(life.activeCase.progress || 0))}%</Text>
            </View>
            <Text style={styles.personDetail}>Months active: {life.activeCase.monthsActive || 0}</Text>
            <Text style={styles.personDetail}>Overtime hours: {life.activeCase.overtimeHoursWorked || 0}</Text>
            <Text style={styles.personDetail}>Difficulty: {life.activeCase.difficulty}%</Text>
            {life.activeCase.breakthrough ? <Text style={styles.helperText}>A breakthrough has already shifted the momentum on this case.</Text> : null}
          </View>

          <AccordionSection title="Case actions" expanded onToggle={() => {}}>
            <View style={styles.sectionShell}>
              <View style={styles.stackedButtonGroup}>
                <TouchableOpacity style={styles.actionButton} onPress={onWorkOvertime}>
                  <Text style={styles.actionButtonText}>Work Overtime</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.feedSecondaryButton} onPress={onAbandonCase}>
                  <Text style={styles.feedSecondaryButtonText}>Abandon Case</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AccordionSection>
        </>
      ) : (
        <>
          <View style={styles.sectionShell}>
            <Text style={styles.destinationCardTitle}>No active case</Text>
            <Text style={styles.destinationCardBody}>Ask for a new assignment when you are ready to carry the weight of one.</Text>
            <TouchableOpacity style={styles.actionButton} onPress={onAssignCase}>
              <Text style={styles.actionButtonText}>Request a Case</Text>
            </TouchableOpacity>
          </View>

          <AccordionSection title="Case types" expanded onToggle={() => {}}>
            <View style={styles.destinationCardGrid}>
              {Object.entries(CASE_TYPES).map(([key, caseType]) => (
                <View key={key} style={styles.destinationCard}>
                  <Text style={styles.destinationCardTitle}>{caseType.name}</Text>
                  <Text style={styles.personDetail}>Difficulty: {caseType.difficulty}%</Text>
                  <Text style={styles.personDetail}>Reward: ${caseType.solveReward[0].toLocaleString()}-${caseType.solveReward[1].toLocaleString()}</Text>
                  {caseType.dangerLevel ? <Text style={styles.helperText}>Risk level: {caseType.dangerLevel}</Text> : null}
                </View>
              ))}
            </View>
          </AccordionSection>
        </>
      )}
    </ScrollView>
  );
}
