import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { getAvailableJobs } from "../../domains/partTimeJobs.js";
import AccordionSection from "../layout/AccordionSection.js";

function formatRequirement(label, current, needed) {
  const met = Number(current || 0) >= Number(needed || 0);
  return `${label}: ${needed}+${met ? " met" : " missing"}`;
}

export default function PartTimeJobsPanel({ life, onApplyForJob, onWorkShift, onQuitJob }) {
  const [jobListExpanded, setJobListExpanded] = useState(!life.partTimeJob);
  const [currentJobExpanded, setCurrentJobExpanded] = useState(Boolean(life.partTimeJob));
  const availableJobs = getAvailableJobs(life);

  return (
    <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Part-time jobs</Text>
      <Text style={styles.helperText}>A lighter work chapter that brings in cash, experience, and some extra pressure.</Text>

      {life.partTimeJob ? (
        <AccordionSection title="Current job" expanded={currentJobExpanded} onToggle={() => setCurrentJobExpanded((current) => !current)}>
          <View style={styles.sectionShell}>
            <Text style={styles.destinationCardTitle}>{life.partTimeJob.title}</Text>
            <Text style={styles.destinationCardBody}>A steady side job that keeps some money moving through the year.</Text>
            <Text style={styles.personDetail}>Pay: ${life.partTimeJob.hourlyPay}/hour</Text>
            <Text style={styles.personDetail}>Hours: {life.partTimeJob.hoursPerWeek} per week</Text>
            <Text style={styles.personDetail}>Weekly earnings: ${(life.partTimeJob.hourlyPay || 0) * (life.partTimeJob.hoursPerWeek || 0)}</Text>
            <Text style={styles.personDetail}>Shifts worked: {life.partTimeJob.totalShiftsWorked || 0}</Text>

            <View style={styles.stackedButtonGroup}>
              <TouchableOpacity style={styles.actionButton} onPress={onWorkShift}>
                <Text style={styles.actionButtonText}>Work a Shift</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.feedSecondaryButton} onPress={onQuitJob}>
                <Text style={styles.feedSecondaryButtonText}>Quit Job</Text>
              </TouchableOpacity>
            </View>
          </View>
        </AccordionSection>
      ) : null}

      <AccordionSection title={life.partTimeJob ? "Other openings" : "Available jobs"} expanded={jobListExpanded} onToggle={() => setJobListExpanded((current) => !current)}>
        <View style={styles.destinationCardGrid}>
          {availableJobs.map((job) => (
            <View key={job.type} style={styles.destinationCard}>
              <Text style={styles.destinationCardTitle}>{job.title}</Text>
              <Text style={styles.destinationCardBody}>{job.description}</Text>
              <Text style={styles.personDetail}>Pay: ${job.hourlyPay[0]}-${job.hourlyPay[1]}/hour</Text>
              <Text style={styles.personDetail}>Hours: {job.hoursPerWeek[0]}-{job.hoursPerWeek[1]} per week</Text>

              <View style={styles.compactList}>
                <Text style={styles.personDetail}>Requirements</Text>
                {job.requirements.intelligence ? <Text style={styles.helperText}>{formatRequirement("Intelligence", life.intelligence, job.requirements.intelligence)}</Text> : null}
                {job.requirements.attractiveness ? <Text style={styles.helperText}>{formatRequirement("Attractiveness", life.attractiveness, job.requirements.attractiveness)}</Text> : null}
                {job.requirements.health ? <Text style={styles.helperText}>{formatRequirement("Health", life.health, job.requirements.health)}</Text> : null}
                <Text style={styles.helperText}>{formatRequirement("Age", life.age, job.minAge)}</Text>
              </View>

              {job.eligible ? (
                <TouchableOpacity style={styles.actionButton} onPress={() => onApplyForJob(job.type)}>
                  <Text style={styles.actionButtonText}>Apply</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.resultCallout}>
                  <Text style={styles.resultCalloutText}>Not eligible yet.</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </AccordionSection>

      {life.workHistory?.length ? (
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Work history</Text>
          <View style={styles.destinationCardGrid}>
            {life.workHistory.map((job, index) => (
              <View key={`${job.title}-${index}`} style={styles.destinationCard}>
                <Text style={styles.destinationCardTitle}>{job.title}</Text>
                <Text style={styles.destinationCardBody}>{job.type} · Ages {job.workedFrom}-{job.workedTo}</Text>
                <Text style={styles.personDetail}>Shifts worked: {job.shiftsWorked}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
