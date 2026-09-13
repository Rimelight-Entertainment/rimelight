import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { CalendarProps } from "./calendar"
import { calendarTheme } from "./calendar.theme"

export interface RLSCalendarProps extends CalendarProps {
  children?: JSX.Element
}

const RLSCalendar: Component<RLSCalendarProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    calendarTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export default RLSCalendar
