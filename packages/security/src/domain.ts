const DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d{1,5})?$/;

export function normalizeDomain(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .split(/[/?#]/)[0]!
    .replace(/\/+$/, "");
}

export function resolveSecurityDomain(value?: string): string | undefined {
  const normalized = value === undefined ? "" : normalizeDomain(value);
  if (!normalized) return undefined;
  if (!DOMAIN_PATTERN.test(normalized)) {
    throw new Error(
      `Invalid security domain ${JSON.stringify(value)}: expected a bare host such as "example.com" (optionally with a port), not a URL or path.`,
    );
  }
  return normalized;
}
