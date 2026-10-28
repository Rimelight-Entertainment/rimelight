import { Show, type Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock";
import { cmsT } from "../../locale";

export const LivePreviewBlock: Component<BlockViewProps> = (props) => {
  const componentCode = () => (props.block.props?.["componentCode"] as string) ?? "";
  const framework = () => (props.block.props?.["framework"] as string) ?? "solid";
  const height = () => (props.block.props?.["height"] as string) ?? "300px";
  const width = () => (props.block.props?.["width"] as string) ?? "100%";
  const editable = () => (props.block.props?.["editable"] as boolean) ?? false;

  return (
    <div
      class="cms-live-preview-block my-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-900 overflow-hidden shadow-sm"
      data-block-id={props.block.id}
    >
      <div class="flex items-center justify-between px-4 py-2 bg-neutral-950/80 border-b border-neutral-800 text-xs text-neutral-400">
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span class="font-mono uppercase font-semibold text-neutral-300">
            Preview ({framework()})
          </span>
        </div>
        <Show when={editable()}>
          <span class="text-xs text-neutral-500">{cmsT("text.interactive")}</span>
        </Show>
      </div>

      <div
        class="p-6 bg-neutral-900 flex items-center justify-center min-h-[160px] overflow-auto"
        style={{ height: height(), width: width() }}
      >
        <div class="text-xs text-neutral-400 font-mono bg-neutral-950/60 p-4 rounded-xl border border-neutral-800 max-w-full overflow-auto">
          <pre>
            <code>{componentCode()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
