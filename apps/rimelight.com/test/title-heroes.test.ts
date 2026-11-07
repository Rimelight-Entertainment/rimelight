import { describe, expect, it } from "vite-plus/test";
import {
  heroExperienceAdd,
  heroExperienceFor,
  isHeroExperienceAmount,
  MAX_HERO_EXPERIENCE_GRANT,
} from "../src/api/title-heroes";

// The grand-tale catalogue rows seeded by the title_hero_catalogue migration.
const AENEAS = "3e0c79c3-6b8e-4f6b-056c-c4b002fffd9b";
const AGNI = "0900d41e-389f-45ad-3861-a79d1bb606d8";
const UNKNOWN = "11111111-1111-4111-8111-111111111111";

describe("hero experience", () => {
  it("zero-fills every catalogue hero when there are no rows", () => {
    expect(heroExperienceFor([AENEAS, AGNI], [])).toEqual({ [AENEAS]: 0, [AGNI]: 0 });
  });

  it("keeps the stored value for a catalogue hero and zero-fills the rest", () => {
    expect(heroExperienceFor([AENEAS, AGNI], [{ heroId: AGNI, experience: 4_200 }])).toEqual({
      [AENEAS]: 0,
      [AGNI]: 4_200,
    });
  });

  it("ignores a row for an id that is not in the catalogue", () => {
    expect(heroExperienceFor([AENEAS, AGNI], [{ heroId: UNKNOWN, experience: 99 }])).toEqual({
      [AENEAS]: 0,
      [AGNI]: 0,
    });
  });
});

describe("hero experience amount", () => {
  it("refuses an amount of zero", () => {
    expect(isHeroExperienceAmount(0)).toBe(false);
  });

  it("refuses a negative amount", () => {
    expect(isHeroExperienceAmount(-1)).toBe(false);
  });

  it("accepts an amount of one", () => {
    expect(isHeroExperienceAmount(1)).toBe(true);
  });

  it("accepts the largest amount and refuses one past it", () => {
    expect(isHeroExperienceAmount(MAX_HERO_EXPERIENCE_GRANT)).toBe(true);
    expect(isHeroExperienceAmount(MAX_HERO_EXPERIENCE_GRANT + 1)).toBe(false);
  });

  it("refuses a fractional amount", () => {
    expect(isHeroExperienceAmount(1.5)).toBe(false);
  });

  it("adds the amount to the stored total", () => {
    expect(heroExperienceAdd(4_200, 30)).toBe(4_230);
  });
});
