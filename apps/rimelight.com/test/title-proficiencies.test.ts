import { describe, expect, it } from "vite-plus/test";
import {
  PROFICIENCY_EXPERIENCE_CAP,
  experienceForLevel,
  levelForExperience,
  proficiencyIdsFor,
} from "../src/api/title-proficiencies";

describe("proficiency curve", () => {
  it("starts at zero and reaches level 1 at 83 experience", () => {
    expect(experienceForLevel(0)).toBe(0);
    expect(experienceForLevel(1)).toBe(83);
  });

  it("lands near 15 million at level 100 and only increases", () => {
    expect(PROFICIENCY_EXPERIENCE_CAP).toBeGreaterThan(14_000_000);
    expect(PROFICIENCY_EXPERIENCE_CAP).toBeLessThan(17_000_000);
    for (let level = 1; level <= 100; level++) {
      expect(experienceForLevel(level)).toBeGreaterThan(experienceForLevel(level - 1));
    }
  });

  it("maps experience to a level at each threshold", () => {
    expect(levelForExperience(82)).toBe(0);
    expect(levelForExperience(83)).toBe(1);
    for (let level = 0; level <= 100; level++) {
      expect(levelForExperience(experienceForLevel(level))).toBe(level);
    }
    expect(levelForExperience(PROFICIENCY_EXPERIENCE_CAP * 3)).toBe(100);
  });

  it("lists the Grand Tale proficiencies by UUIDv4", () => {
    const ids = proficiencyIdsFor("grand-tale");
    expect(ids).toHaveLength(2);
    for (const id of ids)
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
