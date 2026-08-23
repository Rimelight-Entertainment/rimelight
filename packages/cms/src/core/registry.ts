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
  type: "ComponentShowcaseBlock",
  label: "Component Showcase",
  description: "Live component rendering with props injection and multi-framework code examples",
  defaultProps: {
    componentName: "",
    componentPath: "",
    framework: "astro",
    defaultProps: {},
    propsConfig: {},
    togglingPattern: "tab-segmented",
    codeExamples: {}
  },
  allowChildren: true
})

BlockRegistry.register({
  type: "ApiDocumentationBlock",
  label: "API Documentation",
  description:
    "Automated API documentation generation for component props, slots, emits, and theme",
  defaultProps: {
    componentName: "",
    sections: {
      props: true,
      slots: true,
      emits: true,
      theme: true,
      changelog: false
    },
    hide: [],
    show: []
  }
})

BlockRegistry.register({
  type: "LivePreviewBlock",
  label: "Live Preview",
  description: "Runtime code execution with live editing and error handling",
  defaultProps: {
    componentCode: "",
    framework: "astro",
    height: "300px",
    width: "100%",
    editable: false
  }
})
