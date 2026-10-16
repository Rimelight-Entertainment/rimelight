import type { RLDateProps } from "./date.types";
import { createMemo, omit, type Component } from "solid-js";

const defaultOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

export const RLDate: Component<RLDateProps> = (props) => {
  const rest = omit(props, "date", "locale", "options");

  const resolvedDate = createMemo(() =>
    props.date instanceof Date ? props.date : new Date(props.date),
  );
  const valid = createMemo(() => !isNaN(resolvedDate().getTime()));
  const formatted = createMemo(() =>
    valid()
      ? resolvedDate().toLocaleDateString(props.locale ?? "en-US", props.options ?? defaultOptions)
      : "",
  );
  const datetime = createMemo(() => (valid() ? resolvedDate().toISOString() : ""));

  return (
    <time datetime={datetime()} {...rest}>
      {formatted()}
    </time>
  );
};
