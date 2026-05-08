import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import SectionCard from "../components/ui/SectionCard";
import StatTile from "../components/ui/StatTile";
import ScreenHeader from "../components/ui/ScreenHeader";
import { theme } from "../config/theme";
import { getTreatmentPlan } from "../features/pestControl/treatmentAdvisor";

export default function TreatmentPlanScreen() {
  const plan = getTreatmentPlan({ severity: "Medium" });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Stage 3"
        badge="Treatment"
        title="Treatment plan"
        subtitle="Pesticide dosage aligned to wet-zone conditions."
      />

      <SectionCard title="Recommended action" subtitle="Based on severity analysis">
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatTile label="Action" value={plan.action} tone="accent" />
          </View>
          <View style={styles.gridItem}>
            <StatTile label="Dosage" value={plan.dosage} />
          </View>
        </View>
        <StatTile label="Safety" value={plan.safetyNote} />
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
