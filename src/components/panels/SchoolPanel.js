import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { colors } from "../../styles/tokens.js";
import { getGradeSummary } from "../../domains/schoolProgress.js";
import AccordionSection from "../layout/AccordionSection.js";

export default function SchoolPanel({
  life,
  popularity,
  onStudyHarder,
  onSlackOff,
  onDropOut,
  onSelectClassmate,
  onExtracurricular,
  onBrowseCliques,
}) {
  const [expanded, setExpanded] = useState({
    academics: true,
    extracurriculars: false,
    cliques: false,
    classmates: false,
  });

  const roundedPopularity = `${Math.round(Number(popularity || 0))}%`;
  const grade = getGradeSummary(life);
  const isInActivity = (activityType) => life.extracurriculars && life.extracurriculars.includes(activityType);
  const extracurricularOptions = [
    ["basketball", "Basketball", "Try out for the basketball team"],
    ["soccer", "Soccer", "Try out for the soccer team"],
    ["football", "Football", "Try out for the football team"],
    ["band", "Band", "Audition for the band"],
    ["choir", "Choir", "Audition for choir"],
    ["mathClub", "Math Club", "Join Math Club"],
    ["scienceClub", "Science Club", "Join Science Club"],
    ["studentGov", "Student Government", "Run for student government"],
  ];

  function toggle(key) {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>School</Text>

      <AccordionSection title="Academics" expanded={expanded.academics} onToggle={() => toggle("academics")}>
        <View style={styles.sectionShell}>
          <View style={styles.inlineMetricRow}>
            <Text style={styles.inlineMetricLabel}>Grade</Text>
            <View style={styles.inlineMetricTrack}>
              <View style={[styles.inlineMetricFill, { width: `${grade.percent}%`, backgroundColor: colors.accent.reward }]} />
            </View>
            <Text style={[styles.inlineMetricValue, styles.gradeMetricValue]}>{grade.label}</Text>
          </View>
          <View style={styles.stackedButtonGroup}>
            <TouchableOpacity style={styles.actionButton} onPress={onStudyHarder}>
              <Text style={styles.actionButtonText}>Study Harder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onSlackOff}>
              <Text style={styles.actionButtonText}>Slack Off</Text>
            </TouchableOpacity>
            {life.age >= 14 ? (
              <TouchableOpacity style={styles.feedSecondaryButton} onPress={onDropOut}>
                <Text style={styles.feedSecondaryButtonText}>Leave School</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </AccordionSection>

      {life.age >= 12 ? (
        <AccordionSection title="Extracurriculars" expanded={expanded.extracurriculars} onToggle={() => toggle("extracurriculars")}>
          <View style={styles.destinationCardGrid}>
            {extracurricularOptions.map(([key, label, description]) => (
              <TouchableOpacity
                key={key}
                style={[styles.destinationCard, isInActivity(key) && styles.disabledCard]}
                onPress={() => !isInActivity(key) && onExtracurricular(key)}
                disabled={isInActivity(key)}
              >
                <Text style={styles.destinationCardTitle}>{label}</Text>
                <Text style={styles.destinationCardBody}>{isInActivity(key) ? `Already part of ${label}.` : description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </AccordionSection>
      ) : null}

      {life.age >= 12 ? (
        <AccordionSection title="Cliques" expanded={expanded.cliques} onToggle={() => toggle("cliques")}>
          <View style={styles.sectionShell}>
            <TouchableOpacity style={styles.actionButton} onPress={onBrowseCliques}>
              <Text style={styles.actionButtonText}>Browse Social Groups</Text>
            </TouchableOpacity>
          </View>
        </AccordionSection>
      ) : null}

      <AccordionSection title="Classmates" expanded={expanded.classmates} onToggle={() => toggle("classmates")} rightText={roundedPopularity}>
        <View style={styles.compactList}>
          <View style={styles.inlineMetricRow}>
            <Text style={styles.inlineMetricLabel}>Popularity</Text>
            <View style={styles.inlineMetricTrack}>
              <View style={[styles.inlineMetricFill, { width: `${Math.round(Number(popularity || 0))}%`, backgroundColor: colors.accent.reward }]} />
            </View>
            <Text style={styles.inlineMetricValue}>{roundedPopularity}</Text>
          </View>

          {life.classmates.map((person) => (
            <TouchableOpacity key={person.id} style={styles.personCard} onPress={() => onSelectClassmate(person)}>
              <View style={styles.personCardCopy}>
                <Text style={styles.personName}>{person.firstName} {person.lastName}</Text>
                <Text style={styles.personDetail}>Bond {Math.round(Number(person.bond || 0))}%</Text>
                {person.clique ? <Text style={styles.personDetail}>Group: {person.clique}</Text> : null}
              </View>
              <View style={[styles.inlineMetricRow, styles.personCardMetricRow]}>
                <Text style={styles.inlineMetricLabel}>Bond</Text>
                <View style={styles.inlineMetricTrack}>
                  <View style={[styles.inlineMetricFill, { width: `${Math.round(Number(person.bond || 0))}%`, backgroundColor: colors.status.bond }]} />
                </View>
                <Text style={styles.inlineMetricValue}>{Math.round(Number(person.bond || 0))}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </AccordionSection>
    </ScrollView>
  );
}
