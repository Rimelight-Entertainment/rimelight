import type { BaseBlock } from "../../core/types/blocks"

export class HistoryStack {
  private undoStack: BaseBlock[][] = []
  private redoStack: BaseBlock[][] = []
  private debounceTimer: number | null = null
  private maxDepth: number

  constructor(initialBlocks: BaseBlock[] = [], maxDepth = 50) {
    this.maxDepth = maxDepth
    this.undoStack.push(JSON.parse(JSON.stringify(initialBlocks)))
  }

  push(blocks: BaseBlock[], immediate = false): void {
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

  canUndo(): boolean {
    return this.undoStack.length > 1
  }

  canRedo(): boolean {
    return this.redoStack.length > 0
  }
}
