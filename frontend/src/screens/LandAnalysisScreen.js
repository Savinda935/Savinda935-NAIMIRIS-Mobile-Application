import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import SectionCard from "../components/ui/SectionCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import ScreenHeader from "../components/ui/ScreenHeader";
import StatTile from "../components/ui/StatTile";
import { theme } from "../config/theme";
import { evaluateLandSuitability } from "../features/preAnalysis/landAnalysis";

export default function LandAnalysisScreen() {
  const mockResult = evaluateLandSuitability({ soilTexture: "loam", slope: 5 });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Stage 1"
        badge="Pre-analysis"
        title="Land suitability"
        subtitle="Verify land readiness before you invest in cultivation."
      />

      <SectionCard
        title="Capture land photos"
        subtitle="Upload wide and close-up images for AI evaluation."
      >
        <Text style={styles.text}>Focus on soil texture, drainage, and sunlight exposure.</Text>
        <PrimaryButton label="Upload" variant="outline" onPress={() => {}} />
      </SectionCard>

      <SectionCard title="Suitability result" subtitle="Wet-zone scoring">
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatTile label="Status" value={mockResult.status} tone="accent" />
          </View>
          <View style={styles.gridItem}>
            <StatTile label="Slope" value="5%" hint="Terracing OK" />
          </View>
        </View>
        <Text style={styles.text}>Notes: {mockResult.notes}</Text>
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
