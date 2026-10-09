import { type Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock";

export const CodeBlock: Component<BlockViewProps> = (props) => {
  const code = () => (props.block.props?.["code"] as string) ?? "";
  const language = () => (props.block.props?.["language"] as string) ?? "text";

  return (
    <div
      class="cms-code my-4 rounded-lg bg-neutral-950 p-4 font-mono text-sm border border-neutral-800 overflow-x-auto"
      data-block-id={props.block.id}
    >
      <div class="text-xs text-neutral-500 uppercase mb-2 select-none">{language()}</div>
      <pre class="m-0">
        <code>{code()}</code>
      </pre>
    </div>
  );
};
