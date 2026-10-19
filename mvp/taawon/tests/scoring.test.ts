import assert from "node:assert";
import test from "node:test";
import { calculateClinicalScore, normalizeStarRating } from "../src/lib/scoring";

test("calculateClinicalScore computes exact 70/30 weighted index", () => {
  // Case 1: 100% compliance (1.0) and 5/5 stars rating (1.0) -> 100%
  const perfect = calculateClinicalScore({ completionRatio: 1.0, starRating: 5 });
  assert.strictEqual(perfect.value, 100);
  assert.strictEqual(perfect.completion, 100);
  assert.strictEqual(perfect.rating, 100);

  // Case 2: 50% compliance (0.5) and 4/5 stars rating (0.8)
  // 0.7 * 80 + 0.3 * 50 = 56 + 15 = 71
  const mid = calculateClinicalScore({ completionRatio: 0.5, starRating: 4 });
  assert.strictEqual(mid.value, 71);
  assert.strictEqual(mid.completion, 50);
  assert.strictEqual(mid.rating, 80);

  // Case 3: No specialist rating yet (only home compliance) -> fallback to pure compliance
  const noRating = calculateClinicalScore({ completionRatio: 0.6, starRating: null });
  assert.strictEqual(noRating.value, 60);
  assert.strictEqual(noRating.rating, null);
  assert.strictEqual(noRating.completion, 60);
});

test("calculateClinicalScore enforces mathematical bounds (0 to 100)", () => {
  // Negative values clamped to 0
  const low = calculateClinicalScore({ completionRatio: -0.5, starRating: -2 });
  assert.strictEqual(low.value, 0);

  // Overflow values clamped to 100
  const high = calculateClinicalScore({ completionRatio: 1.8, starRating: 7 });
  assert.strictEqual(high.value, 100);
});

test("normalizeStarRating correctly maps 1-5 scale to 0.0-1.0", () => {
  assert.strictEqual(normalizeStarRating(5), 1.0);
  assert.strictEqual(normalizeStarRating(1), 0.2);
  assert.strictEqual(normalizeStarRating(0), 0.0);
  assert.strictEqual(normalizeStarRating(null), null);
});
