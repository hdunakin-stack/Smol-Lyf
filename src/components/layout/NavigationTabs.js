// Navigation tabs component

import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function NavigationTabs({ activeTab, onTabChange, age }) {
  const canInteract = age >= 5;

  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'home' && styles.tabActive]}
        onPress={() => onTabChange('home')}
      >
        <Text style={styles.tabText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'occupation' && styles.tabActive]}
        onPress={() => onTabChange('occupation')}
      >
        <Text style={styles.tabText}>Occupation</Text>
      </TouchableOpacity>
      {canInteract && (
        <TouchableOpacity
          style={[styles.tab, activeTab === 'relationships' && styles.tabActive]}
          onPress={() => onTabChange('relationships')}
        >
          <Text style={styles.tabText}>Relationships</Text>
        </TouchableOpacity>
      )}
      {canInteract && (
        <TouchableOpacity
          style={[styles.tab, activeTab === 'activities' && styles.tabActive]}
          onPress={() => onTabChange('activities')}
        >
          <Text style={styles.tabText}>Activities</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
