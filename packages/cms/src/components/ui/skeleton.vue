<script lang="ts">
import { defineComponent, h, type HTMLAttributes, type PropType } from "vue"
import { cn } from "@/lib/utils"

export const Skeleton = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "span",
        {
          "data-slot": "skeleton",
          "class": cn("bg-muted animate-pulse rounded-md", props.class),
          ...attrs
        },
        slots
      )
  }
})
</script>
