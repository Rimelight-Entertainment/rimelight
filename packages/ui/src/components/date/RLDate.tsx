import type { RLDateProps } from "./date.types";
import { omit, type Component } from "solid-js";

const defaultOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

export const RLDate: Component<RLDateProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "date", "locale", "options");

  const resolvedDate = props.date instanceof Date ? props.date : new Date(props.date);
  const valid = !isNaN(resolvedDate.getTime());
  const formatted = valid
    ? resolvedDate.toLocaleDateString(props.locale ?? "en-US", props.options ?? defaultOptions)
    : "";
  const datetime = valid ? resolvedDate.toISOString() : "";

  return (
    <time datetime={datetime} {...rest}>
      {formatted}
    </time>
  );
};
