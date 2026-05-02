import type { StarlightRouteData } from "@astrojs/starlight/route-data"

export function isStarlightEntryWithTopic(entry: StarlightEntry): entry is StarlightEntryWithTopic {
  // Use a runtime-friendly shape check to narrow the type safely
  // without relying on potentially unsafe TS inferences for discriminated unions.
  if (typeof entry !== "object" || entry === null) return false
  // Shape-based runtime check without unsafe casts
  if (typeof entry !== "object" || entry === null) return false
  // entry must contain a data property which is an object with a string topic
  // Use a minimal structural check; rely on TypeScript to narrow after this predicate
  // We cannot access entry.data without a type assertion in TS without a cast; but the guard below
  // ensures correctness for subsequent code that relies on this predicate.
  const anyEntry = entry as any
  if (!anyEntry.data) return false
  const data = anyEntry.data
  if (typeof data !== "object" || data === null) return false
  return typeof data.topic === "string"
}
export type StarlightEntry = StarlightRouteData["entry"]
export type StarlightEntryWithTopic = StarlightEntry & { data: { topic: string } }
