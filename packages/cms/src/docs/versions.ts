import { resolveLabel } from "../core/collections/define";
import type { Label } from "../core/collections/types";

/**
 * Versioned docs navigation, derived entirely from entry slugs.
 *
 * Slugs look like `v1/website/overview/introduction`:
 *   - 1st segment: the version (`v1`, `v2`…). The version list is just the distinct prefixes.
 *   - 2nd segment: the section ("scope"), shown as tabs above the sidebar (api, packages…).
 *   - the rest: folders and the page. Folders become collapsible sidebar groups.
 *
 * Switching versions swaps the whole tree; the same page path is kept when it exists in the
 * target version, otherwise you land on that version's first page. Language is never part of
 * the slug: titles and content are localized inside each entry.
 */

export interface DocsEntryRef {
  slug: string;
  title: Label;
}

export interface DocsNavItem {
  label: string;
  href?: string | undefined;
  active?: boolean | undefined;
  collapsed?: boolean | undefined;
  children?: DocsNavItem[] | undefined;
}

export interface DocsScope {
  id: string;
  label: string;
  href: string;
  active: boolean;
}

export interface DocsNav {
  versions: string[];
  version: string;
  /** Entry slug to load for the current page (handles `…/index` pages). */
  slug: string;
  /** Page path inside the version (no version prefix), e.g. "website/overview/introduction". */
  path: string;
  scopes: DocsScope[];
  activeScope: DocsScope | undefined;
  /** Sidebar tree for the active scope. */
  items: DocsNavItem[];
  /** Pages of the active scope in sidebar order (for prev / next). */
  pages: { label: string; href: string; path: string }[];
  prev: { label: string; href: string } | null;
  next: { label: string; href: string } | null;
}

const VERSION = /^v\d+(\.\d+)*$/i;

/** Distinct versions, newest first (v10 > v9 > v2). */
export function docsVersions(entries: DocsEntryRef[]): string[] {
  const set = new Set<string>();
  for (const e of entries) {
    const first = e.slug.split("/")[0] ?? "";
    if (VERSION.test(first)) set.add(first);
  }
  const num = (v: string) => v.slice(1).split(".").map(Number);
  return [...set].sort((a, b) => {
    const [x, y] = [num(a), num(b)];
    for (let i = 0; i < Math.max(x.length, y.length); i++) {
      const d = (y[i] ?? 0) - (x[i] ?? 0);
      if (d) return d;
    }
    return 0;
  });
}

/** Splits a URL path (after /docs/) into version + page path. No version → the latest. */
export function parseDocsPath(
  urlPath: string | undefined,
  versions: string[],
): { version: string; path: string } {
  const parts = (urlPath ?? "").split("/").filter(Boolean);
  if (parts[0] && versions.includes(parts[0]))
    return { version: parts[0], path: parts.slice(1).join("/") };
  return { version: versions[0] ?? "", path: parts.join("/") };
}

/** "rimelight-ui" → "Rimelight UI", "api" → "API", "getting-started" → "Getting started". */
export function humanizeSegment(segment: string): string {
  const ACRONYMS = new Set([
    "api",
    "ai",
    "ui",
    "cms",
    "i18n",
    "seo",
    "mcp",
    "cli",
    "faq",
    "sdk",
    "cpp",
  ]);
  const words = segment.split(/[-_]/).filter(Boolean);
  return words
    .map((w, i) =>
      ACRONYMS.has(w.toLowerCase())
        ? w.toUpperCase()
        : i === 0 || w.length > 3
          ? w.charAt(0).toUpperCase() + w.slice(1)
          : w,
    )
    .join(" ");
}

/** Sidebar order: "overview"/"introduction"/"getting-started" first, then alphabetical. */
const FIRST = ["overview", "introduction", "getting-started", "index"];
const rank = (seg: string) => {
  const i = FIRST.indexOf(seg);
  return i === -1 ? FIRST.length : i;
};

interface Node {
  seg: string;
  path: string;
  title?: string | undefined;
  /** The page for this folder is stored as `<path>/index`. */
  indexSlug?: boolean | undefined;
  children: Map<string, Node>;
}

export function buildDocsNav(
  entries: DocsEntryRef[],
  opts: {
    /** URL prefix of the docs, e.g. "/en/company/docs". */
    basePath: string;
    /** The URL path after basePath (e.g. "v1/website/overview/introduction"), or empty. */
    urlPath?: string | undefined;
    locale?: string | undefined;
  },
): DocsNav {
  const locale = opts.locale ?? "en";
  const base = opts.basePath.replace(/\/+$/, "");
  const versions = docsVersions(entries);
  const parsed = parseDocsPath(opts.urlPath, versions);
  const version = parsed.version;
  const href = (path: string) => `${base}/${version}/${path}`;

  // Tree of this version's pages.
  const root: Node = { seg: "", path: "", children: new Map() };
  for (const e of entries) {
    const parts = e.slug.split("/");
    if (parts[0] !== version || parts.length < 2) continue;
    let node = root;
    const rest = parts.slice(1);
    rest.forEach((seg, i) => {
      const path = rest.slice(0, i + 1).join("/");
      if (!node.children.has(seg)) node.children.set(seg, { seg, path, children: new Map() });
      node = node.children.get(seg)!;
    });
    node.title = resolveLabel(e.title, locale) || humanizeSegment(node.seg);
  }

  // A folder's `index` page is the folder's own page: `contributing/index` → `contributing`.
  const foldIndex = (n: Node) => {
    const idx = n.children.get("index");
    if (idx && !idx.children.size && n !== root) {
      n.title = idx.title;
      n.children.delete("index");
      n.indexSlug = true;
    }
    n.children.forEach(foldIndex);
  };
  foldIndex(root);

  const sorted = (n: Node) =>
    [...n.children.values()].sort(
      (a, b) =>
        rank(a.seg) - rank(b.seg) ||
        // Pages before folders at the same level.
        Number(a.children.size > 0) - Number(b.children.size > 0) ||
        (a.title ?? humanizeSegment(a.seg)).localeCompare(b.title ?? humanizeSegment(b.seg)),
    );

  const firstPage = (n: Node): string | undefined => {
    if (n.title !== undefined && !n.children.size) return n.path;
    for (const c of sorted(n)) {
      const p = firstPage(c);
      if (p) return p;
    }
    return n.title !== undefined ? n.path : undefined;
  };

  const scopeNodes = sorted(root);
  const versionFirst = firstPage(root) ?? "";
  const path = (parsed.path || versionFirst).replace(/\/index$/, "").replace(/\/+$/, "");
  const activeSeg = path.split("/")[0];

  const scopes: DocsScope[] = scopeNodes.map((n) => ({
    id: n.seg,
    label: humanizeSegment(n.seg),
    href: href(firstPage(n) ?? n.path),
    active: n.seg === activeSeg,
  }));
  const activeScope = scopes.find((s) => s.active) ?? scopes[0];
  const scopeNode = root.children.get(activeScope?.id ?? "");

  const pages: DocsNav["pages"] = [];
  const toItems = (n: Node): DocsNavItem[] =>
    sorted(n).map((c) => {
      const isActive = c.path === path;
      if (c.title !== undefined && !c.children.size) {
        pages.push({ label: c.title, href: href(c.path), path: c.path });
        return { label: c.title, href: href(c.path), active: isActive };
      }
      if (c.title !== undefined) pages.push({ label: c.title, href: href(c.path), path: c.path });
      const children = toItems(c);
      const containsActive = path === c.path || path.startsWith(`${c.path}/`);
      return {
        // Folders keep their own name ("Components"), even when their index page has a
        // different title ("Overview"); the folder links to that index page.
        label: humanizeSegment(c.seg),
        ...(c.title !== undefined ? { href: href(c.path) } : {}),
        active: isActive,
        collapsed: !containsActive,
        children,
      };
    });
  const items = scopeNode ? toItems(scopeNode) : [];

  const i = pages.findIndex((p) => p.path === path);
  const pick = (p: (typeof pages)[number] | undefined) =>
    p ? { label: p.label, href: p.href } : null;

  const findNode = (p: string) => {
    let n: Node | undefined = root;
    for (const seg of p.split("/").filter(Boolean)) n = n?.children.get(seg);
    return n;
  };
  const current = findNode(path);
  const slug = version ? `${version}/${path}${current?.indexSlug ? "/index" : ""}` : "";

  return {
    versions,
    version,
    slug,
    path,
    scopes,
    activeScope,
    items,
    pages,
    prev: i > 0 ? pick(pages[i - 1]) : null,
    next: i >= 0 ? pick(pages[i + 1]) : null,
  };
}

/**
 * Where switching to `target` should go: the same page if it exists there, otherwise the
 * first page of the same section, otherwise the version's first page.
 */
export function switchDocsVersion(
  entries: DocsEntryRef[],
  opts: { basePath: string; path: string; target: string },
): string {
  const base = opts.basePath.replace(/\/+$/, "");
  const slugs = new Set(entries.map((e) => e.slug));
  if (slugs.has(`${opts.target}/${opts.path}`)) return `${base}/${opts.target}/${opts.path}`;
  const section = opts.path.split("/")[0];
  const inSection = entries
    .map((e) => e.slug)
    .filter((s) => s.startsWith(`${opts.target}/${section}/`))
    .sort();
  if (inSection[0]) return `${base}/${inSection[0]}`;
  return `${base}/${opts.target}`;
}
