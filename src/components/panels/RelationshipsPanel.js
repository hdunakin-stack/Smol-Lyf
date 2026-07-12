import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { colors } from "../../styles/tokens.js";
import { sortRelationships } from "../../domains/relationships.js";

function summarize(label, people, emptyCopy) {
  if (!people.length) {
    return {
      id: label.toLowerCase(),
      label,
      value: "Quiet",
      summary: emptyCopy || `No major ${label.toLowerCase()} arc is active right now.`,
    };
  }

  const average = Math.round(people.reduce((sum, person) => sum + Number(person.bond || 0), 0) / people.length);
  const value = average >= 75 ? "Thriving" : average < 45 ? "Shaky" : "Steady";

  return {
    id: label.toLowerCase(),
    label,
    value,
    summary: `${people.length} ${people.length === 1 ? "connection" : "connections"} shaping this chapter.`,
  };
}

function normalizeGroupMembers(items, relation) {
  return (items || []).map((person, index) => ({
    id: person.id || `${relation}-${index}-${person.firstName || "member"}`,
    firstName: person.firstName || relation,
    lastName: person.lastName || "",
    age: person.age,
    bond: Number(person.bond || 45),
    relation,
    relationshipStatus: person.relationshipStatus || relation.toLowerCase(),
    clique: person.clique || null,
  }));
}

export default function RelationshipsPanel({ life, onSelectPerson, focusTarget = null }) {
  const sortedRelationships = useMemo(() => sortRelationships(life.relationships || []), [life.relationships]);
  const [expandedSections, setExpandedSections] = useState({
    family: true,
    romance: false,
    friends: false,
    school: false,
    team: false,
    work: false,
    clique: false,
    band: false,
    choir: false,
    exes: false,
    acquaintances: false,
  });
  const [highlightedPersonId, setHighlightedPersonId] = useState(null);
  const [highlightedSection, setHighlightedSection] = useState(null);

  function toggleSection(section) {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  useEffect(() => {
    if (!focusTarget?.section) return undefined;

    const sectionKey = focusTarget.section;
    setExpandedSections((current) => ({
      ...current,
      [sectionKey]: true,
    }));
    setHighlightedSection(sectionKey);
    setHighlightedPersonId(focusTarget.personId || null);

    const timer = setTimeout(() => {
      setHighlightedSection(null);
      setHighlightedPersonId(null);
    }, 2200);

    return () => clearTimeout(timer);
  }, [focusTarget]);

  const family = sortedRelationships.filter((person) => person.relationshipStatus === "family");
  const romance = sortedRelationships.filter((person) => ["married", "dating", "engaged"].includes(person.relationshipStatus));
  const friends = sortedRelationships.filter((person) => person.relationshipStatus === "friend");
  const exes = sortedRelationships.filter((person) => person.relationshipStatus === "ex");
  const acquaintances = sortedRelationships.filter((person) =>
    !["married", "dating", "engaged", "family", "friend", "ex"].includes(person.relationshipStatus) &&
    person.relation !== "Pet" &&
    person.relation !== "Classmate"
  );

  const schoolPeople = normalizeGroupMembers(life.classmates || [], "Classmate");
  const coworkers = normalizeGroupMembers(life.fullTimeJob?.coworkers || [], "Coworker");
  const sportsActivity = (life.extracurriculars || []).find((activity) => ["basketball", "soccer", "football", "tennis", "wrestling"].includes(activity));
  const teamPeople = normalizeGroupMembers(life.extracurricularDetails?.[sportsActivity]?.teammates || [], "Teammate");
  const bandPeople = normalizeGroupMembers(life.extracurricularDetails?.band?.teammates || [], "Bandmate");
  const choirPeople = normalizeGroupMembers(life.extracurricularDetails?.choir?.teammates || [], "Choir Member");
  const cliquePeople = normalizeGroupMembers(
    [...(life.classmates || []), ...sortedRelationships]
      .filter((person, index, arr) => person.clique && arr.findIndex((item) => item.id === person.id) === index)
      .filter((person) => !life.clique || person.clique === life.clique),
    "Group Member"
  );

  const { CLIQUES } = require("../../domains/cliques.js");
  const cliqueLabel = life.clique && CLIQUES[life.clique] ? CLIQUES[life.clique].name : life.clique;

  const dynamicDomains = [
    schoolPeople.length ? { key: "school", summary: summarize("School", schoolPeople, "School relationships will show up here once they matter."), people: schoolPeople } : null,
    teamPeople.length ? { key: "team", summary: summarize("Team", teamPeople, "Team life is quiet right now."), people: teamPeople } : null,
    coworkers.length ? { key: "work", summary: summarize("Work", coworkers, "Work relationships will land here once they exist."), people: coworkers } : null,
    (life.clique || cliquePeople.length || life.greekLife) ? {
      key: "clique",
      summary: {
        id: "clique",
        label: "Clique",
        value: cliqueLabel || life.greekLife?.name || "Active",
        summary: cliquePeople.length
          ? `${cliquePeople.length} group-linked people are shaping the social scene.`
          : "This social circle is now part of the life around you.",
      },
      people: cliquePeople,
      utility: life.greekLife ? `${life.greekLife.name} · ${life.greekLife.reputation}` : cliqueLabel,
    } : null,
    bandPeople.length ? { key: "band", summary: summarize("Band", bandPeople, "Band life is quiet right now."), people: bandPeople } : null,
    choirPeople.length ? { key: "choir", summary: summarize("Choir", choirPeople, "Choir life is quiet right now."), people: choirPeople } : null,
  ].filter(Boolean);

  function renderPerson(person) {
    return (
      <TouchableOpacity
        key={person.id}
        style={[
          styles.personCard,
          highlightedPersonId === person.id && styles.focusFlashCard,
        ]}
        onPress={() => onSelectPerson(person)}
      >
        <View style={styles.personCardHeader}>
          <View style={styles.personCardCopy}>
            <Text style={styles.personName}>{person.firstName} {person.lastName}</Text>
            <Text style={styles.personDetail}>{person.relation}{typeof person.age === "number" ? ` · Age ${person.age}` : ""}</Text>
            {person.clique ? <Text style={styles.personDetail}>Group: {person.clique}</Text> : null}
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

  function renderDomainCard(domain, sectionKey = domain.key || domain.summary.id) {
    return (
      <View key={sectionKey} style={[styles.socialDomainCard, highlightedSection === sectionKey && styles.focusFlashCard]}>
        <View style={styles.socialDomainHeader}>
          <View style={styles.feedCardCopy}>
            <Text style={styles.socialOverviewLabel}>{domain.summary.label}</Text>
            <Text style={styles.socialOverviewValue}>{domain.summary.value}</Text>
            <Text style={styles.socialOverviewSummary}>{domain.summary.summary}</Text>
          </View>
          <TouchableOpacity style={styles.timelineOpenPill} onPress={() => toggleSection(sectionKey)}>
            <Text style={styles.timelineOpenPillText}>{expandedSections[sectionKey] ? "Hide" : "Open"}</Text>
          </TouchableOpacity>
        </View>

        {expandedSections[sectionKey] ? (
          <View style={styles.socialDomainContent}>
            {domain.utility ? (
              <View style={[styles.utilityTile, { marginBottom: 12 }]}>
                <Text style={styles.personName}>{domain.summary.value}</Text>
                <Text style={styles.personDetail}>{domain.utility}</Text>
              </View>
            ) : null}
            {domain.people.length ? domain.people.map(renderPerson) : (
              <Text style={styles.helperText}>Nothing major is active here yet.</Text>
            )}
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
      <Text style={styles.sectionTitle}>Relationships</Text>

      <View style={styles.socialOverviewGrid}>
        {renderDomainCard({ key: "family", summary: summarize("Family", family), people: family }, "family")}
        {renderDomainCard({ key: "romance", summary: summarize("Romance", romance), people: romance }, "romance")}
        {renderDomainCard({ key: "friends", summary: summarize("Friends", friends), people: friends }, "friends")}
        {dynamicDomains.map((domain) => renderDomainCard(domain, domain.key))}
      </View>

      {exes.length ? renderDomainCard({ key: "exes", summary: summarize("Exes", exes), people: exes }, "exes") : null}
      {acquaintances.length ? renderDomainCard({ key: "acquaintances", summary: summarize("Acquaintances", acquaintances), people: acquaintances }, "acquaintances") : null}

      {sortedRelationships.length === 0 && dynamicDomains.length === 0 ? (
        <Text style={styles.helperText}>No relationships yet. Start meeting people.</Text>
      ) : null}
    </ScrollView>
  );
}
