import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import StatusBars from "../layout/StatusBars.js";
import RouteIdentityStrip from "../layout/RouteIdentityStrip.js";
import { styles } from "../../styles/AppStyles.js";
import { getStageLabelFromAge, getStageSummary } from "../../utils/lifeStages.js";
import { getRouteAvailability } from "../../utils/feed.js";

export default function ProfileHub({
  life,
  onBack,
  onOpenRoute,
  onOpenSettings,
  onSeeAllLives,
}) {
  const stageLabel = getStageLabelFromAge(life.age);
  const summary = getStageSummary(life);
  const routes = getRouteAvailability(life);

  return (
    <View style={styles.routeScreen}>
      <View style={styles.routeHeader}>
        <TouchableOpacity style={styles.routeBackButton} onPress={onBack}>
          <Text style={styles.routeBackText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.routeTitle}>Profile hub</Text>
        <TouchableOpacity style={styles.routeGhostButton} onPress={onOpenSettings}>
          <Text style={styles.routeGhostButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
      <RouteIdentityStrip life={life} />

      <ScrollView style={styles.routeScroll} contentContainerStyle={styles.routeScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.feedSectionEyebrow}>Identity</Text>
          <Text style={styles.heroName}>{life.firstName} {life.lastName}</Text>
          <Text style={styles.heroMeta}>Age {life.age} · {stageLabel} · {life.city}</Text>
          <Text style={styles.heroSubMeta}>{life.occupation}</Text>
          <Text style={styles.profileSummary}>{summary}</Text>
          <View style={styles.heroStatsWrap}>
            <StatusBars life={life} showAppearance embedded hideAge />
          </View>
        </View>

        <View style={styles.profileHubSection}>
          <Text style={styles.feedSectionTitle}>Deep views</Text>
          <View style={styles.destinationCardGrid}>
            <TouchableOpacity style={styles.destinationCard} onPress={() => onOpenRoute("timeline")}>
              <Text style={styles.destinationCardTitle}>Timeline</Text>
              <Text style={styles.destinationCardBody}>Read this life as a chapter archive, year by year.</Text>
            </TouchableOpacity>
            {routes.occupation ? (
              <TouchableOpacity style={styles.destinationCard} onPress={() => onOpenRoute("occupation")}>
                <Text style={styles.destinationCardTitle}>Occupation</Text>
                <Text style={styles.destinationCardBody}>School, work, groups, and major progression.</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.destinationCard} onPress={() => onOpenRoute("relationships")}>
              <Text style={styles.destinationCardTitle}>Relationships</Text>
              <Text style={styles.destinationCardBody}>Family, friends, romance, and the people shaping this run.</Text>
            </TouchableOpacity>
            {routes.activities ? (
              <TouchableOpacity style={styles.destinationCard} onPress={() => onOpenRoute("activities")}>
                <Text style={styles.destinationCardTitle}>Activities</Text>
                <Text style={styles.destinationCardBody}>Self-care, lifestyle choices, and chapter-specific routines.</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.profileHubSection}>
          <Text style={styles.feedSectionTitle}>Manage lives</Text>
          <TouchableOpacity style={styles.secondaryPanelButton} onPress={onSeeAllLives}>
            <Text style={styles.secondaryPanelButtonText}>See all lives</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryPanelButton} onPress={onOpenSettings}>
            <Text style={styles.secondaryPanelButtonText}>Open settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
