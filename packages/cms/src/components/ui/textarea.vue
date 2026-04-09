<script lang="ts">
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"
import { cn } from "@/lib/utils"

export const Textarea = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> }
  },
  setup(props, { attrs }) {
    return () =>
      h("textarea", {
        "data-slot": "textarea",
        "class": cn(
          "border-input hover:border-foreground/20 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 bg-muted/30 read-only:hover:border-input read-only:focus-visible:border-input read-only:text-muted-foreground flex min-h-[80px] w-full rounded-lg border px-3 py-1.5 text-base transition-colors focus-visible:ring-3 focus-visible:outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          props.class
        ),
        ...attrs
      })
  }
})
</script>
