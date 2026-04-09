<script lang="ts">
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"
import { cn } from "@/lib/utils"

export const Input = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    type: { type: String, default: "text" }
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "input",
        {
          "data-slot": "input",
          "type": props.type,
          "class": cn(
            "border-input hover:border-foreground/20 file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 bg-muted/30 read-only:hover:border-input read-only:focus-visible:border-input read-only:text-muted-foreground h-9 w-full min-w-0 rounded-lg border px-3 py-1.5 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:font-medium read-only:cursor-not-allowed focus-visible:ring-3 read-only:focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})
</script>
