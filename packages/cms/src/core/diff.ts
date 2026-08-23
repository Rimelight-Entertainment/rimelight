import type { BaseBlock } from "./types/blocks"

export type DiffChangeType = "added" | "removed" | "modified" | "unchanged"

export interface BlockDiff {
  blockId: string
  type: string
  status: DiffChangeType
  oldBlock?: BaseBlock
  newBlock?: BaseBlock
  fieldChanges?: {
    field: string
    oldValue: any
    newValue: any
  }[]
}

export interface PageVersionDiff {
  blocks: BlockDiff[]
  metaChanges: {
    field: string
    oldValue: any
    newValue: any
  }[]
  summary: {
    addedCount: number
    removedCount: number
    modifiedCount: number
    unchangedCount: number
  }
}

/**
 * Calculates a detailed diff between an old list of blocks and a new list of blocks.
 */
export function diffBlocks(oldBlocks: BaseBlock[] = [], newBlocks: BaseBlock[] = []): BlockDiff[] {
  const diffs: BlockDiff[] = []
  const oldMap = new Map<string, { block: BaseBlock; index: number }>()
  const newMap = new Map<string, { block: BaseBlock; index: number }>()

  oldBlocks.forEach((block, index) => {
    oldMap.set(block.id, { block, index })
  })

  newBlocks.forEach((block, index) => {
    newMap.set(block.id, { block, index })
  })

  // Check new blocks (added or modified/unchanged)
  for (const newBlock of newBlocks) {
    const oldEntry = oldMap.get(newBlock.id)

    if (!oldEntry) {
      diffs.push({
        blockId: newBlock.id,
        type: newBlock.type,
        status: "added",
        newBlock
      })
    } else {
      const oldBlock = oldEntry.block
      const fieldChanges: { field: string; oldValue: any; newValue: any }[] = []

      const oldProps = (oldBlock as any).props || (oldBlock as any).properties || {}
      const newProps = (newBlock as any).props || (newBlock as any).properties || {}

      // Compare properties
      const allPropKeys = new Set([...Object.keys(oldProps), ...Object.keys(newProps)])

      for (const key of allPropKeys) {
        const oldVal = oldProps[key]
        const newVal = newProps[key]
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          fieldChanges.push({ field: `props.${key}`, oldValue: oldVal, newValue: newVal })
        }
      }

      if (fieldChanges.length > 0) {
        diffs.push({
          blockId: newBlock.id,
          type: newBlock.type,
          status: "modified",
          oldBlock,
          newBlock,
          fieldChanges
        })
      } else {
        diffs.push({
          blockId: newBlock.id,
          type: newBlock.type,
          status: "unchanged",
          oldBlock,
          newBlock
        })
      }
    }
  }

  // Check for removed blocks
  for (const oldBlock of oldBlocks) {
    if (!newMap.has(oldBlock.id)) {
      diffs.push({
        blockId: oldBlock.id,
        type: oldBlock.type,
        status: "removed",
        oldBlock
      })
    }
  }

  return diffs
}

/**
 * Compares two page snapshots (metadata + content blocks).
 */
export function diffPageSnapshots(oldSnapshot: any, newSnapshot: any): PageVersionDiff {
  const oldBlocks = oldSnapshot?.content?.blocks || []
  const newBlocks = newSnapshot?.content?.blocks || []
  const blockDiffs = diffBlocks(oldBlocks, newBlocks)

  const metaFields = ["title", "slug", "description", "tags", "type", "authorIds", "bylines"]
  const metaChanges: { field: string; oldValue: any; newValue: any }[] = []

  for (const field of metaFields) {
    const oldVal = oldSnapshot?.[field]
    const newVal = newSnapshot?.[field]
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      metaChanges.push({ field, oldValue: oldVal, newValue: newVal })
    }
  }

  const summary = {
    addedCount: blockDiffs.filter((d) => d.status === "added").length,
    removedCount: blockDiffs.filter((d) => d.status === "removed").length,
    modifiedCount: blockDiffs.filter((d) => d.status === "modified").length,
    unchangedCount: blockDiffs.filter((d) => d.status === "unchanged").length
  }

  return {
    blocks: blockDiffs,
    metaChanges,
    summary
  }
}
