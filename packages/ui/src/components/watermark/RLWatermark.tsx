import { createMemo, omit, type Component } from "solid-js";
import type { RLWatermarkProps } from "./watermark.types";
import { watermarkTheme } from "./watermark.theme";

export const RLWatermark: Component<RLWatermarkProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    watermarkTheme({
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
