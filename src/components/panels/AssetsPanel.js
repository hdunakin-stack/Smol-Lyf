import React from "react";
import { ScrollView, Text, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import {
  getAssetArchiveSummary,
  getFinancialStory,
  getIncomeSnapshot,
  getObligationsSnapshot,
} from "../../utils/assets.js";

function InfoCard({ title, detail }) {
  return (
    <View style={styles.destinationCard}>
      <Text style={styles.destinationCardTitle}>{title}</Text>
      <Text style={styles.destinationCardBody}>{detail}</Text>
    </View>
  );
}

export default function AssetsPanel({ life }) {
  const cash = Number(life.money || 0);
  const income = getIncomeSnapshot(life);
  const obligations = getObligationsSnapshot(life);
  const archive = getAssetArchiveSummary(life);
  const story = getFinancialStory(life);

  return (
    <ScrollView contentContainerStyle={styles.panelScrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.placeholderCard}>
        <Text style={styles.assetsSectionLabel}>Cash</Text>
        <Text style={styles.assetsCashValue}>${cash.toLocaleString()}</Text>
        <Text style={styles.placeholderBody}>What this life can actually spend right now.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Income Snapshot</Text>
        {income.length ? (
          <View style={styles.destinationCardGrid}>
            {income.map((entry) => (
              <InfoCard key={entry.key} title={entry.title} detail={entry.detail} />
            ))}
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderTitle}>No active income yet</Text>
            <Text style={styles.placeholderBody}>This chapter has not opened up real earning power yet, but that can change later.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Obligations</Text>
        {obligations.length ? (
          <View style={styles.destinationCardGrid}>
            {obligations.map((entry) => (
              <InfoCard key={entry.key} title={entry.title} detail={entry.detail} />
            ))}
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderTitle}>No major obligations</Text>
            <Text style={styles.placeholderBody}>Nothing heavy is pulling on this life’s finances right now.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Financial Story</Text>
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderBody}>{story}</Text>
        </View>
      </View>

      {archive.length ? (
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Archive-ready</Text>
          <View style={styles.destinationCardGrid}>
            {archive.map((entry) => (
              <InfoCard key={entry.key} title={entry.title} detail={entry.detail} />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
