import { splitProps, type Component } from "solid-js"

export interface RLSDateProps {
  date: Date | string | number
  locale?: string
  options?: Intl.DateTimeFormatOptions
  class?: string
  [key: string]: unknown
}

const defaultOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric"
}

const RLSDate: Component<RLSDateProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["date", "locale", "options"])

  const resolvedDate = props.date instanceof Date ? props.date : new Date(props.date)
  const valid = !isNaN(resolvedDate.getTime())
  const formatted = valid
    ? resolvedDate.toLocaleDateString(props.locale ?? "en-US", props.options ?? defaultOptions)
    : ""
  const datetime = valid ? resolvedDate.toISOString() : ""

  return (
    <time datetime={datetime} {...rest}>
      {formatted}
    </time>
  )
}

export default RLSDate
