import React from "react";
import { Text, View, TouchableOpacity, Modal } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function JobApplicationResultModal({ visible, result, onClose }) {
  if (!result) return null;

  const { success, job, message, salary } = result;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{success ? "Job offer" : "Application update"}</Text>
          {job?.title ? <Text style={styles.resultName}>{job.title}</Text> : null}
          <Text style={[styles.resultBody, { marginBottom: 18 }]}>{message}</Text>

          {success && salary ? (
            <View style={{ marginBottom: 18 }}>
              <Text style={styles.resultDelta}>${salary.toLocaleString()}/year</Text>
            </View>
          ) : null}

          <View style={[styles.resultCallout, { marginBottom: 18 }]}>
            <Text style={styles.resultCalloutText}>
              {success ? "This role now lives in Occupation." : "Build a little more momentum, then circle back later."}
            </Text>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Text style={styles.actionButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
