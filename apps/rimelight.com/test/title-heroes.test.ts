import { describe, expect, it } from "vite-plus/test";
import {
  canGrantHeroExperience,
  HERO_IDS,
  heroExperienceAdd,
  heroExperienceFor,
  MAX_HERO_EXPERIENCE_GRANT,
} from "../src/api/title-heroes";

const AENEAS = HERO_IDS[0]!;
const AGNI = HERO_IDS[1]!;
const UNKNOWN = "11111111-1111-4111-8111-111111111111";

describe("hero experience", () => {
  it("zero-fills every hero id when there are no rows", () => {
    expect(heroExperienceFor([])).toEqual({ [AENEAS]: 0, [AGNI]: 0 });
  });

  it("keeps the stored value for a known hero and zero-fills the rest", () => {
    expect(heroExperienceFor([{ heroId: AGNI, experience: 4_200 }])).toEqual({
      [AENEAS]: 0,
      [AGNI]: 4_200,
    });
  });

  it("ignores a row for an id that is not a hero", () => {
    expect(heroExperienceFor([{ heroId: UNKNOWN, experience: 99 }])).toEqual({
      [AENEAS]: 0,
      [AGNI]: 0,
    });
  });

  it("lists the hero ids in lowercase UUID form", () => {
    expect(HERO_IDS).toHaveLength(2);
    for (const id of HERO_IDS)
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });
});

describe("hero experience grant", () => {
  it("refuses an amount of zero", () => {
    expect(canGrantHeroExperience(AENEAS, 0)).toBe(false);
  });

  it("refuses a negative amount", () => {
    expect(canGrantHeroExperience(AENEAS, -1)).toBe(false);
  });

  it("accepts an amount of one", () => {
    expect(canGrantHeroExperience(AENEAS, 1)).toBe(true);
  });

  it("accepts the largest amount and refuses one past it", () => {
    expect(canGrantHeroExperience(AGNI, MAX_HERO_EXPERIENCE_GRANT)).toBe(true);
    expect(canGrantHeroExperience(AGNI, MAX_HERO_EXPERIENCE_GRANT + 1)).toBe(false);
  });

  it("refuses a fractional amount", () => {
    expect(canGrantHeroExperience(AENEAS, 1.5)).toBe(false);
  });

  it("refuses an unknown hero", () => {
    expect(canGrantHeroExperience(UNKNOWN, 10)).toBe(false);
  });

  it("adds the amount to the stored total", () => {
    expect(heroExperienceAdd(4_200, 30)).toBe(4_230);
  });
});
