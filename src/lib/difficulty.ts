export type DifficultyLabel = "moderate" | "challenging" | "strenuous";

function normalizeDifficultyLevel(score: number | null | undefined) {
  if (typeof score !== "number" || Number.isNaN(score)) return 1;

  // Backward compatibility: existing data may still use 3/4/5.
  if (score >= 5) return 3;
  if (score >= 4) return 2;
  if (score >= 3) return 1;

  return Math.max(1, Math.min(3, Math.round(score)));
}

export const DIFFICULTY_OPTIONS: Array<{
  label: string;
  value: DifficultyLabel;
  score: number;
}> = [
  { label: "Moderate", value: "moderate", score: 3 },
  { label: "Challenging", value: "challenging", score: 4 },
  { label: "Strenuous", value: "strenuous", score: 5 },
];

export function difficultyScoreToLabel(score: number | null | undefined) {
  const level = normalizeDifficultyLevel(score);
  if (level >= 3) return "Strenuous";
  if (level >= 2) return "Challenging";
  return "Moderate";
}

export function difficultyScoreToValue(
  score: number | null | undefined,
): DifficultyLabel {
  const level = normalizeDifficultyLevel(score);
  if (level >= 3) return "strenuous";
  if (level >= 2) return "challenging";
  return "moderate";
}

export function difficultyScoreToLevel(score: number | null | undefined) {
  return normalizeDifficultyLevel(score);
}

export function difficultyValueToScore(value: string | null | undefined) {
  const normalized = String(value || "")
    .toLowerCase()
    .trim();

  if (normalized === "strenuous") return 5;
  if (normalized === "challenging") return 4;
  if (normalized === "moderate") return 3;

  const numeric = Number(normalized);
  if (Number.isFinite(numeric)) {
    return Math.max(3, Math.min(5, numeric));
  }

  return 3;
}
