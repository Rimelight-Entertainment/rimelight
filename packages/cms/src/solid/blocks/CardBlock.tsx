import { Show, type Component } from "solid-js"
import type { BlockViewProps } from "./ParagraphBlock.tsx"

export const CardBlock: Component<BlockViewProps> = (props) => {
  const title = () => (props.block.props?.["title"] as string) ?? ""
  const description = () => (props.block.props?.["description"] as string) ?? ""
  const icon = () => (props.block.props?.["icon"] as string) ?? "i-lucide-book-open"
  const href = () => props.block.props?.["href"] as string | undefined
  const badge = () => props.block.props?.["badge"] as string | undefined

  return (
    <Show
      when={href()}
      fallback={
        <div
          class="cms-card group relative block p-5 rounded-xl border border-neutral-200 bg-elevated hover:border-primary-500/50 hover:shadow-md transition-all text-decoration-none no-underline"
          data-block-id={props.block.id}
        >
          <CardBody title={title()} description={description()} icon={icon()} badge={badge()} />
        </div>
      }
    >
      <a
        href={href()}
        class="cms-card group relative block p-5 rounded-xl border border-neutral-200 bg-elevated hover:border-primary-500/50 hover:shadow-md transition-all text-decoration-none no-underline"
        data-block-id={props.block.id}
      >
        <CardBody title={title()} description={description()} icon={icon()} badge={badge()} />
      </a>
    </Show>
  )
}

function CardBody(props: {
  title: string
  description: string
  icon: string
  badge?: string | undefined
}) {
  return (
    <>
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-3">
          <Show when={props.icon}>
            <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
              <span class={`${props.icon} size-5`} aria-hidden="true" />
            </div>
          </Show>
          <Show when={props.title}>
            <h4 class="text-base font-semibold text-neutral-900 m-0 group-hover:text-primary-600 transition-colors">
              {props.title}
            </h4>
          </Show>
        </div>
        <Show when={props.badge}>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-100 text-neutral-700">
            {props.badge}
          </span>
        </Show>
      </div>
      <Show when={props.description}>
        <p class="mt-3 text-sm text-neutral-600 m-0">{props.description}</p>
      </Show>
    </>
  )
}

export default CardBlock
