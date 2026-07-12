import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function ActionResultModal({ visible, result, onClose }) {
  if (!result) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{result.title}</Text>
          {result.name ? <Text style={styles.resultName}>{result.name}</Text> : null}
          <Text style={[styles.resultBody, { marginBottom: 18 }]}>{result.message}</Text>

          {result.changes?.length ? (
            <View style={{ marginBottom: 18 }}>
              {result.changes.map((change) => (
                <Text key={change} style={styles.resultDelta}>{change}</Text>
              ))}
            </View>
          ) : null}

          {result.callout ? (
            <View style={[styles.resultCallout, { marginBottom: 18 }]}>
              <Text style={styles.resultCalloutText}>{result.callout}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Text style={styles.actionButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
