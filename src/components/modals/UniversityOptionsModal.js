import React from "react";
import { Text, View, TouchableOpacity, Modal } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function UniversityOptionsModal({ visible, life, onApplyScholarship, onPayTuition, onTakeLoan, onSkipUniversity, attemptedOptions }) {
  const tuitionCost = 20000;
  const hasEnoughMoney = life.money >= tuitionCost;
  const hasParents = life.relationships?.some((r) => r.relation === "Mother" || r.relation === "Father");

  const scholarshipFailed = attemptedOptions?.scholarship === false;
  const parentsFailed = attemptedOptions?.parents === false;
  const selfPaymentFailed = attemptedOptions?.payTuition === false;

  function DisabledAction({ label }) {
    return (
      <View style={[styles.actionButtonSecondary, styles.actionButtonDisabled]}>
        <Text style={styles.actionButtonSecondaryText}>{label}</Text>
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>University Options</Text>
            <Text style={styles.modalDescription}>You finished high school. What's next?</Text>
          </View>

          {!scholarshipFailed ? (
            <>
              <TouchableOpacity style={styles.actionButton} onPress={onApplyScholarship}>
                <Text style={styles.actionButtonText}>Apply for Scholarship</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>High academic and athletic performers get scholarships more easily.</Text>
            </>
          ) : (
            <DisabledAction label="Scholarship Rejected" />
          )}

          {hasEnoughMoney && !selfPaymentFailed ? (
            <>
              <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => onPayTuition("self")}>
                <Text style={styles.actionButtonSecondaryText}>Pay Tuition (${tuitionCost.toLocaleString()})</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>Pay from your savings.</Text>
            </>
          ) : hasEnoughMoney && selfPaymentFailed ? (
            <DisabledAction label="Tuition Already Paid" />
          ) : hasParents && !parentsFailed ? (
            <>
              <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => onPayTuition("parents")}>
                <Text style={styles.actionButtonSecondaryText}>Ask Parents to Pay</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>Your parents might help cover ${tuitionCost.toLocaleString()}.</Text>
            </>
          ) : hasParents && parentsFailed ? (
            <DisabledAction label="Parents Can't Afford It" />
          ) : null}

          <TouchableOpacity style={styles.actionButtonSecondary} onPress={onTakeLoan}>
            <Text style={styles.actionButtonSecondaryText}>Take Student Loans</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>Borrow ${tuitionCost.toLocaleString()} and repay over time.</Text>

          <TouchableOpacity style={styles.actionButtonSecondary} onPress={onSkipUniversity}>
            <Text style={styles.actionButtonSecondaryText}>Skip University</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>Find a job now or revisit school later.</Text>

        </View>
      </View>
    </Modal>
  );
}
