<script lang="ts">
import { cn } from "@/lib/utils"
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"

export const Card = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    size: { type: String as PropType<"default" | "sm">, default: "default" }
  },
  setup(props, { slots }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "card",
          "data-size": props.size,
          "class": cn(
            "group/card bg-card text-card-foreground ring-foreground/10 flex flex-col gap-4 rounded-xl py-4 text-sm ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
            props.class
          )
        },
        slots.default?.()
      )
  }
})

export const CardHeader = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "card-header",
          "class": cn(
            "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
            props.class
          )
        },
        slots.default?.()
      )
  }
})

export const CardTitle = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "card-title",
          "class": cn(
            "text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
            props.class
          )
        },
        slots.default?.()
      )
  }
})

export const CardDescription = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "card-description",
          "class": cn("text-muted-foreground text-sm", props.class)
        },
        slots.default?.()
      )
  }
})

export const CardAction = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "card-action",
          "class": cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", props.class)
        },
        slots.default?.()
      )
  }
})

export const CardContent = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "card-content",
          "class": cn("px-4 group-data-[size=sm]/card:px-3", props.class)
        },
        slots.default?.()
      )
  }
})

export const CardFooter = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "card-footer",
          "class": cn(
            "bg-muted/50 flex items-center rounded-b-xl border-t p-4 group-data-[size=sm]/card:p-3",
            props.class
          )
        },
        slots.default?.()
      )
  }
})

export default Card
</script>
