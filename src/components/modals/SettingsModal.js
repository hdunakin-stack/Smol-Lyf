// Settings modal component

import React from "react";
import { Text, View, TouchableOpacity, Modal, ScrollView } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function SettingsModal({ visible, onClose, onStartNewLife, onSeeAllLives }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Text style={styles.modalSubtitle}>Manage your current run, revisit your archive, or start a fresh life.</Text>
          </View>

          <ScrollView style={styles.modalScrollBody} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.actionButton} onPress={onStartNewLife}>
              <Text style={styles.actionButtonText}>Start a New Life</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonSecondary} onPress={onSeeAllLives}>
              <Text style={styles.actionButtonSecondaryText}>See All Lives</Text>
            </TouchableOpacity>
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
