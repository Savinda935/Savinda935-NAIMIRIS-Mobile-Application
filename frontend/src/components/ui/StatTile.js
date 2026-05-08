import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../config/theme";

export default function StatTile({ label, value, hint, tone = "default" }) {
  const isAccent = tone === "accent";

  return (
    <View style={[styles.tile, isAccent && styles.tileAccent]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm
  },
  tileAccent: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.glow
  },
  label: {
    color: theme.colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontFamily: theme.typography.medium
  },
  value: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.title
  },
  hint: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: theme.spacing.xs,
    fontFamily: theme.typography.body
  }
});
