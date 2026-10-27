import { describe, expect, it } from "vite-plus/test";
import { analyzeRoutes, bucketOf, routeKey, routePattern } from "../src/route-analysis";
import { indexKeys } from "../src/slices";

const index = indexKeys({
  page: { home: { title: "Home" }, about: { title: "About" } },
  common: { save: "Save" },
  error: { retry: "Retry" },
});

/** A resolver over an in-memory project: specifiers are resolved by appending `.tsx` to `./` paths. */
const memory = (files: Record<string, string>) => ({
  read: (id: string) => files[id] ?? "",
  resolve: async (specifier: string, importer: string) => {
    if (!specifier.startsWith(".")) return null;
    const dir = importer.slice(0, importer.lastIndexOf("/"));
    const parts = [...dir.split("/"), ...specifier.split("/")];
    const out: string[] = [];
    for (const p of parts) {
      if (p === "..") out.pop();
      else if (p !== ".") out.push(p);
    }
    const id = out.join("/");
    return id in files ? id : `${id}.tsx`;
  },
});

describe("namespace of a key", () => {
  it("uses the second level under page, and the top-level segment elsewhere", () => {
    expect(bucketOf("page.home.title")).toBe("page.home");
    expect(bucketOf("page.title")).toBe("page");
    expect(bucketOf("common.save")).toBe("common");
  });
});

describe("route keys and URL patterns", () => {
  it("derives the route key from the file path", () => {
    expect(routeKey("/app/src/routes", "/app/src/routes/[locale]/(app)/index.tsx")).toBe(
      "[locale]/(app)/index",
    );
  });

  it("drops groups and index, and matches params", () => {
    expect(routePattern("[locale]/(app)/index")).toBe("^/[^/]+/?$");
    expect(routePattern("[locale]/(app)/company/about")).toBe("^/[^/]+/company/about/?$");
    expect(routePattern("index")).toBe("^/?$");
  });

  const matches = (key: string, url: string) => new RegExp(routePattern(key)).test(url);

  it("matches a catch-all against the rest of the path, including nothing", () => {
    expect(matches("[locale]/blog/[...slug]", "/en/blog/a/b")).toBe(true);
    expect(matches("[locale]/blog/[...slug]", "/en/blog")).toBe(true);
    expect(matches("[locale]/blog/[...slug]", "/en/blogs")).toBe(false);
  });

  it("matches an optional param against zero or one segment", () => {
    expect(matches("[locale]/docs/[[page]]", "/en/docs")).toBe(true);
    expect(matches("[locale]/docs/[[page]]", "/en/docs/intro")).toBe(true);
    expect(matches("[locale]/docs/[[page]]", "/en/docs/intro/more")).toBe(false);
  });

  it("escapes static segments", () => {
    expect(matches("[locale]/a.b", "/en/a.b")).toBe(true);
    expect(matches("[locale]/a.b", "/en/axb")).toBe(false);
  });
});

describe("analyzeRoutes", () => {
  it("collects a route's namespaces from its file and ancestor layouts, plus the globals", async () => {
    const files = {
      "/app/src/routes/[locale]/(app).tsx":
        'import { Shell } from "./shell";\nexport default Shell;\n',
      "/app/src/routes/[locale]/(app)/index.tsx": 't("page.home.title"); t.raw("common");\n',
      "/app/src/routes/[locale]/(app)/about.tsx": 't("page.about.title");\n',
      "/app/src/routes/[locale]/shell.tsx": 't("error.retry");\n',
      "/app/src/App.tsx": 't("common.save");\n',
    };
    const routeFiles = new Map([
      ["[locale]/(app)", "/app/src/routes/[locale]/(app).tsx"],
      ["[locale]/(app)/index", "/app/src/routes/[locale]/(app)/index.tsx"],
      ["[locale]/(app)/about", "/app/src/routes/[locale]/(app)/about.tsx"],
    ]);
    const result = await analyzeRoutes(routeFiles, ["/app/src/App.tsx"], index, memory(files));
    expect(result.globals).toEqual(["common"]);
    expect(result.routes["[locale]/(app)/index"]).toEqual(["common", "error", "page.home"]);
    expect(result.routes["[locale]/(app)/about"]).toEqual(["common", "error", "page.about"]);
  });

  it("does not enter another route's file", async () => {
    const files = {
      "/app/src/routes/a.tsx": 'import "./b";\nt("page.home.title");\n',
      "/app/src/routes/b.tsx": 't("page.about.title");\n',
    };
    const routeFiles = new Map([
      ["a", "/app/src/routes/a.tsx"],
      ["b", "/app/src/routes/b.tsx"],
    ]);
    const result = await analyzeRoutes(routeFiles, [], index, memory(files));
    expect(result.routes["a"]).toEqual(["page.home"]);
  });

  it("ignores commented-out imports", async () => {
    const files = {
      "/app/src/routes/a.tsx":
        '// import "../unused";\n/* import "../unused"; */\nt("page.home.title");\n',
      "/app/src/unused.tsx": 't("error.retry");\n',
    };
    const routeFiles = new Map([["a", "/app/src/routes/a.tsx"]]);
    const result = await analyzeRoutes(routeFiles, [], index, memory(files));
    expect(result.routes["a"]).toEqual(["page.home"]);
  });

  it("follows import cycles without looping", async () => {
    const files = {
      "/app/src/routes/a.tsx": 'import "../x";\n',
      "/app/src/x.tsx": 'import "./y";\nt("common.save");\n',
      "/app/src/y.tsx": 'import "./x";\nt("error.retry");\n',
    };
    const routeFiles = new Map([["a", "/app/src/routes/a.tsx"]]);
    const result = await analyzeRoutes(routeFiles, [], index, memory(files));
    expect(result.routes["a"]).toEqual(["common", "error"]);
  });

  it("reuses a kept graph, rescanning only the modules removed from it", async () => {
    const files: Record<string, string> = {
      "/app/src/routes/a.tsx": 'import "../shared";\nt("page.home.title");\n',
      "/app/src/shared.tsx": 't("common.save");\n',
    };
    const resolver = memory(files);
    const reads: string[] = [];
    const counting = { ...resolver, read: (id: string) => (reads.push(id), resolver.read(id)) };
    const routeFiles = new Map([["a", "/app/src/routes/a.tsx"]]);
    const graph = new Map();

    await analyzeRoutes(routeFiles, [], index, counting, graph);
    expect(reads).toHaveLength(2);

    files["/app/src/shared.tsx"] = 't("error.retry");\n';
    graph.delete("/app/src/shared.tsx");
    const result = await analyzeRoutes(routeFiles, [], index, counting, graph);
    expect(reads).toHaveLength(3);
    expect(result.routes["a"]).toEqual(["error", "page.home"]);
  });
});
