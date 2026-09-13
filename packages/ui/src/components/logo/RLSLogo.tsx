import { createMemo, Show, splitProps, type Component, type JSX } from "solid-js"
import type { LogoProps } from "./logo"
import { logoTheme } from "./logo.theme"
import uiConfig from "virtual:rimelight/ui"

export interface RLSLogoProps extends LogoProps {
  children?: JSX.Element
  src?: string
}

const RLSLogo: Component<RLSLogoProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "variant",
    "mode",
    "theme",
    "href",
    "alt",
    "src",
    "ui",
    "class",
    "children"
  ])

  const variant = () => props.variant || "logomark"
  const href = () => props.href ?? "/"

  const logoInfo = createMemo(() => {
    if (props.src) {
      return { logoSrc: props.src, darkSrc: null, lightSrc: null }
    }

    const cfgLogos = (uiConfig as any)?.logos
    const logoVariant = cfgLogos?.[variant()]

    let logoSrc: string | null = null
    let darkSrc: string | null = null
    let lightSrc: string | null = null

    if (logoVariant && typeof logoVariant === "object") {
      if (props.mode) {
        logoSrc = logoVariant[props.mode] || logoVariant.color
      } else {
        logoSrc = logoVariant.color || logoVariant.black || logoVariant.white
        darkSrc = logoVariant.white || logoVariant.color
        lightSrc = logoVariant.black || logoVariant.color
      }
    } else if (typeof logoVariant === "string") {
      logoSrc = logoVariant
    }

    return { logoSrc, darkSrc, lightSrc }
  })

  const startsWithUrlPrefix = () => {
    const s = logoInfo().logoSrc
    return s && (s.startsWith("http") || s.startsWith("/") || s.startsWith("."))
  }

  const isIcon = () => {
    const s = logoInfo().logoSrc
    return s && !startsWithUrlPrefix() && (s.includes(":") || s.startsWith("i-"))
  }

  const hasAutoMode = () => {
    const { darkSrc, lightSrc } = logoInfo()
    return darkSrc && lightSrc && darkSrc !== lightSrc && !props.mode
  }

  const resolvedClasses = createMemo(() =>
    logoTheme({
      variant: variant(),
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <a
      class={resolvedClasses().root}
      href={href()}
      aria-label={props.alt || variant()}
      data-slot="root"
      data-theme={props.theme}
      style={props.theme ? { "color-scheme": props.theme } : undefined}
      {...rest}
    >
      <Show when={logoInfo().logoSrc} fallback={props.children}>
        <Show
          when={!isIcon()}
          fallback={
            <span class={`${logoInfo().logoSrc} size-full block shrink-0`} aria-hidden="true" />
          }
        >
          <Show
            when={!hasAutoMode()}
            fallback={
              <span
                class="rla-logo-image size-full flex items-center justify-center shrink-0"
                style={{
                  "--rla-logo-light": `url('${logoInfo().lightSrc}')`,
                  "--rla-logo-dark": `url('${logoInfo().darkSrc}')`
                }}
              >
                <img
                  src={logoInfo().lightSrc || ""}
                  alt={props.alt || ""}
                  class="rla-logo-light size-full block object-contain shrink-0"
                />
                <img
                  src={logoInfo().darkSrc || ""}
                  alt={props.alt || ""}
                  class="rla-logo-dark size-full hidden object-contain shrink-0"
                />
              </span>
            }
          >
            <img
              src={logoInfo().logoSrc || ""}
              alt={props.alt || ""}
              class="size-full block object-contain shrink-0"
            />
          </Show>
        </Show>
      </Show>
    </a>
  )
}

export default RLSLogo
