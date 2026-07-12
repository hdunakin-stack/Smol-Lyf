import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { colors } from "../../styles/tokens.js";
import { canSeeFullTime, showIncome } from "../../domains/occupationGating.js";
import { getOccupationLabelForAge } from "../../utils/lifeStages.js";
import { getGradeSummary } from "../../domains/schoolProgress.js";
import AccordionSection from "../layout/AccordionSection.js";

const ACTIVITY_NAMES = {
  basketball: "Basketball Team",
  soccer: "Soccer Team",
  football: "Football Team",
  tennis: "Tennis Team",
  wrestling: "Wrestling Team",
  band: "Band",
  choir: "Choir",
  mathClub: "Math Club",
  scienceClub: "Science Club",
  studentGov: "Student Government",
};

const ACTIVITY_ACTION_LABELS = {
  basketball: { practice: "Run drills", takeItEasy: "Take a lighter practice", talkToCoach: "Talk to coach" },
  soccer: { practice: "Run conditioning", takeItEasy: "Take a lighter practice", talkToCoach: "Talk to coach" },
  football: { practice: "Run drills", takeItEasy: "Take a lighter practice", talkToCoach: "Talk to coach" },
  tennis: { practice: "Work on your serve", takeItEasy: "Take a lighter practice", talkToCoach: "Talk to coach" },
  wrestling: { practice: "Train your technique", takeItEasy: "Take a lighter practice", talkToCoach: "Talk to coach" },
  band: { practice: "Rehearse your part", takeItEasy: "Take an easier rehearsal", talkToCoach: "Talk to band leader" },
  choir: { practice: "Take voice lessons", takeItEasy: "Rest your voice", talkToCoach: "Talk to choir director" },
  mathClub: { practice: "Work extra problems", takeItEasy: "Step back this round", talkToCoach: "Talk to club advisor" },
  scienceClub: { practice: "Put in lab time", takeItEasy: "Keep it low-key", talkToCoach: "Talk to club advisor" },
  studentGov: { practice: "Do campaign work", takeItEasy: "Step back a bit", talkToCoach: "Talk to advisor" },
};

function formatSchoolLabel(life) {
  if (life.occupation && life.occupation.includes("University Student")) {
    return "College";
  }
  return getOccupationLabelForAge(life.age, life.origin).replace(" Student", "");
}

function buildAvailableExtracurriculars(life) {
  const options = [
    { id: "basketball", title: "Basketball", description: "Try out for the basketball team" },
    { id: "soccer", title: "Soccer", description: "Try out for the soccer team" },
    { id: "football", title: "Football", description: "Try out for the football team" },
    { id: "band", title: "Band", description: "Audition for the band" },
    { id: "choir", title: "Choir", description: "Audition for choir" },
    { id: "mathClub", title: "Math Club", description: "Join Math Club" },
    { id: "scienceClub", title: "Science Club", description: "Join Science Club" },
    { id: "studentGov", title: "Student Government", description: "Run for student government" },
  ];

  return options;
}

export default function OccupationPanel({
  life,
  onOpenActivity,
  onOpenPartTimeJobs,
  onOpenFullTimeJobs,
  onOpenSpecialCareers,
  onOpenDetectiveCases,
  onActivityAction,
  onFreelanceGig,
  onStudyHarder,
  onSlackOff,
  onDropOut,
  onSelectClassmate,
  onExtracurricular,
  onBrowseCliques,
  popularity,
  onBrowseGreekLife,
  onQuitGreekLife,
}) {
  const [expanded, setExpanded] = useState({
    school: true,
    academics: false,
    extracurriculars: false,
    cliques: false,
    classmates: false,
    freelance: false,
    activities: true,
  });

  const joinedActivities = life.extracurriculars || [];
  const schoolLabel = formatSchoolLabel(life);
  const roundedPopularity = `${Math.round(Number(popularity || 0))}%`;
  const grade = getGradeSummary(life);
  const isStudent = (life.age >= 5 && life.age < 18) || Boolean(life.occupation && life.occupation.includes("University Student"));
  const schoolActionsVisible = life.age >= 12;

  function toggle(key) {
    setExpanded((current) => ({ ...current, [key]: !current[key] }));
  }

  function renderPersonCard(person) {
    return (
      <TouchableOpacity key={person.id} style={styles.personCard} onPress={() => onSelectClassmate(person)}>
        <View style={styles.personCardHeader}>
          <View style={styles.personCardCopy}>
            <Text style={styles.personName}>{person.firstName} {person.lastName}</Text>
            <Text style={styles.personDetail}>Bond {Math.round(Number(person.bond || 0))}%</Text>
            {person.clique ? <Text style={styles.personDetail}>Group: {person.cliqueName || person.clique}</Text> : null}
          </View>
        </View>
        <View style={[styles.inlineMetricRow, styles.personCardMetricRow]}>
          <Text style={styles.inlineMetricLabel}>Bond</Text>
          <View style={styles.inlineMetricTrack}>
            <View style={[styles.inlineMetricFill, { width: `${person.bond}%`, backgroundColor: colors.status.bond }]} />
          </View>
          <Text style={styles.inlineMetricValue}>{Math.round(Number(person.bond || 0))}%</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Current Status: {life.occupation}</Text>

      <View style={styles.stressIndicator}>
        <View style={styles.inlineMetricRow}>
          <Text style={styles.inlineMetricLabel}>Stress</Text>
          <View style={styles.inlineMetricTrack}>
            <View style={[styles.inlineMetricFill, { width: `${life.stress}%`, backgroundColor: colors.status.warning }]} />
          </View>
          <Text style={[styles.inlineMetricValue, { color: colors.text.warm }]}>{Math.round(Number(life.stress || 0))}%</Text>
        </View>
      </View>

      {isStudent ? (
          <AccordionSection title={schoolLabel} expanded={expanded.school} onToggle={() => toggle("school")}>
          <AccordionSection title="Academics" level={1} expanded={expanded.academics} onToggle={() => toggle("academics")}>
            <View style={styles.sectionShell}>
              {life.age >= 5 && life.age < 18 ? (
                <View style={styles.inlineMetricRow}>
                  <Text style={styles.inlineMetricLabel}>Grade</Text>
                  <View style={styles.inlineMetricTrack}>
                    <View style={[styles.inlineMetricFill, { width: `${grade.percent}%`, backgroundColor: colors.accent.reward }]} />
                  </View>
                  <Text style={[styles.inlineMetricValue, styles.gradeMetricValue]}>{grade.label}</Text>
                </View>
              ) : null}
              <View style={styles.stackedButtonGroup}>
                <TouchableOpacity style={styles.actionButton} onPress={onStudyHarder}>
                  <Text style={styles.actionButtonText}>Study Harder</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={onSlackOff}>
                  <Text style={styles.actionButtonText}>Slack Off</Text>
                </TouchableOpacity>
                {life.age >= 14 ? (
                  <TouchableOpacity style={styles.feedSecondaryButton} onPress={onDropOut}>
                    <Text style={styles.feedSecondaryButtonText}>Drop Out</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </AccordionSection>

          {schoolActionsVisible ? (
            <AccordionSection title="Extracurriculars" level={1} expanded={expanded.extracurriculars} onToggle={() => toggle("extracurriculars")}>
              <View style={styles.compactList}>
                {buildAvailableExtracurriculars(life).map((option) => {
                  const joined = joinedActivities.includes(option.id);
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={[styles.destinationCard, joined && styles.disabledCard]}
                      onPress={() => !joined && onExtracurricular(option.id)}
                      disabled={joined}
                    >
                      <Text style={styles.destinationCardTitle}>{option.title}</Text>
                      <Text style={styles.destinationCardBody}>{joined ? `Already part of ${option.title}.` : option.description}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </AccordionSection>
          ) : null}

          {schoolActionsVisible ? (
            <AccordionSection title="Cliques" level={1} expanded={expanded.cliques} onToggle={() => toggle("cliques")}>
              <View style={styles.sectionShell}>
                <TouchableOpacity style={styles.actionButton} onPress={onBrowseCliques}>
                  <Text style={styles.actionButtonText}>Browse Social Groups</Text>
                </TouchableOpacity>
                {life.occupation && life.occupation.includes("University Student") ? (
                  life.greekLife ? (
                    <>
                      <Text style={styles.personName}>{life.greekLife.name}</Text>
                      <Text style={styles.personDetail}>Reputation: {life.greekLife.reputation}</Text>
                      <Text style={styles.personDetail}>Annual Dues: ${life.greekLife.annualCost}</Text>
                      <TouchableOpacity style={styles.feedSecondaryButton} onPress={onQuitGreekLife}>
                        <Text style={styles.feedSecondaryButtonText}>Leave Group</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity style={styles.actionButtonSecondary} onPress={onBrowseGreekLife}>
                      <Text style={styles.actionButtonSecondaryText}>Explore Greek Life</Text>
                    </TouchableOpacity>
                  )
                ) : null}
              </View>
            </AccordionSection>
          ) : null}

          <AccordionSection title="Classmates" level={1} expanded={expanded.classmates} onToggle={() => toggle("classmates")} rightText={roundedPopularity}>
            <View style={styles.compactList}>
              <View style={styles.inlineMetricRow}>
                <Text style={styles.inlineMetricLabel}>Popularity</Text>
                <View style={styles.inlineMetricTrack}>
                  <View style={[styles.inlineMetricFill, { width: `${Math.round(Number(popularity || 0))}%`, backgroundColor: colors.accent.reward }]} />
                </View>
                <Text style={styles.inlineMetricValue}>{roundedPopularity}</Text>
              </View>
              {(life.classmates || []).map(renderPersonCard)}
            </View>
          </AccordionSection>
        </AccordionSection>
      ) : null}

      {showIncome(life) ? (
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Income</Text>
          <AccordionSection title="Freelance Gigs" expanded={expanded.freelance} onToggle={() => toggle("freelance")}>
            <View style={styles.sectionShell}>
              <View style={styles.stackedButtonGroup}>
                <TouchableOpacity style={styles.actionButton} onPress={() => onFreelanceGig("tutor")}>
                  <Text style={styles.actionButtonText}>Tutoring</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => onFreelanceGig("mowLawn")}>
                  <Text style={styles.actionButtonText}>Lawn Care</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AccordionSection>

          {life.age >= 15 && life.age < 18 ? (
            <TouchableOpacity style={styles.secondaryPanelButton} onPress={onOpenPartTimeJobs}>
              <Text style={styles.secondaryPanelButtonText}>{life.partTimeJob ? "Open part-time job" : "Browse part-time jobs"}</Text>
            </TouchableOpacity>
          ) : null}

          {canSeeFullTime(life) ? (
            <TouchableOpacity style={styles.secondaryPanelButton} onPress={onOpenFullTimeJobs}>
              <Text style={styles.secondaryPanelButtonText}>{life.fullTimeJob ? "Open full-time work" : "Browse careers"}</Text>
            </TouchableOpacity>
          ) : null}

          {life.age >= 18 ? (
            <TouchableOpacity style={styles.secondaryPanelButton} onPress={onOpenSpecialCareers}>
              <Text style={styles.secondaryPanelButtonText}>Special careers</Text>
            </TouchableOpacity>
          ) : null}

          {life.fullTimeJob?.title?.toLowerCase().includes("detective") ? (
            <TouchableOpacity style={styles.secondaryPanelButton} onPress={onOpenDetectiveCases}>
              <Text style={styles.secondaryPanelButtonText}>Detective cases</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {joinedActivities.length ? (
        <AccordionSection title="My Activities" expanded={expanded.activities} onToggle={() => toggle("activities")}>
          <View style={styles.compactList}>
            {joinedActivities.map((activity) => {
              const labels = ACTIVITY_ACTION_LABELS[activity] || ACTIVITY_ACTION_LABELS.studentGov;
              const details = life.extracurricularDetails?.[activity];

              return (
                <View key={activity} style={styles.sectionShell}>
                  <TouchableOpacity onPress={() => onOpenActivity(activity)}>
                    <Text style={styles.destinationCardTitle}>{ACTIVITY_NAMES[activity] || activity}</Text>
                    {details?.position ? <Text style={styles.destinationCardBody}>Role: {details.position}</Text> : null}
                  </TouchableOpacity>

                  {typeof details?.progress === "number" ? (
                    <View style={styles.inlineMetricRow}>
                      <Text style={styles.inlineMetricLabel}>Progress</Text>
                      <View style={styles.inlineMetricTrack}>
                        <View style={[styles.inlineMetricFill, { width: `${Math.round(Number(details.progress || 0))}%`, backgroundColor: colors.accent.reward }]} />
                      </View>
                      <Text style={styles.inlineMetricValue}>{Math.round(Number(details.progress || 0))}%</Text>
                    </View>
                  ) : null}

                  <View style={styles.stackedButtonGroup}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => onActivityAction(activity, "practice")}>
                      <Text style={styles.actionButtonText}>{labels.practice}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => onActivityAction(activity, "takeItEasy")}>
                      <Text style={styles.actionButtonText}>{labels.takeItEasy}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => onActivityAction(activity, "talkToCoach")}>
                      <Text style={styles.actionButtonText}>{labels.talkToCoach}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </AccordionSection>
      ) : null}
    </ScrollView>
  );
}
