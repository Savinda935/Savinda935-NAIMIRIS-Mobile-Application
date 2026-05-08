import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import SectionCard from "../components/ui/SectionCard";
import StatTile from "../components/ui/StatTile";
import ScreenHeader from "../components/ui/ScreenHeader";
import PrimaryButton from "../components/ui/PrimaryButton";
import { theme } from "../config/theme";
import { buildBudgetPlan } from "../features/preAnalysis/budgetPlanner";

export default function BudgetPlanningScreen() {
  const plan = buildBudgetPlan({
    budgetLkr: 300000,
    landSizeAcres: 1,
    workers: 3,
    tools: ["sprayer", "drip"]
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Stage 1"
        badge="Budget aware"
        title="Budget planning"
        subtitle="Match cultivation methods to the farmer's investment capacity."
      />

      <SectionCard title="Inputs" subtitle="Current farm assumptions">
        <Text style={styles.text}>Budget: LKR 300,000</Text>
        <Text style={styles.text}>Land Size: 1 acre</Text>
        <Text style={styles.text}>Resources: 3 workers, sprayer, drip</Text>
        <PrimaryButton label="Adjust inputs" variant="outline" onPress={() => {}} />
      </SectionCard>

      <SectionCard title="Optimized plan" subtitle="Best-fit method for the budget">
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatTile label="Method" value={plan.method} tone="accent" />
          </View>
          <View style={styles.gridItem}>
            <StatTile label="Cost" value={`LKR ${plan.estimatedCost}`} />
          </View>
        </View>
        <StatTile label="Compatibility" value={plan.fitsBudget ? "Fits Budget" : "Over Budget"} />
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
