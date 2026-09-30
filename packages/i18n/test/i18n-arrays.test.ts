import { describe, expect, it } from "vite-plus/test";
import { initializeI18n, currentLocale, t, tRaw, tArray, getRawTranslation } from "../src/index";

describe("@rimelight/i18n array, object, and deep path support", () => {
  const translations = {
    en: {
      resume: {
        title: "Resume",
        tags: ["TypeScript", "Astro", "Unreal Engine"],
        experiences: [
          {
            role: "Game Programmer",
            company: "Compass.UOL",
            bullets: ["Training in Unreal Engine", "Implemented gameplay mechanics"],
            details: {
              location: "Curitiba",
              remote: true
            }
          },
          {
            role: "Customer Service",
            company: "Concentrix",
            bullets: ["Supervision support"]
          }
        ],
        settings: {
          nested: {
            deep: "Found value"
          }
        }
      }
    },
    pt: {
      resume: {
        title: "Currículo",
        tags: ["TypeScript", "Astro", "Unreal Engine"],
        experiences: [
          {
            role: "Programador de Jogos",
            company: "Compass.UOL",
            bullets: ["Treinamento na Unreal Engine", "Implementação de mecânicas de gameplay"],
            details: {
              location: "Curitiba",
              remote: true
            }
          }
        ]
      }
    }
  };

  initializeI18n({
    defaultLocale: "en",
    translations
  });

  it("retrieves flat translations as strings via t()", () => {
    currentLocale.set("en");
    expect(t("resume.title")).toBe("Resume");
    currentLocale.set("pt");
    expect(t("resume.title")).toBe("Currículo");
  });

  it("retrieves deep-path values via t()", () => {
    currentLocale.set("en");
    expect(t("resume.experiences.0.role")).toBe("Game Programmer");
    expect(t("resume.experiences.0.bullets.0")).toBe("Training in Unreal Engine");
    expect(t("resume.experiences.0.details.location")).toBe("Curitiba");
    expect(t("resume.settings.nested.deep")).toBe("Found value");

    currentLocale.set("pt");
    expect(t("resume.experiences.0.role")).toBe("Programador de Jogos");
    expect(t("resume.experiences.0.bullets.0")).toBe("Treinamento na Unreal Engine");
  });

  it("retrieves string arrays via t.array() and tArray()", () => {
    currentLocale.set("en");
    expect(t.array("resume.tags")).toEqual(["TypeScript", "Astro", "Unreal Engine"]);
    expect(tArray("resume.tags")).toEqual(["TypeScript", "Astro", "Unreal Engine"]);
    expect(t.array("resume.experiences.0.bullets")).toEqual([
      "Training in Unreal Engine",
      "Implemented gameplay mechanics"
    ]);
  });

  it("retrieves structured objects and arrays via t.raw() and tRaw()", () => {
    currentLocale.set("en");
    const exp = t.raw<any[]>("resume.experiences");
    expect(Array.isArray(exp)).toBe(true);
    expect(exp.length).toBe(2);
    expect(exp[0].role).toBe("Game Programmer");
    expect(tRaw<any[]>("resume.experiences")).toEqual(exp);

    currentLocale.set("pt");
    const expPt = t.raw<any[]>("resume.experiences");
    expect(expPt.length).toBe(1);
    expect(expPt[0].role).toBe("Programador de Jogos");
  });

  it("returns fallbacks for non-existent paths in t.array() and t.raw()", () => {
    currentLocale.set("en");
    expect(t.array("resume.missing_array")).toEqual([]);
    expect(t.array("resume.missing_array", ["fallback"])).toEqual(["fallback"]);
    expect(t.raw("resume.missing_obj", { default: true })).toEqual({ default: true });
    expect(t.raw("non_existent_component.key")).toBeUndefined();
  });

  it("retrieves component-level object via getRawTranslation", () => {
    currentLocale.set("en");
    const resumeComp = getRawTranslation("resume") as any;
    expect(resumeComp).toBeDefined();
    expect(resumeComp.title).toBe("Resume");
    expect(resumeComp.tags).toEqual(["TypeScript", "Astro", "Unreal Engine"]);
  });
});
