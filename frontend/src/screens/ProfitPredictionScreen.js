import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import SectionCard from "../components/ui/SectionCard";
import StatTile from "../components/ui/StatTile";
import ScreenHeader from "../components/ui/ScreenHeader";
import { theme } from "../config/theme";
import { predictProfit } from "../features/preAnalysis/profitPredictor";

export default function ProfitPredictionScreen() {
  const prediction = predictProfit({
    budgetLkr: 300000,
    landSizeAcres: 1,
    yieldKg: 850,
    pricePerKg: 650
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Stage 1"
        badge="ROI Dashboard"
        title="Profit prediction"
        subtitle="Estimate cost, yield, revenue, and ROI before cultivation."
      />

      <SectionCard title="Financial snapshot" subtitle="Risk-aware outputs">
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatTile label="Total Cost" value={`LKR ${prediction.totalCost}`} />
          </View>
          <View style={styles.gridItem}>
            <StatTile label="Revenue" value={`LKR ${prediction.revenue}`} tone="accent" />
          </View>
        </View>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatTile label="Profit" value={`LKR ${prediction.profit}`} />
          </View>
          <View style={styles.gridItem}>
            <StatTile label="ROI" value={`${prediction.roiPercent}%`} hint="Risk adjusted" />
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
    marginBottom: theme.spacing.sm
  },
  gridItem: {
    flex: 1,
    marginRight: theme.spacing.sm
  }
});
