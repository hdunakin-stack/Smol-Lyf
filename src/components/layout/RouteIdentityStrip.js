import React from "react";
import { Text, View } from "react-native";
import { styles } from "../../styles/AppStyles.js";

export default function RouteIdentityStrip({ life }) {
  if (!life) return null;

  return (
    <View style={styles.routeIdentityStrip}>
      <Text style={styles.routeIdentityName}>
        {life.firstName} {life.lastName}
      </Text>
      <Text style={styles.routeIdentityMoney}>${Number(life.money || 0).toLocaleString()}</Text>
    </View>
  );
}
