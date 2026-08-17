import { createSignal, onMount, onCleanup, For, type Component } from "solid-js"

const BLOCK_DEFS = [
  {
    group: "Text",
    type: "ParagraphBlock",
    label: "Paragraph",
    desc: "Rich text paragraph",
    icon: "¶"
  },
  {
    group: "Text",
    type: "SectionBlock",
    label: "Section",
    desc: "Collapsible section with heading",
    icon: "§"
  },
  {
    group: "Media",
    type: "ImageBlock",
    label: "Image",
    desc: "Embed an image with caption",
    icon: "🖼"
  },
  {
    group: "Media",
    type: "CodeBlock",
    label: "Code",
    desc: "Code block with syntax highlighting",
    icon: "</>"
  },
  {
    group: "Callout",
    type: "CalloutBlock",
    label: "Callout",
    desc: "Highlighted info/warning/note box",
    icon: "⚡"
  },
  {
    group: "Screenplay",
    type: "ScriptBlock",
    label: "Script",
    desc: "Script container with plot tracking",
    icon: "📄"
  },
  {
    group: "Screenplay",
    type: "SceneBlock",
    label: "Scene",
    desc: "Scene with location and time-of-day",
    icon: "🎬"
  },
  {
    group: "Screenplay",
    type: "DialogueBlock",
    label: "Dialogue",
    desc: "Character dialogue line",
    icon: "💬"
  }
]

import { ALLOWED_CHILDREN_MAP } from "../../core/types/blocks"
export { ALLOWED_CHILDREN_MAP }

export interface RimelightBlockPickerProps {
  open: boolean
  sectionDepth?: number | undefined
  containerType?: string | null | undefined
  onSelect: (type: string) => void
  onClose: () => void
}

export const RimelightBlockPicker: Component<RimelightBlockPickerProps> = (props) => {
  let searchInput: HTMLInputElement | undefined = undefined
  const [query, setQuery] = createSignal("")
  const [selectedIndex, setSelectedIndex] = createSignal(0)

  const allowedTypes = (): string[] => {
    const parent = props.containerType || "Root"
    return ALLOWED_CHILDREN_MAP[parent] || ALLOWED_CHILDREN_MAP.Root || []
  }

  const filteredBlocks = () => {
    const q = query().toLowerCase()
    const depth = props.sectionDepth || 0
    const allowed = allowedTypes()

    return BLOCK_DEFS.filter((b) => {
      if (!allowed.includes(b.type)) return false
      if (b.type === "SectionBlock" && depth >= 6) return false
      return (
        b.label.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q) ||
        b.desc.toLowerCase().includes(q) ||
        b.group.toLowerCase().includes(q)
      )
    })
  }

  onMount(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (props.open && e.key === "Escape") {
        props.onClose()
      }
    }
    document.addEventListener("keydown", handleGlobalKeydown)
    onCleanup(() => document.removeEventListener("keydown", handleGlobalKeydown))
  })

  const handleKeydown = (e: KeyboardEvent) => {
    const list = filteredBlocks()
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, Math.max(0, list.length - 1)))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const selected = list[selectedIndex()]
      if (selected) {
        props.onSelect(selected.type)
      }
    }
  }

  return (
    <div classList={{ hidden: !props.open }}>
      <div
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) props.onClose()
        }}
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div class="text-sm font-semibold text-gray-100">
              Add Block{" "}
              {props.containerType ? `to ${props.containerType.replace("Block", "")}` : ""}
            </div>
          </div>

          <input
            ref={(el) => {
              searchInput = el
              if (props.open) setTimeout(() => searchInput?.focus(), 10)
            }}
            type="text"
            value={query()}
            onInput={(e) => {
              setQuery(e.currentTarget.value)
              setSelectedIndex(0)
            }}
            onKeyDown={handleKeydown}
            placeholder="Search blocks..."
            class="w-[calc(100%-2rem)] bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 mx-4 my-3"
          />

          <div class="overflow-y-auto max-h-[50vh] pb-2">
            {filteredBlocks().length === 0 ? (
              <div class="text-center py-4 text-gray-500 text-sm">No compatible blocks found</div>
            ) : (
              (() => {
                let currentGroup = ""
                return (
                  <For each={filteredBlocks()}>
                    {(block, index) => {
                      const showHeader = block.group !== currentGroup
                      if (showHeader) currentGroup = block.group
                      const isSelected = index() === selectedIndex()

                      return (
                        <>
                          {showHeader && (
                            <div class="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 py-1 mt-2">
                              {block.group}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              props.onSelect(block.type)
                            }}
                            onMouseEnter={() => setSelectedIndex(index())}
                            class="cms-picker-item flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-gray-800 w-full text-left bg-transparent border-none"
                            classList={{ "bg-gray-800": isSelected }}
                          >
                            <div class="text-xl w-8 h-8 flex items-center justify-center shrink-0 bg-gray-800 rounded text-gray-300">
                              {block.icon}
                            </div>
                            <div class="flex flex-col flex-1">
                              <div class="flex items-center justify-between">
                                <span class="text-sm font-medium text-gray-200">{block.label}</span>
                                <span class="text-[10px] font-mono text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">
                                  {block.type}
                                </span>
                              </div>
                              <span class="text-xs text-gray-500 mt-0.5">{block.desc}</span>
                            </div>
                          </button>
                        </>
                      )
                    }}
                  </For>
                )
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
