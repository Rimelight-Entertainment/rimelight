import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { CalendarProps } from "./calendar"
import { calendarTheme } from "./calendar.theme"

export interface RLCalendarProps extends CalendarProps {
  children?: JSX.Element
}

const RLCalendar: Component<RLCalendarProps> = (allProps) => {
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

export { RLCalendar }
export default RLCalendar
