import type { InlineNode } from "./inline"

export type BlockType =
  | "SectionBlock"
  | "ParagraphBlock"
  | "CalloutBlock"
  | "ImageBlock"
  | "ScriptBlock"
  | "SceneBlock"
  | "DialogueBlock"
  | "CodeBlock"
  | (string & {})

export type TimeOfDay = "MORNING" | "NOON" | "AFTERNOON" | "EVENING" | "NIGHT" | "OTHER"
export type Setting = "INTERIOR" | "EXTERIOR" | "OTHER"
export type Transition = "CUT_TO" | "CUT_BACK_TO" | "FADE_TO" | "NONE"

export interface ScriptBlockProps {
  title: string
  synopsis: string
  characters: string[]
  aPlot: string
  bPlot: string
  cPlot: string
  stinger: string
}

export interface SceneBlockProps {
  location: string
  timeOfDay: TimeOfDay
  setting: Setting
  transition: Transition
  description: string
}

export interface DialogueBlockProps {
  character: string
  parenthetical?: string
  line: string
}

export interface BaseBlock {
  /**
   * Unique UUID v4 identifier
   */
  id: string
  type: BlockType

  /**
   * Structural Template Lock: If true, this block is a permanent template anchor and can NEVER be
   * deleted, reordered, or removed.
   */
  isTemplated?: boolean

  /**
   * Property Content Lock: Controls whether block prop content can be edited. - boolean true: ALL
   * properties of this block are locked from editing. - string[]: Specific property keys locked
   * from editing (e.g. ["title", "disclaimer"]).
   */
  templatedProps?: boolean | string[]

  allowedRoles?: string[]
  requiredPermission?: string
  props: Record<string, any>
  children?: BaseBlock[]
}

// ─── Typed block prop interfaces ─────────────────────────────────────────────

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export type CalloutVariant =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "commentary"
  | "ideation"
  | "source"

export interface SectionBlockProps {
  title: string
  description?: string
  level?: HeadingLevel
  mainArticleSlug?: string
  children: BaseBlock[]
}

export interface ParagraphBlockProps {
  /**
   * Stored as an InlineNode array (structured AST). Fallback: { en: string } or plain string.
   */
  text: InlineNode[] | { en: string } | string
}

export interface CalloutBlockProps {
  variant: CalloutVariant
  to?: string
  target?: string
  children: BaseBlock[]
}

export interface ImageBlockProps {
  src: string
  alt: string
  caption?: string
}

export interface CodeBlockProps {
  code: string
  language: string
  caption?: string
}

export interface TypedScriptBlockProps extends ScriptBlockProps {
  children: BaseBlock[]
}

export interface TypedSceneBlockProps extends SceneBlockProps {
  children: BaseBlock[]
}

// ─── Typed block discriminated union ─────────────────────────────────────────

export interface SectionBlock extends BaseBlock {
  type: "SectionBlock"
  props: SectionBlockProps
}

export interface ParagraphBlock extends BaseBlock {
  type: "ParagraphBlock"
  props: ParagraphBlockProps
}

export interface CalloutBlock extends BaseBlock {
  type: "CalloutBlock"
  props: CalloutBlockProps
}

export interface ImageBlock extends BaseBlock {
  type: "ImageBlock"
  props: ImageBlockProps
}

export interface ScriptBlock extends BaseBlock {
  type: "ScriptBlock"
  props: TypedScriptBlockProps
}

export interface SceneBlock extends BaseBlock {
  type: "SceneBlock"
  props: TypedSceneBlockProps
}

export interface DialogueBlock extends BaseBlock {
  type: "DialogueBlock"
  props: DialogueBlockProps
}

export interface CodeBlock extends BaseBlock {
  type: "CodeBlock"
  props: CodeBlockProps
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
