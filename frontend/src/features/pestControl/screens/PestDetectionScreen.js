import React, { useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";

import PrimaryButton from "../../../components/ui/PrimaryButton";
import ScreenHeader from "../../../components/ui/ScreenHeader";
import SectionCard from "../../../components/ui/SectionCard";
import StatTile from "../../../components/ui/StatTile";
import { API_BASE_URL } from "../../../config/api";
import { theme } from "../../../config/theme";
import { predictDiseaseFromImage } from "../api/pestApi";


const formatConfidence = (value) => {
  if (typeof value !== "number") {
    return "--";
  }

  return `${Math.round(value * 100)}%`;
};

const extractErrorMessage = (error) => {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }

  if (error?.message) {
    return error.message;
  }

  return "Unable to connect to the pest-control backend.";
};

export default function PestDetectionScreen() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const pickImage = async () => {
    setErrorMessage("");

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorMessage("Photo library permission is required to upload a leaf image.");
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
    setPrediction(null);
  };

  const runPrediction = async () => {
    if (!selectedImage) {
      setErrorMessage("Please select a leaf image first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await predictDiseaseFromImage(selectedImage);
      setPrediction(data);
    } catch (error) {
      setPrediction(null);
      setErrorMessage(extractErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const detections = Array.isArray(prediction?.predictions) ? prediction.predictions : [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Stage 3"
        badge="AI Pest"
        title="Pest detection"
        subtitle="Upload a Nai Miris leaf image for backend YOLO disease prediction."
      />

      <SectionCard title="Leaf image" subtitle={`Backend: ${API_BASE_URL}`}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.emptyPreview}>
            <Text style={styles.emptyPreviewText}>No image selected</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <View style={styles.buttonCell}>
            <PrimaryButton label="Pick image" variant="outline" onPress={pickImage} disabled={isLoading} />
          </View>
          <View style={styles.buttonCell}>
            <PrimaryButton label={isLoading ? "Analyzing..." : "Analyze"} onPress={runPrediction} disabled={isLoading} />
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={styles.loadingText}>Sending image to FastAPI backend...</Text>
          </View>
        ) : null}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      </SectionCard>

      {prediction ? (
        <SectionCard title="Prediction result" subtitle={prediction.model ? `Model: ${prediction.model}` : ""}>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <StatTile label="Disease" value={prediction.disease_name || "Unknown"} tone="accent" />
            </View>
            <View style={styles.gridItem}>
              <StatTile label="Confidence" value={formatConfidence(prediction.confidence)} />
            </View>
          </View>

          {prediction.severity ? (
            <StatTile label="Severity" value={prediction.severity} />
          ) : null}

          {prediction.treatment_recommendation ? (
            <Text style={styles.text}>{prediction.treatment_recommendation}</Text>
          ) : null}

          {detections.length ? (
            <View style={styles.detectionList}>
              <Text style={styles.sectionLabel}>All detections</Text>
              {detections.map((item, index) => (
                <Text key={`${item.disease_name}-${index}`} style={styles.text}>
                  {item.disease_name}: {formatConfidence(item.confidence)}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={styles.text}>No bounding-box detections were returned.</Text>
          )}
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
    marginBottom: theme.spacing.md
  },
  gridItem: {
    flex: 1,
    marginRight: theme.spacing.sm
  },
  text: {
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.body
  },
  sectionLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
    fontFamily: theme.typography.medium
  },
  detectionList: {
    marginTop: theme.spacing.sm
  }
});
