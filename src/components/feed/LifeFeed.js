import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import StatusBars from "../layout/StatusBars.js";
import { styles } from "../../styles/AppStyles.js";

export default function LifeFeed({
  life,
  feed,
  onOpenRoute,
  onOpenSettings,
  onAgeUp,
  onOpenTimelineAge,
}) {
  function runAction(action) {
    if (action.type === "route") {
      onOpenRoute(action.route, action.focus);
      return;
    }

    if (action.handler === "ageUp") {
      onAgeUp();
    }
  }

  return (
    <ScrollView style={styles.feedScroll} contentContainerStyle={styles.feedContent} showsVerticalScrollIndicator={false}>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIdentity}>
            <Text style={styles.heroName}>{life.firstName} {life.lastName}</Text>
            <Text style={styles.heroMeta}>Age {life.age} · {life.occupation}</Text>
            <Text style={styles.heroSubMeta}>{life.city}</Text>
          </View>
          <View style={styles.heroActions}>
            <Text style={styles.heroMoney}>${Number(life.money || 0).toLocaleString()}</Text>
            <TouchableOpacity style={styles.heroSettingsButton} onPress={onOpenSettings}>
              <Text style={styles.heroSettingsButtonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.heroProfileButton} onPress={() => onOpenRoute("profile")}>
          <Text style={styles.heroProfileButtonText}>Open profile hub</Text>
        </TouchableOpacity>

        <View style={styles.heroStatsWrap}>
          <StatusBars life={life} embedded hideAge />
        </View>
      </View>

      <View style={styles.chipRailWrap}>
        {feed.quickChips.length > 2 ? (
          <View style={styles.chipRailHintRow}>
            <Text style={styles.chipRailHint}>Swipe for more</Text>
          </View>
        ) : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRail} contentContainerStyle={styles.chipRailContent}>
          {feed.quickChips.map((chip) => (
            <TouchableOpacity key={chip.id} style={styles.quickChip} onPress={() => onOpenRoute(chip.route)}>
              <Text style={styles.quickChipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.chipRailTail} />
        </ScrollView>
      </View>

      <View style={styles.feedSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.feedSectionTitle}>Recent timeline</Text>
          <TouchableOpacity onPress={() => onOpenRoute("timeline")}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>
        {feed.recentHistory.map((entry) => {
          const showSummary = Number(entry.age) < Number(life.age);
          const previewEvents = showSummary ? entry.supportingEvents : entry.supportingEvents.slice(1);

          return (
            <TouchableOpacity key={entry.age} style={styles.timelineCard} activeOpacity={0.92} onPress={() => onOpenTimelineAge?.(entry.age)}>
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
                  <Text style={styles.timelineOpenPillText}>Open</Text>
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
                <Text key={`${entry.age}-${index}`} style={styles.timelineEvent}>{event}</Text>
              ))}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.feedSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.feedSectionTitle}>Social health</Text>
          <TouchableOpacity onPress={() => onOpenRoute("relationships")}>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.socialOverviewGrid}>
          {feed.socialOverview.map((domain) => (
            <TouchableOpacity key={domain.id} style={styles.socialOverviewCard} onPress={() => onOpenRoute("relationships", { section: domain.id })}>
              <Text style={styles.socialOverviewLabel}>{domain.label}</Text>
              <Text style={styles.socialOverviewValue}>{domain.value}</Text>
              <Text style={styles.socialOverviewSummary}>{domain.summary}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.feedSection}>
        <Text style={styles.feedSectionTitle}>Suggested actions</Text>
        {feed.actions.map((card) => (
          <View key={card.id} style={styles.actionCard}>
            {card.eyebrow ? <Text style={styles.actionCardEyebrow}>{card.eyebrow}</Text> : null}
            <Text style={styles.actionCardTitle}>{card.title}</Text>
            <Text style={styles.actionCardSummary}>{card.summary}</Text>

            <TouchableOpacity style={styles.feedPrimaryButton} onPress={() => runAction(card.primary)}>
              <Text style={styles.feedPrimaryButtonText}>{card.primary.label}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
