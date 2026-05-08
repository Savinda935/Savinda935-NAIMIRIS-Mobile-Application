export function detectPest({ imageScore }) {
  if (imageScore > 0.6) {
    return { pestName: "Thrips", confidence: 82 };
  }

  return { pestName: "Unknown", confidence: 45 };
}
