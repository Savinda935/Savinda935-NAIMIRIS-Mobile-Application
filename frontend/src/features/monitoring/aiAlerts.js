const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const pickLatest = (values) => {
  if (!values || values.length === 0) {
    return null;
  }

  return values[values.length - 1];
};

const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

const stdDev = (values) => {
  if (!values.length) {
    return 0;
  }

  const avg = mean(values);
  const variance = mean(values.map((value) => (value - avg) ** 2));
  return Math.sqrt(variance);
};

const detectSpike = (values, limit = 2.2) => {
  const numeric = values.filter((value) => typeof value === "number");
  if (numeric.length < 4) {
    return false;
  }

  const latest = numeric[numeric.length - 1];
  const baseline = numeric.slice(0, -1);
  const deviation = stdDev(baseline);
  if (!deviation) {
    return false;
  }

  return Math.abs(latest - mean(baseline)) > deviation * limit;
};

const formatScore = (value) => Math.round(clamp(value, 0, 100));

export function getAiAlertSummary({ readings, statuses, history, stage }) {
  const statusValues = Object.values(statuses || {}).filter((status) => status !== "unknown");
  const highCount = statusValues.filter((status) => status === "high").length;
  const lowCount = statusValues.filter((status) => status === "low").length;

  const baseRisk = 20;
  const riskScore = formatScore(baseRisk + highCount * 18 + lowCount * 12);

  const anomalies = [];
  if (detectSpike(history.map((entry) => entry.airTemp))) {
    anomalies.push("Air temperature spike");
  }
  if (detectSpike(history.map((entry) => entry.airHumidity))) {
    anomalies.push("Humidity spike");
  }
  if (detectSpike(history.map((entry) => entry.soilAnalog))) {
    anomalies.push("Soil analog anomaly");
  }

  const anomalyDetected = anomalies.length > 0;
  const soil = pickLatest(history.map((entry) => entry.soilAnalog));
  const humidity = readings?.airHumidity;

  let recommendation = "Maintain current schedule and keep monitoring.";
  if (riskScore >= 65) {
    recommendation = "Increase inspection frequency and adjust irrigation schedule.";
  } else if (riskScore >= 45) {
    recommendation = "Monitor closely and verify irrigation/EC balance.";
  }

  if (typeof humidity === "number" && humidity > 80) {
    recommendation = "Improve airflow and reduce leaf wetness to lower disease risk.";
  }

  if (typeof soil === "number" && stage?.dry_threshold && soil < stage.dry_threshold) {
    recommendation = "Soil is below dry threshold. Irrigation check recommended.";
  }

  const summary = anomalyDetected
    ? `Anomaly detected: ${anomalies.join(", ")}.`
    : "No anomalies detected in recent readings.";

  return {
    riskScore,
    anomalyDetected,
    summary,
    anomalies,
    recommendation
  };
}
