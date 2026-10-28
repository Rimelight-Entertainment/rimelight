import type { Component } from "solid-js";
import type { BaseBlock } from "../types/blocks";
import type { FieldDefinition, Label } from "../collections/types";
import { createBlockId } from "./tree";

/** Props every block renderer receives. Nested blocks arrive pre-rendered as `children`. */
export interface BlockRenderProps {
  block: BaseBlock;
  locale?: string;
  sectionDepth?: number;
  index?: number;
  components?: Record<string, Component<any>>;
  children?: any;
}

/** Props a custom block editor receives inside the block canvas. */
export interface BlockEditorProps<P = Record<string, any>> {
  block: BaseBlock & { props: P };
  /** Shallow-merge into the block's props. */
  update: (patch: Partial<P>) => void;
  readOnly: boolean;
  sectionDepth: number;
  /** Renders the block's children as an editable nested canvas (for container blocks). */
  renderChildren: () => any;
}

export type BlockCategory = "text" | "structure" | "media" | "data" | "embed" | (string & {});

export interface BlockDefinition<P extends Record<string, any> = Record<string, any>> {
  type: string;
  label: Label;
  description?: Label;
  icon?: string;
  category?: BlockCategory;
  /** Slash-menu search aliases. */
  keywords?: string[];
  defaultProps: P;
  /**
   * Typed props. Used for validation, the auto-generated inspector, and MCP docs. Same field
   * vocabulary as collections.
   */
  fields?: Record<string, FieldDefinition>;
  /** Child block types. Omit for leaf blocks; `"*"` allows any root-level block. */
  children?: string[] | "*";
  /** Blocks created alongside a new instance (e.g. a Tabs block starts with one TabItem). */
  initialChildren?: () => BaseBlock[];
  /**
   * Block types this block may live inside. When set, the block can only be created in, or
   * dragged into, one of these parents — never at the root and never in a `"*"` container.
   * E.g. a `SceneBlock` with `parents: ["ScriptBlock"]` only exists inside scripts.
   */
  parents?: string[];
  /** Hidden from the root picker (only insertable inside its parent, e.g. TabItem). */
  nestedOnly?: boolean;
  /**
   * Maximum depth of this block nested inside itself (counting the outermost one as 1).
   * `SectionBlock` uses 5 so headings run h2–h6; deeper sections can't be created or dropped.
   */
  maxNesting?: number;
  /** The text prop edited inline in the canvas (contenteditable). */
  inlineText?: keyof P & string;
  /**
   * `true` when `inlineText` stores rich `InlineNode[]` (bold, links, mentions). Otherwise the
   * prop is a plain string and the canvas edits it as plain text.
   */
  richText?: boolean;
  render?: Component<BlockRenderProps>;
  /** Custom canvas editor. Omitted → inline text (if `inlineText`) + auto inspector from `fields`. */
  editor?: Component<BlockEditorProps<P>>;
}

export class BlockRegistry {
  #defs = new Map<string, BlockDefinition>();

  register(...defs: BlockDefinition<any>[]): this {
    for (const def of defs) this.#defs.set(def.type, def);
    return this;
  }
  get(type: string): BlockDefinition | undefined {
    return this.#defs.get(type);
  }
  has(type: string): boolean {
    return this.#defs.has(type);
  }
  all(): BlockDefinition[] {
    return [...this.#defs.values()];
  }
  /**
   * Block types insertable inside `parentType` (or at the root when null). Both sides must
   * agree: the parent lists the child (or accepts `"*"`), and the child's `parents` (if any)
   * include the parent.
   */
  allowedChildren(parentType: string | null, rootAllowed?: string[]): BlockDefinition[] {
    if (!parentType) {
      return this.all().filter(
        (d) => !d.nestedOnly && !d.parents && (!rootAllowed || rootAllowed.includes(d.type)),
      );
    }
    const allowed = this.get(parentType)?.children;
    if (!allowed) return [];
    if (allowed === "*") return this.allowedChildren(null, rootAllowed);
    return allowed
      .map((t) => this.get(t))
      .filter((d): d is BlockDefinition => !!d && (!d.parents || d.parents.includes(parentType)));
  }

  /** Whether `type` may be a child of `parentType` (null = root). */
  accepts(parentType: string | null, type: string, rootAllowed?: string[]): boolean {
    return this.allowedChildren(parentType, rootAllowed).some((d) => d.type === type);
  }
  create(type: string, props?: Record<string, any>): BaseBlock {
    const def = this.get(type);
    const block: BaseBlock = {
      id: createBlockId(),
      type,
      props: { ...structuredClone(def?.defaultProps ?? {}), ...props },
    };
    if (def?.children) block.children = def.initialChildren?.() ?? [];
    return block;
  }
  clone(): BlockRegistry {
    return new BlockRegistry().register(...this.all());
  }
}

export function defineBlock<P extends Record<string, any>>(
  def: BlockDefinition<P>,
): BlockDefinition<P> {
  return def;
}
