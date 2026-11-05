/**
 * Reads a named field from an untyped row item. Returns `undefined` for
 * non-object items or missing keys.
 */
export function readField(item: unknown, key: string): unknown {
  if (typeof item !== "object" || item === null) return undefined;
  return (item as Record<string, unknown>)[key];
}
