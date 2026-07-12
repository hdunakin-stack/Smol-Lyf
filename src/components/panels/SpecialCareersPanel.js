import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { colors } from "../../styles/tokens.js";

function formatRange(range) {
  return `$${range[0].toLocaleString()}-$${range[1].toLocaleString()}/year`;
}

function formatRequirementLine(label, value, currentValue) {
  const meets = Number(currentValue || 0) >= Number(value || 0);
  return `${label}: ${value}+${meets ? " met" : ` missing (You: ${currentValue || 0})`}`;
}

export default function SpecialCareersPanel({
  life,
  onStartCareer,
  onQuitCareer,
}) {
  const { SPECIAL_CAREERS, isEligibleForSpecialCareer } = require("../../domains/specialCareers.js");

  if (life.specialCareer) {
    const career = life.specialCareer;
    const careerData = SPECIAL_CAREERS[career.key];
    const performance = Math.round(Number(career.performance || 0));

    return (
      <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{career.title}</Text>

        <View style={styles.sectionShell}>
          <Text style={styles.destinationCardTitle}>{life.occupation}</Text>
          <Text style={styles.destinationCardBody}>{careerData.description}</Text>
          <View style={styles.inlineMetricRow}>
            <Text style={styles.inlineMetricLabel}>Performance</Text>
            <View style={styles.inlineMetricTrack}>
              <View style={[styles.inlineMetricFill, { width: `${performance}%`, backgroundColor: colors.status.positive }]} />
            </View>
            <Text style={styles.inlineMetricValue}>{performance}%</Text>
          </View>
          <Text style={styles.personDetail}>Income: ${Number(career.income || 0).toLocaleString()}/year</Text>
          <Text style={styles.personDetail}>Hours: {career.hoursPerWeek} per week</Text>
          <Text style={styles.personDetail}>Years active: {career.yearsActive || 0}</Text>
          {careerData.managerEligible ? <Text style={styles.personDetail}>Fame: {Math.round(Number(life.fame || 0))}%</Text> : null}
          <Text style={styles.personDetail}>Progression: {(careerData.progression || []).join(" -> ")}</Text>
          {careerData.injuryRisk ? <Text style={styles.helperText}>Injury risk: {Math.floor(careerData.injuryRisk * 100)}% per year</Text> : null}
          {careerData.crimeRisk ? <Text style={styles.helperText}>Risk of fallout: {Math.floor(careerData.crimeRisk * 100)}% per year</Text> : null}
        </View>

        <TouchableOpacity style={styles.feedSecondaryButton} onPress={onQuitCareer}>
          <Text style={styles.feedSecondaryButtonText}>Quit Career</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const careerKeys = Object.keys(SPECIAL_CAREERS);

  return (
    <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Special careers</Text>
      <Text style={styles.helperText}>Higher-risk paths with louder payoffs, harsher fallout, and more public attention.</Text>

      <View style={styles.destinationCardGrid}>
        {careerKeys.map((careerKey) => {
          const career = SPECIAL_CAREERS[careerKey];
          const { eligible, reasons } = isEligibleForSpecialCareer(life, careerKey);

          return (
            <View key={careerKey} style={styles.destinationCard}>
              <Text style={styles.destinationCardTitle}>{career.title}</Text>
              <Text style={styles.destinationCardBody}>{career.description}</Text>
              <Text style={styles.personDetail}>Income: {formatRange(career.baseIncome)}</Text>
              <Text style={styles.personDetail}>Hours: {career.hoursPerWeek} per week</Text>
              <Text style={styles.personDetail}>Stress: {Math.round(Number(career.stressImpact || 0))}%</Text>

              <View style={styles.compactList}>
                <Text style={styles.personDetail}>Requirements</Text>
                {Object.entries(career.requirements).map(([stat, value]) => (
                  stat === "age"
                    ? <Text key={stat} style={styles.helperText}>{formatRequirementLine("Age", value, life.age)}</Text>
                    : <Text key={stat} style={styles.helperText}>{formatRequirementLine(stat.charAt(0).toUpperCase() + stat.slice(1), value, life[stat])}</Text>
                ))}
                {career.activityRequired ? <Text style={styles.helperText}>Relevant background: {career.activityRequired.join(" or ")}</Text> : null}
              </View>

              <Text style={styles.personDetail}>Progression: {(career.progression || []).join(" -> ")}</Text>
              {career.managerEligible ? <Text style={styles.helperText}>Manager support opens up once fame crosses 50%.</Text> : null}

              {eligible ? (
                <TouchableOpacity style={styles.actionButton} onPress={() => onStartCareer(careerKey)}>
                  <Text style={styles.actionButtonText}>Start Career</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.resultCallout}>
                  <Text style={styles.resultCalloutText}>{reasons[0]}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
