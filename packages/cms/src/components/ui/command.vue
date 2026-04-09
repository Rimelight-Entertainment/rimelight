<script lang="ts">
import { cn } from "@/lib/utils"
import { Search } from "lucide-vue-next"
import { defineComponent, h, ref, computed, provide, type HTMLAttributes, type PropType } from "vue"

// Simple Vue command palette implementation (no cmdk dependency)
const CommandContextKey = Symbol("command")

export const Command = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    modelValue: { type: String, default: "" }
  },
  emits: ["update:modelValue"],
  setup(props, { slots, attrs }) {
    const searchTerm = ref("")
    provide(CommandContextKey, { searchTerm })

    return () =>
      h(
        "div",
        {
          "data-slot": "command",
          "class": cn(
            "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const CommandInput = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    placeholder: { type: String, default: "Type a command or search..." }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        { "class": "px-3 border-b flex items-center", "data-slot": "command-input-wrapper" },
        [
          h(Search, { class: "mr-2 opacity-50 shrink-0 size-4" }),
          h(
            "input",
            {
              "data-slot": "command-input",
              "class": cn(
                "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
                props.class
              ),
              "placeholder": props.placeholder,
              ...attrs
            },
            slots
          )
        ]
      )
  }
})

export const CommandList = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "command-list",
          "class": cn("max-h-[300px] overflow-y-auto overflow-x-hidden py-2", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const CommandEmpty = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "command-empty",
          "class": cn("py-6 text-center text-sm", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const CommandGroup = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    heading: { type: String }
  },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "command-group",
          "class": cn(
            "text-foreground [&_[data-slot=command-item]]:px-2 [&_[data-slot=command-item]]:py-1.5",
            props.class
          ),
          ...attrs
        },
        props.heading
          ? [
              h(
                "div",
                { class: "px-2 py-1.5 text-xs font-medium text-muted-foreground" },
                props.heading
              ),
              slots.default?.()
            ]
          : slots.default?.()
      )
  }
})

export const CommandItem = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    value: { type: String },
    disabled: { type: Boolean, default: false }
  },
  emits: ["select"],
  setup(props, { slots, attrs, emit }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "command-item",
          "class": cn(
            "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none",
            props.disabled && "opacity-50 pointer-events-none",
            props.class
          ),
          "data-disabled": props.disabled ? "" : undefined,
          "tabindex": props.disabled ? undefined : 0,
          "onClick": () => !props.disabled && emit("select"),
          ...attrs
        },
        slots
      )
  }
})

export const CommandSeparator = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "command-separator",
          "class": cn("bg-border -mx-1 h-px", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const CommandShortcut = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "span",
        {
          "data-slot": "command-shortcut",
          "class": cn("text-muted-foreground ml-auto text-xs tracking-widest", props.class),
          ...attrs
        },
        slots
      )
  }
})
</script>
