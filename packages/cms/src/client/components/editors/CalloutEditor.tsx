import { createSignal, onMount, onCleanup, For, Show, type Component } from "solid-js"
import type { BaseBlock } from "../../../core/types/blocks"
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable"
import RLSSelect from "@rimelight/ui/components/select/RLSSelect"
import RLSInput from "@rimelight/ui/components/input/RLSInput"
import RLSButton from "@rimelight/ui/components/button/RLSButton"

export interface CalloutEditorProps {
  blockId?: string
  props: Record<string, any>
  children?: BaseBlock[] | (() => BaseBlock[])
  sectionDepth?: number
  onPropsChange: (newProps: Record<string, any>) => void
  onRelocate?: ((id: string, newIndex: number, targetParentId?: string | null) => void) | undefined
  onOpenPicker?: () => void
  renderChildBlock?: (block: BaseBlock, depth: number) => any
}

const VARIANTS: Record<string, { icon: string; label: string }> = {
  info: { icon: "info", label: "Info" },
  success: { icon: "check", label: "Success" },
  warning: { icon: "triangleAlert", label: "Warning" },
  error: { icon: "circleAlert", label: "Error" },
  commentary: { icon: "messageSquare", label: "Commentary" },
  ideation: { icon: "lightbulb", label: "Ideation" },
  source: { icon: "code", label: "Source" }
}

const VARIANT_OPTIONS = Object.entries(VARIANTS).map(([key, item]) => ({
  label: item.label,
  value: key
}))

const TARGET_OPTIONS = [
  { label: "Same tab", value: "_self" },
  { label: "New tab (_blank)", value: "_blank" }
]

export const CalloutEditor: Component<CalloutEditorProps> = (componentProps) => {
  const [linkSettingsOpen, setLinkSettingsOpen] = createSignal(!!componentProps.props.to)
  let childrenContainer: HTMLDivElement | undefined = undefined
  let sortableInstance: any = null

  const variant = () => componentProps.props.variant || "info"

  const childrenBlocks = (): BaseBlock[] => {
    if (typeof componentProps.children === "function") {
      return componentProps.children() || []
    }
    return componentProps.children || componentProps.props.children || []
  }

  onMount(() => {
    if (childrenContainer) {
      sortableInstance = initBlockSortable(childrenContainer, {
        filter: ".cms-empty-placeholder, .locked",
        onReorder: (oldIdx: number, newIdx: number) => {
          cleanAllSortableClasses()
          const list = [...childrenBlocks()]
          const item = list.splice(oldIdx, 1)[0]
          if (item) {
            list.splice(newIdx, 0, item)
            componentProps.onPropsChange({ ...componentProps.props, children: list })
          }
          requestAnimationFrame(() => cleanAllSortableClasses())
          setTimeout(cleanAllSortableClasses, 50)
          setTimeout(cleanAllSortableClasses, 200)
        },
        onAdd: (blockId: string, newIdx: number) => {
          cleanAllSortableClasses()
          if (componentProps.onRelocate && componentProps.blockId) {
            componentProps.onRelocate(blockId, newIdx, componentProps.blockId)
          }
          requestAnimationFrame(() => cleanAllSortableClasses())
          setTimeout(cleanAllSortableClasses, 50)
          setTimeout(cleanAllSortableClasses, 200)
        },
        onRemove: (_blockId: string, _oldIdx: number) => {
          cleanAllSortableClasses()
        }
      })
    }

    onCleanup(() => {
      if (sortableInstance) sortableInstance.destroy()
    })
  })

  const saveLinkProps = (to?: string, target?: string) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      to: to !== undefined ? to : componentProps.props.to,
      target: target !== undefined ? target : componentProps.props.target
    })
  }

  const setVariant = (v: string) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      variant: v
    })
  }

  return (
    <div class="w-full flex flex-col gap-3 p-3 rounded-xl border border-default/70">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Callout:
          </span>
          <div class="w-36">
            <RLSSelect
              items={VARIANT_OPTIONS}
              value={variant()}
              onChange={(e: Event & { currentTarget: HTMLSelectElement }) =>
                setVariant(e.currentTarget.value)
              }
              size="xs"
            />
          </div>
        </div>

        <RLSButton
          variant="ghost"
          color="neutral"
          size="xs"
          onClick={() => setLinkSettingsOpen(!linkSettingsOpen())}
          title="Link settings"
          leadingIcon="link"
          label={componentProps.props.to ? "Linked" : "Add Link"}
        />
      </div>

      <Show when={linkSettingsOpen()}>
        <div class="flex items-center gap-2 p-2 rounded-lg border border-default text-xs">
          <div class="flex-1">
            <RLSInput
              type="text"
              placeholder="Link URL (e.g. https://... or /slug)"
              value={componentProps.props.to || ""}
              onBlur={(e: FocusEvent & { currentTarget: HTMLInputElement }) =>
                saveLinkProps(e.currentTarget.value, componentProps.props.target)
              }
              size="sm"
            />
          </div>
          <div class="w-32">
            <RLSSelect
              items={TARGET_OPTIONS}
              value={componentProps.props.target || "_self"}
              onChange={(e: Event & { currentTarget: HTMLSelectElement }) =>
                saveLinkProps(componentProps.props.to, e.currentTarget.value)
              }
              size="xs"
            />
          </div>
        </div>
      </Show>

      <div
        ref={(el) => (childrenContainer = el)}
        class="p-2 rounded-lg border border-dashed border-default flex flex-col gap-2 min-h-[36px]"
      >
        {childrenBlocks().length === 0 ? (
          <div class="text-center py-2">
            <span class="text-xs text-muted-foreground block">Empty callout</span>
            <RLSButton
              variant="link"
              color="primary"
              size="xs"
              onClick={() => componentProps.onOpenPicker?.()}
              label="+ Add block"
            />
          </div>
        ) : (
          <For each={childrenBlocks()}>
            {(childBlock) =>
              componentProps.renderChildBlock?.(childBlock, componentProps.sectionDepth || 0)
            }
          </For>
        )}
      </div>
    </div>
  )
}
