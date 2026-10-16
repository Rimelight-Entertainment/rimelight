import type { BaseBlock, InlineNode, TextInlineNode } from "@rimelight/cms";

export * from "@rimelight/cms";

// Compatibility aliases for legacy consumer code
export type Block = BaseBlock;

export interface SectionBlockProps {
  level: number;
  title: string;
  description?: string;
  mainArticleSlug?: string;
  children: Block[];
}

export interface SectionBlock extends BaseBlock {
  type: "SectionBlock";
  props: SectionBlockProps;
}

export type InlineText =
  | TextInlineNode
  | {
      id: string;
      type: "text";
      props: { content: string };
    };

export type RichTextContent = Array<
  | InlineNode
  | {
      id: string;
      type: string;
      props: Record<string, any>;
    }
>;
