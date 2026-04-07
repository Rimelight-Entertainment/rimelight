function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Deep-merge two dictionaries. - `base` provides known structure (fallback) - `overrides` can
 * provide partial values - Both types are preserved and merged correctly
 */
function assertRecord(obj: unknown): asserts obj is Record<string, unknown> {
  if (!obj || typeof obj !== "object") throw new Error("Expected object")
}

function assertA<T>(obj: unknown): asserts obj is T {
  if (!obj) throw new Error("Expected result")
}

export function deepMerge<A extends object, B extends Partial<A>>(base: A, overrides: B): A {
  const result = { ...base }
  assertRecord(result)

  for (const key of Object.keys(overrides)) {
    const overrideValue = Reflect.get(overrides, key)
    const baseValue = Reflect.get(base, key)

    if (overrideValue === undefined) continue

    if (isObject(baseValue) && isObject(overrideValue)) {
      Reflect.set(result, key, deepMerge(baseValue as object, overrideValue as Partial<object>))
    } else {
      Reflect.set(result, key, overrideValue)
    }
  }

  assertA<A>(result)
  return result
}
