import type { Component } from "solid-js";
import type { BaseBlock } from "@rimelight/cms";

export interface LivePreviewBlockProps {
  block: BaseBlock;
  locale?: string;
}

export const LivePreviewBlock: Component<LivePreviewBlockProps> = (props) => {
  const p = () => (props.block.props || {}) as any;
  const componentCode = () => p().componentCode || "";
  const framework = () => p().framework || "solid";
  const height = () => p().height || "300px";
  const width = () => p().width || "100%";
  const editable = () => Boolean(p().editable);

  return (
    <div
      class="cms-live-preview border border-default rounded-xl overflow-visible bg-neutral-50 text-highlighted my-6"
      data-block-id={props.block.id}
      data-framework={framework()}
      data-editable={editable()}
    >
      <div class="controls-area p-4 border-b border-default flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs font-medium text-muted uppercase tracking-wider">Live Preview</span>
          <span class="text-xs font-mono text-muted bg-muted px-2 py-0.5 rounded">
            {framework()}
          </span>
        </div>
        {editable() && <span class="text-xs text-muted italic">Editable</span>}
      </div>

      <div
        class="preview-area p-4 flex items-center justify-center"
        style={{ height: height(), width: width() }}
      >
        <pre class="text-sm font-mono text-muted bg-muted p-4 rounded-lg overflow-x-auto w-full">
          <code>{componentCode()}</code>
        </pre>
      </div>
    </div>
  );
};

export default LivePreviewBlock;
