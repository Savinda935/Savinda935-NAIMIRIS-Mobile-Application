import axios from "axios";

import { API_BASE_URL } from "../../../config/api";


const PRE_ANALYSIS_PREFIX = "/api/preanalysis";

export async function analyzeLandImage({ imageAsset, landSizePerch }) {
  const formData = new FormData();
  const filename = imageAsset.fileName || `land-${Date.now()}.jpg`;
  const mimeType = imageAsset.mimeType || "image/jpeg";

  formData.append("land_size_perch", String(landSizePerch));
  formData.append("image", {
    uri: imageAsset.uri,
    name: filename,
    type: mimeType
  });

  const response = await axios.post(
    `${API_BASE_URL}${PRE_ANALYSIS_PREFIX}/land-image/analyze`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data;
}

export async function runPreAnalysisDecisionSupport(payload) {
  const response = await axios.post(`${API_BASE_URL}${PRE_ANALYSIS_PREFIX}/decision-support`, payload);
  return response.data;
}
