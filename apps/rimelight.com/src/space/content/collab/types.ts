// Published page JSON as the Loro mapping reads and writes it (MAPPING section 1).

export type Locale = string;

export interface InlineText {
  type: "text";
  text: string;
  marks?: ("bold" | "italic" | "underline" | "strikethrough" | "code")[];
}

export interface InlineLink {
  type: "link";
  url: string;
  children: InlineText[];
  openInNewTab?: boolean;
}

export interface InlineMention {
  type: "mention";
  entryId: string;
  collection: string;
  slug: string;
  title?: string;
}

export interface InlineEmoji {
  type: "emoji";
  emoji: string;
  shortcode?: string;
}

export interface InlineIcon {
  type: "icon";
  name: string;
  label?: string;
}

export type InlineNode = InlineText | InlineLink | InlineMention | InlineEmoji | InlineIcon;

export interface Block {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: Block[];
  isTemplated?: boolean;
  templatedProps?: boolean | string[];
  allowedRoles?: string[];
  requiredPermission?: string;
  visibility?: "internal" | "public";
}

export interface PageContent {
  blocks: Block[];
  properties: Record<string, any>;
}

export interface PageMeta {
  slug: string;
  type: string;
  title: Record<string, string>;
  description?: Record<string, string>;
  tags?: Record<string, string>[];
  templateId?: string | null;
  templateVersion?: number;
}

export interface Page {
  meta: PageMeta;
  content: PageContent;
}
