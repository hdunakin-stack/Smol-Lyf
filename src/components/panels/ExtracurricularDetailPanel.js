import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { colors } from "../../styles/tokens.js";

const ACTION_COPY = {
  basketball: { practice: "Run drills", drop: "Leave the team" },
  soccer: { practice: "Run conditioning", drop: "Leave the team" },
  football: { practice: "Run drills", drop: "Leave the team" },
  tennis: { practice: "Work on your serve", drop: "Leave the team" },
  wrestling: { practice: "Train your technique", drop: "Leave the team" },
  band: { practice: "Rehearse your part", drop: "Leave the band" },
  choir: { practice: "Take voice lessons", drop: "Leave the choir" },
  mathClub: { practice: "Work extra problems", drop: "Leave the club" },
  scienceClub: { practice: "Put in lab time", drop: "Leave the club" },
  studentGov: { practice: "Do campaign work", drop: "Step away" },
};

export default function ExtracurricularDetailPanel({
  life,
  activity,
  activityName,
  onPractice,
  onDrop,
}) {
  const details = life.extracurricularDetails?.[activity] || { teamPerformance: 0, teammates: [] };
  const progress = Math.round(Number(details.progress || details.teamPerformance || 0));
  const teammates = details.teammates || [];
  const labels = ACTION_COPY[activity] || { practice: "Practice", drop: "Leave" };

  return (
    <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>{activityName}</Text>

      <View style={styles.sectionShell}>
        <View style={styles.inlineMetricRow}>
          <Text style={styles.inlineMetricLabel}>Progress</Text>
          <View style={styles.inlineMetricTrack}>
            <View style={[styles.inlineMetricFill, { width: `${progress}%`, backgroundColor: colors.accent.reward }]} />
          </View>
          <Text style={styles.inlineMetricValue}>{progress}%</Text>
        </View>
        {details.position ? <Text style={styles.personDetail}>Role: {details.position}</Text> : null}
      </View>

      <View style={styles.sectionShell}>
        <View style={styles.stackedButtonGroup}>
          <TouchableOpacity style={styles.actionButton} onPress={onPractice}>
            <Text style={styles.actionButtonText}>{labels.practice}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButtonSecondary} onPress={onDrop}>
            <Text style={styles.actionButtonSecondaryText}>{labels.drop}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {teammates.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>People in the group</Text>
          <View style={styles.compactList}>
            {teammates.map((teammate) => (
              <View key={teammate.id} style={styles.personCard}>
                <View style={styles.personCardCopy}>
                  <Text style={styles.personName}>{teammate.firstName} {teammate.lastName}</Text>
                  <Text style={styles.personDetail}>Skill {Math.round(Number(teammate.skill || 0))}%</Text>
                </View>
                <View style={[styles.inlineMetricRow, styles.personCardMetricRow]}>
                  <Text style={styles.inlineMetricLabel}>Bond</Text>
                  <View style={styles.inlineMetricTrack}>
                    <View style={[styles.inlineMetricFill, { width: `${Math.round(Number(teammate.bond || 0))}%`, backgroundColor: colors.status.bond }]} />
                  </View>
                  <Text style={styles.inlineMetricValue}>{Math.round(Number(teammate.bond || 0))}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
