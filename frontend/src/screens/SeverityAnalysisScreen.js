import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import SectionCard from "../components/ui/SectionCard";
import StatTile from "../components/ui/StatTile";
import ScreenHeader from "../components/ui/ScreenHeader";
import { theme } from "../config/theme";
import { scoreSeverity } from "../features/pestControl/severityScoring";
import { appendLocalArray } from "../services/storage";

export default function SeverityAnalysisScreen() {
  const affectedLeavesPercent = 18;
  const pestCount = 12;
  const severityScore = affectedLeavesPercent + pestCount;
  const severity = scoreSeverity({
    affectedLeavesPercent,
    pestCount
  });

  useEffect(() => {
    appendLocalArray(
      "pestHistory",
      {
        score: severityScore,
        level: severity.level,
        timestamp: Date.now()
      },
      90
    ).catch((error) => {
      console.warn("Failed to save pest severity history", error);
    });
  }, [severityScore, severity.level]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Stage 3"
        badge="Risk Level"
        title="Severity analysis"
        subtitle="Classify infestation and decide the treatment intensity."
      />

      <SectionCard title="Severity result" subtitle="Based on affected leaves and pest count">
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatTile label="Severity" value={severity.level} tone="accent" />
          </View>
          <View style={styles.gridItem}>
            <StatTile label="Risk" value={severity.riskNote} />
          </View>
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  grid: {
    flexDirection: "row",
    marginBottom: theme.spacing.md
  },
  gridItem: {
    flex: 1,
    marginRight: theme.spacing.sm
  }
});
