import type { RichTextValue } from "./inline";

export type BlockType =
  | "SectionBlock"
  | "ParagraphBlock"
  | "CalloutBlock"
  | "ImageBlock"
  | "CodeBlock"
  | "TableBlock"
  | "TabsBlock"
  | "TabItemBlock"
  | "StepsBlock"
  | "StepItemBlock"
  | "CardsBlock"
  | "CardBlock"
  | "FileTreeBlock"
  | "ApiDocumentationBlock"
  | "LivePreviewBlock"
  | "DividerBlock"
  | "QuoteBlock"
  | "EmbedBlock"
  | (string & {});

export interface BaseBlock {
  /**
   * Unique UUID v4 identifier
   */
  id: string;
  type: BlockType;

  /**
   * Structural Template Lock: If true, this block is a permanent template anchor and can NEVER be
   * deleted, reordered, or removed.
   */
  isTemplated?: boolean;

  /**
   * Property Content Lock: Controls whether block prop content can be edited. - boolean true: ALL
   * properties of this block are locked from editing. - string[]: Specific property keys locked
   * from editing (e.g. ["title", "disclaimer"]).
   */
  templatedProps?: boolean | string[];

  allowedRoles?: string[];
  requiredPermission?: string;
  props: Record<string, any>;
  children?: BaseBlock[];
}

// ─── Typed block prop interfaces ─────────────────────────────────────────────

export type HeadingLevel = 2 | 3 | 4 | 5 | 6;

export const MIN_SECTION_HEADING_LEVEL: HeadingLevel = 2;
export const MAX_SECTION_HEADING_LEVEL: HeadingLevel = 6;
export const MAX_SECTION_DEPTH: number = 4; // Depth 0 -> H2, Depth 4 -> H6
/** Sections can nest this many levels (h2 … h6). Mirrors `maxNesting` on SectionBlock. */
export const MAX_SECTION_NESTING: number = MAX_SECTION_DEPTH + 1;

export function calculateHeadingLevel(sectionDepth: number): HeadingLevel {
  const depth = Math.max(0, Math.floor(sectionDepth || 0));
  return Math.min(MAX_SECTION_HEADING_LEVEL, depth + MIN_SECTION_HEADING_LEVEL) as HeadingLevel;
}

export type CalloutVariant =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "commentary"
  | "ideation"
  | "source";

export interface SectionBlockProps {
  /** Rich text. The heading level (h2–h6) comes from nesting, never from a prop. */
  title: RichTextValue;
  description?: RichTextValue;
  mainArticleSlug?: string;
  children: BaseBlock[];
}

export interface ParagraphBlockProps {
  /** Rich text: `InlineNode[]`, or a per-locale map of them. */
  text: RichTextValue;
}

export interface CalloutBlockProps {
  variant: CalloutVariant;
  to?: string;
  target?: string;
  children: BaseBlock[];
}

import type { MediaValue } from "./media";

export interface ImageBlockProps {
  src: string | MediaValue;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
}

export interface CodeBlockProps {
  code: string;
  language: string;
  caption?: string;
  title?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
}

export interface TableColumnDef {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
}

export interface TableBlockProps {
  columns: TableColumnDef[];
  rows: Record<string, string>[];
  caption?: string;
}

export interface TabItemBlockProps {
  label: string;
  value?: string;
  icon?: string;
  children: BaseBlock[];
}

export interface TabsBlockProps {
  defaultValue?: string;
  children: BaseBlock[];
}

export interface StepItemBlockProps {
  title: RichTextValue;
  description?: string;
  children: BaseBlock[];
}

export interface StepsBlockProps {
  children: BaseBlock[];
}

export interface CardBlockProps {
  title: string;
  description?: string;
  icon?: string;
  href?: string;
  badge?: string;
}

export interface CardsBlockProps {
  columns?: 1 | 2 | 3 | 4;
  children: BaseBlock[];
}

export interface FileTreeNode {
  name: string;
  isDir?: boolean;
  children?: FileTreeNode[];
  comment?: string;
}

export interface FileTreeBlockProps {
  tree: FileTreeNode[];
}

export interface ApiDocumentationBlockProps {
  componentName: string;
  sections: {
    props?: boolean;
    slots?: boolean;
    emits?: boolean;
    theme?: boolean;
    changelog?: boolean;
  };
  hide?: string[];
  show?: string[];
}

export interface LivePreviewBlockProps {
  componentCode: string;
  framework: "solid";
  height?: string;
  width?: string;
  editable?: boolean;
}
