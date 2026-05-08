import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { theme } from "../../config/theme";

export default function PrimaryButton({ label, onPress, disabled, variant = "primary" }) {
  const isOutline = variant === "outline";

  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, isOutline && styles.outline, disabled && styles.disabled]}
      disabled={disabled}
    >
      <Text style={[styles.label, isOutline && styles.labelOutline]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: theme.elevation.mid
  },
  label: {
    color: "#0E1713",
    fontWeight: "700",
    fontSize: 14,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    fontFamily: theme.typography.medium
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: theme.colors.borderStrong
  },
  labelOutline: {
    color: theme.colors.text
  },
  disabled: {
    backgroundColor: theme.colors.muted,
    borderColor: theme.colors.muted
  }
});
