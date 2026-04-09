<script lang="ts">
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"
import { cn } from "@/lib/utils"

export const Label = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "label",
        {
          "data-slot": "label",
          "class": cn(
            "text-foreground/80 flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})
</script>
