import React from "react";
import { Text, View, TouchableOpacity, Modal } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function DrivingTestModal({ visible, onTakeTest, onSkip }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Driving Test</Text>
            <Text style={styles.modalSubtitle}>You turned 16. Do you want to take the driving test?</Text>
          </View>

          <View style={styles.stackedButtonGroup}>
            <TouchableOpacity style={styles.actionButton} onPress={onTakeTest}>
              <Text style={styles.actionButtonText}>Take the test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButtonSecondary} onPress={onSkip}>
              <Text style={styles.actionButtonSecondaryText}>Not yet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
