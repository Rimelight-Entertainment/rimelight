import { onMount, For, type Component } from "solid-js"

export interface CodeEditorProps {
  props: Record<string, any>
  onPropsChange: (newProps: Record<string, any>) => void
}

const LANGUAGES = [
  "typescript",
  "javascript",
  "python",
  "bash",
  "html",
  "css",
  "json",
  "markdown",
  "sql",
  "rust",
  "go",
  "c",
  "cpp",
  "other"
]

export const CodeEditor: Component<CodeEditorProps> = (componentProps) => {
  let languageSelect: HTMLSelectElement | undefined
  let codeTextarea: HTMLTextAreaElement | undefined
  let captionInput: HTMLInputElement | undefined

  const autoResize = () => {
    if (codeTextarea) {
      codeTextarea.style.height = "auto"
      codeTextarea.style.height = `${codeTextarea.scrollHeight + 2}px`
    }
  }

  const saveProps = () => {
    componentProps.onPropsChange({
      ...componentProps.props,
      language: languageSelect?.value || "typescript",
      code: codeTextarea?.value || "",
      caption: captionInput?.value || ""
    })
  }

  onMount(() => {
    if (codeTextarea) {
      codeTextarea.value = componentProps.props.code || ""
      autoResize()
    }
  })

  return (
    <div class="rimelight-code-editor flex flex-col gap-2 p-3 w-full">
      <div class="flex items-center justify-between mb-1">
        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
          <span>Source Code</span>
          <select
            id="code-language-select"
            ref={(el) => (languageSelect = el)}
            data-field="language"
            value={componentProps.props.language || "typescript"}
            onChange={saveProps}
            class="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 outline-none cursor-pointer font-normal normal-case"
          >
            <For each={LANGUAGES}>
              {(l) => (
                <option value={l} selected={l === (componentProps.props.language || "typescript")}>
                  {l}
                </option>
              )}
            </For>
          </select>
        </label>
      </div>
      <div class="relative">
        <textarea
          ref={(el) => (codeTextarea = el)}
          data-field="code"
          class="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-green-300 font-mono resize-none outline-none focus:border-blue-500 min-h-[120px] leading-relaxed"
          placeholder="// Write code here..."
          spellcheck={false}
          onInput={autoResize}
          onBlur={saveProps}
          onKeyDown={(e) => {
            if (e.key === "Tab" && codeTextarea) {
              e.preventDefault()
              const start = codeTextarea.selectionStart
              const end = codeTextarea.selectionEnd
              const val = codeTextarea.value
              codeTextarea.value = val.substring(0, start) + "  " + val.substring(end)
              codeTextarea.selectionStart = codeTextarea.selectionEnd = start + 2
            }
          }}
        />
      </div>
      <input
        ref={(el) => (captionInput = el)}
        type="text"
        data-field="caption"
        value={componentProps.props.caption || ""}
        onBlur={saveProps}
        class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500 mt-2"
        placeholder="Caption (optional)"
      />
    </div>
  )
}
