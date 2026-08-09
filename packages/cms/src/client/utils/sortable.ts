import Sortable from "sortablejs"

export interface SortableOptions {
  onReorder: (oldIndex: number, newIndex: number) => void
  onAdd?: (blockId: string, newIndex: number, fromContainerId?: string) => void
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
      put: true
    },
    animation: 150,
    handle: options.handle || ".cms-drag-handle, .cms-grip-btn",
    filter: options.filter || ".locked", // Templated or read-only blocks filtered out from drag
    forceFallback: true,
    fallbackClass: "cms-sortable-drag",
    ghostClass: "cms-sortable-ghost",
    chosenClass: "cms-sortable-chosen",
    fallbackOnBody: true,
    swapThreshold: 0.65,
    emptyInsertThreshold: 10,
    onEnd: (evt) => {
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
        const fromContainer = evt.from.closest("[data-block-id]")
        options.onAdd(blockId, evt.newIndex, fromContainer?.dataset.blockId)
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
