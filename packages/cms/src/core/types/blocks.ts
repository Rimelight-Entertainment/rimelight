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
