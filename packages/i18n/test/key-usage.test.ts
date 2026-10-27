import { describe, expect, it } from "vite-plus/test";
import { analyzeRoutes, indexKeys } from "../src/route-analysis";

const index = indexKeys({
  page: { home: { title: "Home" }, about: { title: "About" } },
  common: { save: "Save" },
  error: { retry: "Retry" },
});

/** The namespaces a route file needs, found through `analyzeRoutes` (the key usage is internal). */
const bucketsOf = async (source: string): Promise<string[]> => {
  const file = "/app/src/routes/index.tsx";
  const resolver = { read: () => source, resolve: async () => null };
  const analysis = await analyzeRoutes(new Map([["index", file]]), [], index, resolver);
  return analysis.routes["index"]!;
};

describe("key usage in a route file", () => {
  it("counts a key literal, and nothing that merely shares its text", async () => {
    expect(await bucketsOf(`t("page.home.title");`)).toEqual(["page.home"]);
    expect(await bucketsOf(`const kind = "page"; const level = "error";`)).toEqual([]);
  });

  it("reads a whole namespace only from t.raw, t.array and t calls", async () => {
    expect(await bucketsOf(`t.raw("page")`)).toEqual(["page.about", "page.home"]);
    expect(await bucketsOf(`t.raw<string>("page")`)).toEqual(["page.about", "page.home"]);
    expect(await bucketsOf(`t.array("error")`)).toEqual(["error"]);
  });

  it("covers template keys built from a namespace prefix", async () => {
    expect(await bucketsOf("t(`page.${id}`)")).toEqual(["page.about", "page.home"]);
  });

  it("ignores commented-out keys, and keeps strings that contain //", async () => {
    const source = [
      `const url = "https://example.com"; t("page.home.title");`,
      `// t("page.about.title"); t.raw("error");`,
      `/* t("error.retry") */`,
    ].join("\n");
    expect(await bucketsOf(source)).toEqual(["page.home"]);
  });
});
