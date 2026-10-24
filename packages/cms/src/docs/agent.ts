import { blocksToMarkdown } from "../markdown";
import type { Cms } from "../services/index";

export interface AgentMarkdownOptions {
  siteUrl?: string;
  llmsUrl?: string;
  sourceUrl?: string;
}

function resolveLocalized(val: unknown, locale: string = "en"): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "object" && val !== null) {
    const rec = val as Record<string, string>;
    return rec[locale] || rec["en"] || Object.values(rec)[0] || "";
  }
  return typeof val === "number" ? String(val) : "";
}

/**
 * Renders a CMS page record into clean, agent-ready Markdown with YAML frontmatter.
 */
export interface MarkdownSource {
  slug: string;
  collection: string;
  title: Record<string, string>;
  description?: Record<string, string> | null;
  blocks: import("../core/types/blocks").BaseBlock[];
  properties: Record<string, any>;
}

export function renderPageAsMarkdown(
  page: MarkdownSource,
  locale: string = "en",
  options: AgentMarkdownOptions = {},
): string {
  const { siteUrl = "https://rimelight.com", llmsUrl = "/llms.txt", sourceUrl } = options;
  const title = resolveLocalized(page.title, locale) || "Untitled";
  const description = resolveLocalized(page.description, locale);
  const version = page.properties["version"];
  const lines = [
    "---",
    `title: ${JSON.stringify(title)}`,
    ...(description ? [`description: ${JSON.stringify(description)}`] : []),
    ...(version ? [`version: ${JSON.stringify(version)}`] : []),
    `collection: ${JSON.stringify(page.collection)}`,
    "---",
    "",
    "> Documentation Index",
    `> Fetch the complete documentation index at: ${new URL(llmsUrl, siteUrl).href}`,
    "",
    `# ${title}`,
    "",
    blocksToMarkdown(page.blocks),
    "",
  ];
  if (sourceUrl) lines.push(`Source: ${new URL(sourceUrl, siteUrl).href}`, "");
  return lines.join("\n");
}

/**
 * Collate all published entries of a collection into a single corpus markdown document
 * (for `/llms-full.txt` style endpoints).
 */
export async function renderCorpusMarkdown(
  cms: Cms,
  options: {
    collection?: string;
    locale?: string;
    siteUrl?: string;
    title?: string;
    description?: string;
  } = {},
): Promise<string> {
  const {
    collection = "doc",
    locale = "en",
    siteUrl = "https://rimelight.com",
    title = "Documentation Corpus",
    description = "Complete single-corpus documentation for AI agents.",
  } = options;
  const parts = [
    `# ${title}`,
    "",
    description,
    "",
    `Generated for site: ${siteUrl}`,
    "",
    "---",
    "",
  ];
  const { entries } = await cms.entries.listEntries({
    collection,
    status: "published",
    orderBy: "slug",
    limit: 500,
    includeContent: true,
  });
  for (const entry of entries) {
    parts.push(
      renderPageAsMarkdown(
        {
          ...entry,
          blocks: entry.published?.blocks ?? [],
          properties: entry.published?.properties ?? {},
        },
        locale,
        { siteUrl },
      ),
      "",
      "---",
      "",
    );
  }
  return parts.join("\n");
}
