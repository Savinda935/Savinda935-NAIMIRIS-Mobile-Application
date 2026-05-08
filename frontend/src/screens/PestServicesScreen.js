import React from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import ScreenHeader from "../components/ui/ScreenHeader";
import SectionCard from "../components/ui/SectionCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import { theme } from "../config/theme";

export default function PestServicesScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Services"
        badge="Stage 3"
        title="Pest control"
        subtitle="Detect pests, score severity, and treat precisely."
      />

      <SectionCard title="Pest detection" subtitle="Image-based identification">
        <Text style={styles.text}>Identify Nai Miris pests from leaf photos.</Text>
        <PrimaryButton label="Open" onPress={() => navigation.navigate("PestDetection")} />
      </SectionCard>

      <SectionCard title="Severity analysis" subtitle="Low, medium, or high">
        <Text style={styles.text}>Classify infestation risk and urgency.</Text>
        <PrimaryButton label="Open" onPress={() => navigation.navigate("SeverityAnalysis")} />
      </SectionCard>

      <SectionCard title="Treatment plan" subtitle="Localized dosage guidance">
        <Text style={styles.text}>Get safe, wet-zone aligned pesticide advice.</Text>
        <PrimaryButton label="Open" onPress={() => navigation.navigate("TreatmentPlan")} />
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  text: { color: theme.colors.text, marginBottom: theme.spacing.sm, fontFamily: theme.typography.body }
});
