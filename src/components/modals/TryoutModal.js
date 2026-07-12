// Tryout/Audition modal

import React from "react";
import { Text, View, TouchableOpacity, Modal } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function TryoutModal({ visible, tryoutData, onAccept, onDecline }) {
  if (!tryoutData) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{tryoutData.title}</Text>
            <Text style={styles.modalSubtitle}>{tryoutData.description}</Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.actionButton} onPress={onAccept}>
              <Text style={styles.actionButtonText}>Give It a Shot</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onDecline}>
              <Text style={styles.closeButtonText}>Not This Time</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
