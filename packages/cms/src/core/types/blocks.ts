import type { RichTextValue } from "./inline";

export type BlockType =
  | "SectionBlock"
  | "ParagraphBlock"
  | "CalloutBlock"
  | "ImageBlock"
  | "ScriptBlock"
  | "SceneBlock"
  | "DialogueBlock"
  | "CodeBlock"
  | "TableBlock"
  | "TabsBlock"
  | "TabItemBlock"
  | "StepsBlock"
  | "StepItemBlock"
  | "CardsBlock"
  | "CardBlock"
  | "FileTreeBlock"
  | "ComponentShowcaseBlock"
  | "ApiDocumentationBlock"
  | "LivePreviewBlock"
  | (string & {});

export type TimeOfDay = "MORNING" | "NOON" | "AFTERNOON" | "EVENING" | "NIGHT" | "OTHER";
export type Setting = "INTERIOR" | "EXTERIOR" | "OTHER";
export type Transition = "CUT_TO" | "CUT_BACK_TO" | "FADE_TO" | "NONE";

export interface ScriptBlockProps {
  title: string;
  synopsis: string;
  characters: string[];
  aPlot: string;
  bPlot: string;
  cPlot: string;
  stinger: string;
}

export interface SceneBlockProps {
  location: string;
  timeOfDay: TimeOfDay;
  setting: Setting;
  transition: Transition;
  description: RichTextValue;
}

export interface DialogueBlockProps {
  character: string;
  parenthetical?: string;
  line: RichTextValue;
}

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
export const MAX_SECTION_DEPTH = 4; // Depth 0 -> H2, Depth 4 -> H6
/** Sections can nest this many levels (h2 … h6). Mirrors `maxNesting` on SectionBlock. */
export const MAX_SECTION_NESTING = MAX_SECTION_DEPTH + 1;

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

export interface ComponentShowcaseBlockProps {
  componentName: string;
  componentPath: string;
  framework: "solid";
  defaultProps: Record<string, any>;
  propsConfig: Record<string, string[]>;
  togglingPattern: "icon" | "select-option" | "tab-segmented" | "pill-toggle";
  codeExamples: {
    solid?: string;
  };
  playgroundUrl: string | undefined;
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

export interface TypedScriptBlockProps extends ScriptBlockProps {
  children: BaseBlock[];
}

export interface TypedSceneBlockProps extends SceneBlockProps {
  children: BaseBlock[];
}

// ─── Typed block discriminated union ─────────────────────────────────────────

export interface SectionBlock extends BaseBlock {
  type: "SectionBlock";
  props: SectionBlockProps;
}

export interface ParagraphBlock extends BaseBlock {
  type: "ParagraphBlock";
  props: ParagraphBlockProps;
}

export interface CalloutBlock extends BaseBlock {
  type: "CalloutBlock";
  props: CalloutBlockProps;
}

export interface ImageBlock extends BaseBlock {
  type: "ImageBlock";
  props: ImageBlockProps;
}

export interface ScriptBlock extends BaseBlock {
  type: "ScriptBlock";
  props: TypedScriptBlockProps;
}

export interface SceneBlock extends BaseBlock {
  type: "SceneBlock";
  props: TypedSceneBlockProps;
}

export interface DialogueBlock extends BaseBlock {
  type: "DialogueBlock";
  props: DialogueBlockProps;
}

export interface CodeBlock extends BaseBlock {
  type: "CodeBlock";
  props: CodeBlockProps;
}

export interface TableBlock extends BaseBlock {
  type: "TableBlock";
  props: TableBlockProps;
}

export interface TabsBlock extends BaseBlock {
  type: "TabsBlock";
  props: TabsBlockProps;
}

export interface TabItemBlock extends BaseBlock {
  type: "TabItemBlock";
  props: TabItemBlockProps;
}

export interface StepsBlock extends BaseBlock {
  type: "StepsBlock";
  props: StepsBlockProps;
}

export interface StepItemBlock extends BaseBlock {
  type: "StepItemBlock";
  props: StepItemBlockProps;
}

export interface CardsBlock extends BaseBlock {
  type: "CardsBlock";
  props: CardsBlockProps;
}

export interface CardBlock extends BaseBlock {
  type: "CardBlock";
  props: CardBlockProps;
}

export interface FileTreeBlock extends BaseBlock {
  type: "FileTreeBlock";
  props: FileTreeBlockProps;
}

export interface ComponentShowcaseBlock extends BaseBlock {
  type: "ComponentShowcaseBlock";
  props: ComponentShowcaseBlockProps;
}

export interface ApiDocumentationBlock extends BaseBlock {
  type: "ApiDocumentationBlock";
  props: ApiDocumentationBlockProps;
}

export interface LivePreviewBlock extends BaseBlock {
  type: "LivePreviewBlock";
  props: LivePreviewBlockProps;
}

export type TypedBlock =
  | SectionBlock
  | ParagraphBlock
  | CalloutBlock
  | ImageBlock
  | ScriptBlock
  | SceneBlock
  | DialogueBlock
  | CodeBlock
  | TableBlock
  | TabsBlock
  | TabItemBlock
  | StepsBlock
  | StepItemBlock
  | CardsBlock
  | CardBlock
  | FileTreeBlock
  | ComponentShowcaseBlock
  | ApiDocumentationBlock
  | LivePreviewBlock;

export const ALLOWED_CHILDREN_MAP: Record<string, BlockType[]> = {
  Root: [
    "SectionBlock",
    "ParagraphBlock",
    "CalloutBlock",
    "ImageBlock",
    "CodeBlock",
    "ScriptBlock",
    "SceneBlock",
    "DialogueBlock",
    "TableBlock",
    "TabsBlock",
    "StepsBlock",
    "CardsBlock",
    "FileTreeBlock",
    "ComponentShowcaseBlock",
    "ApiDocumentationBlock",
    "LivePreviewBlock",
  ],
  SectionBlock: [
    "SectionBlock",
    "ParagraphBlock",
    "CalloutBlock",
    "ImageBlock",
    "CodeBlock",
    "ScriptBlock",
    "TableBlock",
    "TabsBlock",
    "StepsBlock",
    "CardsBlock",
    "FileTreeBlock",
    "ComponentShowcaseBlock",
    "ApiDocumentationBlock",
    "LivePreviewBlock",
  ],
  CalloutBlock: [
    "ParagraphBlock",
    "CalloutBlock",
    "ImageBlock",
    "CodeBlock",
    "TableBlock",
    "TabsBlock",
    "StepsBlock",
    "CardsBlock",
    "FileTreeBlock",
    "ComponentShowcaseBlock",
    "ApiDocumentationBlock",
    "LivePreviewBlock",
  ],
  TabsBlock: ["TabItemBlock"],
  TabItemBlock: [
    "ParagraphBlock",
    "CalloutBlock",
    "ImageBlock",
    "CodeBlock",
    "TableBlock",
    "StepsBlock",
    "CardsBlock",
    "FileTreeBlock",
    "ComponentShowcaseBlock",
    "ApiDocumentationBlock",
    "LivePreviewBlock",
  ],
  StepsBlock: ["StepItemBlock"],
  StepItemBlock: [
    "ParagraphBlock",
    "CalloutBlock",
    "ImageBlock",
    "CodeBlock",
    "TableBlock",
    "TabsBlock",
    "CardsBlock",
    "FileTreeBlock",
    "ComponentShowcaseBlock",
    "ApiDocumentationBlock",
    "LivePreviewBlock",
  ],
  CardsBlock: ["CardBlock"],
  ScriptBlock: ["SceneBlock"],
  SceneBlock: ["ParagraphBlock", "CalloutBlock", "DialogueBlock"],
};
