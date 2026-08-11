import { createSignal, onMount, type Component } from "solid-js"

export interface InlineNode {
  type: "text" | "link"
  text?: string
  marks?: string[]
  url?: string
  children?: InlineNode[]
  openInNewTab?: boolean
}

export interface ParagraphEditorProps {
  props: Record<string, any>
  onPropsChange: (newProps: Record<string, any>) => void
}

const renderNodesToHtml = (nodes: InlineNode[]): string => {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        let text = node.text || ""
        text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        if (node.marks) {
          if (node.marks.includes("bold")) text = `<strong>${text}</strong>`
          if (node.marks.includes("italic")) text = `<em>${text}</em>`
          if (node.marks.includes("underline")) text = `<u>${text}</u>`
          if (node.marks.includes("strikethrough")) text = `<s>${text}</s>`
          if (node.marks.includes("code")) text = `<code>${text}</code>`
        }
        return text
      } else if (node.type === "link") {
        const target = node.openInNewTab ? ' target="_blank"' : ""
        return `<a href="${node.url || "#"}"${target}>${renderNodesToHtml(node.children || [])}</a>`
      }
      return ""
    })
    .join("")
}

export const ParagraphEditor: Component<ParagraphEditorProps> = (componentProps) => {
  let editableDiv: HTMLDivElement | null = null as HTMLDivElement | null
  let containerDiv: HTMLDivElement | null = null as HTMLDivElement | null

  const [toolbarVisible, setToolbarVisible] = createSignal(false)

  const parseDOM = (root: Node): InlineNode[] => {
    const nodes: InlineNode[] = []
    root.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent) {
          nodes.push({ type: "text", text: child.textContent })
        }
      } else if (child instanceof HTMLElement) {
        const el = child
        const tagName = el.tagName.toLowerCase()

        if (el instanceof HTMLAnchorElement) {
          const a = el
          nodes.push({
            type: "link",
            url: a.href,
            children: parseDOM(el)
          })
        } else {
          const childNodes = parseDOM(el)
          let mark = ""
          if (["strong", "b"].includes(tagName)) mark = "bold"
          else if (["em", "i"].includes(tagName)) mark = "italic"
          else if (["u"].includes(tagName)) mark = "underline"
          else if (["s", "strike"].includes(tagName)) mark = "strikethrough"
          else if (["code"].includes(tagName)) mark = "code"

          if (mark) {
            childNodes.forEach((n) => {
              if (n.type === "text") {
                n.marks = n.marks || []
                if (!n.marks.includes(mark)) n.marks.push(mark)
              }
            })
          }
          nodes.push(...childNodes)
        }
      }
    })
    return nodes
  }

  const saveProps = () => {
    if (!editableDiv) return
    const parsedNodes = parseDOM(editableDiv)
    componentProps.onPropsChange({
      ...componentProps.props,
      text: parsedNodes
    })
  }

  const execCommand = (cmd: string) => {
    if (cmd === "createLink") {
      const url = prompt("Enter link URL:")
      if (url) document.execCommand(cmd, false, url)
    } else {
      document.execCommand(cmd, false)
    }
    editableDiv?.focus()
  }

  onMount(() => {
    if (!editableDiv) return
    const text = componentProps.props.text
    if (!text) {
      editableDiv.innerHTML = ""
    } else if (Array.isArray(text)) {
      editableDiv.innerHTML = renderNodesToHtml(text)
    } else if (typeof text === "object" && text.en) {
      editableDiv.innerText = text.en
    } else {
      editableDiv.innerText = String(text)
    }

    editableDiv.addEventListener("focus", () => setToolbarVisible(true))
    editableDiv.addEventListener("blur", () => {
      setTimeout(() => {
        if (containerDiv && !containerDiv.contains(document.activeElement)) {
          setToolbarVisible(false)
          saveProps()
        }
      }, 200)
    })
    editableDiv.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "b") {
          e.preventDefault()
          execCommand("bold")
        } else if (e.key === "i") {
          e.preventDefault()
          execCommand("italic")
        } else if (e.key === "u") {
          e.preventDefault()
          execCommand("underline")
        } else if (e.key === "k") {
          e.preventDefault()
          execCommand("createLink")
        }
      }
    })
    editableDiv.addEventListener("paste", (e: ClipboardEvent) => {
      e.preventDefault()
      const clipboardText = e.clipboardData?.getData("text/plain") || ""
      document.execCommand("insertText", false, clipboardText)
    })
  })

  return (
    <div
      ref={(el) => (containerDiv = el)}
      class="rimelight-paragraph-editor border border-transparent rounded-md transition-colors duration-200 w-full"
      classList={{
        "border-gray-600 overflow-hidden": toolbarVisible(),
        "border-transparent": !toolbarVisible()
      }}
    >
      <div
        class="toolbar-div flex items-center gap-1 px-2 py-1 bg-gray-800 border-b border-gray-700 rounded-t-md"
        classList={{ hidden: !toolbarVisible() }}
      >
        <button
          type="button"
          data-cmd="bold"
          onClick={() => execCommand("bold")}
          class="p-1.5 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 cursor-pointer text-xs font-bold"
        >
          B
        </button>
        <button
          type="button"
          data-cmd="italic"
          onClick={() => execCommand("italic")}
          class="p-1.5 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 cursor-pointer text-xs italic"
        >
          I
        </button>
        <button
          type="button"
          data-cmd="underline"
          onClick={() => execCommand("underline")}
          class="p-1.5 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 cursor-pointer text-xs underline"
        >
          U
        </button>
        <div class="w-px h-4 bg-gray-700 mx-1"></div>
        <button
          type="button"
          data-cmd="createLink"
          onClick={() => execCommand("createLink")}
          class="p-1.5 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 cursor-pointer text-xs"
        >
          Link
        </button>
      </div>
      <div
        ref={(el) => (editableDiv = el)}
        aria-label="Paragraph text content"
        contentEditable={true}
        class="editable-div p-3 outline-none min-h-[48px] text-sm text-gray-100 bg-transparent leading-relaxed"
      />
    </div>
  )
}
