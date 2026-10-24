import type { BaseBlock } from "../core/types/blocks";
import { resolveRichText } from "../core/richtext";
import { entryUrl } from "../core/collections/color";

/** Rich text (nodes or a per-locale map) → markdown. Mentions become links to the entry. */
export function inlinesToMarkdown(value: unknown, locale = "en"): string {
  return resolveRichText(value, locale)
    .map((node) => {
      switch (node.type) {
        case "text": {
          let text = node.text || "";
          const marks = node.marks || [];
          if (marks.includes("code")) text = `\`${text}\``;
          if (marks.includes("bold")) text = `**${text}**`;
          if (marks.includes("italic")) text = `*${text}*`;
          if (marks.includes("strikethrough")) text = `~~${text}~~`;
          return text;
        }
        case "link": {
          const linkText = (node.children || []).map((c) => c.text).join("") || node.url;
          return `[${linkText}](${node.url})`;
        }
        case "mention":
          return `[${node.title || node.slug}](${entryUrl(true, node)})`;
        case "emoji":
          return node.emoji;
        default:
          return "";
      }
    })
    .join("");
}

export function blocksToMarkdown(
  blocks: BaseBlock[] = [],
  options: { sectionLevel?: number } = {},
): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";

  const baseLevel = options.sectionLevel ?? 2;
  const lines: string[] = [];

  for (const block of blocks) {
    if (!block) continue;
    const children = block.children || block.props?.["children"] || [];

    switch (block.type) {
      case "SectionBlock": {
        // Heading level comes from nesting only (top-level section = h2).
        const level = baseLevel;
        const hashes = "#".repeat(Math.min(6, Math.max(1, level)));
        const title = inlinesToMarkdown(block.props?.["title"]);
        if (title) lines.push(`${hashes} ${title}`);
        const description = inlinesToMarkdown(block.props?.["description"]);
        if (description) lines.push(`_${description}_`);
        if (children.length > 0) {
          lines.push(blocksToMarkdown(children, { sectionLevel: Math.min(6, level + 1) }));
        }
        break;
      }

      case "ParagraphBlock": {
        const text = inlinesToMarkdown(block.props?.["text"]);
        if (text) lines.push(text);
        break;
      }

      case "CalloutBlock": {
        const variant = (block.props?.["variant"] || "info").toUpperCase();
        const childMd = blocksToMarkdown(children, options);
        const calloutHeader = `> [!${variant}]`;
        if (childMd) {
          const indented = childMd
            .split("\n")
            .map((l) => (l.trim() ? `> ${l}` : `>`))
            .join("\n");
          lines.push(`${calloutHeader}\n${indented}`);
        } else {
          lines.push(calloutHeader);
        }
        break;
      }

      case "CodeBlock": {
        const lang = block.props?.["language"] || "";
        const code = block.props?.["code"] || "";
        const caption = block.props?.["caption"] ? `\n_${block.props["caption"]}_` : "";
        lines.push(`\`\`\`${lang}\n${code}\n\`\`\`${caption}`);
        break;
      }

      case "TableBlock": {
        const columns = block.props?.["columns"] || [];
        const rows = block.props?.["rows"] || [];
        if (columns.length > 0) {
          const headerRow = `| ${columns.map((c: any) => c.header || c.key).join(" | ")} |`;
          const alignRow = `| ${columns
            .map((c: any) => {
              if (c.align === "center") return ":---:";
              if (c.align === "right") return "---:";
              return "---";
            })
            .join(" | ")} |`;
          const bodyRows = rows.map(
            (r: any) => `| ${columns.map((c: any) => r[c.key] || "").join(" | ")} |`,
          );
          const tableMd = [headerRow, alignRow, ...bodyRows].join("\n");
          const caption = block.props?.["caption"] ? `\n_${block.props["caption"]}_` : "";
          lines.push(`${tableMd}${caption}`);
        }
        break;
      }

      case "ImageBlock": {
        const alt = block.props?.["alt"] || "";
        const src = block.props?.["src"] || "";
        const caption = block.props?.["caption"] ? `\n_${block.props["caption"]}_` : "";
        lines.push(`![${alt}](${src})${caption}`);
        break;
      }

      case "TabsBlock": {
        for (const tab of children) {
          const tabLabel = tab.props?.label || "Tab";
          const tabChildren = tab.children || tab.props?.children || [];
          lines.push(`#### ${tabLabel}\n\n${blocksToMarkdown(tabChildren, options)}`);
        }
        break;
      }

      case "TabItemBlock": {
        const label = block.props?.["label"] || "Tab";
        lines.push(`#### ${label}\n\n${blocksToMarkdown(children, options)}`);
        break;
      }

      case "StepsBlock": {
        let stepIndex = 1;
        for (const step of children) {
          const title = inlinesToMarkdown(step.props?.title) || `Step ${stepIndex}`;
          const desc = step.props?.description ? ` - ${step.props.description}` : "";
          const stepChildren = step.children || step.props?.children || [];
          lines.push(`${stepIndex}. **${title}**${desc}`);
          if (stepChildren.length > 0) {
            lines.push(blocksToMarkdown(stepChildren, options));
          }
          stepIndex++;
        }
        break;
      }

      case "StepItemBlock": {
        const title = inlinesToMarkdown(block.props?.["title"]) || "Step";
        const desc = block.props?.["description"] ? ` - ${block.props["description"]}` : "";
        lines.push(`- **${title}**${desc}`);
        if (children.length > 0) {
          lines.push(blocksToMarkdown(children, options));
        }
        break;
      }

      case "CardsBlock": {
        for (const card of children) {
          const title = card.props?.title || "";
          const href = card.props?.href || "#";
          const desc = card.props?.description ? `: ${card.props.description}` : "";
          lines.push(`- [${title}](${href})${desc}`);
        }
        break;
      }

      case "CardBlock": {
        const title = block.props?.["title"] || "";
        const href = block.props?.["href"] || "#";
        const desc = block.props?.["description"] ? `: ${block.props["description"]}` : "";
        lines.push(`- [${title}](${href})${desc}`);
        break;
      }

      case "FileTreeBlock": {
        const renderTree = (nodes: any[], prefix = ""): string[] => {
          const treeLines: string[] = [];
          for (const node of nodes) {
            const icon = node.isDir ? "📁 " : "📄 ";
            const comment = node.comment ? ` # ${node.comment}` : "";
            treeLines.push(`${prefix}${icon}${node.name}${comment}`);
            if (node.children && node.children.length > 0) {
              treeLines.push(...renderTree(node.children, `${prefix}  `));
            }
          }
          return treeLines;
        };
        const treeNodes = block.props?.["tree"] || [];
        lines.push(`\`\`\`text\n${renderTree(treeNodes).join("\n")}\n\`\`\``);
        break;
      }

      case "DialogueBlock": {
        lines.push(`**${block.props?.["character"]}:** "${block.props?.["line"] || ""}"`);
        break;
      }

      default: {
        if (block.props?.["text"]) {
          lines.push(inlinesToMarkdown(block.props["text"]));
        }
        break;
      }
    }
  }

  return lines.filter(Boolean).join("\n\n");
}
