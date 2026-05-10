import React, { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import PrimaryButton from "../../../components/ui/PrimaryButton";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SectionCard from "../../../components/ui/SectionCard";
import StatTile from "../../../components/ui/StatTile";
import { API_BASE_URL } from "../../../config/api";
import { theme } from "../../../config/theme";
import { analyzeLandImage } from "../api/preAnalysisApi";


const formatPercent = (value) => {
  if (typeof value !== "number") {
    return "--";
  }

  return `${value.toFixed(2)}%`;
};

const extractErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail) && detail.length) {
    return detail.map((item) => item.msg).join(", ");
  }

  return error?.message || "Unable to connect to the pre-analysis backend.";
};

export default function LandAnalysisScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [landSizePerch, setLandSizePerch] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const pickImage = async () => {
    setErrorMessage("");

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage("Photo library permission is required to upload a land image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    setSelectedImage(result.assets[0]);
    setAnalysis(null);
  };

  const runAnalysis = async () => {
    const landSize = Number(landSizePerch);
    if (!selectedImage) {
      setErrorMessage("Please select a satellite or top-view land image first.");
      return;
    }

    if (!Number.isFinite(landSize) || landSize <= 0) {
      setErrorMessage("Enter total land size in perch.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await analyzeLandImage({ imageAsset: selectedImage, landSizePerch: landSize });
      setAnalysis(data);
    } catch (error) {
      setAnalysis(null);
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const coverPercentages = analysis?.land_cover_percentages || {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Stage 1"
        badge="Pre-analysis"
        title="Land suitability"
        subtitle="Upload a satellite or top-view land image and estimate Nai Miris plant count."
      />

      <SectionCard title="Land image" subtitle={`Backend: ${API_BASE_URL}`}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.emptyPreview}>
            <Text style={styles.emptyPreviewText}>No land image selected</Text>
          </View>
        )}

        <Text style={styles.inputLabel}>Total land size (perch)</Text>
        <TextInput
          value={landSizePerch}
          onChangeText={setLandSizePerch}
          keyboardType="numeric"
          placeholder="Example: 20"
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
        />

        <View style={styles.buttonRow}>
          <View style={styles.buttonCell}>
            <PrimaryButton label="Pick image" variant="outline" onPress={pickImage} disabled={isLoading} />
          </View>
          <View style={styles.buttonCell}>
            <PrimaryButton label={isLoading ? "Analyzing..." : "Analyze"} onPress={runAnalysis} disabled={isLoading} />
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.loadingText}>Sending land image to FastAPI backend...</Text>
          </View>
        ) : null}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </SectionCard>

      {analysis ? (
        <SectionCard title="PP1 result" subtitle={analysis.message}>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <StatTile label="Suitability" value={analysis.suitability} tone="accent" />
            </View>
            <View style={styles.gridItem}>
              <StatTile label="Plants" value={`${analysis.estimated_plant_count}`} hint="Estimated Nai Miris count" />
            </View>
          </View>

          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <StatTile label="Usable area" value={formatPercent(analysis.usable_farming_percentage)} />
            </View>
            <View style={styles.gridItem}>
              <StatTile label="Usable land" value={`${analysis.usable_land_perch} perch`} hint={`${analysis.usable_land_sqft} sq ft`} />
            </View>
          </View>

          <View style={styles.coverList}>
            <Text style={styles.sectionLabel}>Land cover percentages</Text>
            {Object.entries(coverPercentages).map(([label, value]) => (
              <Text key={label} style={styles.text}>
                {label.replace(/_/g, " ")}: {formatPercent(value)}
              </Text>
            ))}
          </View>
        </SectionCard>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: theme.colors.background },
  content: { padding: theme.spacing.lg },
  previewImage: {
    width: "100%",
    height: 220,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md
  },
  emptyPreview: {
    height: 180,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.md
  },
  emptyPreviewText: {
    color: theme.colors.muted,
    fontFamily: theme.typography.body
  },
  inputLabel: {
    color: theme.colors.muted,
    fontFamily: theme.typography.medium,
    fontSize: 12,
    marginBottom: theme.spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    fontFamily: theme.typography.body
  },
  buttonRow: {
    flexDirection: "row",
    marginHorizontal: -theme.spacing.xs
  },
  buttonCell: {
    flex: 1,
    paddingHorizontal: theme.spacing.xs
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.md
  },
  loadingText: {
    color: theme.colors.muted,
    marginLeft: theme.spacing.sm,
    fontFamily: theme.typography.body
  },
  errorText: {
    color: theme.colors.danger,
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.body
  },
  grid: {
    flexDirection: "row",
    marginBottom: theme.spacing.sm
  },
  gridItem: {
    flex: 1,
    marginRight: theme.spacing.sm
  },
  coverList: {
    marginTop: theme.spacing.sm
  },
  sectionLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.medium
  },
  text: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.body,
    textTransform: "capitalize"
  }
});
