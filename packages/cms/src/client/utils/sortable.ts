import Sortable from "sortablejs"

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
  return Sortable.create(container, {
    group: {
      name: options.group || "cms-blocks",
      pull: true,
      put: (to, _from, dragEl) => {
        // Prevent a container block from being dropped into itself or its own descendants
        if (dragEl.contains(to.el)) return false
        return true
      }
    },
    animation: 150,
    handle: options.handle || ".cms-drag-handle, .cms-grip-btn",
    filter: options.filter || ".locked", // Templated or read-only blocks filtered out from drag
    forceFallback: false,
    ghostClass: "cms-sortable-ghost",
    chosenClass: "cms-sortable-chosen",
    swapThreshold: 0.65,
    emptyInsertThreshold: 50,
    onEnd: (evt) => {
      document.querySelectorAll(".cms-sortable-drag").forEach((el) => el.remove())
      if (
        evt.from === evt.to &&
        evt.oldIndex !== undefined &&
        evt.newIndex !== undefined &&
        evt.oldIndex !== evt.newIndex
      ) {
        options.onReorder(evt.oldIndex, evt.newIndex)
      }
    },
    onAdd: (evt) => {
      const itemEl = evt.item
      const blockId = itemEl.dataset.id || itemEl.getAttribute("data-id")
      if (blockId && evt.newIndex !== undefined && options.onAdd) {
        const target = evt.from.closest("[data-block-id]")
        const containerBlockId = target instanceof HTMLElement ? target.dataset.blockId : undefined
        options.onAdd(blockId, evt.newIndex, containerBlockId, itemEl)
      }
    },
    onRemove: (evt) => {
      const itemEl = evt.item
      const blockId = itemEl.dataset.id || itemEl.getAttribute("data-id")
      if (blockId && evt.oldIndex !== undefined && options.onRemove) {
        options.onRemove(blockId, evt.oldIndex)
      }
    }
  })
}
