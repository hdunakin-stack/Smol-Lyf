// History log component
// 11.11.2025 - v1.00.11: Added null/undefined safety check

import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function HistoryLog({ history }) {
  if (!history || typeof history !== "object") {
    return (
      <>
        <Text style={styles.sectionTitle}>History</Text>
        <Text style={styles.helperText}>No history yet. Start living your life.</Text>
      </>
    );
  }

  return (
    <>
      <Text style={styles.sectionTitle}>History</Text>
      {Object.keys(history)
        .sort((a, b) => Number(b) - Number(a))
        .map((age) => (
          <View key={age} style={styles.historyBlock}>
            <Text style={styles.historyAge}>Age {age}</Text>
            {history[age].map((event, i) => (
              <Text key={i} style={styles.historyEvent}>- {event}</Text>
            ))}
          </View>
        ))}
    </>
  );
}
