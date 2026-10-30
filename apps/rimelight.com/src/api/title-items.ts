import type { TitleSlug } from "./titles";

/** The largest amount of any one item a player can hold. Each item has its own cap; this is the shared default. */
export const ITEM_MAX_AMOUNT = 1_000_000_000;

/**
 * The cap of each item, per title, keyed by the item's internal id (a UUIDv4). The server is the source of
 * truth: it enforces these, and the item fetch returns them so the game shows and clamps to the same
 * numbers. The game's MaxAmount in UGTItemSettings is only the fallback for local development. The ids
 * must match the game's catalogue, since an unknown id is rejected.
 */
const ITEM_CAPS: Record<TitleSlug, Record<string, number>> = {
  "grand-tale": {
    "57103ae6-4ca0-427a-9878-3309a42b622b": ITEM_MAX_AMOUNT, // Lumber: Maple
    "960dd003-85e9-4264-b0b2-eb05759b42b8": ITEM_MAX_AMOUNT, // Lumber: Willow
    "bacf5116-555e-41af-a164-bbf7fd6f25ed": ITEM_MAX_AMOUNT, // Lumber: Oak
    "4e3500f7-8bde-4460-a1c0-a6406a8906fa": ITEM_MAX_AMOUNT, // Lumber: Pine
    "dc2225b5-8f47-469a-b140-97ba18b1f547": ITEM_MAX_AMOUNT, // Lumber: Birch
    "1118b2bb-d32e-4253-83ea-4adc91a21d1d": ITEM_MAX_AMOUNT, // Ore: Copper
    "dd1b696f-66e8-41b2-81ff-00438170ee98": ITEM_MAX_AMOUNT, // Ore: Tin
    "9b15a242-d1f6-4810-b79f-49073fb04010": ITEM_MAX_AMOUNT, // Ore: Iron
    "a3400f5d-8679-4216-a66d-a9cc7d503392": ITEM_MAX_AMOUNT, // Ore: Silver
    "9f0e585a-549c-439e-85d5-f1c9568e9287": ITEM_MAX_AMOUNT, // Ore: Coal
  },
};

export function itemCapsFor(title: TitleSlug): Record<string, number> {
  return ITEM_CAPS[title];
}
