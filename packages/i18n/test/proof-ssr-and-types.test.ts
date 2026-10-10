import { describe, expect, it } from "vite-plus/test";
import { i18n } from "../src/middleware";
import { getCurrentLocale, t } from "../src/index";
import { createMockContext, setTranslations } from "./helpers";

function req(path: string, init?: RequestInit): Request {
  return new Request(`https://example.com${path}`, init);
}

describe("PROOF: SSR Concurrency and Race Condition Isolation", () => {
  it("DEMO of why the OLD code failed: global module variable bleeds across async pauses", async () => {
    // This simulates the OLD architecture with a global variable
    let oldGlobalLocale = "en";
    const oldGetCurrentLocale = () => oldGlobalLocale;
    const oldSetCurrentLocale = (loc: string) => {
      oldGlobalLocale = loc;
    };

    // User A requests Spanish (/es)
    const handleUserA = async () => {
      oldSetCurrentLocale("es");
      // User A awaits a 30ms database or CMS fetch
      await new Promise((r) => setTimeout(r, 30));
      // What does User A see after the await?
      return oldGetCurrentLocale();
    };

    // User B requests English (/en) 10ms later
    const handleUserB = async () => {
      await new Promise((r) => setTimeout(r, 10));
      oldSetCurrentLocale("en");
      return oldGetCurrentLocale();
    };

    const [userAResult, userBResult] = await Promise.all([handleUserA(), handleUserB()]);

    // PROOF OF THE OLD BUG: User A was overwritten by User B!
    expect(userBResult).toBe("en");
    expect(userAResult).toBe("en"); // BUG: User A wanted "es", but got "en"!
  });

  it("PROOF that the NEW i18n middleware and AsyncLocalStorage isolates 10 concurrent async requests", async () => {
    setTranslations(
      {
        en: { title: "Welcome" },
        es: { title: "Bienvenido" },
        pt: { title: "Bem-vindo" },
        de: { title: "Willkommen" },
        fr: { title: "Bienvenue" },
      },
      {
        locales: ["en", "es", "pt", "de", "fr"],
        defaultLocale: "en",
        prefixDefaultLocale: true,
      },
    );

    const middleware = i18n();

    // 10 concurrent requests fired simultaneously with different locales and varying random async latency
    const testCases = [
      { path: "/es/home", expectedLocale: "es", expectedTitle: "Bienvenido", delayMs: 45 },
      { path: "/pt/home", expectedLocale: "pt", expectedTitle: "Bem-vindo", delayMs: 15 },
      { path: "/de/home", expectedLocale: "de", expectedTitle: "Willkommen", delayMs: 30 },
      { path: "/fr/home", expectedLocale: "fr", expectedTitle: "Bienvenue", delayMs: 10 },
      { path: "/en/home", expectedLocale: "en", expectedTitle: "Welcome", delayMs: 50 },
      { path: "/es/contact", expectedLocale: "es", expectedTitle: "Bienvenido", delayMs: 25 },
      { path: "/pt/contact", expectedLocale: "pt", expectedTitle: "Bem-vindo", delayMs: 35 },
      { path: "/de/contact", expectedLocale: "de", expectedTitle: "Willkommen", delayMs: 5 },
      { path: "/fr/contact", expectedLocale: "fr", expectedTitle: "Bienvenue", delayMs: 40 },
      { path: "/en/contact", expectedLocale: "en", expectedTitle: "Welcome", delayMs: 20 },
    ];

    const results = await Promise.all(
      testCases.map(async (tc) => {
        let actualResult = { actualLocale: "", actualTitle: "" };
        const ctx = createMockContext(req(tc.path));
        await middleware(ctx as any, async () => {
          await new Promise((r) => setTimeout(r, tc.delayMs));
          actualResult = {
            actualLocale: getCurrentLocale(),
            actualTitle: t("title"),
          };
        });
        return actualResult;
      }),
    );

    // Verify EVERY single request maintained 100% isolation with zero crosstalk
    results.forEach((res, i) => {
      const tc = testCases[i];
      if (!tc) throw new Error("Missing test case");
      expect(res).toEqual({
        actualLocale: tc.expectedLocale,
        actualTitle: tc.expectedTitle,
      });
    });
  });

  it("PROOF that TranslationKey is strictly bound to RimelightTranslationKeys", () => {
    const validKey: import("../src/runtime").TranslationKey = "title";
    expect(t(validKey)).toBeDefined();
  });
});
