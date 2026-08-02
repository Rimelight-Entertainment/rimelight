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
