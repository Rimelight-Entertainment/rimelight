import type { RLWatermarkProps } from "./watermark.types";
import { RLWatermarkTheme } from "./watermark.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLWatermark: Component<RLWatermarkProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLWatermarkTheme({
      ui: props.ui,
      class: props.class,
      ...allProps,
    }),
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
