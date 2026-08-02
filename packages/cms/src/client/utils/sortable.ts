import Sortable from "sortablejs"

export interface SortableOptions {
  onReorder: (oldIndex: number, newIndex: number) => void
  handle?: string
  filter?: string
}

export function initBlockSortable(container: HTMLElement, options: SortableOptions): Sortable {
  return Sortable.create(container, {
    animation: 150,
    handle: options.handle || ".cms-drag-handle",
    filter: options.filter || ".locked", // Templated or read-only blocks filtered out from drag
    onEnd: (evt) => {
      if (
        evt.oldIndex !== undefined &&
        evt.newIndex !== undefined &&
        evt.oldIndex !== evt.newIndex
      ) {
        options.onReorder(evt.oldIndex, evt.newIndex)
      }
    }
  })
}
