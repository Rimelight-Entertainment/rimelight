<script lang="ts">
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { h, type FunctionalComponent } from "vue"

export const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-foreground/20 text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)

type StatusColor = "green" | "yellow" | "blue" | "purple"

const statusDotColor: Record<StatusColor, string> = {
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  blue: "bg-blue-500",
  purple: "bg-violet-500"
}

const statusBadgeBg: Record<StatusColor, string> = {
  green: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  yellow: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  blue: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  purple: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-400"
}

function getStatusColor(status: string): StatusColor {
  if (status === "published") return "green"
  if (status === "changed") return "yellow"
  if (status === "scheduled") return "purple"
  return "blue"
}

export const StatusBadge: FunctionalComponent<{
  status: string
  styled?: boolean
  class?: any
}> = (props, { slots }) => {
  if (!props.status) return null
  const color = getStatusColor(props.status)
  return h(
    "span",
    {
      class: cn(
        "inline-flex items-center gap-1.5 rounded-4xl py-0.5 text-xs font-medium capitalize",
        props.styled
          ? cn("border px-2.5 py-0.5", statusBadgeBg[color])
          : "text-foreground border border-transparent",
        props.class
      )
    },
    [
      h("span", { class: cn("size-1.5 rounded-full", statusDotColor[color]) }),
      props.status,
      slots.default?.()
    ]
  )
}

StatusBadge.props = {
  status: { type: String, required: true },
  styled: { type: Boolean, default: false },
  class: { type: [String, Object, Array] }
}

export const Badge: FunctionalComponent<{
  class?: any
  variant?: NonNullable<VariantProps<typeof badgeVariants>["variant"]>
}> = (props, { slots }) => {
  return h(
    "span",
    {
      "data-slot": "badge",
      "class": cn(badgeVariants({ variant: props.variant }), props.class)
    },
    slots
  )
}

Badge.props = {
  variant: { type: String, default: "default" },
  class: { type: [String, Object, Array] }
}
</script>
