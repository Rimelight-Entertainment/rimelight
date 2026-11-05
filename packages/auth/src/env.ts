/** Reads a deployment setting from `process.env`, falling back to Vite's `import.meta.env`. */
export function getEnv(key: string, fallback = ""): string {
  if (typeof process !== "undefined" && process.env?.[key]) return process.env[key]!;
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  return fallback;
}
