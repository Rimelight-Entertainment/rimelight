import { z } from "zod";
import type { TitleSettingsDocument } from "#db/schema/title-settings";

export type { TitleSettingsDocument, TitleSettingValue } from "#db/schema/title-settings";

export const MAX_BODY_BYTES = 16 * 1024;
export const MAX_STORED_BYTES = 64 * 1024;

const NAME = /^[a-z][a-zA-Z0-9]{0,63}$/;

// Structure only: category -> key -> scalar. The server does not know what any setting means.
// Zod 4 rejects non-finite numbers in z.number().
const scalar = z.union([z.string().max(256), z.number(), z.boolean(), z.null()]);
export const titleSettingsPatchSchema = z.record(
  z.string().regex(NAME),
  z.record(z.string().regex(NAME), scalar),
);

/**
 * Per-key merge. Sent keys overwrite stored ones, `null` removes the key, and categories left empty
 * are dropped. Keys the patch does not mention are kept as they are.
 */
export function mergeTitleSettings(
  current: TitleSettingsDocument,
  patch: z.infer<typeof titleSettingsPatchSchema>,
): TitleSettingsDocument {
  const next: TitleSettingsDocument = structuredClone(current);
  for (const [category, keys] of Object.entries(patch)) {
    const target = next[category] ?? {};
    for (const [key, value] of Object.entries(keys)) {
      if (value === null) delete target[key];
      else target[key] = value;
    }
    if (Object.keys(target).length > 0) next[category] = target;
    else delete next[category];
  }
  return next;
}

export function byteLength(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}
