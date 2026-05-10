export async function analyzeImage({ imageUri, type }) {
  return {
    type,
    confidence: 0.8,
    result: "Mock AI response"
  };
}

import { fetchAiAlertSummary as fetchMonitoringAiAlertSummary } from "../features/monitoring/api/monitoringApi";


export async function fetchAiAlertSummary({ payload }) {
  return fetchMonitoringAiAlertSummary(payload);
}
