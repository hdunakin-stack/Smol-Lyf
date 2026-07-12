import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function AccordionSection({
  title,
  expanded,
  onToggle,
  children,
  rightText = null,
  level = 0,
  bodyStyle = null,
  headerStyle = null,
}) {
  return (
    <View style={[styles.accordionSection, level > 0 && styles.accordionSectionNested]}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.accordionShellHeader, headerStyle, level > 0 && styles.accordionShellHeaderNested]}
        onPress={onToggle}
      >
        <View style={styles.accordionShellTitleWrap}>
          <Text style={styles.accordionShellTitle}>{title}</Text>
        </View>
        <View style={styles.accordionShellRight}>
          {rightText ? <Text style={styles.accordionShellMeta}>{rightText}</Text> : null}
          <View style={[styles.accordionToggleChip, expanded && styles.accordionToggleChipExpanded]}>
            <Text style={[styles.accordionToggleChipText, expanded && styles.accordionToggleChipTextExpanded]}>
              {expanded ? "Hide" : "Open"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
      {expanded ? <View style={[styles.accordionShellBody, bodyStyle]}>{children}</View> : null}
    </View>
  );
}
