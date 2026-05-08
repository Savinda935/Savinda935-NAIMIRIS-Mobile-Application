import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, Text, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ui/ScreenHeader";
import SectionCard from "../components/ui/SectionCard";
import PrimaryButton from "../components/ui/PrimaryButton";
import { theme } from "../config/theme";

export default function MonitoringServicesScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true
      })
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Services"
        badge="Stage 2"
        title="Monitoring"
        subtitle="Track sensors and get weekly AI guidance."
      />

      <Animated.View style={[styles.animatedCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <SectionCard title="IoT dashboard" subtitle="Live soil and climate signals">
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, styles.iconBadgeBlue]}>
              <Ionicons name="pulse" size={18} color={theme.colors.text} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardKicker}>Live feed</Text>
              <Text style={styles.cardMeta}>Every 5 seconds</Text>
            </View>
            <View style={styles.cardTag}>
              <Text style={styles.cardTagText}>IOT</Text>
            </View>
          </View>
          <Text style={styles.text}>Monitor moisture, EC, temperature, and humidity.</Text>
          <View style={styles.chipRow}>
            <View style={styles.chip}><Text style={styles.chipText}>Moisture</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>EC</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Heat</Text></View>
          </View>
          <PrimaryButton label="Open" onPress={() => navigation.navigate("IoTDashboard")} />
        </SectionCard>
      </Animated.View>

      <Animated.View
        style={[
          styles.animatedCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <SectionCard title="Growth monitoring" subtitle="Stage-wise guidance">
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, styles.iconBadgeGreen]}>
              <Ionicons name="leaf" size={18} color={theme.colors.text} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardKicker}>AI growth</Text>
              <Text style={styles.cardMeta}>Weekly image check</Text>
            </View>
            <View style={styles.cardTag}>
              <Text style={styles.cardTagText}>AI</Text>
            </View>
          </View>
          <Text style={styles.text}>Upload weekly images to get targeted recommendations.</Text>
          <View style={styles.chipRow}>
            <View style={styles.chip}><Text style={styles.chipText}>Stages</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Guidance</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Reports</Text></View>
          </View>
          <PrimaryButton label="Open" onPress={() => navigation.navigate("GrowthMonitoring")} />
        </SectionCard>
      </Animated.View>

      <Animated.View
        style={[
          styles.animatedCard,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <SectionCard title="Data analysis" subtitle="Firebase summary and PDF report">
          <View style={styles.cardHeader}>
            <View style={[styles.iconBadge, styles.iconBadgeGold]}>
              <Ionicons name="analytics" size={18} color={theme.colors.text} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardKicker}>Analytics</Text>
              <Text style={styles.cardMeta}>Historical insights</Text>
            </View>
            <View style={styles.cardTag}>
              <Text style={styles.cardTagText}>PDF</Text>
            </View>
          </View>
          <Text style={styles.text}>Review averages, trends, and download the Firebase report.</Text>
          <View style={styles.chipRow}>
            <View style={styles.chip}><Text style={styles.chipText}>Summary</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Trends</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Report</Text></View>
          </View>
          <PrimaryButton label="Open" onPress={() => navigation.navigate("DataAnalysis")} />
        </SectionCard>
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  text: { color: theme.colors.text, marginBottom: theme.spacing.sm, fontFamily: theme.typography.body },
  animatedCard: {
    marginBottom: theme.spacing.lg
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm
  },
  cardHeaderText: {
    flex: 1
  },
  cardKicker: {
    color: theme.colors.muted,
    fontSize: 12,
    fontFamily: theme.typography.medium,
    textTransform: "uppercase",
    letterSpacing: 1.4
  },
  cardMeta: {
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.typography.body,
    marginTop: 2
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: theme.spacing.sm
  },
  iconBadgeBlue: {
    backgroundColor: theme.colors.primaryDark
  },
  iconBadgeGreen: {
    backgroundColor: theme.colors.primary
  },
  iconBadgeGold: {
    backgroundColor: theme.colors.accent
  },
  cardTag: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceAlt
  },
  cardTagText: {
    color: theme.colors.text,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    fontFamily: theme.typography.medium
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: theme.spacing.md
  },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceAlt,
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm
  },
  chipText: {
    color: theme.colors.muted,
    fontSize: 11,
    fontFamily: theme.typography.medium,
    textTransform: "uppercase",
    letterSpacing: 1.1
  }
});
