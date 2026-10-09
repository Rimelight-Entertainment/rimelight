import { For, Show, type Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock";

export const ScriptBlock: Component<BlockViewProps> = (props) => {
  const title = () => (props.block.props?.["title"] as string) ?? "Untitled Script";
  const synopsis = () => (props.block.props?.["synopsis"] as string) ?? "";
  const characters = () => (props.block.props?.["characters"] as string[]) ?? [];
  const aPlot = () => (props.block.props?.["aPlot"] as string) ?? "";
  const bPlot = () => (props.block.props?.["bPlot"] as string) ?? "";
  const cPlot = () => (props.block.props?.["cPlot"] as string) ?? "";
  const stinger = () => (props.block.props?.["stinger"] as string) ?? "";
  const hasPlots = () => !!(aPlot() || bPlot() || cPlot() || stinger());

  return (
    <div
      class="cms-script-block my-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 p-6 md:p-8 font-sans"
      data-block-id={props.block.id}
    >
      <header class="border-b border-neutral-200 dark:border-neutral-800 pb-6 mb-6">
        <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-1">
          <span class="i-lucide-clapperboard size-4" aria-hidden="true" />
          Screenplay / Narrative Script
        </div>
        <h3 class="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {title()}
        </h3>
        <Show when={synopsis()}>
          <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400 italic">{synopsis()}</p>
        </Show>

        <Show when={characters().length > 0}>
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <span class="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Characters:
            </span>
            <For each={characters()}>
              {(char) => (
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-200/70 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                  {char}
                </span>
              )}
            </For>
          </div>
        </Show>

        <Show when={hasPlots()}>
          <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-white/60 dark:bg-neutral-800/40 p-3.5 rounded-xl border border-neutral-200/60 dark:border-neutral-700/40">
            <Show when={aPlot()}>
              <div>
                <span class="font-semibold text-neutral-700 dark:text-neutral-300">A Plot:</span>
                <p class="text-neutral-600 dark:text-neutral-400 truncate">{aPlot()}</p>
              </div>
            </Show>
            <Show when={bPlot()}>
              <div>
                <span class="font-semibold text-neutral-700 dark:text-neutral-300">B Plot:</span>
                <p class="text-neutral-600 dark:text-neutral-400 truncate">{bPlot()}</p>
              </div>
            </Show>
            <Show when={cPlot()}>
              <div>
                <span class="font-semibold text-neutral-700 dark:text-neutral-300">C Plot:</span>
                <p class="text-neutral-600 dark:text-neutral-400 truncate">{cPlot()}</p>
              </div>
            </Show>
            <Show when={stinger()}>
              <div>
                <span class="font-semibold text-neutral-700 dark:text-neutral-300">Stinger:</span>
                <p class="text-neutral-600 dark:text-neutral-400 truncate">{stinger()}</p>
              </div>
            </Show>
          </div>
        </Show>
      </header>

      <div class="script-body font-mono text-sm space-y-4">{props.children}</div>
    </div>
  );
};
