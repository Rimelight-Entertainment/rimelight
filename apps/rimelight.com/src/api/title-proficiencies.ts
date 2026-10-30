import type { TitleSlug } from "./titles";

/**
 * The proficiency experience curve, the same as the game's (GTProficiencyMath). Level 0 costs nothing; the
 * experience to reach level L is the RuneScape experience for level L + 1. Levels run from 0 to 100.
 */
export const PROFICIENCY_MAX_LEVEL = 100;

const RUNESCAPE_TABLE: number[] = (() => {
  const table: number[] = [];
  let points = 0;
  for (let level = 1; level <= PROFICIENCY_MAX_LEVEL + 1; level++) {
    table.push(Math.floor(points / 4));
    points += Math.floor(level + 300 * 2 ** (level / 7));
  }
  return table;
})();

/** The experience a proficiency needs to reach a level, clamped to 0..100. */
export function experienceForLevel(level: number): number {
  return RUNESCAPE_TABLE[Math.min(Math.max(level, 0), PROFICIENCY_MAX_LEVEL)] ?? 0;
}

/** The experience at the level-100 threshold. Experience past it is converted to Engram. */
export const PROFICIENCY_EXPERIENCE_CAP = experienceForLevel(PROFICIENCY_MAX_LEVEL);

/** The level a total experience reaches, from 0 to 100. */
export function levelForExperience(experience: number): number {
  let level = 0;
  while (level < PROFICIENCY_MAX_LEVEL && experience >= experienceForLevel(level + 1)) level++;
  return level;
}

/** The ids of the proficiencies of each title. The game's catalogue must hold the same ids. */
const PROFICIENCY_IDS: Record<TitleSlug, string[]> = {
  "grand-tale": [
    "618004dc-2ac8-460c-b0ca-f39812a09aa9", // Woodcutting
    "93fa88d7-c3ba-4745-a7f6-ed9cc6ef2ba4", // Mining
  ],
};

export function proficiencyIdsFor(title: TitleSlug): string[] {
  return PROFICIENCY_IDS[title];
}
