const DEFAULT_MAX = 100;

/**
 * Resolves the effective range and value. A non-finite or non-positive `max` falls back to 100,
 * a missing or NaN `value` reads as 0, and `value` is clamped into `[0, max]`.
 */
export function resolveProgress(value: number | undefined, max: number | undefined) {
  const total = max !== undefined && Number.isFinite(max) && max > 0 ? max : DEFAULT_MAX;
  const current =
    value === undefined || Number.isNaN(value) ? 0 : Math.min(total, Math.max(0, value));
  return { value: current, max: total, percent: (current / total) * 100 };
}
