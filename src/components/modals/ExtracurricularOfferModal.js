// Extracurricular offer modal (age 12+)

import React from "react";
import { Text, View, TouchableOpacity, Modal } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function ExtracurricularOfferModal({ visible, onSelectOption, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Extracurricular Activities</Text>
            <Text style={styles.modalSubtitle}>School is opening up a few new lanes. What sounds right for this chapter?</Text>
          </View>

          <View style={styles.stackedButtonGroup}>
            <TouchableOpacity style={styles.actionButton} onPress={() => onSelectOption("sport")}>
              <Text style={styles.actionButtonText}>Try Out for a Sport</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => onSelectOption("band")}>
              <Text style={styles.actionButtonText}>Audition for Band</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => onSelectOption("choir")}>
              <Text style={styles.actionButtonText}>Audition for Choir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => onSelectOption("club")}>
              <Text style={styles.actionButtonText}>Join a Club</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Not Interested</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
