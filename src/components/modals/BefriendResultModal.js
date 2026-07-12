import React from "react";
import { Text, View, TouchableOpacity, Modal } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function BefriendResultModal({ visible, result, onClose }) {
  if (!result) return null;

  const { success, person, message } = result;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>
            {success ? "Friend Request Accepted" : "Friend Request Declined"}
          </Text>
          <Text style={styles.resultName}>
            {person.firstName} {person.lastName}
          </Text>
          <Text style={[styles.resultBody, { marginBottom: 18 }]}>
            {message}
          </Text>

          {success && (
            <View style={{ marginBottom: 18 }}>
              <Text style={styles.resultDelta}>+10 Bond</Text>
              <View style={styles.resultCallout}>
                <Text style={styles.resultCalloutText}>
                  You can now see {person.firstName} in your relationships, spend time together, and build something real from here.
                </Text>
              </View>
            </View>
          )}

          {!success && (
            <View style={{ marginBottom: 18 }}>
              <View style={styles.resultCallout}>
                <Text style={styles.resultCalloutText}>
                  Nothing shifted this time. Spend a little more time together first, then try again when the bond feels stronger.
                </Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Text style={styles.actionButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
