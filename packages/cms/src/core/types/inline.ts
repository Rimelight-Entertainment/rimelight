export type InlineNodeType = "text" | "page_mention" | "user_mention" | "link" | "emoji";

export interface TextInlineNode {
  type: "text";
  text: string;
  marks?: Array<"bold" | "italic" | "underline" | "strikethrough" | "code">;
}

export interface PageMentionNode {
  type: "page_mention";
  pageId: string;
  pageSlug: string;
  displayTitle?: string;
}

export interface LinkInlineNode {
  type: "link";
  url: string;
  children: TextInlineNode[];
  openInNewTab?: boolean;
}

export type InlineNode = TextInlineNode | PageMentionNode | LinkInlineNode;
