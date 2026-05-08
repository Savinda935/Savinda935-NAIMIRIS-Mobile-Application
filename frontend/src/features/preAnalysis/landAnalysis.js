export function evaluateLandSuitability({ soilTexture, slope }) {
  if (soilTexture === "loam" && slope <= 8) {
    return { status: "Suitable", notes: "Good soil texture and slope for wet-zone Nai Miris." };
  }

  return { status: "Review Needed", notes: "Consider soil improvement or terrace planning." };
}
