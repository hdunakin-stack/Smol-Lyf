import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function FreelanceGigModal({ visible, gigData, onAccept, onDecline }) {
  if (!gigData) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{gigData.title}</Text>
            <Text style={styles.modalSubtitle}>{gigData.description}</Text>
          </View>

          <View style={styles.sectionShell}>
            <Text style={styles.personDetail}>Rate: ${gigData.hourlyRate}/hour</Text>
            <Text style={styles.personDetail}>Time: {gigData.hours} hours</Text>
            <Text style={styles.resultDelta}>+${gigData.totalPay} Cash</Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.actionButton} onPress={onAccept}>
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeButton} onPress={onDecline}>
              <Text style={styles.closeButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
