import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { colors } from "../../styles/tokens.js";
import AccordionSection from "../layout/AccordionSection.js";

function formatPersonality(personalityKey) {
  const map = {
    mentor: "Mentor energy",
    rival: "Competitive streak",
    friend: "Easygoing",
    gossip: "Always knows the latest",
    neutral: "Professional",
    romantic: "A little more interested than usual",
  };
  return map[personalityKey] || "Work connection";
}

function renderWorkMeter(label, value, fill) {
  const safeValue = Math.round(Number(value || 0));
  return (
    <View style={styles.inlineMetricRow}>
      <Text style={styles.inlineMetricLabel}>{label}</Text>
      <View style={styles.inlineMetricTrack}>
        <View style={[styles.inlineMetricFill, { width: `${safeValue}%`, backgroundColor: fill }]} />
      </View>
      <Text style={styles.inlineMetricValue}>{safeValue}%</Text>
    </View>
  );
}

export default function CoworkerPanel({ life, onInteract }) {
  const [expandedCoworker, setExpandedCoworker] = useState(null);
  const coworkers = life.fullTimeJob?.coworkers || [];
  const manager = life.fullTimeJob?.manager;

  if (!life.fullTimeJob) {
    return (
      <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>No work circle yet</Text>
          <Text style={styles.placeholderBody}>Coworkers show up once this life has settled into a full-time role.</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionTitle}>Work relationships</Text>

      {manager ? (
        <View style={styles.sectionShell}>
          <Text style={styles.destinationCardTitle}>Manager</Text>
          <Text style={styles.personName}>{manager.firstName} {manager.lastName}</Text>
          <Text style={styles.personDetail}>{manager.quality === "excellent" ? "Strong manager" : manager.quality === "poor" ? "Difficult manager" : "Steady manager"}</Text>
          {renderWorkMeter("Bond", manager.bond, colors.status.bond)}
          {manager.quality === "excellent" ? <Text style={styles.helperText}>A strong manager can make promotions and stressful weeks easier to survive.</Text> : null}
          {manager.quality === "poor" ? <Text style={styles.helperText}>This relationship needs care if you want the job to feel sustainable.</Text> : null}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Coworkers</Text>
        {coworkers.length === 0 ? (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderBody}>This job has not filled out its wider cast yet.</Text>
          </View>
        ) : (
          coworkers.map((coworker) => {
            const isExpanded = expandedCoworker === coworker.id;
            return (
              <AccordionSection
                key={coworker.id}
                title={`${coworker.firstName} ${coworker.lastName}`}
                expanded={isExpanded}
                onToggle={() => setExpandedCoworker(isExpanded ? null : coworker.id)}
                rightText={`${Math.round(Number(coworker.bond || 0))}%`}
              >
                <View style={styles.sectionShell}>
                  <Text style={styles.personDetail}>{formatPersonality(coworker.personality)}</Text>
                  <Text style={styles.personDetail}>Age {coworker.age} · {coworker.yearsAtCompany} years here</Text>
                  {renderWorkMeter("Bond", coworker.bond, colors.status.bond)}
                  {renderWorkMeter("Morale", coworker.morale, coworker.morale > 60 ? colors.status.positive : colors.status.warning)}

                  <View style={styles.stackedButtonGroup}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => onInteract(coworker.id, "chat")}>
                      <Text style={styles.actionButtonText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => onInteract(coworker.id, "askAdvice")}>
                      <Text style={styles.actionButtonSecondaryText}>Ask for Advice</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => onInteract(coworker.id, "collaborate")}>
                      <Text style={styles.actionButtonSecondaryText}>Collaborate</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => onInteract(coworker.id, "compliment")}>
                      <Text style={styles.actionButtonSecondaryText}>Compliment</Text>
                    </TouchableOpacity>
                    {coworker.personality === "gossip" ? (
                      <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => onInteract(coworker.id, "gossip")}>
                        <Text style={styles.actionButtonSecondaryText}>Trade Gossip</Text>
                      </TouchableOpacity>
                    ) : null}
                    <TouchableOpacity style={styles.feedSecondaryButton} onPress={() => onInteract(coworker.id, "ignore")}>
                      <Text style={styles.feedSecondaryButtonText}>Keep Distance</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </AccordionSection>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
