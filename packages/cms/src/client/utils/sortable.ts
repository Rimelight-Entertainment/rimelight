import Sortable from "sortablejs"

const sortableProto: Record<string, any> | undefined = Sortable?.prototype

if (typeof window !== "undefined" && sortableProto && !sortableProto.patchedParentNodeGuard) {
  sortableProto.patchedParentNodeGuard = true
  const originalOnDragOver = sortableProto["_onDragOver"]
  if (typeof originalOnDragOver === "function") {
    sortableProto["_onDragOver"] = function (evt: Event) {
      if (evt && evt.target instanceof Element) {
        const el = evt.target
        if (typeof document !== "undefined" && !document.contains(el)) {
          return
        }
      }
      try {
        originalOnDragOver.call(this, evt)
      } catch (err: unknown) {
        if (
          err instanceof TypeError ||
          (err instanceof Error && err.message.includes("parentNode"))
        ) {
          return
        }
        throw err
      }
    }
  }
}

export interface SortableOptions {
  onReorder: (oldIndex: number, newIndex: number) => void
  onAdd?: (
    blockId: string,
    newIndex: number,
    fromContainerId?: string,
    itemEl?: HTMLElement
  ) => void
  onRemove?: (blockId: string, oldIndex: number) => void
  handle?: string
  filter?: string
  group?: string
}

export function initBlockSortable(container: HTMLElement, options: SortableOptions): Sortable {
  const runCleanup = (specificItem?: HTMLElement | Element) => {
    const doClean = () => cleanAllSortableClasses()
    cleanAllSortableClasses(specificItem)
    doClean()
    requestAnimationFrame(doClean)
    setTimeout(doClean, 50)
    setTimeout(doClean, 150)
    setTimeout(doClean, 300)
    setTimeout(doClean, 600)
  }

  return Sortable.create(container, {
    group: {
      name: options.group || "cms-blocks",
      pull: true,
      put: (to, _from, dragEl) => {
        if (!to || !to.el || !dragEl) return false
        // Prevent a container block from being dropped into itself or its own descendants
        if (dragEl === to.el || dragEl.contains(to.el)) return false
        return true
      }
    },
    animation: 150,
    handle: options.handle || ".cms-drag-handle, .cms-grip-btn",
    filter: options.filter || ".locked", // Templated or read-only blocks filtered out from drag
    forceFallback: false,
    fallbackOnBody: false,
    fallbackTolerance: 3,
    ghostClass: "cms-sortable-ghost",
    chosenClass: "cms-sortable-chosen",
    dragClass: "cms-sortable-drag",
    swapThreshold: 0.65,
    emptyInsertThreshold: 50,
    onStart: () => {},
    onUnchoose: () => {
      runCleanup()
    },
    onSpill: () => {
      runCleanup()
    },
    onEnd: (evt) => {
      runCleanup(evt.item)

      if (
        evt.from === evt.to &&
        evt.oldIndex !== undefined &&
        evt.newIndex !== undefined &&
        evt.oldIndex !== evt.newIndex
      ) {
        const oldIdx = evt.oldIndex
        const newIdx = evt.newIndex
        // Remove SortableJS-placed node; SolidJS will re-render from state
        evt.item.parentNode?.removeChild(evt.item)
        requestAnimationFrame(() => {
          options.onReorder(oldIdx, newIdx)
          runCleanup(evt.item)
        })
      } else {
        requestAnimationFrame(() => {
          runCleanup(evt.item)
        })
      }
    },
    onAdd: (evt) => {
      runCleanup(evt.item)
      const itemEl = evt.item
      const blockId = itemEl.dataset.id || itemEl.getAttribute("data-id")
      if (blockId && evt.newIndex !== undefined && options.onAdd) {
        const target = evt.from.closest("[data-block-id]")
        const containerBlockId = target instanceof HTMLElement ? target.dataset.blockId : undefined
        // Remove the physically-moved DOM node before calling the callback.
        // The reactive framework (SolidJS) will re-render the authoritative element
        // from state, so leaving the SortableJS-placed node causes a visual duplicate.
        itemEl.parentNode?.removeChild(itemEl)
        options.onAdd(blockId, evt.newIndex, containerBlockId, itemEl)
      }
    },
    onRemove: (evt) => {
      runCleanup(evt.item)
      const itemEl = evt.item
      const blockId = itemEl.dataset.id || itemEl.getAttribute("data-id")
      if (blockId && evt.oldIndex !== undefined && options.onRemove) {
        options.onRemove(blockId, evt.oldIndex)
      }
    }
  })
}

function cleanElement(el: Element) {
  if (el instanceof HTMLElement) {
    el.classList.remove(
      "cms-sortable-ghost",
      "cms-sortable-chosen",
      "cms-sortable-drag",
      "sortable-fallback"
    )
    el.style.pointerEvents = ""
    el.style.opacity = ""
    el.style.transform = ""
    el.style.boxShadow = ""
    el.style.borderColor = ""
    el.style.backgroundColor = ""
  }
}

export function cleanAllSortableClasses(specificItem?: HTMLElement | Element) {
  if (specificItem) {
    cleanElement(specificItem)
    specificItem.querySelectorAll("*").forEach(cleanElement)
  }

  if (typeof document !== "undefined") {
    document
      .querySelectorAll(
        ".cms-sortable-ghost, .cms-sortable-chosen, .cms-sortable-drag, .sortable-fallback"
      )
      .forEach((el) => {
        cleanElement(el)
        el.querySelectorAll("*").forEach(cleanElement)
      })
  }
}

const customWin: Record<string, any> | null = typeof window !== "undefined" ? window : null
if (customWin && !customWin.cmsSortableGlobalListenersAttached) {
  customWin.cmsSortableGlobalListenersAttached = true
  const globalClean = () => {
    const doClean = () => cleanAllSortableClasses()
    doClean()
    setTimeout(doClean, 50)
    setTimeout(doClean, 150)
    setTimeout(doClean, 300)
  }
  customWin.addEventListener("mouseup", globalClean, { capture: true })
  customWin.addEventListener("pointerup", globalClean, { capture: true })
  customWin.addEventListener("touchend", globalClean, { capture: true })
  customWin.addEventListener("dragend", globalClean, { capture: true })
  customWin.addEventListener("drop", globalClean, { capture: true })
}
