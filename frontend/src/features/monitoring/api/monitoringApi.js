import axios from "axios";

import { API_BASE_URL } from "../../../config/api";


const MONITORING_PREFIX = "/api/monitoring";

export async function analyzeGerminationImage({ imageAsset, plantAgeDays }) {
  const formData = new FormData();
  const filename = imageAsset.fileName || `growth-${Date.now()}.jpg`;
  const mimeType = imageAsset.mimeType || "image/jpeg";

  formData.append("plant_age_days", String(plantAgeDays));
  formData.append("image", {
    uri: imageAsset.uri,
    name: filename,
    type: mimeType
  });

  const response = await axios.post(
    `${API_BASE_URL}${MONITORING_PREFIX}/analytics/germination/analyze`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data;
}

export async function fetchAiAlertSummary(payload) {
  const response = await axios.post(`${API_BASE_URL}${MONITORING_PREFIX}/ai/alerts`, payload);
  return response.data;
}
