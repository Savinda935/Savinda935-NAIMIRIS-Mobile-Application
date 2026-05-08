import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import PrimaryButton from "../components/ui/PrimaryButton";
import ScreenHeader from "../components/ui/ScreenHeader";
import SectionCard from "../components/ui/SectionCard";
import StatTile from "../components/ui/StatTile";
import { theme } from "../config/theme";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroGlow} />
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
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    marginBottom: theme.spacing.xl,
    overflow: "hidden"
  },
  heroGlow: {
    position: "absolute",
    right: -60,
    top: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.glow,
    opacity: 0.7
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
