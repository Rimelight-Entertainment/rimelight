<script lang="ts">
import { mergeProps } from "vue"
import { useSlots } from "vue"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button.vue"
import { Input } from "@/components/ui/input.vue"
import { Separator } from "@/components/ui/separator.vue"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet.vue"
import { Skeleton } from "@/components/ui/skeleton.vue"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.vue"
import { PanelLeftIcon } from "lucide-vue-next"
import {
  defineComponent,
  h,
  type HTMLAttributes,
  type PropType,
  ref,
  computed,
  watch,
  onMounted,
  onUnmounted,
  provide,
  inject,
  type Ref,
  nextTick
} from "vue"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContextKey = Symbol() as InjectionKey<SidebarContextProps | null>
type InjectionKey<T> = symbol

// Simple mobile detection composable
function useIsMobile() {
  const isMobile = ref(false)
  onMounted(() => {
    const check = () => (isMobile.value = window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    onUnmounted(() => window.removeEventListener("resize", check))
  })
  return isMobile
}

export function useSidebar() {
  const context = inject(SidebarContextKey)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

export const SidebarProvider = defineComponent({
  props: {
    defaultOpen: { type: Boolean, default: true },
    open: { type: Boolean },
    onOpenChange: { type: Function as PropType<(open: boolean) => void> },
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]>, default: "" },
    style: { type: [String, Object] }
  },
  setup(props, { slots, attrs }) {
    const isMobile = useIsMobile()
    const openMobile = ref(false)
    const [_open, _setOpen] = ref(props.defaultOpen)
    const open = computed(() => props.open ?? _open.value)

    function setOpen(value: boolean | ((value: boolean) => boolean)) {
      const openState = typeof value === "function" ? value(open.value) : value
      if (props.onOpenChange) {
        props.onOpenChange(openState)
      } else {
        _setOpen.value = openState
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    }

    function toggleSidebar() {
      if (isMobile.value) {
        openMobile.value = !openMobile.value
      } else {
        setOpen((prev) => !prev)
      }
    }

    onMounted(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      onUnmounted(() => window.removeEventListener("keydown", handleKeyDown))
    })

    const state = computed(() => (open.value ? "expanded" : "collapsed"))

    const contextValue = computed<SidebarContextProps>(() => ({
      state: state.value,
      open: open.value,
      setOpen,
      isMobile: isMobile.value,
      openMobile: openMobile.value,
      setOpenMobile: (v: boolean) => (openMobile.value = v),
      toggleSidebar
    }))

    provide(SidebarContextKey, contextValue)

    return () =>
      h(
        "div",
        {
          "data-slot": "sidebar-wrapper",
          "style": {
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...(props.style as Record<string, unknown>)
          },
          "class": cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarTrigger = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    const { toggleSidebar } = useSidebar()
    return () =>
      h(
        Button,
        {
          "data-sidebar": "trigger",
          "data-slot": "sidebar-trigger",
          "variant": "ghost",
          "size": "icon-sm",
          "class": props.class,
          "onClick": (e: Event) => {
            ;(attrs as Record<string, unknown>).onClick?.(e)
            toggleSidebar()
          },
          ...attrs
        },
        { default: () => [h(PanelLeftIcon), h("span", { class: "sr-only" }, "Toggle Sidebar")] }
      )
  }
})

export const SidebarRail = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { attrs }) {
    const { toggleSidebar } = useSidebar()
    return () =>
      h("button", {
        "data-sidebar": "rail",
        "data-slot": "sidebar-rail",
        "aria-label": "Toggle Sidebar",
        "tabindex": -1,
        "onClick": toggleSidebar,
        "title": "Toggle Sidebar",
        "class": cn(
          "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] sm:flex ltr:-translate-x-1/2 rtl:-translate-x-1/2",
          "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
          "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
          "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
          "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
          "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
          props.class
        ),
        ...attrs
      })
  }
})

export const SidebarInset = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "main",
        {
          "data-slot": "sidebar-inset",
          "class": cn(
            "bg-background relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarInput = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        Input,
        {
          "data-slot": "sidebar-input",
          "data-sidebar": "input",
          "class": cn("bg-background h-8 w-full shadow-none", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarHeader = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "sidebar-header",
          "data-sidebar": "header",
          "class": cn("flex flex-col gap-2 p-2", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarFooter = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "sidebar-footer",
          "data-sidebar": "footer",
          "class": cn("flex flex-col gap-2 p-2", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarSeparator = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { attrs }) {
    return () =>
      h(Separator, {
        "data-slot": "sidebar-separator",
        "data-sidebar": "separator",
        "class": cn("bg-sidebar-border mx-2 w-auto", props.class),
        ...attrs
      })
  }
})

export const SidebarContent = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "sidebar-content",
          "data-sidebar": "content",
          "class": cn(
            "no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarGroup = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "sidebar-group",
          "data-sidebar": "group",
          "class": cn("relative flex w-full min-w-0 flex-col p-2", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarGroupLabel = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      useRender({
        defaultTagName: "div",
        props: mergeProps<"div">(
          {
            class: cn(
              "flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
              props.class
            )
          },
          attrs
        ),
        render: slots.default,
        state: {
          slot: "sidebar-group-label",
          sidebar: "group-label"
        }
      })
  }
})

export const SidebarGroupAction = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      useRender({
        defaultTagName: "button",
        props: mergeProps<"button">(
          {
            class: cn(
              "absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
              props.class
            )
          },
          attrs
        ),
        render: slots.default,
        state: {
          slot: "sidebar-group-action",
          sidebar: "group-action"
        }
      })
  }
})

export const SidebarGroupContent = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "sidebar-group-content",
          "data-sidebar": "group-content",
          "class": cn("w-full text-sm", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarMenu = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "ul",
        {
          "data-slot": "sidebar-menu",
          "data-sidebar": "menu",
          "class": cn("flex w-full min-w-0 flex-col gap-0", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarMenuItem = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "li",
        {
          "data-slot": "sidebar-menu-item",
          "data-sidebar": "menu-item",
          "class": cn("group/menu-item relative", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const sidebarMenuButtonVariants = cva(
  "peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export const SidebarMenuButton = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    isActive: { type: Boolean, default: false },
    variant: {
      type: String as PropType<
        NonNullable<VariantProps<typeof sidebarMenuButtonVariants>["variant"]>
      >,
      default: "default"
    },
    size: {
      type: String as PropType<NonNullable<VariantProps<typeof sidebarMenuButtonVariants>["size"]>>,
      default: "default"
    },
    tooltip: { type: [String, Object] as PropType<string | Record<string, unknown>> }
  },
  setup(props, { slots, attrs }) {
    const { isMobile, state } = useSidebar()

    return () => {
      const comp = useRender({
        defaultTagName: "button",
        props: mergeProps<"button">(
          {
            class: cn(
              sidebarMenuButtonVariants({ variant: props.variant, size: props.size }),
              props.class
            )
          },
          attrs
        ),
        render: !props.tooltip ? slots.default : h(TooltipTrigger, { render: slots.default }),
        state: {
          slot: "sidebar-menu-button",
          sidebar: "menu-button",
          size: props.size,
          active: props.isActive
        }
      })

      if (!props.tooltip) {
        return comp
      }

      const tooltipProps =
        typeof props.tooltip === "string" ? { children: props.tooltip } : props.tooltip

      return h(Tooltip, null, {
        default: () => [
          comp,
          h(TooltipContent, {
            side: "right",
            align: "center",
            hidden: state.value !== "collapsed" || isMobile.value,
            ...(tooltipProps as Record<string, unknown>)
          })
        ]
      })
    }
  }
})

export const SidebarMenuAction = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    showOnHover: { type: Boolean, default: false }
  },
  setup(props, { slots, attrs }) {
    return () =>
      useRender({
        defaultTagName: "button",
        props: mergeProps<"button">(
          {
            class: cn(
              "absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0",
              props.showOnHover &&
                "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-active/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 md:opacity-0",
              props.class
            )
          },
          attrs
        ),
        render: slots.default,
        state: {
          slot: "sidebar-menu-action",
          sidebar: "menu-action"
        }
      })
  }
})

export const SidebarMenuBadge = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "div",
        {
          "data-slot": "sidebar-menu-badge",
          "data-sidebar": "menu-badge",
          "class": cn(
            "text-sidebar-foreground peer-hover/menu-button:text-sidebar-accent-foreground peer-data-active/menu-button:text-sidebar-accent-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarMenuSkeleton = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    showIcon: { type: Boolean, default: false }
  },
  setup(props, { attrs }) {
    const width = ref(`${Math.floor(Math.random() * 40) + 50}%`)
    return () =>
      h(
        "div",
        {
          "data-slot": "sidebar-menu-skeleton",
          "data-sidebar": "menu-skeleton",
          "class": cn("flex h-8 items-center gap-2 rounded-md px-2", props.class),
          ...attrs
        },
        {
          default: () =>
            [
              props.showIcon
                ? h(Skeleton, {
                    "class": "rounded-md size-4",
                    "data-sidebar": "menu-skeleton-icon"
                  })
                : null,
              h(Skeleton, {
                "class": "flex-1 h-4 max-w-(--skeleton-width)",
                "data-sidebar": "menu-skeleton-text",
                "style": { "--skeleton-width": width.value } as Record<string, string>
              })
            ].filter(Boolean)
        }
      )
  }
})

export const SidebarMenuSub = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "ul",
        {
          "data-slot": "sidebar-menu-sub",
          "data-sidebar": "menu-sub",
          "class": cn(
            "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5 group-data-[collapsible=icon]:hidden",
            props.class
          ),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarMenuSubItem = defineComponent({
  props: { class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> } },
  setup(props, { slots, attrs }) {
    return () =>
      h(
        "li",
        {
          "data-slot": "sidebar-menu-sub-item",
          "data-sidebar": "menu-sub-item",
          "class": cn("group/menu-sub-item relative", props.class),
          ...attrs
        },
        slots
      )
  }
})

export const SidebarMenuSubButton = defineComponent({
  props: {
    class: { type: [String, Object, Array] as PropType<HTMLAttributes["class"]> },
    size: { type: String as PropType<"sm" | "md">, default: "md" },
    isActive: { type: Boolean, default: false }
  },
  setup(props, { slots, attrs }) {
    return () =>
      useRender({
        defaultTagName: "a",
        props: mergeProps<"a">(
          {
            class: cn(
              "flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground ring-sidebar-ring outline-hidden group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
              props.class
            )
          },
          attrs
        ),
        render: slots.default,
        state: {
          slot: "sidebar-menu-sub-button",
          sidebar: "menu-sub-button",
          size: props.size,
          active: props.isActive
        }
      })
  }
})
</script>

<script setup lang="ts">
import type { HTMLAttributes, PropType } from "vue"

interface SidebarProps {
  class?: HTMLAttributes["class"]
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
  dir?: string
}

const props = withDefaults(defineProps<SidebarProps>(), {
  side: "left",
  variant: "sidebar",
  collapsible: "offcanvas"
})

const { isMobile, state, openMobile, setOpenMobile } = useSidebar()
</script>

<template>
  <!-- Non-collapsible -->
  <div
    v-if="collapsible === 'none'"
    data-slot="sidebar"
    :class="
      cn('bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col', props.class)
    "
  >
    <slot />
  </div>

  <!-- Mobile -->
  <Sheet v-else-if="isMobile" :open="openMobile" @update:open="setOpenMobile">
    <SheetContent
      :dir="dir"
      data-sidebar="sidebar"
      data-slot="sidebar"
      data-mobile="true"
      class="text-sidebar-foreground p-0 bg-sidebar w-(--sidebar-width) [&>button]:hidden"
      :style="{ '--sidebar-width': SIDEBAR_WIDTH_MOBILE }"
      :side="side"
    >
      <SheetHeader class="sr-only">
        <SheetTitle>Sidebar</SheetTitle>
        <SheetDescription>Displays the mobile sidebar.</SheetDescription>
      </SheetHeader>
      <div class="flex flex-col h-full w-full">
        <slot />
      </div>
    </SheetContent>
  </Sheet>

  <!-- Desktop -->
  <div
    v-else
    class="group peer text-sidebar-foreground hidden md:block"
    :data-state="state"
    :data-collapsible="state === 'collapsed' ? collapsible : ''"
    :data-variant="variant"
    :data-side="side"
    data-slot="sidebar"
  >
    <!-- Sidebar gap -->
    <div
      data-slot="sidebar-gap"
      :class="
        cn(
          'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)'
        )
      "
    />
    <!-- Sidebar container -->
    <div
      data-slot="sidebar-container"
      :data-side="side"
      :class="
        cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear data-[side=left]:left-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:right-0 data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)] md:flex',
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
            : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
          props.class
        )
      "
    >
      <div
        data-sidebar="sidebar"
        data-slot="sidebar-inner"
        class="bg-sidebar flex flex-col size-full group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:ring-1 group-data-[variant=floating]:ring-sidebar-border group-data-[variant=floating]:shadow-sm"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
