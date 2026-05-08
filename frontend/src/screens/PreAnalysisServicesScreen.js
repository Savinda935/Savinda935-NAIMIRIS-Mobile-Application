import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import ScreenHeader from "../components/ui/ScreenHeader";
import SectionCard from "../components/ui/SectionCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import { theme } from "../config/theme";

export default function PreAnalysisServicesScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Services"
        badge="Stage 1"
        title="Pre-analysis"
        subtitle="Validate land, budget, and profit before cultivation."
      />

      <SectionCard title="Land analysis" subtitle="Photo-based suitability scoring">
        <Text style={styles.text}>Check soil texture, slope, and wet-zone readiness.</Text>
        <PrimaryButton label="Open" onPress={() => navigation.navigate("LandAnalysis")} />
      </SectionCard>

      <SectionCard title="Budget planning" subtitle="Budget-aware method selection">
        <Text style={styles.text}>Match inputs to available capital and resources.</Text>
        <PrimaryButton label="Open" onPress={() => navigation.navigate("BudgetPlanning")} />
      </SectionCard>

      <SectionCard title="Profit prediction" subtitle="ROI and risk snapshot">
        <Text style={styles.text}>Estimate yield, revenue, and profit margin.</Text>
        <PrimaryButton label="Open" onPress={() => navigation.navigate("ProfitPrediction")} />
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  text: { color: theme.colors.text, marginBottom: theme.spacing.sm, fontFamily: theme.typography.body }
});
