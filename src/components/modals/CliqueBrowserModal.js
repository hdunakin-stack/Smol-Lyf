import React, { useMemo, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";

function getCliqueScenario(cliqueKey) {
  const scenarios = {
    goths: "Someone from the goth crowd asked if you wanted to hang out with them and their friends after school.",
    jocks: "A confident athlete said you should come around more and see if you fit with the team crowd.",
    nerds: "A classmate mentioned their group always has room for someone who actually likes ideas.",
    artsy: "A creative kid invited you to hang around the music room and see what their people are like.",
    rebels: "Someone with a reckless grin said their crew does things their own way and you might fit right in.",
    popular: "One of the social heavy-hitters hinted that their circle has noticed you lately.",
    loners: "Someone quiet gave you the look that says you can sit nearby without having to perform.",
  };

  return scenarios[cliqueKey] || "A new social circle is opening up around you.";
}

export default function CliqueBrowserModal({ visible, life, onInteract, onClose }) {
  const [selectedClique, setSelectedClique] = useState(null);
  const { CLIQUES } = require("../../domains/cliques.js");
  const cliqueKeys = useMemo(() => Object.keys(CLIQUES), [CLIQUES]);
  const currentClique = life?.clique;

  if (selectedClique) {
    const cliqueData = CLIQUES[selectedClique];
    const isCurrent = selectedClique === currentClique;

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{cliqueData.name}</Text>
              <Text style={styles.modalSubtitle}>{getCliqueScenario(selectedClique)}</Text>
            </View>

            <View style={styles.sectionShell}>
              <Text style={styles.helperText}>Reputation: {cliqueData.description}</Text>
              <Text style={styles.helperText}>Social feel: {cliqueData.benefits}</Text>
            </View>

            {isCurrent ? (
              <View style={styles.resultCallout}>
                <Text style={styles.resultCalloutText}>This is already your current social circle.</Text>
              </View>
            ) : (
              <View style={styles.stackedButtonGroup}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    onInteract(selectedClique, "askJoin");
                    setSelectedClique(null);
                  }}
                >
                  <Text style={styles.actionButtonText}>See Where This Goes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButtonSecondary}
                  onPress={() => {
                    onInteract(selectedClique, "hangOut");
                    setSelectedClique(null);
                  }}
                >
                  <Text style={styles.actionButtonSecondaryText}>Hang Around First</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedClique(null)}>
                <Text style={styles.closeButtonText}>Not Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cliques</Text>
            <Text style={styles.modalSubtitle}>Current: {currentClique ? CLIQUES[currentClique].name : "None yet"}</Text>
          </View>

          <ScrollView style={styles.modalScrollBody} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            {cliqueKeys.map((cliqueKey) => {
              const clique = CLIQUES[cliqueKey];
              const isCurrent = cliqueKey === currentClique;

              return (
                <TouchableOpacity
                  key={cliqueKey}
                  style={[styles.destinationCard, isCurrent && styles.disabledCard]}
                  onPress={() => setSelectedClique(cliqueKey)}
                >
                  <Text style={styles.destinationCardTitle}>{clique.name}{isCurrent ? " (Current)" : ""}</Text>
                  <Text style={styles.destinationCardBody}>
                    {isCurrent ? "Your current social circle." : getCliqueScenario(cliqueKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
