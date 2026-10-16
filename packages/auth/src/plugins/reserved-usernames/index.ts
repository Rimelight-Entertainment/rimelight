const HOMOGLYPH_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "9": "g",
  "@": "a",
  "!": "i",
  $: "s",
  "|": "i",
};

/**
 * Normalizes a username string by mapping common leetspeak / homoglyphs and
 * stripping non-alphanumeric characters.
 */
export const normalizeUsername = (input: string): string => {
  return input
    .toLowerCase()
    .split("")
    .map((char) => HOMOGLYPH_MAP[char] || char)
    .join("")
    .replace(/[^a-z0-9]/g, "");
};

/**
 * Minimal baseline reserved keyword list for routing and critical system roles.
 * Applications should pass their own domain-specific blacklists to createRestrictedUsernameSet.
 */
export const DEFAULT_RESTRICTED_KEYWORDS = [
  "admin",
  "root",
  "staff",
  "moderator",
  "bot",
  "system",
  "api",
  "auth",
  "settings",
  "static",
  "login",
  "billing",
  "checkout",
  "compliance",
  "privacy",
] as const;

/**
 * Creates a fast lookup Set of normalized restricted usernames.
 */
export const createRestrictedUsernameSet = (
  customBlacklist: (string | readonly string[])[] = [],
): Set<string> => {
  const flattened: string[] = [...DEFAULT_RESTRICTED_KEYWORDS, ...customBlacklist.flat()];
  return new Set(flattened.map((name) => normalizeUsername(name)));
};

export const RESTRICTED_SET = createRestrictedUsernameSet();
