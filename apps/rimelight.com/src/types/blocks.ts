export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

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
  | "LivePreviewBlock";

export interface BaseBlock {
  id: string;
  type: BlockType;
  isTemplated?: boolean;
  props: Record<string, any>;
}

export interface SectionBlockProps {
  level: HeadingLevel;
  title: string;
  description?: string;
  mainArticleSlug?: string;
  children: Block[];
}

export interface ParagraphBlockProps {
  text: RichTextContent;
}

export type CalloutVariant =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "commentary"
  | "ideation"
  | "source";

export interface CalloutBlockProps {
  variant: CalloutVariant;
  children: Block[];
  to?: string;
  target?: string;
}

export interface ImageBlockProps {
  src: string;
  alt: string;
  caption?: string;
}

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
  children: Block[];
}

export interface SceneBlockProps {
  location: string;
  timeOfDay: TimeOfDay;
  setting: Setting;
  transition: Transition;
  description: string;
  children: Block[];
}

export interface DialogueBlockProps {
  character: string;
  parenthetical?: string;
  line: string;
}

export interface SectionBlock extends BaseBlock {
  type: "SectionBlock";
  props: SectionBlockProps;
}

export interface ParagraphContentBlock extends BaseBlock {
  type: "ParagraphBlock";
  props: ParagraphBlockProps;
}

export interface CalloutContentBlock extends BaseBlock {
  type: "CalloutBlock";
  props: CalloutBlockProps;
}

export interface ImageContentBlock extends BaseBlock {
  type: "ImageBlock";
  props: ImageBlockProps;
}

export interface ScriptContentBlock extends BaseBlock {
  type: "ScriptBlock";
  props: ScriptBlockProps;
}

export interface SceneContentBlock extends BaseBlock {
  type: "SceneBlock";
  props: SceneBlockProps;
}

export interface DialogueContentBlock extends BaseBlock {
  type: "DialogueBlock";
  props: DialogueBlockProps;
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
  playgroundUrl?: string;
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

export interface ComponentShowcaseContentBlock extends BaseBlock {
  type: "ComponentShowcaseBlock";
  props: ComponentShowcaseBlockProps;
}

export interface ApiDocumentationContentBlock extends BaseBlock {
  type: "ApiDocumentationBlock";
  props: ApiDocumentationBlockProps;
}

export interface LivePreviewContentBlock extends BaseBlock {
  type: "LivePreviewBlock";
  props: LivePreviewBlockProps;
}

export type Block =
  | SectionBlock
  | ParagraphContentBlock
  | CalloutContentBlock
  | ImageContentBlock
  | ScriptContentBlock
  | SceneContentBlock
  | DialogueContentBlock
  | ComponentShowcaseContentBlock
  | ApiDocumentationContentBlock
  | LivePreviewContentBlock;

export type InlineContentType = "text" | "link" | "mention";

export interface BaseInlineContent {
  type: InlineContentType;
  id: string;
  props: Record<string, any>;
}

export interface InlineText extends BaseInlineContent {
  type: "text";
  props: {
    content: string;
  };
}

export interface InlineLink extends BaseInlineContent {
  type: "link";
  props: {
    href: string;
    target?: "_blank" | "_self";
    content: string;
  };
}

export interface InlineMention extends BaseInlineContent {
  type: "mention";
  props: {
    pageId: string;
  };
}

export type InlineContent = InlineText | InlineLink | InlineMention;

export type RichTextContent = InlineContent[];
