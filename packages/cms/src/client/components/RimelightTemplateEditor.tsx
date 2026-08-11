import { createSignal, onMount, onCleanup, For, type Component } from "solid-js"
import type { BaseBlock } from "../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../utils/sortable"

export interface RimelightTemplateEditorProps {
  initialBlocks?: BaseBlock[]
  onChange?: (blocks: BaseBlock[]) => void
  ref?: (el: any) => void
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export const RimelightTemplateEditor: Component<RimelightTemplateEditorProps> = (props) => {
  const [blocks, setBlocks] = createSignal<BaseBlock[]>(
    props.initialBlocks ? JSON.parse(JSON.stringify(props.initialBlocks)) : []
  )
  let selectEl: HTMLSelectElement | undefined
  let canvasContainer: HTMLDivElement | undefined
  let sortableInstance: any = null

  const updateBlocks = (newBlocks: BaseBlock[]) => {
    setBlocks(newBlocks)
    props.onChange?.(newBlocks)
  }

  onMount(() => {
    if (canvasContainer) {
      sortableInstance = initBlockSortable(canvasContainer, {
        onReorder: (oldIdx: number, newIdx: number) => {
          cleanAllSortableClasses()
          const list = [...blocks()]
          const item = list.splice(oldIdx, 1)[0]
          if (item) {
            list.splice(newIdx, 0, item)
            updateBlocks(list)
          }
          requestAnimationFrame(() => cleanAllSortableClasses())
          setTimeout(cleanAllSortableClasses, 50)
          setTimeout(cleanAllSortableClasses, 200)
        }
      })
    }

    const publicMethods = {
      getBlocks: () => JSON.parse(JSON.stringify(blocks())),
      setBlocks: (newBlocks: BaseBlock[]) => updateBlocks(JSON.parse(JSON.stringify(newBlocks)))
    }

    if (props.ref) props.ref(publicMethods)

    onCleanup(() => {
      if (sortableInstance) sortableInstance.destroy()
    })
  })

  const addBlock = (type: string) => {
    let blockProps: Record<string, any> = {}
    if (type === "SectionBlock") {
      blockProps = { title: "Section Heading" }
    } else if (type === "CalloutBlock") {
      blockProps = { text: { en: "Callout note content..." }, variant: "info" }
    } else if (type === "CodeBlock") {
      blockProps = { code: "// Code snippet", language: "typescript" }
    } else if (type === "ImageBlock") {
      blockProps = { src: "https://via.placeholder.com/600x300", alt: "Image description" }
    } else if (type === "ScriptBlock") {
      blockProps = { title: "Scene Script" }
    } else if (type === "SceneBlock") {
      blockProps = { heading: "INT. SCENE - DAY" }
    } else if (type === "DialogueBlock") {
      blockProps = { character: "CHARACTER", text: { en: "Dialogue text..." } }
    } else {
      blockProps = { text: { en: "Paragraph content..." } }
    }

    const newBlock: BaseBlock = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      type,
      isTemplated: false,
      props: blockProps
    }

    updateBlocks([...blocks(), newBlock])
  }

  const deleteBlock = (id: string) => {
    updateBlocks(blocks().filter((b) => b.id !== id))
  }

  const updateBlockItem = (id: string, updater: (b: BaseBlock) => void) => {
    const list: BaseBlock[] = JSON.parse(JSON.stringify(blocks()))
    const target = list.find((b) => b.id === id)
    if (target) {
      updater(target)
      updateBlocks(list)
    }
  }

  return (
    <div class="cms-template-editor border border-gray-300 rounded-lg p-4 bg-gray-950 text-gray-100 space-y-4">
      <div class="flex items-center justify-between bg-gray-900 p-3 rounded border border-gray-800">
        <div>
          <h4 class="text-sm font-semibold text-gray-200">Initial Template Blocks</h4>
          <p class="text-xs text-gray-400">
            Visually design the initial layout and set block locks for pages instantiated from this
            template.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <select
            ref={(el) => (selectEl = el)}
            id="tmpl-block-type-select"
            class="px-2.5 py-1.5 bg-gray-800 border border-gray-700 text-xs rounded text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ParagraphBlock">Paragraph</option>
            <option value="SectionBlock">Section Heading</option>
            <option value="CalloutBlock">Callout Box</option>
            <option value="CodeBlock">Code Snippet</option>
            <option value="ImageBlock">Image</option>
            <option value="ScriptBlock">Script</option>
            <option value="SceneBlock">Scene</option>
            <option value="DialogueBlock">Dialogue</option>
          </select>
          <button
            type="button"
            id="tmpl-add-block-btn"
            onClick={() => addBlock(selectEl?.value || "ParagraphBlock")}
            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-medium rounded text-white cursor-pointer"
          >
            + Add Block
          </button>
        </div>
      </div>

      <div
        ref={(el) => (canvasContainer = el)}
        id="tmpl-block-canvas"
        class="space-y-3 min-h-[120px] p-3 bg-gray-900/50 border border-gray-800 rounded"
      >
        {blocks().length === 0 ? (
          <div class="text-center py-8 text-xs text-gray-500 italic">
            No initial blocks added yet. Use the dropdown above to add initial template blocks.
          </div>
        ) : (
          <For each={blocks()}>
            {(block, index) => {
              const rawText =
                block.props.text || block.props.title || block.props.code || block.props.src || ""
              const textVal = typeof rawText === "object" ? rawText.en || "" : rawText || ""

              return (
                <div
                  data-id={block.id}
                  class="cms-template-block-card bg-gray-900 border border-gray-800 rounded p-3 text-xs space-y-2 relative"
                >
                  <div class="flex items-center justify-between border-b border-gray-800 pb-2">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-gray-300 uppercase">{block.type}</span>
                      <span class="text-[10px] text-gray-500">#{index() + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteBlock(block.id)}
                      class="tmpl-del-btn text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>

                  <div class="flex items-center gap-4 py-1">
                    <label
                      class="flex items-center gap-1.5 cursor-pointer text-gray-300 select-none"
                      title="Permanent anchor: page authors cannot delete or reorder this block"
                    >
                      <input
                        type="checkbox"
                        checked={!!block.isTemplated}
                        onChange={(e) =>
                          updateBlockItem(block.id, (b) => {
                            b.isTemplated = e.currentTarget.checked
                          })
                        }
                        class="tmpl-anchor-chk rounded text-blue-600 focus:ring-0"
                      />
                      <span>📌 Anchor (Permanent)</span>
                    </label>
                    <label
                      class="flex items-center gap-1.5 cursor-pointer text-gray-300 select-none"
                      title="Content lock: page authors cannot edit this block's content"
                    >
                      <input
                        type="checkbox"
                        checked={block.templatedProps === true}
                        onChange={(e) =>
                          updateBlockItem(block.id, (b) => {
                            b.templatedProps = e.currentTarget.checked
                          })
                        }
                        class="tmpl-lock-chk rounded text-blue-600 focus:ring-0"
                      />
                      <span>🔒 Lock Content</span>
                    </label>
                  </div>

                  <div>
                    <label class="block text-[11px] text-gray-400 mb-1">
                      Block Content / Text
                      <input
                        id={`tmpl-content-${block.id}`}
                        type="text"
                        value={escapeHtml(textVal)}
                        onInput={(e) => {
                          const val = e.currentTarget.value
                          updateBlockItem(block.id, (b) => {
                            if (b.type === "SectionBlock") b.props.title = val
                            else if (b.type === "CodeBlock") b.props.code = val
                            else if (b.type === "ImageBlock") b.props.src = val
                            else b.props.text = { en: val }
                          })
                        }}
                        class="tmpl-content-input w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded text-gray-200 text-xs focus:outline-none focus:border-blue-500 mt-1 font-normal"
                        placeholder="Enter default block content..."
                      />
                    </label>
                  </div>
                </div>
              )
            }}
          </For>
        )}
      </div>
    </div>
  )
}
