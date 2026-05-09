import axios from "axios";

import { API_BASE_URL } from "../../../config/api";


const PEST_CONTROL_PREFIX = "/api/pest-control";

export async function predictDiseaseFromImage(imageAsset) {
  const formData = new FormData();
  const filename = imageAsset.fileName || `leaf-${Date.now()}.jpg`;
  const mimeType = imageAsset.mimeType || "image/jpeg";

  formData.append("image", {
    uri: imageAsset.uri,
    name: filename,
    type: mimeType
  });

  const response = await axios.post(
    `${API_BASE_URL}${PEST_CONTROL_PREFIX}/predict-disease`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data;
}

export async function checkPestControlHealth() {
  const response = await axios.get(`${API_BASE_URL}${PEST_CONTROL_PREFIX}/health`);
  return response.data;
}
