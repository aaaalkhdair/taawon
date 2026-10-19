/**
 * Pure Clinical Scoring Engine for Taawon
 * Computes objective progress metrics based on 70% specialist clinical evaluation
 * and 30% home task compliance.
 */

export interface ScoreInput {
  completionRatio: number; // 0.0 to 1.0 (or greater, clamped)
  starRating: number | null; // 1 to 5 scale (or null if pending specialist review)
}

export interface ClinicalScoreResult {
  value: number; // 0 to 100 overall score
  rating: number | null; // 0 to 100 specialist rating score
  completion: number; // 0 to 100 compliance score
}

export function normalizeStarRating(stars: number | null): number | null {
  if (stars == null) return null;
  const clamped = Math.max(0, Math.min(5, stars));
  return clamped / 5;
}

export function calculateClinicalScore(input: ScoreInput): ClinicalScoreResult {
  // Clamp completion ratio between 0 and 1
  const cleanRatio = Math.max(0, Math.min(1, input.completionRatio));
  const completionPercent = Math.round(cleanRatio * 100);

  const normalizedRating = normalizeStarRating(input.starRating);

  if (normalizedRating == null) {
    return {
      value: completionPercent,
      rating: null,
      completion: completionPercent,
    };
  }

  const ratingPercent = Math.round(normalizedRating * 100);
  // Formula: 70% Specialist Rating + 30% Home Compliance
  const weightedValue = Math.round(0.7 * ratingPercent + 0.3 * completionPercent);
  const boundedValue = Math.max(0, Math.min(100, weightedValue));

  return {
    value: boundedValue,
    rating: ratingPercent,
    completion: completionPercent,
  };
}
