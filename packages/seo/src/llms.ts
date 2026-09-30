export interface LlmsPage {
  title: string;
  url: string;
  description?: string;
  markdownUrl?: string;
  section?: string;
}

export interface LlmsTxtOptions {
  site: string;
  title: string;
  description?: string;
  fullCorpusUrl?: string;
  pages: LlmsPage[];
  sections?: Array<{ label: string; url: string }>;
}

export interface LlmsFullTxtOptions {
  site: string;
  title: string;
  description?: string;
  pages: Array<{
    title: string;
    url: string;
    description?: string;
    markdown: string;
    version?: string;
  }>;
}

/**
 * Builds standard /llms.txt document format for AI discovery.
 */
export function buildLlmsTxt(options: LlmsTxtOptions): string {
  const {
    site,
    title,
    description,
    fullCorpusUrl = `${site.replace(/\/$/, "")}/llms-full.txt`,
    pages,
    sections = [],
  } = options;

  const lines = [
    `# ${title}`,
    "",
    description || "Documentation index for AI agents.",
    "",
    `Full corpus (all pages, one document): ${fullCorpusUrl}`,
    "",
  ];

  if (sections.length > 0) {
    lines.push("## Sections", "");
    for (const sec of sections) {
      lines.push(`- [${sec.label}](${sec.url})`);
    }
    lines.push("");
  }

  lines.push("## Pages", "");

  // Group pages by section if present, or flat
  const grouped = new Map<string, LlmsPage[]>();
  for (const page of pages) {
    const sec = page.section || "General";
    if (!grouped.has(sec)) grouped.set(sec, []);
    grouped.get(sec)!.push(page);
  }

  if (grouped.size === 1 && grouped.has("General")) {
    for (const page of pages) {
      const pageUrl = page.markdownUrl || page.url;
      const desc = page.description ? ` — ${page.description}` : "";
      lines.push(`- [${page.title}](${pageUrl})${desc}`);
    }
  } else {
    for (const [secName, secPages] of grouped.entries()) {
      lines.push(`### ${secName}`, "");
      for (const page of secPages) {
        const pageUrl = page.markdownUrl || page.url;
        const desc = page.description ? ` — ${page.description}` : "";
        lines.push(`- [${page.title}](${pageUrl})${desc}`);
      }
      lines.push("");
    }
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Builds concatenated /llms-full.txt single corpus document for AI agents.
 */
export function buildLlmsFullTxt(options: LlmsFullTxtOptions): string {
  const { title, description, pages } = options;
  const parts = [
    `# ${title} — Full Documentation Corpus`,
    "",
    description || "Complete documentation corpus for AI agents.",
    "",
    "---",
    "",
  ];

  for (const page of pages) {
    const metaHeader = [
      `## ${page.title}`,
      "",
      `URL: ${page.url}`,
      ...(page.description ? [`Description: ${page.description}`] : []),
      ...(page.version ? [`Version: ${page.version}`] : []),
      "",
      page.markdown.trim(),
      "",
      "---",
      "",
    ];
    parts.push(...metaHeader);
  }

  return parts.join("\n");
}
