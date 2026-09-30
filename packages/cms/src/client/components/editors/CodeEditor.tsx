import { onSettled, type Component } from "solid-js";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";

export interface CodeEditorProps {
  props: Record<string, any>;
  onPropsChange: (newProps: Record<string, any>) => void;
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
];

export const CodeEditor: Component<CodeEditorProps> = (componentProps) => {
  let codeTextarea: HTMLTextAreaElement | undefined;

  const saveProps = (lang?: string, code?: string, caption?: string) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      language: lang !== undefined ? lang : componentProps.props["language"] || "typescript",
      code: code !== undefined ? code : codeTextarea?.value || "",
      caption: caption !== undefined ? caption : componentProps.props["caption"] || ""
    });
  };

  onSettled(() => {
    if (codeTextarea) {
      codeTextarea.value = componentProps.props["code"] || "";
    }
  });

  return (
    <div class="rimelight-code-editor flex flex-col gap-2 p-2 w-full">
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-muted uppercase tracking-wide">Language</span>
          <div class="w-36">
            <RLSelect
              items={LANGUAGES}
              value={componentProps.props["language"] || "typescript"}
              onChange={(e: any) => saveProps(e.currentTarget.value)}
              size="xs"
            />
          </div>
        </div>
      </div>
      <div class="relative w-full">
        <textarea
          ref={(el) => (codeTextarea = el)}
          data-field="code"
          class="w-full bg-neutral-950/80 border border-default rounded-lg px-3 py-2 text-sm text-green-400 font-mono resize-none outline-none focus:border-primary min-h-[120px] leading-relaxed"
          style="field-sizing: content"
          placeholder="// Write code here..."
          spellcheck={false}
          onBlur={() => saveProps()}
          onKeyDown={(e) => {
            if (e.key === "Tab" && codeTextarea) {
              e.preventDefault();
              const start = codeTextarea.selectionStart;
              const end = codeTextarea.selectionEnd;
              const val = codeTextarea.value;
              codeTextarea.value = val.substring(0, start) + "  " + val.substring(end);
              codeTextarea.selectionStart = codeTextarea.selectionEnd = start + 2;
            }
          }}
        />
      </div>
      <RLInput
        type="text"
        data-field="caption"
        value={componentProps.props["caption"] || ""}
        onBlur={(e) => saveProps(undefined, undefined, e.currentTarget.value)}
        size="sm"
        placeholder="Caption (optional)"
      />
    </div>
  );
};
