import type { Component, ParentProps } from "solid-js";
import type { BaseBlock } from "../../core/types/blocks";

export interface ScriptBlockProps extends ParentProps {
  block: BaseBlock;
  locale?: string | undefined;
}

export const ScriptBlock: Component<ScriptBlockProps> = (props) => {
  const p = () => (props.block.props || {}) as any;
  const characters = () => p().characters || [];
  const hasPlot = () => p().aPlot || p().bPlot || p().cPlot;
  const hasChildren = () => Boolean(props.children);

  return (
    <div class="my-6 p-4 border-l-4 border-amber-400 bg-amber-50/20 rounded-r-lg">
      <div class="mb-4">
        <h3 class="text-xl font-bold text-amber-900">{p().title}</h3>
        {p().synopsis && <p class="text-sm text-neutral-600 mt-1 italic">{p().synopsis}</p>}
        {characters().length > 0 && (
          <div class="flex flex-wrap gap-3 mt-3 text-xs">
            {characters().map((char: string) => (
              <span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{char}</span>
            ))}
          </div>
        )}
      </div>
      {hasPlot() && (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
          {p().aPlot && (
            <div class="bg-neutral-50/50 rounded p-2 border border-neutral-200">
              <div class="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                A Plot
              </div>
              <div class="text-sm mt-0.5">{p().aPlot}</div>
            </div>
          )}
          {p().bPlot && (
            <div class="bg-neutral-50/50 rounded p-2 border border-neutral-200">
              <div class="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                B Plot
              </div>
              <div class="text-sm mt-0.5">{p().bPlot}</div>
            </div>
          )}
          {p().cPlot && (
            <div class="bg-neutral-50/50 rounded p-2 border border-neutral-200">
              <div class="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                C Plot
              </div>
              <div class="text-sm mt-0.5">{p().cPlot}</div>
            </div>
          )}
        </div>
      )}
      {p().stinger && (
        <p class="text-sm text-neutral-600 italic mt-2 border-t border-neutral-200 pt-2">
          Stinger: {p().stinger}
        </p>
      )}
      {hasChildren() && <div class="mt-4">{props.children}</div>}
    </div>
  );
};

export default ScriptBlock;
