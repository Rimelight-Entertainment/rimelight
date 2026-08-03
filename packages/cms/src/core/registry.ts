import type { TimeOfDay, Setting, Transition } from "./types/blocks"

export interface BlockDefinition {
  type: string
  label: string
  description?: string
  defaultProps: Record<string, any>
  allowChildren?: boolean
}

const definitions = new Map<string, BlockDefinition>()

export const BlockRegistry = {
  register(def: BlockDefinition): void {
    definitions.set(def.type, def)
  },

  get(type: string): BlockDefinition | undefined {
    return definitions.get(type)
  },

  getAll(): BlockDefinition[] {
    return Array.from(definitions.values())
  }
}

// Register built-in block types
BlockRegistry.register({
  type: "SectionBlock",
  label: "Section",
  description: "Container block for grouping nested content",
  defaultProps: { title: "" },
  allowChildren: true
})

BlockRegistry.register({
  type: "ParagraphBlock",
  label: "Paragraph",
  description: "Rich text paragraph block",
  defaultProps: { text: { en: "" } }
})

BlockRegistry.register({
  type: "CalloutBlock",
  label: "Callout",
  description: "Highlighted callout box (info, warning, note)",
  defaultProps: { variant: "info", text: { en: "" } }
})

BlockRegistry.register({
  type: "ImageBlock",
  label: "Image",
  description: "Image component with caption and alt text",
  defaultProps: { url: "", alt: "", caption: "" }
})

BlockRegistry.register({
  type: "CodeBlock",
  label: "Code",
  description: "Code block with syntax highlighting",
  defaultProps: { code: "", language: "typescript" }
})

BlockRegistry.register({
  type: "ScriptBlock",
  label: "Script",
  description: "Script block with title, synopsis, characters, and plot tracking",
  defaultProps: {
    title: "",
    synopsis: "",
    characters: [],
    aPlot: "",
    bPlot: "",
    cPlot: "",
    stinger: ""
  },
  allowChildren: true
})

BlockRegistry.register({
  type: "SceneBlock",
  label: "Scene",
  description: "Scene block with location, time, setting, and transition",
  defaultProps: {
    location: "",
    timeOfDay: "OTHER" as TimeOfDay,
    setting: "OTHER" as Setting,
    transition: "NONE" as Transition,
    description: ""
  },
  allowChildren: true
})

BlockRegistry.register({
  type: "DialogueBlock",
  label: "Dialogue",
  description: "Dialogue block with character, parenthetical, and line",
  defaultProps: { character: "", parenthetical: "", line: "" }
})
