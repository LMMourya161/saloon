// Simple LLM stub
// Returns an array of recommendation strings based on the category and tag.
export function getRecommendation(category, tag) {
  // In a real implementation, you would call an LLM API.
  // Here we return a placeholder recommendation.
  if (category && typeof category === "string") {
    return [
      `${category} recommended style`,
      `${category} suggested color`
    ];
  }
  return [];
}
