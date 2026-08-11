import { createSignal } from "solid-js"
import { createStore, reconcile } from "solid-js/store"
import type { BaseBlock } from "../../core/types/blocks"
import { HistoryStack, createDefaultBlock } from "./history"
import { AutosaveController, type AutosaveStatus } from "./autosave"
import { sanitizeBlockTree } from "../utils/tree-sanitizer"

const cloneBlocks = (b: BaseBlock[]): BaseBlock[] => JSON.parse(JSON.stringify(b))

export function createEditorState(
  initialBlocks: BaseBlock[] = [],
  pageId: string = "default-page"
) {
  const [blocks, setBlocksStore] = createStore<BaseBlock[]>(
    JSON.parse(JSON.stringify(initialBlocks))
  )
  const [status, setStatus] = createSignal<AutosaveStatus>("saved")
  const [previewVisible, setPreviewVisible] = createSignal<boolean>(false)
  const [pickerTarget, setPickerTarget] = createSignal<{
    open: boolean
    targetId: string | null
    position: "before" | "after"
    sectionDepth: number
    parentId?: string | null
  }>({
    open: false,
    targetId: null,
    position: "after",
    sectionDepth: 0,
    parentId: null
  })

  let historyStack = new HistoryStack(initialBlocks)
  let autosaveController = new AutosaveController({
    pageId,
    onStatusChange: (newStatus: AutosaveStatus) => {
      setStatus(newStatus)
    }
  })

  const notifyChange = (immediate = false) => {
    const rawBlocks = sanitizeBlockTree(JSON.parse(JSON.stringify(blocks)))
    historyStack.push(rawBlocks, immediate)
    if (immediate) {
      void autosaveController.saveImmediate({ blocks: rawBlocks })
    } else {
      autosaveController.notifyChange({ blocks: rawBlocks })
    }
  }

  const setBlocks = (newBlocks: BaseBlock[]) => {
    historyStack.pause()
    setBlocksStore(reconcile(JSON.parse(JSON.stringify(newBlocks))))
    historyStack = new HistoryStack(newBlocks)
    historyStack.resume()
    notifyChange(true)
  }

  const updateBlockProps = (id: string, newProps: Record<string, any>) => {
    const updated = cloneBlocks(blocks)
    const findAndUpdate = (list: BaseBlock[]): boolean => {
      for (const item of list) {
        if (!item) continue
        if (item.id === id) {
          item.props = { ...item.props, ...newProps }
          if (newProps.children !== undefined) {
            item.children = newProps.children
            item.props.children = newProps.children
          }
          return true
        }
        const childrenList = item.children || item.props?.children
        if (childrenList && findAndUpdate(childrenList)) {
          return true
        }
      }
      return false
    }
    if (findAndUpdate(updated)) {
      setBlocksStore(reconcile(updated))
      notifyChange()
    }
  }

  const undo = () => {
    const prev = historyStack.undo()
    if (prev) {
      setBlocksStore(reconcile(prev))
      autosaveController.notifyChange({ blocks: prev })
    }
  }

  const redo = () => {
    const next = historyStack.redo()
    if (next) {
      setBlocksStore(reconcile(next))
      autosaveController.notifyChange({ blocks: next })
    }
  }

  const deleteBlock = (id: string) => {
    const removeFromList = (list: BaseBlock[]): BaseBlock[] => {
      return list.filter((b) => {
        if (b.id === id) return false
        if (b.children) {
          b.children = removeFromList(b.children)
        }
        if (b.props?.children) {
          b.props.children = removeFromList(b.props.children)
        }
        return true
      })
    }
    const updated = removeFromList(JSON.parse(JSON.stringify(blocks)))
    setBlocksStore(reconcile(updated))
    notifyChange(true)
  }

  const moveBlock = (id: string, direction: -1 | 1) => {
    const updated = cloneBlocks(blocks)
    const findAndMove = (list: BaseBlock[]): boolean => {
      const idx = list.findIndex((b) => b.id === id)
      const newIdx = idx + direction
      if (idx !== -1 && newIdx >= 0 && newIdx < list.length) {
        const item = list.splice(idx, 1)[0]
        if (item) {
          list.splice(newIdx, 0, item)
          return true
        }
      }
      for (const item of list) {
        const children = item.children || item.props?.children
        if (children && findAndMove(children)) {
          item.children = children
          item.props.children = children
          return true
        }
      }
      return false
    }
    findAndMove(updated)
    setBlocksStore(reconcile(updated))
    notifyChange(true)
  }

  const duplicateBlock = (id: string) => {
    const updated = cloneBlocks(blocks)
    const findAndDup = (list: BaseBlock[]): boolean => {
      const idx = list.findIndex((b) => b.id === id)
      if (idx !== -1) {
        const clone: BaseBlock = JSON.parse(JSON.stringify(list[idx]))
        clone.id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : Math.random().toString(36).slice(2)
        list.splice(idx + 1, 0, clone)
        return true
      }
      for (const item of list) {
        const children = item.children || item.props?.children
        if (children && findAndDup(children)) {
          item.children = children
          item.props.children = children
          return true
        }
      }
      return false
    }
    findAndDup(updated)
    setBlocksStore(reconcile(updated))
    notifyChange(true)
  }

  const insertBlock = (
    type: string,
    targetId: string | null = null,
    position: "before" | "after" = "after",
    parentId: string | null = null
  ) => {
    const newBlock = createDefaultBlock(type)
    const updated = cloneBlocks(blocks)

    const insertIntoList = (list: BaseBlock[]): boolean => {
      if (targetId) {
        const idx = list.findIndex((b) => b.id === targetId)
        if (idx !== -1) {
          list.splice(position === "after" ? idx + 1 : idx, 0, newBlock)
          return true
        }
      }
      if (parentId) {
        for (const item of list) {
          if (item.id === parentId) {
            const children = item.children || item.props?.children || []
            if (position === "after") {
              children.push(newBlock)
            } else {
              children.unshift(newBlock)
            }
            item.children = children
            item.props.children = children
            return true
          }
        }
      }
      for (const item of list) {
        const children = item.children || item.props?.children
        if (children && insertIntoList(children)) {
          item.children = children
          item.props.children = children
          return true
        }
      }
      return false
    }

    if (!targetId && !parentId) {
      updated.push(newBlock)
    } else {
      const inserted = insertIntoList(updated)
      if (!inserted) updated.push(newBlock)
    }

    setBlocksStore(reconcile(updated))
    notifyChange(true)
  }

  const openPicker = (
    targetId: string | null = null,
    position: "before" | "after" = "after",
    sectionDepth = 0,
    parentId: string | null = null
  ) => {
    setPickerTarget({ open: true, targetId, position, sectionDepth, parentId })
  }

  const closePicker = () => {
    setPickerTarget((prev) => ({ ...prev, open: false }))
  }

  const relocateBlock = (id: string, newIndex: number, targetParentId?: string | null) => {
    const updated = cloneBlocks(blocks)
    let extractedBlock: BaseBlock | null = null

    const remove = (list: BaseBlock[]): BaseBlock[] => {
      return list.filter((b) => {
        if (b.id === id) {
          extractedBlock = b
          return false
        }
        if (b.children) {
          b.children = remove(b.children)
          if (b.props) b.props.children = b.children
        } else if (b.props?.children) {
          b.props.children = remove(b.props.children)
          b.children = b.props.children
        }
        return true
      })
    }

    const cleanedTree = remove(updated)
    if (!extractedBlock) return

    if (!targetParentId) {
      const idx = Math.min(Math.max(0, newIndex), cleanedTree.length)
      cleanedTree.splice(idx, 0, extractedBlock)
    } else {
      const insertIntoTarget = (list: BaseBlock[]): boolean => {
        for (const item of list) {
          if (item.id === targetParentId) {
            const children = item.children || item.props?.children || []
            const idx = Math.min(Math.max(0, newIndex), children.length)
            children.splice(idx, 0, extractedBlock!)
            item.children = children
            item.props.children = children
            return true
          }
          const sub = item.children || item.props?.children
          if (sub && insertIntoTarget(sub)) return true
        }
        return false
      }
      if (!insertIntoTarget(cleanedTree)) {
        const idx = Math.min(Math.max(0, newIndex), cleanedTree.length)
        cleanedTree.splice(idx, 0, extractedBlock)
      }
    }

    setBlocksStore(reconcile(cleanedTree))
    notifyChange(true)
  }

  const saveDraft = () => {
    autosaveController.notifyChange({ blocks: JSON.parse(JSON.stringify(blocks)) })
  }

  return {
    blocks,
    status,
    previewVisible,
    setPreviewVisible,
    pickerTarget,
    setBlocks,
    updateBlockProps,
    undo,
    redo,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    insertBlock,
    relocateBlock,
    openPicker,
    closePicker,
    saveDraft
  }
}

export type EditorState = ReturnType<typeof createEditorState>
