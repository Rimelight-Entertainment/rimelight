/**
 * The heroes a player can take into a title, and the experience the player has with each. The ids are the game's
 * hero ids, lowercase like every stored uuid (Postgres returns uuids in lowercase). A hero the player has never
 * used reads as zero.
 */
export const HERO_IDS = [
  "a3e1c0d2-5b7f-4e19-9c4a-2d6f8b1e7c30", // Aeneas (Knight)
  "b7f24d1e-9a63-4c8b-8e2f-5d1a9c0b6e42", // Agni (Sorcerer)
];

/** Zero-fills every hero id, then overlays the stored rows. A row for an id that is not a hero is ignored. */
export function heroExperienceFor(
  rows: readonly { heroId: string; experience: number }[],
): Record<string, number> {
  const experience: Record<string, number> = {};
  for (const id of HERO_IDS) experience[id] = 0;
  for (const row of rows) {
    if (row.heroId in experience) experience[row.heroId] = row.experience;
  }
  return experience;
}

/** The most one grant may add. Matches the bound the proficiency grant uses. */
export const MAX_HERO_EXPERIENCE_GRANT = 1_000_000_000;

/**
 * A grant is accepted only for one of HERO_IDS, and only for a whole amount from 1 up to MAX_HERO_EXPERIENCE_GRANT. Zero and
 * negative amounts are refused: the game server's grants only add experience.
 */
export function canGrantHeroExperience(heroId: string, amount: number): boolean {
  return (
    HERO_IDS.includes(heroId) &&
    Number.isInteger(amount) &&
    amount >= 1 &&
    amount <= MAX_HERO_EXPERIENCE_GRANT
  );
}

/** The stored total after a grant. The caller has already checked the grant with canGrantHeroExperience. */
export function heroExperienceAdd(previous: number, amount: number): number {
  return previous + amount;
}
