import { describe, expect, it } from "vite-plus/test";
import { indexKeys, usedKeys } from "../src/slices";

const en = {
  page: { home: { title: "Home" }, about: { title: "About" } },
  error: { retry: "Retry" },
  modals: { items: { one: "{count} item", other: "{count} items" } },
};
const index = indexKeys(en);

describe("per-module key usage", () => {
  it("finds exact key literals", () => {
    expect(usedKeys(`t("page.home.title")`, index).keys).toEqual(["page.home.title"]);
  });

  it("does not treat common words as namespaces", () => {
    const used = usedKeys(`const kind = "page"; const level = "error";`, index);
    expect(used).toEqual({ keys: [], namespaces: [] });
  });

  it("reads a namespace only from t.raw / t.array / t calls", () => {
    expect(usedKeys(`t.raw("page")`, index).namespaces).toEqual(["page"]);
    expect(usedKeys(`t.raw<string>("page")`, index).namespaces).toEqual(["page"]);
    expect(usedKeys(`t.array("error")`, index).namespaces).toEqual(["error"]);
  });

  it("covers template keys built from a namespace prefix", () => {
    const used = usedKeys("t(`page.${id}`)", index);
    expect(used.namespaces).toEqual(["page"]);
    expect(used.keys.sort()).toEqual(["page.about.title", "page.home.title"]);
  });

  it("ignores commented-out keys and namespaces while keeping strings with //", () => {
    const used = usedKeys(
      [
        `const url = "https://example.com"; t("page.home.title");`,
        `// t("page.about.title"); t.raw("error");`,
        `/* t("error.retry") */`,
      ].join("\n"),
      index,
    );
    expect(used).toEqual({ keys: ["page.home.title"], namespaces: [] });
  });
});
