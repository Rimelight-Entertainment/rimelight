import { createMemo, omit, type Component } from "solid-js";
import type { SkeletonProps } from "./skeleton";
import { skeletonTheme } from "./skeleton.theme";

export interface RLSkeletonProps extends SkeletonProps {}

const RLSkeleton: Component<RLSkeletonProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "shape", "ui", "class");

  const classes = createMemo(() =>
    skeletonTheme({
      shape: props.shape ?? "rounded",
      ui: props.ui,
      class: props.class
    })
  );

  return <div class={classes()["root"]} data-slot="root" {...rest} />;
};

export { RLSkeleton };
