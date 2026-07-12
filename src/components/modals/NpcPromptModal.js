import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function NpcPromptModal({ visible, prompt, onChoose, onClose }) {
  if (!prompt) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{prompt.title}</Text>
            {prompt.person ? <Text style={styles.resultName}>{prompt.person.firstName} {prompt.person.lastName}</Text> : null}
            {prompt.context ? <Text style={styles.modalStatusText}>{prompt.context}</Text> : null}
          </View>
          <Text style={styles.modalSubtitle}>{prompt.question}</Text>

          <View style={styles.stackedButtonGroup}>
            {prompt.choices.map((choice) => (
              <TouchableOpacity
                key={choice.id}
                style={choice.tone === "aggressive" ? styles.feedSecondaryButton : styles.actionButtonSecondary}
                onPress={() => onChoose(choice.id)}
              >
                <Text style={choice.tone === "aggressive" ? styles.feedSecondaryButtonText : styles.actionButtonSecondaryText}>
                  {choice.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

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
