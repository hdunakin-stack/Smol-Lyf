import React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { styles } from "../../styles/AppStyles.js";

function ChoiceBlock({ title, body, buttonLabel, buttonStyle, buttonTextStyle, onPress }) {
  return (
    <View>
      <View style={styles.destinationCard}>
        <Text style={styles.destinationCardTitle}>{title}</Text>
        <Text style={styles.destinationCardBody}>{body}</Text>
      </View>
      <TouchableOpacity style={buttonStyle} onPress={onPress}>
        <Text style={buttonTextStyle}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PregnancyModal({
  visible,
  life,
  partnerName,
  onKeepBaby,
  onAskTermination,
  onDenyPaternity,
  onGhost,
  onCoParent,
  onMakeItWork,
}) {
  if (!visible || !partnerName) return null;

  const partner = life.relationships?.find((r) => r.firstName === partnerName);
  const relationshipStatus = partner?.relationshipStatus || "dating";

  const openingCopy =
    relationshipStatus === "married"
      ? `${partnerName} is pregnant. This changes both of your lives.`
      : relationshipStatus === "engaged"
      ? `${partnerName} is pregnant. The future just got a lot more real.`
      : `${partnerName} says they're pregnant. You did not expect this.`;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Unexpected News</Text>
            <Text style={styles.modalSubtitle}>{openingCopy}</Text>
          </View>

          <ScrollView style={styles.modalScrollBody} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.destinationCardGrid}>
              <ChoiceBlock
                title="Keep the baby"
                body="Accept parenthood and bring the child into your life."
                buttonLabel="Choose parenthood"
                buttonStyle={styles.actionButton}
                buttonTextStyle={styles.actionButtonText}
                onPress={onKeepBaby}
              />

              <ChoiceBlock
                title="Talk about termination"
                body="Have the hardest conversation directly before anything else unfolds."
                buttonLabel="Open the conversation"
                buttonStyle={styles.actionButtonSecondary}
                buttonTextStyle={styles.actionButtonSecondaryText}
                onPress={onAskTermination}
              />

              <ChoiceBlock
                title="Commit to making it work"
                body="Try to strengthen the relationship and prepare together."
                buttonLabel="Stay together"
                buttonStyle={styles.actionButtonSecondary}
                buttonTextStyle={styles.actionButtonSecondaryText}
                onPress={onMakeItWork}
              />

              <ChoiceBlock
                title="Agree to co-parent"
                body="Step away from the romance but stay involved as parents."
                buttonLabel="Co-parent"
                buttonStyle={styles.actionButtonInfo}
                buttonTextStyle={styles.actionButtonInfoText}
                onPress={onCoParent}
              />

              <ChoiceBlock
                title="Deny paternity"
                body="This can badly damage trust, reputation, and the relationship around you."
                buttonLabel="Deny it"
                buttonStyle={styles.actionButtonDanger}
                buttonTextStyle={styles.actionButtonText}
                onPress={onDenyPaternity}
              />

              <ChoiceBlock
                title="Disappear"
                body="The most extreme response. Fallout can spread far beyond the relationship itself."
                buttonLabel="Disappear"
                buttonStyle={styles.actionButtonDanger}
                buttonTextStyle={styles.actionButtonText}
                onPress={onGhost}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
