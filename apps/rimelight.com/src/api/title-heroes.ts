/**
 * The experience a player has with each hero of a title. Which heroes a title has is the title_hero_catalogue table's
 * rule; the ids are lowercase, like every stored uuid (Postgres returns uuids in lowercase). A hero the player has never
 * used reads as zero.
 */

/** Zero-fills every hero id of the title, then overlays the stored rows. A row for an id that is not a hero is ignored. */
export function heroExperienceFor(
  heroIds: readonly string[],
  rows: readonly { heroId: string; experience: number }[],
): Record<string, number> {
  const experience: Record<string, number> = {};
  for (const id of heroIds) experience[id] = 0;
  for (const row of rows) {
    if (row.heroId in experience) experience[row.heroId] = row.experience;
  }
  return experience;
}

/** The most one grant may add. Matches the bound the proficiency grant uses. */
export const MAX_HERO_EXPERIENCE_GRANT = 1_000_000_000;

/**
 * An amount is accepted only as a whole number from 1 up to MAX_HERO_EXPERIENCE_GRANT. Zero and negative amounts are
 * refused: the game server's grants only add experience.
 */
export function isHeroExperienceAmount(amount: number): boolean {
  return Number.isInteger(amount) && amount >= 1 && amount <= MAX_HERO_EXPERIENCE_GRANT;
}

/** The stored total after a grant. The caller has already checked the grant with isHeroExperienceAmount. */
export function heroExperienceAdd(previous: number, amount: number): number {
  return previous + amount;
}
