import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { theme } from "../../config/theme";

export default function SectionCard({ title, subtitle, children, tone = "default" }) {
  const isAccent = tone === "accent";

  return (
    <View style={[styles.card, isAccent && styles.cardAccent]}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg
  },
  cardAccent: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surfaceAlt
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
    letterSpacing: theme.typography.letterSpacing,
    fontFamily: theme.typography.title
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.body
  }
});
