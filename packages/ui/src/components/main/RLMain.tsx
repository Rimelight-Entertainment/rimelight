import { createMemo, omit, type Component, Show } from "solid-js";
import type { RLMainProps } from "./main.types";
import { mainTheme } from "./main.theme";

export const RLMain: Component<RLMainProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "as", "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    mainTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <Show
      when={props.as && props.as !== "main"}
      fallback={
        <main class={`${resolvedClasses().root} rl-main-container`} data-slot="main" {...rest}>
          {props.children}
        </main>
      }
    >
      <div class={`${resolvedClasses().root} rl-main-container`} data-slot="main" {...rest}>
        {props.children}
      </div>
    </Show>
  );
};
