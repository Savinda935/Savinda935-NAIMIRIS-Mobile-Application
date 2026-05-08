import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../config/theme";

export default function ScreenHeader({ eyebrow, title, subtitle, badge }) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        {badge ? <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View> : null}
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  eyebrow: {
    color: theme.colors.accent,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontSize: 12,
    fontFamily: theme.typography.medium
  },
  badge: {
    borderColor: theme.colors.borderStrong,
    borderWidth: 1,
    borderRadius: theme.radius.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.surfaceAlt
  },
  badgeText: {
    color: theme.colors.text,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontFamily: theme.typography.medium
  },
  title: {
    fontSize: 26,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    fontFamily: theme.typography.title
  },
  subtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.muted,
    fontSize: 14,
    fontFamily: theme.typography.body
  }
});
