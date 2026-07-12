import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { buildHistorySnapshots } from "../../utils/history.js";

export default function TimelineArchive({ life, initialAge, onOpenAge }) {
  const snapshots = useMemo(() => buildHistorySnapshots(life?.history), [life]);
  const [expandedAges, setExpandedAges] = useState(initialAge != null ? { [Number(initialAge)]: true } : {});

  useEffect(() => {
    if (initialAge != null) {
      setExpandedAges((current) => ({ ...current, [Number(initialAge)]: true }));
    }
  }, [initialAge]);

  function toggleAge(age) {
    setExpandedAges((current) => ({
      ...current,
      [age]: !current[age],
    }));
    if (onOpenAge) onOpenAge(age);
  }

  return (
    <ScrollView style={styles.routeScroll} contentContainerStyle={styles.routeScrollContent} showsVerticalScrollIndicator={false}>
      {snapshots.map((entry) => {
        const expanded = !!expandedAges[entry.age];
        const showSummary = Number(entry.age) < Number(life?.age || 0);
        const previewEvents = showSummary ? entry.supportingEvents : entry.supportingEvents.slice(1);
        const additionalEvents = showSummary ? (entry.remainingEvents || []) : (entry.remainingEvents || []);

        return (
          <TouchableOpacity key={entry.age} style={styles.timelineCard} activeOpacity={0.94} onPress={() => toggleAge(entry.age)}>
            <View style={styles.timelineCardHeader}>
              <View style={styles.feedCardCopy}>
                <Text style={styles.timelineAge}>Age {entry.age}</Text>
                <View style={styles.timelineMetaRow}>
                  <View style={styles.timelineTag}>
                    <Text style={styles.timelineTagText}>{entry.stageLabel}</Text>
                  </View>
                  <Text style={styles.timelineMetaText}>{entry.count} moments</Text>
                </View>
              </View>
              <View style={styles.timelineOpenPill}>
                <Text style={styles.timelineOpenPillText}>{expanded ? "Hide" : "Open"}</Text>
              </View>
            </View>

            {showSummary ? (
              <>
                <Text style={styles.timelineFeaturedEvent}>{entry.summaryLine}</Text>
                {entry.summarySupport ? <Text style={styles.timelineEvent}>{entry.summarySupport}</Text> : null}
              </>
            ) : (
              <Text style={styles.timelineFeaturedEvent}>{entry.featuredEvent}</Text>
            )}

            {previewEvents.map((event, index) => (
              <Text key={`${entry.age}-preview-${index}`} style={styles.timelineEvent}>{event}</Text>
            ))}

            {expanded && additionalEvents.length ? (
              <View style={styles.timelineCardFooter}>
                <View style={styles.feedCardCopy}>
                  {additionalEvents.map((event, index) => (
                    <Text key={`${entry.age}-full-${index}`} style={styles.timelineEvent}>{event}</Text>
                  ))}
                </View>
              </View>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
