import { type Component, createSignal, For, Show } from "solid-js";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";

interface ComponentShowcaseProps {
  component?: string;
  componentName?: string;
  slots?: string[];
  props?: Record<string, any>;
  class?: string;
  playground?: string;
  propsConfig?: Record<string, string[]>;
  defaultProps?: Record<string, string>;
  togglingPattern?: "icon" | "select-option" | "tab-segmented" | "pill-toggle";
  theme?: any;
  combinationClasses?: Record<string, any>;
  initialThemeClasses?: Record<string, string>;
  themeSlots?: string[];
  children?: any;
  "code-solid"?: any;
}

export const ComponentShowcase: Component<ComponentShowcaseProps> = (props) => {
  const isDynamic = () => Boolean(props.propsConfig);
  const propKeys = () => (props.propsConfig ? Object.keys(props.propsConfig) : []);
  const [selectedProps, setSelectedProps] = createSignal<Record<string, string>>(
    props.defaultProps || {},
  );
  const [selectedMode, setSelectedMode] = createSignal<"single" | "compare">("single");

  return (
    <div
      class={`component-showcase border border-default rounded-xl overflow-visible bg-neutral-50 text-highlighted my-6 ${
        props.class || ""
      }`}
    >
      <Show when={isDynamic()}>
        <div class="flex flex-wrap items-center gap-6 px-4 py-3 bg-muted/20 border-b border-default justify-between w-full">
          <div class="flex flex-wrap items-center gap-6">
            <For each={propKeys()}>
              {(prop) => (
                <div class="flex items-center gap-2">
                  <label class="text-xs font-semibold text-muted uppercase tracking-wider">
                    {prop}:
                  </label>
                  <RLSelect
                    items={props.propsConfig?.[prop] || []}
                    value={selectedProps()[prop] || ""}
                    name={prop}
                    size="sm"
                    onChange={(val: any) => setSelectedProps((prev) => ({ ...prev, [prop]: val }))}
                  />
                </div>
              )}
            </For>
          </div>

          <Show when={props.togglingPattern === "tab-segmented"}>
            <div class="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-default/40 ml-auto">
              <RLButton
                class={`mode-tab ${
                  selectedMode() === "single"
                    ? "active bg-neutral-50 text-highlighted shadow-xs border border-default/40"
                    : "text-muted"
                }`}
                size="xs"
                variant="ghost"
                color="neutral"
                onClick={() => setSelectedMode("single")}
              >
                Single Preview
              </RLButton>
              <RLButton
                class={`mode-tab ${
                  selectedMode() === "compare"
                    ? "active bg-neutral-50 text-highlighted shadow-xs border border-default/40"
                    : "text-muted"
                }`}
                size="xs"
                variant="ghost"
                color="neutral"
                onClick={() => setSelectedMode("compare")}
              >
                Compare All
              </RLButton>
            </div>
          </Show>
        </div>
      </Show>

      {/* Preview Area */}
      <div class="preview-area px-4 py-6 flex items-center justify-center min-h-[120px] border-b border-default relative">
        <div class="absolute top-2 right-4 z-10">
          <div class="text-xs bg-muted text-muted px-2 py-1 rounded border border-default">
            Preview
          </div>
        </div>
        <div class="preview-slot-wrapper flex items-center justify-center w-full">
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default ComponentShowcase;
