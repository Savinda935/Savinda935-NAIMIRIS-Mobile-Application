import React from "react";
import { View, Text, StyleSheet, ImageBackground, Pressable } from "react-native";
import PrimaryButton from "../components/ui/PrimaryButton";
import { theme } from "../config/theme";

const welcomeImage = require("../images/welcome.png");

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ImageBackground source={welcomeImage} style={styles.image} resizeMode="cover">
        <View style={styles.overlay}>
          <View style={styles.topSpacer} />
          <View style={styles.content}>
            <Text style={styles.eyebrow}>NAIMIRIS</Text>
            <Text style={styles.title}>Smart farming. Real profit.</Text>
            <Text style={styles.subtitle}>
              Turn wet-zone pepper farming into a planned, data-driven business.
            </Text>
          </View>
          <View style={styles.actions}>
            <PrimaryButton label="Get Started" onPress={() => navigation.navigate("Onboarding")} />
            <Pressable onPress={() => navigation.replace("Tabs")}>
              <Text style={styles.skip}>Skip for now</Text>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  image: {
    flex: 1
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(5, 10, 8, 0.55)",
    padding: theme.spacing.xl,
    justifyContent: "space-between"
  },
  topSpacer: {
    height: theme.spacing.xxl
  },
  content: {
    maxWidth: 300
  },
  eyebrow: {
    color: theme.colors.accent,
    textTransform: "uppercase",
    letterSpacing: 3,
    fontSize: 12,
    fontFamily: theme.typography.medium
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    marginTop: theme.spacing.sm,
    fontFamily: theme.typography.title
  },
  subtitle: {
    color: theme.colors.muted,
    marginTop: theme.spacing.sm,
    fontSize: 14,
    fontFamily: theme.typography.body
  },
  actions: {
    marginBottom: theme.spacing.lg
  },
  skip: {
    color: theme.colors.muted,
    textAlign: "center",
    marginTop: theme.spacing.sm,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontFamily: theme.typography.medium
  }
});
