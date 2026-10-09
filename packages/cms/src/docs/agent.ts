import { blocksToMarkdown } from "../markdown";
import { pages } from "../schema";
import { eq, and, isNull, isNotNull } from "drizzle-orm";

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
export function renderPageAsMarkdown(
  page: any,
  locale: string = "en",
  options: AgentMarkdownOptions = {},
): string {
  const { siteUrl = "https://rimelight.com", llmsUrl = "/llms.txt", sourceUrl } = options;

  let contentObj = page.content;
  if (typeof contentObj === "string") {
    try {
      contentObj = JSON.parse(contentObj);
    } catch {
      contentObj = { blocks: [], properties: {} };
    }
  } else if (!contentObj || typeof contentObj !== "object") {
    contentObj = { blocks: [], properties: {} };
  }

  const blocks = Array.isArray(contentObj.blocks) ? contentObj.blocks : [];
  const properties = contentObj.properties || {};

  const title = resolveLocalized(page.title, locale) || properties.title || "Untitled";
  const description = resolveLocalized(page.description, locale) || properties.description || "";
  const version = properties.version || page.templateVersion;
  const markdownBody = blocksToMarkdown(blocks);

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(title)}`,
    ...(description ? [`description: ${JSON.stringify(description)}`] : []),
    ...(version ? [`version: ${JSON.stringify(version)}`] : []),
    ...(page.type ? [`type: ${JSON.stringify(page.type)}`] : []),
    "---",
    "",
    "> Documentation Index",
    `> Fetch the complete documentation index at: ${new URL(llmsUrl, siteUrl).href}`,
    "> Use this file to discover all available pages and sections.",
    "",
    `# ${title}`,
    "",
    markdownBody,
    "",
  ];

  if (sourceUrl) {
    frontmatter.push(`Source: ${new URL(sourceUrl, siteUrl).href}`, "");
  }

  return frontmatter.join("\n");
}

/**
 * Collate all published pages of a given type into a single corpus markdown document.
 */
export async function renderCorpusMarkdown(
  db: any,
  options: {
    type?: string;
    locale?: string;
    siteUrl?: string;
    title?: string;
    description?: string;
  } = {},
): Promise<string> {
  const {
    type = "doc",
    locale = "en",
    siteUrl = "https://rimelight.com",
    title = "Rimelight Documentation Corpus",
    description = "Complete single-corpus documentation for AI agents.",
  } = options;

  if (!db) return `# ${title}\n\n${description}`;

  const conditions = [isNull(pages.deletedAt), isNotNull(pages.publishedVersionId)];
  if (type) {
    conditions.push(eq(pages.type, type));
  }

  const rows = await db
    .select()
    .from(pages)
    .where(and(...conditions));

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

  for (const page of rows) {
    const pageMd = renderPageAsMarkdown(page, locale, { siteUrl });
    parts.push(pageMd, "", "---", "");
  }

  return parts.join("\n");
}
