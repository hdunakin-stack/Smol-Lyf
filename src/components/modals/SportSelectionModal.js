import React from "react";
import { Text, View, TouchableOpacity, Modal } from "react-native";
import { styles } from "../../styles/AppStyles.js";

const SPORT_OPTIONS = [
  { id: "basketball", label: "Basketball", copy: "Fast breaks, pressure shots, and a smaller team orbit." },
  { id: "soccer", label: "Soccer", copy: "Conditioning, field vision, and a bigger team rhythm." },
  { id: "football", label: "Football", copy: "Hard practices, coach pressure, and a loud team culture." },
];

export default function SportSelectionModal({ visible, onSelectSport, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pick a Sport</Text>
            <Text style={styles.modalSubtitle}>Choose one team to try out for this year.</Text>
          </View>

          <View style={styles.stackedButtonGroup}>
            {SPORT_OPTIONS.map((sport) => (
              <TouchableOpacity key={sport.id} style={styles.actionButton} onPress={() => onSelectSport(sport.id)}>
                <Text style={styles.actionButtonText}>{sport.label}</Text>
                <Text style={styles.actionButtonSubtext}>{sport.copy}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
