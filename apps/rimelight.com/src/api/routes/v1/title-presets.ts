import { z } from "zod";
import type { TitlePresetRow } from "#db/schema/title-presets";
import type { TitleSettingsDocument } from "#db/schema/title-settings";
import { MAX_BODY_BYTES, NAME } from "./title-settings";

export const PRESET_SLOTS = 5;

// Structure only: category -> key -> scalar (string, finite number or boolean). Null is not a preset value.
const presetScalar = z.union([z.string().max(256), z.number(), z.boolean()]);
export const presetSettingsSchema = z.record(
  z.string().regex(NAME),
  z.record(z.string().regex(NAME), presetScalar),
);

export const presetBodySchema = z.object({
  name: z.string().trim().min(1).max(32),
  settings: presetSettingsSchema,
});

export interface PresetView {
  slot: number;
  name: string;
  version: number;
  updatedAt: string;
  settings: TitleSettingsDocument;
}

/** The slot from the URL, or `null` when it is not an integer from 1 to 5. */
export function parsePresetSlot(raw: string): number | null {
  if (!/^[0-9]+$/.test(raw)) return null;
  const slot = Number(raw);
  return slot >= 1 && slot <= PRESET_SLOTS ? slot : null;
}

/** True when a preset request body is within the 16 KB cap, counted in UTF-8 bytes. Matches GTSettingsDocument::MaxBodyBytes. */
export function presetBodyFits(raw: string): boolean {
  return new TextEncoder().encode(raw).length <= MAX_BODY_BYTES;
}

export function presetView(row: TitlePresetRow): PresetView {
  return {
    slot: row.slot,
    name: row.name,
    version: row.version,
    updatedAt: row.updatedAt.toISOString(),
    settings: row.settings,
  };
}

/** Exactly five entries, index 0 = slot 1. An empty slot is `null`. */
export function presetList(rows: TitlePresetRow[]): (PresetView | null)[] {
  const list: (PresetView | null)[] = Array.from({ length: PRESET_SLOTS }, () => null);
  for (const row of rows) list[row.slot - 1] = presetView(row);
  return list;
}
