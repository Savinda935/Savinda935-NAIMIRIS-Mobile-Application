import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import SectionCard from "../components/ui/SectionCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import ScreenHeader from "../components/ui/ScreenHeader";
import StatTile from "../components/ui/StatTile";
import { theme } from "../config/theme";
import { analyzeGrowthStage } from "../features/monitoring/growthAnalyzer";

export default function GrowthMonitoringScreen() {
  const result = analyzeGrowthStage({
    week: 4,
    imageScore: 0.72
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Stage 2"
        badge="AI Growth"
        title="Growth monitoring"
        subtitle="Weekly AI checks with stage-based irrigation and fertilizer guidance."
      />

      <SectionCard title="Weekly image upload" subtitle="Capture plant canopy and stem health">
        <Text style={styles.text}>Use consistent lighting to improve AI accuracy.</Text>
        <PrimaryButton label="Upload" variant="outline" onPress={() => {}} />
      </SectionCard>

      <SectionCard title="Stage guidance" subtitle="Localized for Sri Lankan wet zone">
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatTile label="Current Stage" value={result.stage} tone="accent" />
          </View>
          <View style={styles.gridItem}>
            <StatTile label="Week" value="4" hint="Cycle target" />
          </View>
        </View>
        <Text style={styles.text}>Recommendation: {result.guidance}</Text>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  text: { color: theme.colors.text, marginBottom: theme.spacing.sm, fontFamily: theme.typography.body },
  grid: {
    flexDirection: "row",
    marginBottom: theme.spacing.md
  },
  gridItem: {
    flex: 1,
    marginRight: theme.spacing.sm
  }
});
