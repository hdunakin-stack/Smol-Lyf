import React from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { randInt } from "../../utils/random.js";

export default function MassageModal({ visible, onAccept, onClose }) {
  const massagePrice = randInt(50, 107);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Massage Appointment</Text>
            <Text style={styles.modalSubtitle}>
              A quiet reset for this chapter. It can ease stress and leave the year feeling a little lighter.
            </Text>
          </View>

          <View style={styles.resultCallout}>
            <Text style={styles.gigPay}>Today's Price</Text>
            <Text style={styles.gigTotal}>${massagePrice}</Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.actionButton} onPress={() => onAccept(massagePrice)}>
              <Text style={styles.actionButtonText}>Book massage</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonSecondary} onPress={onClose}>
              <Text style={styles.actionButtonSecondaryText}>Maybe later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
