import React from "react";
import { Text, View, TouchableOpacity, Modal, ScrollView } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function AllLivesModal({ visible, lives, onClose, onSelectLife, onDeleteLife }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Lives</Text>
            <Text style={styles.modalSubtitle}>Pick up an existing story or clear one out.</Text>
          </View>

          <ScrollView style={styles.modalScrollBody} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            {lives.length === 0 ? (
              <Text style={styles.helperText}>No saved lives yet.</Text>
            ) : (
              lives.map((life) => (
                <View key={life.lifeId} style={styles.lifeCard}>
                  <TouchableOpacity onPress={() => onSelectLife(life.lifeId)} style={styles.lifeCardSelectArea}>
                    <Text style={styles.lifeCardName}>
                      {life.firstName} {life.lastName}
                    </Text>
                    <View style={styles.lifeCardMetaBlock}>
                      <Text style={styles.lifeCardDetail}>
                        Age {life.age}{life.occupation ? ` · ${life.occupation}` : ""}
                      </Text>
                      <Text style={styles.lifeCardDetail}>{life.city}</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.lifeCardActions}>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => onDeleteLife(life.lifeId)}>
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.actionButtonInfo} onPress={onClose}>
              <Text style={styles.actionButtonInfoText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
