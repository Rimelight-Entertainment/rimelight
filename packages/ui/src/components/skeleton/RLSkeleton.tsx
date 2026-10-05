import type { RLSkeletonProps } from "./skeleton.types";
import { RLSkeletonTheme } from "./skeleton.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLSkeleton: Component<RLSkeletonProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "shape", "ui", "class");

  const classes = createMemo(() =>
    RLSkeletonTheme({
      shape: props.shape ?? "rounded",
      ui: props.ui,
      class: props.class,
    }),
  );

  return <div class={classes()["root"]} data-slot="root" {...rest} />;
};
