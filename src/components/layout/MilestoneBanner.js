import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function MilestoneBanner({ banner, onDismiss }) {
  if (!banner) return null;

  return (
    <View style={styles.milestoneBannerWrap}>
      <TouchableOpacity activeOpacity={0.92} style={styles.milestoneBannerPressable} onPress={onDismiss}>
        <View style={styles.milestoneBanner}>
          <View style={styles.milestoneBannerRow}>
            <Text style={styles.milestoneBannerTitle}>{banner.title}</Text>
            <Text style={styles.milestoneBannerDismiss}>×</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
