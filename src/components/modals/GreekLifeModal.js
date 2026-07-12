import React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { spacing } from "../../styles/tokens.js";

export default function GreekLifeModal({
  visible,
  life,
  organizations,
  onJoinOrg,
  onClose,
}) {
  if (!visible || !organizations) return null;

  const { org1, org2 } = organizations;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { maxHeight: "70%" }]}>
          <Text style={styles.modalTitle}>
            {life?.gender === "Male" ? "Join a Fraternity" : "Join a Sorority"}
          </Text>

          <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
            <Text style={styles.modalDescription}>
              Choose which Greek organization to pledge. Annual dues are charged each year.
            </Text>

            {[org1, org2].map((org, index) => (
              <View key={index} style={[styles.feedCard, { marginTop: index === 0 ? spacing.lg : spacing.sm + 3 }]}>
                <Text style={styles.feedCardTitle}>
                  {org.name}
                </Text>
                <Text style={styles.helperText}>Reputation: {org.reputation}</Text>
                <Text style={styles.helperText}>Annual Dues: ${org.cost}</Text>
                <TouchableOpacity
                  style={[styles.actionButtonSecondary, { marginTop: spacing.sm }]}
                  onPress={() => onJoinOrg(index === 0 ? "org1" : "org2")}
                >
                  <Text style={styles.actionButtonSecondaryText}>Pledge {org.name}</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.actionButtonSecondary, { marginTop: spacing.lg }]}
              onPress={onClose}
            >
              <Text style={styles.actionButtonSecondaryText}>Not Interested</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
