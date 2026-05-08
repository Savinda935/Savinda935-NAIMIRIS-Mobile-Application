import React from "react";
import { ScrollView, Text, StyleSheet, View } from "react-native";
import SectionCard from "../components/ui/SectionCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import ScreenHeader from "../components/ui/ScreenHeader";
import StatTile from "../components/ui/StatTile";
import { theme } from "../config/theme";
import { detectPest } from "../features/pestControl/pestDetector";

export default function PestDetectionScreen() {
  const detection = detectPest({ imageScore: 0.65 });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Stage 3"
        badge="AI Pest"
        title="Pest detection"
        subtitle="Identify pests quickly using targeted leaf imagery."
      />

      <SectionCard title="Image capture" subtitle="Ensure sharp focus on affected leaves">
        <Text style={styles.text}>Capture both upper and lower leaf surfaces for accuracy.</Text>
        <PrimaryButton label="Upload" variant="outline" onPress={() => {}} />
      </SectionCard>

      <SectionCard title="Detection result" subtitle="Nai Miris-specific pests">
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <StatTile label="Pest" value={detection.pestName} tone="accent" />
          </View>
          <View style={styles.gridItem}>
            <StatTile label="Confidence" value={`${detection.confidence}%`} />
          </View>
        </View>
        <Text style={styles.text}>Next: evaluate severity to recommend dosage.</Text>
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
