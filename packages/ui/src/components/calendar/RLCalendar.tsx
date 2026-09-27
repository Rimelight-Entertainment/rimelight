import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { CalendarProps } from "./calendar"
import { calendarTheme } from "./calendar.theme"

export interface RLCalendarProps extends CalendarProps {
  children?: JSX.Element
}

const RLCalendar: Component<RLCalendarProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

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

export { RLCalendar }
