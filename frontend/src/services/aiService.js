export async function analyzeImage({ imageUri, type }) {
  return {
    type,
    confidence: 0.8,
    result: "Mock AI response"
  };
}

export async function fetchAiAlertSummary({ baseUrl, payload }) {
  const response = await fetch(`${baseUrl}/ai/alerts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API failed: ${response.status} ${errorText}`);
  }

  return response.json();
}
