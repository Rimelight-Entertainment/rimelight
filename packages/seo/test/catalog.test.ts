import { describe, it, expect } from "vite-plus/test";
import { buildApiCatalog } from "../src/catalog.js";

describe("buildApiCatalog", () => {
  it("builds linkset api-catalog object", () => {
    const catalog = buildApiCatalog({
      items: [
        {
          rel: "self",
          href: "/.well-known/api-catalog",
          type: "application/linkset+json",
        },
        {
          rel: "alternate",
          href: "/sitemap.xml",
          type: "application/xml",
        },
      ],
    });

    const items = catalog["api-catalog"];
    expect(items).toHaveLength(2);
    expect(items[0]?.rel).toBe("self");
    expect(items[1]?.href).toBe("/sitemap.xml");
  });
});
