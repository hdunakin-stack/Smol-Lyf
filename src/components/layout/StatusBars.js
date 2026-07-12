// Status bars component
// 11.11.2025 - v1.03.0: Added formerClique display
// 11.11.2025 - v1.04.0: Replaced Stress with Happiness, all bars now white
// 11.19.2025 - Added appearance display

import React from "react";
import { View, Text } from "react-native";
import { styles } from "../../styles/AppStyles.js";
import { colors, spacing } from "../../styles/tokens.js";
import { getStatSemanticTone } from "../../utils/status.js";
import AppearanceDisplay from "../AppearanceDisplay.js";

export default function StatusBars({ life, showAppearance = false, embedded = false, hideAge = false }) {
  function formatPercent(value) {
    return `${Math.round(Number(value || 0))}%`;
  }
  // 11.11.2025 - v1.03.0: Get former clique info for display
  let formerCliqueDisplay = null;
  if (life.formerClique) {
    const { CLIQUES } = require("../../domains/cliques.js");
    const cliqueData = CLIQUES[life.formerClique];
    if (cliqueData) {
      formerCliqueDisplay = `Former ${cliqueData.name}`;
    }
  }

  return (
    <View style={embedded ? styles.statsCardEmbedded : styles.statsCard}>
      {!hideAge ? <Text style={styles.ageText}>Age: {life.age}</Text> : null}
      {formerCliqueDisplay && (
        <Text style={styles.helperText}>{formerCliqueDisplay}</Text>
      )}

      {showAppearance && life.appearance && (
        <View
          style={{
            marginTop: spacing.sm,
            marginBottom: spacing.md,
            paddingTop: spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.border.subtle,
          }}
        >
          <Text style={[styles.subsectionTitle, { fontSize: 14, marginBottom: 8 }]}>Appearance</Text>
          <AppearanceDisplay appearance={life.appearance} detailed={true} age={life.age} gender={life.gender} />
        </View>
      )}
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Health</Text>
        <View style={styles.statBarBg}>
          <View style={[styles.statBarFill, { width: `${life.health}%`, backgroundColor: getStatSemanticTone("health", life.health) }]} />
        </View>
        <Text style={styles.statValue}>{formatPercent(life.health)}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Intelligence</Text>
        <View style={styles.statBarBg}>
          <View style={[styles.statBarFill, { width: `${life.intelligence}%`, backgroundColor: getStatSemanticTone("intelligence", life.intelligence) }]} />
        </View>
        <Text style={styles.statValue}>{formatPercent(life.intelligence)}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Attractiveness</Text>
        <View style={styles.statBarBg}>
          <View style={[styles.statBarFill, { width: `${life.attractiveness}%`, backgroundColor: getStatSemanticTone("attractiveness", life.attractiveness) }]} />
        </View>
        <Text style={styles.statValue}>{formatPercent(life.attractiveness)}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Happiness</Text>
        <View style={styles.statBarBg}>
          <View style={[styles.statBarFill, { width: `${life.happiness}%`, backgroundColor: getStatSemanticTone("happiness", life.happiness) }]} />
        </View>
        <Text style={styles.statValue}>{formatPercent(life.happiness)}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Athleticism</Text>
        <View style={styles.statBarBg}>
          <View style={[styles.statBarFill, { width: `${Number(life.athleticism || 0)}%`, backgroundColor: getStatSemanticTone("athleticism", Number(life.athleticism || 0)) }]} />
        </View>
        <Text style={styles.statValue}>{formatPercent(Number(life.athleticism || 0))}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Stress</Text>
        <View style={styles.statBarBg}>
          <View style={[styles.statBarFillDanger, { width: `${life.stress}%`, backgroundColor: getStatSemanticTone("stress", life.stress) }]} />
        </View>
        <Text style={styles.statValue}>{formatPercent(life.stress)}</Text>
      </View>
      <View style={styles.statRow}>
        <Text style={styles.statLabel}>Fame</Text>
        <View style={styles.statBarBg}>
          <View style={[styles.statBarFill, { width: `${life.fame}%`, backgroundColor: getStatSemanticTone("fame", life.fame) }]} />
        </View>
        <Text style={styles.statValue}>{formatPercent(life.fame)}</Text>
      </View>
    </View>
  );
}
