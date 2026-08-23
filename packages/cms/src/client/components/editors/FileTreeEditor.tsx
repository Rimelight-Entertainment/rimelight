import { onMount, type Component } from "solid-js"
import type { FileTreeNode } from "../../../core/types/blocks"

export interface FileTreeEditorProps {
  props: Record<string, any>
  onPropsChange: (newProps: Record<string, any>) => void
}

export const FileTreeEditor: Component<FileTreeEditorProps> = (componentProps) => {
  let jsonTextarea: HTMLTextAreaElement | undefined

  const tree = (): FileTreeNode[] =>
    componentProps.props.tree || [
      { name: "src", isDir: true, children: [{ name: "index.ts", isDir: false }] },
      { name: "package.json", isDir: false }
    ]

  const autoResize = () => {
    if (jsonTextarea) {
      jsonTextarea.style.height = "auto"
      jsonTextarea.style.height = `${jsonTextarea.scrollHeight + 2}px`
    }
  }

  onMount(() => {
    if (jsonTextarea) {
      jsonTextarea.value = JSON.stringify(tree(), null, 2)
      autoResize()
    }
  })

  const saveJson = (val: string) => {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) {
        componentProps.onPropsChange({
          ...componentProps.props,
          tree: parsed
        })
      }
    } catch {
      // Ignore invalid JSON on intermediate typing
    }
  }

  return (
    <div class="rimelight-file-tree-editor flex flex-col gap-2 p-3 rounded-xl border border-default w-full">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-muted">File Tree JSON</span>
        <span class="text-xs text-muted italic">
          Format: Array of {`{ name, isDir, comment, children }`}
        </span>
      </div>
      <textarea
        ref={(el) => (jsonTextarea = el)}
        class="w-full bg-neutral-950/80 border border-default rounded-lg p-2.5 text-xs text-amber-400 font-mono resize-none outline-none focus:border-primary min-h-[100px] leading-relaxed"
        spellcheck={false}
        onInput={autoResize}
        onBlur={(e) => saveJson(e.currentTarget.value)}
      />
    </div>
  )
}
