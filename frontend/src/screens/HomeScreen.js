import React from "react";
import { ImageBackground, ScrollView, Text, StyleSheet, View } from "react-native";
import PrimaryButton from "../components/ui/PrimaryButton";
import ScreenHeader from "../components/ui/ScreenHeader";
import SectionCard from "../components/ui/SectionCard";
import StatTile from "../components/ui/StatTile";
import { theme } from "../config/theme";

const heroImage = require("../images/image.png");

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ImageBackground source={heroImage} style={styles.hero} imageStyle={styles.heroImage} resizeMode="cover">
        <View style={styles.heroOverlay}>
          <ScreenHeader
            eyebrow="NAIMIRIS"
            badge="Wet Zone"
            title="Profit-driven smart farming command center"
            subtitle="Plan with confidence, monitor every week, and control pests with precision."
          />
          <View style={styles.heroStats}>
            <View style={styles.statHalf}>
              <StatTile label="Focus" value="ROI-first" hint="Budget aware" tone="accent" />
            </View>
            <View style={styles.statHalf}>
              <StatTile label="Coverage" value="3 stages" hint="Plan. Monitor. Control." />
            </View>
          </View>
          <PrimaryButton label="Start pre-analysis" onPress={() => navigation.navigate("LandAnalysis")} />
        </View>
      </ImageBackground>

      <SectionCard
        title="Pre-analysis decision support"
        subtitle="Land fit, budget planning, and ROI risk before you plant."
      >
        <PrimaryButton label="Open services" onPress={() => navigation.navigate("PreAnalysisServices")} />
      </SectionCard>

      <SectionCard
        title="A-to-Z farming guidance"
        subtitle="IoT monitoring and weekly AI-based growth coaching."
      >
        <PrimaryButton label="Open services" onPress={() => navigation.navigate("MonitoringServices")} />
      </SectionCard>

      <SectionCard
        title="Pest monitoring and control"
        subtitle="Detect pests, score severity, and get precise treatment guidance."
      >
        <PrimaryButton label="Open services" onPress={() => navigation.navigate("PestServices")} />
      </SectionCard>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background
  },
  content: {
    padding: theme.spacing.lg
  },
  hero: {
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    marginBottom: theme.spacing.xl,
    overflow: "hidden",
    minHeight: 430
  },
  heroImage: {
    borderRadius: theme.radius.xl
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    padding: theme.spacing.lg,
    backgroundColor: "rgba(14, 23, 19, 0.58)"
  },
  heroStats: {
    flexDirection: "row",
    marginBottom: theme.spacing.lg
  },
  statHalf: {
    flex: 1,
    marginRight: theme.spacing.sm
  },
  buttonStack: {
    marginTop: theme.spacing.sm
  },
  buttonSpacer: {
    marginBottom: theme.spacing.sm
  }
});
