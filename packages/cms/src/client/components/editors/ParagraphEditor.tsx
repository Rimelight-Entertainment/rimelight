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

    editableDiv.addEventListener("input", () => {
      saveProps()
    })
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
      saveProps()
    })
  })

  return (
    <div
      ref={(el) => (containerDiv = el)}
      class="rimelight-paragraph-editor flex flex-col w-full relative"
    >
      <div
        class="toolbar-div flex items-center gap-1 px-2 py-1 bg-neutral-100 dark:bg-neutral-800 border border-default border-b-0 rounded-t-lg shadow-sm"
        classList={{ hidden: !toolbarVisible() }}
      >
        <button
          type="button"
          data-cmd="bold"
          onClick={() => execCommand("bold")}
          class="px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer text-xs font-bold"
        >
          B
        </button>
        <button
          type="button"
          data-cmd="italic"
          onClick={() => execCommand("italic")}
          class="px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer text-xs italic font-serif"
        >
          I
        </button>
        <button
          type="button"
          data-cmd="underline"
          onClick={() => execCommand("underline")}
          class="px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer text-xs underline"
        >
          U
        </button>
        <div class="w-px h-3.5 bg-neutral-300 dark:bg-neutral-700 mx-1"></div>
        <button
          type="button"
          data-cmd="createLink"
          onClick={() => execCommand("createLink")}
          class="px-2 py-0.5 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer text-xs"
        >
          Link
        </button>
      </div>
      <div
        ref={(el) => (editableDiv = el)}
        aria-label="Paragraph text content"
        contentEditable={true}
        class="editable-div p-3 outline-none min-h-[4rem] text-sm text-foreground bg-white dark:bg-neutral-900 border border-default leading-relaxed focus:ring-2 focus:ring-primary shadow-sm"
        classList={{
          "rounded-b-lg": toolbarVisible(),
          "rounded-lg": !toolbarVisible()
        }}
      />
    </div>
  )
}
