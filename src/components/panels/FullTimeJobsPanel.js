import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { colors } from "../../styles/tokens.js";
import AccordionSection from "../layout/AccordionSection.js";

function formatSalaryRange(range) {
  return `$${range[0].toLocaleString()}-$${range[1].toLocaleString()}/year`;
}

function formatProgression(job) {
  return (job.progression || []).join(" -> ");
}

export default function FullTimeJobsPanel({
  life,
  onApplyJob,
  onApplyForJob,
  onWorkOvertime,
  onTakeBreak,
  onAskRaise,
  onPursuePromotion,
  onNetwork,
  onNetworkAtWork,
  onQuitJob,
  onViewCoworkers,
}) {
  const [browseExpanded, setBrowseExpanded] = useState(!life.fullTimeJob);
  const [overviewExpanded, setOverviewExpanded] = useState(true);
  const [actionsExpanded, setActionsExpanded] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const applyHandler = onApplyJob || onApplyForJob;
  const networkHandler = onNetwork || onNetworkAtWork;

  const { getEligibleJobs } = require("../../domains/fullTimeJobs.js");
  const eligibleJobs = useMemo(() => getEligibleJobs(life), [life, getEligibleJobs]);

  if (life.fullTimeJob) {
    const job = life.fullTimeJob;
    const performance = Math.round(Number(job.performance || 0));

    return (
      <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>{job.title}</Text>

        <AccordionSection title="Overview" expanded={overviewExpanded} onToggle={() => setOverviewExpanded((current) => !current)} rightText={`${performance}%`}>
          <View style={styles.sectionShell}>
            <Text style={styles.destinationCardTitle}>{life.occupation}</Text>
            <Text style={styles.destinationCardBody}>A full-time chapter with steadier income, higher expectations, and work relationships that matter.</Text>

            <View style={styles.compactList}>
              <View style={styles.inlineMetricRow}>
                <Text style={styles.inlineMetricLabel}>Performance</Text>
                <View style={styles.inlineMetricTrack}>
                  <View style={[styles.inlineMetricFill, { width: `${performance}%`, backgroundColor: colors.status.positive }]} />
                </View>
                <Text style={styles.inlineMetricValue}>{performance}%</Text>
              </View>
              <View style={styles.inlineMetricRow}>
                <Text style={styles.inlineMetricLabel}>Stress</Text>
                <View style={styles.inlineMetricTrack}>
                  <View style={[styles.inlineMetricFill, { width: `${Math.round(Number(job.stressImpact || 0))}%`, backgroundColor: colors.status.warning }]} />
                </View>
                <Text style={styles.inlineMetricValue}>{Math.round(Number(job.stressImpact || 0))}%</Text>
              </View>
            </View>

            <Text style={styles.personDetail}>Salary: ${Number(job.salary || 0).toLocaleString()}/year</Text>
            <Text style={styles.personDetail}>Hours: {job.hoursPerWeek} per week</Text>
            <Text style={styles.personDetail}>Years worked: {Number(job.yearsWorked || 0)}</Text>
          </View>
        </AccordionSection>

        <AccordionSection title="Actions" expanded={actionsExpanded} onToggle={() => setActionsExpanded((current) => !current)}>
          <View style={styles.sectionShell}>
            <View style={styles.stackedButtonGroup}>
              <TouchableOpacity style={styles.actionButton} onPress={onWorkOvertime}>
                <Text style={styles.actionButtonText}>Work Overtime</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={onTakeBreak}>
                <Text style={styles.actionButtonText}>Take a Break</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonSecondary} onPress={onAskRaise}>
                <Text style={styles.actionButtonSecondaryText}>Ask for Raise</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonSecondary} onPress={onPursuePromotion}>
                <Text style={styles.actionButtonSecondaryText}>Pursue Promotion</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonSecondary} onPress={networkHandler}>
                <Text style={styles.actionButtonSecondaryText}>Build Work Relationships</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonSecondary} onPress={onViewCoworkers}>
                <Text style={styles.actionButtonSecondaryText}>View Coworkers ({life.fullTimeJob.coworkers?.length || 0})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.feedSecondaryButton} onPress={onQuitJob}>
                <Text style={styles.feedSecondaryButtonText}>Quit Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </AccordionSection>

        <AccordionSection title="Other job tracks" expanded={browseExpanded} onToggle={() => setBrowseExpanded((current) => !current)}>
          <View style={styles.compactList}>
            {eligibleJobs.map((option) => (
              <TouchableOpacity key={option.key} style={styles.destinationCard} onPress={() => setSelectedTrack(selectedTrack === option.key ? null : option.key)}>
                <Text style={styles.destinationCardTitle}>{option.title}</Text>
                <Text style={styles.destinationCardBody}>{option.description}</Text>
                <Text style={styles.personDetail}>Typical salary: {formatSalaryRange(option.salary)}</Text>
                <Text style={styles.personDetail}>Hours: {option.hoursPerWeek} per week</Text>
                {selectedTrack === option.key ? (
                  <View style={styles.socialDomainContent}>
                    {option.degreeRequired ? <Text style={styles.personDetail}>Education: {option.degreeRequired}</Text> : null}
                    {option.requiresPriorJob ? <Text style={styles.personDetail}>Prior role: {option.requiresPriorJob}</Text> : null}
                    <Text style={styles.personDetail}>Progression: {formatProgression(option)}</Text>
                    <TouchableOpacity style={styles.actionButton} onPress={() => applyHandler?.(option.key)}>
                      <Text style={styles.actionButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </AccordionSection>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Full-time work</Text>
      <Text style={styles.helperText}>Steadier careers open up as education, experience, and core stats start lining up.</Text>

      {eligibleJobs.length === 0 ? (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Nothing is open yet</Text>
          <Text style={styles.placeholderBody}>Keep building stats, experience, and education. This side of life opens up once the basics are in place.</Text>
        </View>
      ) : (
        <View style={styles.destinationCardGrid}>
          {eligibleJobs.map((job) => (
            <View key={job.key} style={styles.destinationCard}>
              <Text style={styles.destinationCardTitle}>{job.title}</Text>
              <Text style={styles.destinationCardBody}>{job.description}</Text>
              <Text style={styles.personDetail}>Salary: {formatSalaryRange(job.salary)}</Text>
              <Text style={styles.personDetail}>Hours: {job.hoursPerWeek} per week</Text>
              {job.degreeRequired ? <Text style={styles.personDetail}>Education: {job.degreeRequired}</Text> : null}
              {job.requiresPriorJob ? <Text style={styles.personDetail}>Prior role: {job.requiresPriorJob}</Text> : null}
              <Text style={styles.personDetail}>Progression: {formatProgression(job)}</Text>
              <TouchableOpacity style={styles.actionButton} onPress={() => applyHandler?.(job.key)}>
                <Text style={styles.actionButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

    </ScrollView>
  );
}
