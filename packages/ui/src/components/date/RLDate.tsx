import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import type { RLDateProps } from "./date.types";
import { RLDateTheme } from "./date.theme";

const defaultOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

const OMIT_KEYS = ["date", "locale", "options"] as const;

export const RLDate: Component<RLDateProps> = (props) => {
  const { Tag, classes, rest } = RLDateTheme.setup(props, {
    as: "time",
    omit: OMIT_KEYS,
  });

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
    <Tag datetime={datetime()} class={classes().root} {...rest}>
      {formatted()}
    </Tag>
  );
};
