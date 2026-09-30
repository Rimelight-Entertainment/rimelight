import { For, Show, type Component } from "solid-js";
import type { FileTreeNode } from "../../core/types/blocks.ts";
import type { BlockViewProps } from "./ParagraphBlock.tsx";

const TreeNode: Component<{ node: FileTreeNode }> = (props) => {
  const node = () => props.node;
  return (
    <div class="cms-tree-item">
      <div class="flex items-center gap-2 py-0.5 text-neutral-800">
        <span
          class={`${
            node().isDir
              ? "i-lucide-folder text-warning-500"
              : "i-lucide-file-text text-neutral-400"
          } size-4 shrink-0`}
          aria-hidden="true"
        />
        <span class={`font-medium ${node().isDir ? "text-neutral-900" : ""}`}>{node().name}</span>
        <Show when={node().comment}>
          <span class="text-xs text-neutral-500 italic font-sans ml-2">— {node().comment}</span>
        </Show>
      </div>
      <Show when={node().children && node().children!.length > 0}>
        <div class="pl-4 ml-2 border-l border-neutral-200 space-y-1">
          <For each={node().children!}>{(child) => <TreeNode node={child} />}</For>
        </div>
      </Show>
    </div>
  );
};

export const FileTreeBlock: Component<BlockViewProps> = (props) => {
  const tree = () => (props.block.props?.["tree"] as FileTreeNode[]) ?? [];

  return (
    <div
      class="cms-file-tree my-6 rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 font-mono text-sm"
      data-block-id={props.block.id}
    >
      <div class="cms-file-tree-root space-y-1">
        <For each={tree()}>{(node) => <TreeNode node={node} />}</For>
      </div>
    </div>
  );
};

export default FileTreeBlock;
