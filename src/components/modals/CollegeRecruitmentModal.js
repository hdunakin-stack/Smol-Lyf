import React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { colors, spacing } from "../../styles/tokens.js";

export default function CollegeRecruitmentModal({
  visible,
  sport,
  offers,
  hsRanking,
  onAcceptOffer,
  onDecline,
}) {
  if (!visible || !offers) return null;

  function getTierColor(tier) {
    if (tier === "tier1") return colors.accent.reward;
    if (tier === "tier2") return colors.accent.cool;
    return colors.ui.secondary;
  }

  function getTierLabel(tier) {
    if (tier === "tier1") return "Elite Program";
    if (tier === "tier2") return "Top Program";
    return "Solid Program";
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { maxHeight: "85%" }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {sport === "basketball" ? "College Basketball Recruitment" : "College Football Recruitment"}
            </Text>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: spacing.lg }}>
            <Text style={styles.modalDescription}>
              {hsRanking ? `High School Ranking: ${hsRanking}` : "College programs are recruiting you."}
            </Text>
            <Text style={[styles.modalDescription, { marginTop: spacing.sm }]}>
              Choose a program based on NIL earnings, playing time, coaching, and team quality.
            </Text>

            {offers.map((offer, index) => (
              <View
                key={index}
                style={[
                  styles.feedCard,
                  {
                    marginTop: spacing.sm + 3,
                    borderLeftWidth: 4,
                    borderLeftColor: getTierColor(offer.tier),
                  },
                ]}
              >
                <Text style={[styles.feedCardTitle, { fontSize: 18 }]}>{offer.name}</Text>
                <Text style={[styles.helperText, styles.feedbackRewardText, { fontWeight: "700" }]}>
                  {getTierLabel(offer.tier)}
                </Text>

                <View style={{ marginTop: spacing.sm }}>
                  <Text style={styles.helperText}>NIL Deal: ${offer.nilAmount.toLocaleString()}/year</Text>
                  <Text style={styles.helperText}>Market Size: {offer.market}</Text>
                  <Text style={styles.helperText}>Coaching: {offer.coaching}</Text>
                  <Text style={styles.helperText}>Playing Time: {offer.playingTime}</Text>
                  <Text style={styles.helperText}>Team Quality: {offer.team}</Text>
                </View>

                <TouchableOpacity
                  style={[styles.actionButtonSecondary, { marginTop: spacing.sm }]}
                  onPress={() => onAcceptOffer(offer)}
                >
                  <Text style={styles.actionButtonSecondaryText}>Commit to {offer.name}</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.feedSecondaryButton, { marginTop: spacing.lg }]}
              onPress={onDecline}
            >
              <Text style={styles.feedSecondaryButtonText}>Decline All Offers</Text>
            </TouchableOpacity>
            <Text style={[styles.helperText, { textAlign: "center", marginTop: spacing.xs }]}>
              Go pro immediately or pursue another path.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
