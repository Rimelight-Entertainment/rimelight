import { createSignal, For, Show, type Component } from "solid-js";
import type { BaseBlock } from "../../core/types/blocks";
import type { BlockViewProps } from "./ParagraphBlock";

export const TabsBlock: Component<BlockViewProps> = (props) => {
  const children = () => (props.block.children ?? []) as BaseBlock[];
  const defaultValue = () =>
    (props.block.props?.["defaultValue"] as string) ??
    (children()[0]?.props?.["value"] as string) ??
    (children()[0]?.props?.["label"] as string) ??
    "tab-0";
  const [active, setActive] = createSignal(defaultValue());

  const valueFor = (child: BaseBlock, index: number) =>
    (child.props?.["value"] as string) ?? (child.props?.["label"] as string) ?? `tab-${index}`;

  return (
    <div
      class="cms-tabs my-6 border border-neutral-200 rounded-xl overflow-hidden"
      data-block-id={props.block.id}
    >
      <div class="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-3 pt-2">
        <For each={children()}>
          {(child, idx) => {
            const val = valueFor(child, idx());
            const isActive = () => active() === val;
            return (
              <button
                type="button"
                class={`cms-tab-btn px-3 py-1.5 text-xs font-medium rounded-t-md transition-all border-b-2 -mb-px ${
                  isActive()
                    ? "text-primary-600 border-primary-500 bg-white font-semibold"
                    : "text-neutral-600 border-transparent hover:text-neutral-900"
                }`}
                onClick={() => setActive(val)}
              >
                <Show when={child.props?.["icon"]}>
                  <span
                    class={`${child.props["icon"]} mr-1.5 inline-block size-3.5 align-text-bottom`}
                  />
                </Show>
                {child.props?.["label"] ?? `Tab ${idx() + 1}`}
              </button>
            );
          }}
        </For>
      </div>
      <div class="cms-tabs-content p-4 bg-white">{props.children}</div>
    </div>
  );
};
