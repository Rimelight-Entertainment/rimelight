import type { RssFeedOptions } from "./types.js";

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Builds standard RSS 2.0 feed XML document with Atom namespace link.
 */
export function buildRssXml(options: RssFeedOptions): string {
  const siteUrl = (options.site || "").replace(/\/$/, "");
  const feedUrl = options.feedUrl || `${siteUrl}/rss.xml`;
  const language = options.language || "en-US";
  const lastBuildDate = new Date().toUTCString();

  const itemXmls = (options.items || []).map((item) => {
    const itemLink =
      item.link.startsWith("http://") || item.link.startsWith("https://")
        ? item.link
        : `${siteUrl}${item.link.startsWith("/") ? "" : "/"}${item.link}`;
    const pubDate = new Date(item.pubDate).toUTCString();
    const guid = item.guid || itemLink;

    const lines: string[] = [
      "    <item>",
      `      <title>${escapeXml(item.title)}</title>`,
      `      <link>${escapeXml(itemLink)}</link>`,
      `      <guid isPermaLink="${guid.startsWith("http") ? "true" : "false"}">${escapeXml(guid)}</guid>`,
      `      <pubDate>${pubDate}</pubDate>`
    ];

    if (item.description) {
      lines.push(`      <description>${escapeXml(item.description)}</description>`);
    }
    if (item.author) {
      lines.push(`      <author>${escapeXml(item.author)}</author>`);
    }
    if (item.content) {
      lines.push(`      <content:encoded><![CDATA[${item.content}]]></content:encoded>`);
    }

    lines.push("    </item>");
    return lines.join("\n");
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(options.title || "")}</title>
    <description>${escapeXml(options.description || "")}</description>
    <link>${escapeXml(siteUrl)}</link>
    <language>${escapeXml(language)}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${itemXmls.join("\n")}
  </channel>
</rss>`;
}
