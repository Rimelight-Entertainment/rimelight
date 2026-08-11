import type { BaseBlock } from "../../core/types/blocks"

export class HistoryStack {
  private undoStack: BaseBlock[][] = []
  private redoStack: BaseBlock[][] = []
  private debounceTimer: number | null = null
  private maxDepth: number
  private paused = false

  constructor(initialBlocks: BaseBlock[] = [], maxDepth = 100) {
    this.maxDepth = maxDepth
    this.undoStack.push(JSON.parse(JSON.stringify(initialBlocks)))
  }

  push(blocks: BaseBlock[], immediate = false): void {
    if (this.paused) return
    const clone = JSON.parse(JSON.stringify(blocks))

    if (immediate) {
      this.doPush(clone)
      return
    }

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = window.setTimeout(() => {
      this.doPush(clone)
      this.debounceTimer = null
    }, 500)
  }

  private doPush(snapshot: BaseBlock[]): void {
    if (this.undoStack.length >= this.maxDepth) {
      this.undoStack.shift()
    }
    this.undoStack.push(snapshot)
    this.redoStack = []
  }

  undo(): BaseBlock[] | null {
    if (this.undoStack.length <= 1) return null
    const current = this.undoStack.pop()!
    this.redoStack.push(current)
    const previous = this.undoStack[this.undoStack.length - 1]
    return JSON.parse(JSON.stringify(previous))
  }

  redo(): BaseBlock[] | null {
    if (this.redoStack.length === 0) return null
    const next = this.redoStack.pop()!
    this.undoStack.push(next)
    return JSON.parse(JSON.stringify(next))
  }

  /**
   * Suppress snapshot captures (e.g. during programmatic block loads)
   */
  pause(): void {
    this.paused = true
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }

  /**
   * Resume snapshot captures
   */
  resume(): void {
    this.paused = false
  }

  /**
   * Returns an immutable deep-clone of the current state for persistence
   */
  commit(blocks: BaseBlock[]): BaseBlock[] {
    return JSON.parse(JSON.stringify(blocks))
  }

  canUndo(): boolean {
    return this.undoStack.length > 1
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }

  reset(blocks: BaseBlock[]): void {
    this.undoStack = [JSON.parse(JSON.stringify(blocks))]
    this.redoStack = []
    this.paused = false
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }
  }
}

// ─── Default block factory (shared across all editors) ────────────────────────

export function createDefaultBlock(type: string): BaseBlock {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 11)

  switch (type) {
    case "SectionBlock":
      return {
        id,
        type,
        children: [],
        props: { level: 2, title: "New Section", description: "", children: [] }
      }
    case "ParagraphBlock":
      return { id, type, props: { text: [] } }
    case "CalloutBlock":
      return { id, type, children: [], props: { variant: "info", children: [] } }
    case "ImageBlock":
      return { id, type, props: { src: "", alt: "", caption: "" } }
    case "ScriptBlock":
      return {
        id,
        type,
        children: [],
        props: {
          title: "New Script",
          synopsis: "",
          characters: [],
          aPlot: "",
          bPlot: "",
          cPlot: "",
          stinger: "",
          children: []
        }
      }
    case "SceneBlock":
      return {
        id,
        type,
        children: [],
        props: {
          location: "",
          timeOfDay: "OTHER",
          setting: "OTHER",
          transition: "NONE",
          description: "",
          children: []
        }
      }
    case "DialogueBlock":
      return { id, type, props: { character: "", parenthetical: "", line: "" } }
    case "CodeBlock":
      return { id, type, props: { code: "", language: "typescript", caption: "" } }
    default:
      return { id, type, props: { text: [] } }
  }
}
