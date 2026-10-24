/**
 * Rich text is stored as a small inline AST, never as HTML or markdown strings.
 *
 * A rich text value is either `InlineNode[]` or, for translatable content, a per-locale map of
 * them (`{ en: InlineNode[], pt: InlineNode[] }`) — the same i18n pattern as other localized
 * values. Use the helpers in `core/richtext` to read and write either shape.
 */

export type InlineMark = "bold" | "italic" | "underline" | "strikethrough" | "code";

export interface TextInlineNode {
  type: "text";
  text: string;
  marks?: InlineMark[];
}

/** External (or absolute) link. Internal pages should be mentions, so they track renames. */
export interface LinkInlineNode {
  type: "link";
  url: string;
  children: TextInlineNode[];
  openInNewTab?: boolean;
}

/**
 * Reference to another CMS entry. `collection` decides the chip colour (every collection has
 * one), `slug`/`title` are snapshots used for the href and as a fallback label if the entry is
 * gone.
 */
export interface MentionInlineNode {
  type: "mention";
  entryId: string;
  collection: string;
  slug: string;
  title?: string;
  /**
   * Filled in by the content API when delivering content (never stored): the collection's
   * colour and the entry's current URL (absent when the target isn't published).
   */
  color?: string;
  href?: string;
}

export interface EmojiInlineNode {
  type: "emoji";
  /** The emoji character(s), e.g. "🔥". */
  emoji: string;
  /** Optional shortcode without colons, e.g. "fire" (used as the accessible label). */
  shortcode?: string;
}

/** Inline icon from the icon set (an iconify class, e.g. "i-lucide-sword"). */
export interface IconInlineNode {
  type: "icon";
  name: string;
  label?: string;
}

export type InlineNode =
  | TextInlineNode
  | LinkInlineNode
  | MentionInlineNode
  | EmojiInlineNode
  | IconInlineNode;

export type InlineNodeType = InlineNode["type"];

export type RichText = InlineNode[];
export type LocalizedRichText = Record<string, RichText>;
/** What a rich text prop or field stores. */
export type RichTextValue = RichText | LocalizedRichText;
