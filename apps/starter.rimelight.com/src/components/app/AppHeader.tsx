import { type Component, For, Show, onSettled } from "solid-js"
import {
  RLHeader,
  RLLogo,
  RLNavigationMenu,
  RLLinkGroup,
  RLButton,
  RLSlideover,
  RLSearch,
  RLImage,
  RLAvatar,
  RLDropdownMenu,
  type RLButtonProps,
  type RLLinkGroupProps
} from "@rimelight/ui"
import type { NavigationMenuItem } from "@rimelight/ui/components/navigation-menu/navigation-menu.ts"
import type { DropdownMenuItem } from "@rimelight/ui/components/dropdown-menu/dropdown-menu.ts"
import { t, getRelativeLocaleUrl } from "@rimelight/i18n"

export interface AppHeaderProps {
  session?: any
  stackIndex?: number
}

export const AppHeader: Component<AppHeaderProps> = (props) => {
  onSettled(() => {
    const btn = document.getElementById("rla-shortcuts-btn")
    const handler = () => {
      document.dispatchEvent(new CustomEvent("rl-shortcuts:open"))
      document.dispatchEvent(new CustomEvent("rla-shortcuts:open"))
    }
    btn?.addEventListener("click", handler)
    return () => {
      btn?.removeEventListener("click", handler)
    }
  })

  const foundationLinkGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_foundations_label"),
    leadingIcon: "i-lucide-layout",
    links: [
      {
        label: t("app_header.link-groups_center_foundations_links_tokens"),
        href: getRelativeLocaleUrl("/docs/tokens")
      },
      {
        label: t("app_header.link-groups_center_foundations_links_colors"),
        href: getRelativeLocaleUrl("/docs/colors")
      },
      {
        label: t("app_header.link-groups_center_foundations_links_typography"),
        href: getRelativeLocaleUrl("/docs/typography")
      }
    ]
  })

  const componentsLinkGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_components_label"),
    leadingIcon: "i-lucide-blocks",
    links: [
      {
        label: t("app_header.link-groups_center_components_links_astro"),
        href: getRelativeLocaleUrl("/docs/astro")
      },
      {
        label: t("app_header.link-groups_center_components_links_solid"),
        href: getRelativeLocaleUrl("/docs/solid")
      },
      {
        label: t("app_header.link-groups_center_components_links_integrations"),
        href: getRelativeLocaleUrl("/docs/integrations")
      }
    ]
  })

  const resourcesLinkGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_right_resources_label"),
    leadingIcon: "i-lucide-library",
    links: [
      {
        label: t("app_header.link-groups_right_resources_links_docs"),
        href: "/docs",
        leadingIcon: "i-lucide-file-text size-4"
      },
      {
        label: t("app_header.link-groups_right_resources_links_github"),
        href: "https://github.com/Rimelight-Entertainment/rimelight",
        leadingIcon: "i-logos-github-icon size-4"
      }
    ]
  })

  const leftLinks = (): NavigationMenuItem[] => [
    {
      label: t("app_header.left-links_features_label"),
      to: getRelativeLocaleUrl("/features"),
      slot: "features" as const,
      children: [
        {
          label: t("app_header.link-groups_center_foundations_label"),
          description: t("app_header.link-groups_center_foundations_description")
        },
        {
          label: t("app_header.link-groups_center_components_label"),
          description: t("app_header.link-groups_center_components_description")
        },
        {
          label: t("app_header.link-groups_center_integrations_label"),
          description: t("app_header.link-groups_center_integrations_description")
        }
      ]
    },
    {
      label: t("app_header.left-links_about_label"),
      to: getRelativeLocaleUrl("/about")
    },
    {
      label: t("app_header.left-links_blog_label"),
      to: getRelativeLocaleUrl("/blog")
    },
    {
      label: t("app_header.left-links_docs_label"),
      to: getRelativeLocaleUrl("/docs")
    },
    {
      label: t("app_header.left-links_dashboard_label"),
      to: getRelativeLocaleUrl("/dashboard")
    },
    {
      label: t("app_header.left-links_chat_label"),
      to: getRelativeLocaleUrl("/chat")
    },
    {
      label: "Contact",
      to: getRelativeLocaleUrl("/contact")
    }
  ]

  const actions = (): RLButtonProps[] => [
    {
      color: "neutral",
      variant: "outline",
      href: getRelativeLocaleUrl("/auth/sign-up"),
      label: t("app_header.actions_sign-up")
    },
    {
      variant: "solid",
      color: "primary",
      href: getRelativeLocaleUrl("/auth/sign-in"),
      label: t("app_header.actions_sign-in")
    }
  ]

  const userDropdownItems = (): DropdownMenuItem[] =>
    props.session
      ? [
          {
            type: "label",
            label:
              props.session?.tag && props.session?.tag !== "0000"
                ? `${props.session?.name} #${props.session?.tag}`
                : `${props.session?.name || props.session?.email || "User"}`
          },
          {
            label: "Dashboard",
            icon: "i-lucide-layout-dashboard",
            to: getRelativeLocaleUrl("/dashboard")
          },
          {
            label: "Profile",
            icon: "i-lucide-user",
            to: getRelativeLocaleUrl("/dashboard/profile")
          },
          {
            label: "Settings",
            icon: "i-lucide-cog",
            to: getRelativeLocaleUrl("/dashboard/settings")
          },
          {
            type: "separator"
          },
          {
            label: "Sign Out",
            icon: "i-lucide-log-out",
            to: getRelativeLocaleUrl("/auth/sign-out"),
            color: "error"
          }
        ]
      : []

  return (
    <RLHeader
      fixed={true}
      stackIndex={props.stackIndex ?? 1}
      data-theme="dark"
      class="scroll-header bg-black left-1/2"
      left={
        <div class="flex items-center gap-md">
          <div class="hidden md:flex flex-row gap-md items-center">
            <RLLogo variant="logomark" class="h-10 w-auto" mode="color" />
            <RLNavigationMenu
              items={leftLinks()}
              variant="link"
              ui={{
                viewportWrapper:
                  "top-[var(--rl-total-header-height,64px)] flex justify-center fixed left-0 right-0 z-[150] mt-0 bg-transparent",
                viewport:
                  "w-full rounded-none border-none shadow-xl mt-0 pointer-events-auto overflow-hidden",
                link: "text-white transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400"
              }}
            >
              {/* Features Mega Menu */}
              <div
                slot="features-content"
                class="flex flex-col lg:flex-row gap-lg bg-default w-full"
              >
                <div class="bg-default flex flex-col lg:flex-row gap-lg p-lg flex-1">
                  <RLImage
                    class="h-32 lg:h-full w-full lg:w-auto object-cover lg:max-w-80 shrink-0 rounded"
                    src="https://cdn.rimelight.com/images/placeholder.webp"
                    alt=""
                  />

                  <div class="flex flex-col gap-sm flex-2">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-xl gap-y-4">
                      <RLLinkGroup {...foundationLinkGroup()} ui={{ title: "!text-primary-500" }} />
                      <RLLinkGroup {...componentsLinkGroup()} ui={{ title: "!text-primary-500" }} />
                    </div>
                  </div>
                </div>

                <div class="bg-muted p-lg w-64 shrink-0">
                  <RLLinkGroup {...resourcesLinkGroup()} ui={{ title: "!text-primary-500" }} />
                </div>
              </div>
            </RLNavigationMenu>
          </div>

          <div class="block md:hidden">
            <RLSlideover
              side="left"
              title="Menu"
              trigger={
                <RLButton
                  color="neutral"
                  variant="ghost"
                  rounded={true}
                  leadingIcon="i-lucide-menu"
                  class="!text-white"
                  aria-label="Open Menu"
                />
              }
            >
              <RLNavigationMenu
                items={leftLinks()}
                orientation="vertical"
                variant="link"
                ui={{
                  link: "flex justify-start items-center w-full text-left py-2 text-lg transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400"
                }}
              >
                {/* Features Mega Menu (Mobile/Vertical) */}
                <div
                  slot="features-content"
                  class="flex flex-col lg:flex-row gap-lg bg-default w-full"
                >
                  <div class="bg-default flex flex-col lg:flex-row gap-lg p-lg flex-1">
                    <RLImage
                      class="h-32 lg:h-full w-full lg:w-auto object-cover lg:max-w-80 shrink-0 rounded mb-2 lg:mb-0"
                      src="https://cdn.rimelight.com/images/placeholder.webp"
                      alt=""
                      ui={{
                        trigger: "absolute inset-0 w-full h-full overflow-hidden rounded-lg",
                        triggerImage: "w-full h-full object-cover"
                      }}
                    />

                    <div class="flex flex-col gap-sm flex-2">
                      <div class="grid grid-cols-1 sm:grid-cols-2 gap-xl gap-y-4">
                        <RLLinkGroup
                          {...foundationLinkGroup()}
                          ui={{ title: "!text-primary-500" }}
                        />
                        <RLLinkGroup
                          {...componentsLinkGroup()}
                          ui={{ title: "!text-primary-500" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div class="bg-muted p-lg w-64 shrink-0">
                    <RLLinkGroup {...resourcesLinkGroup()} ui={{ title: "!text-primary-500" }} />
                  </div>
                </div>
              </RLNavigationMenu>
            </RLSlideover>
          </div>
        </div>
      }
      center={
        <div class="flex items-center gap-md">
          <div class="block md:hidden">
            <RLLogo variant="logomark" class="h-10 w-auto" mode="color" />
          </div>
        </div>
      }
      right={
        <div class="flex items-center gap-md">
          <RLSearch />
          <RLButton
            id="rla-shortcuts-btn"
            variant="ghost"
            color="neutral"
            leadingIcon="i-lucide-keyboard"
            aria-label="Keyboard Shortcuts"
          />
          <div class="hidden md:flex flex-row gap-md">
            <Show
              when={props.session}
              fallback={
                <For each={actions()}>{(buttonProps) => <RLButton {...buttonProps} />}</For>
              }
            >
              <RLDropdownMenu
                items={userDropdownItems()}
                content={{ align: "end", side: "bottom" }}
                class="text-white"
                trigger={
                  <div class="flex items-center gap-xs cursor-pointer text-white hover:text-primary-400 transition-colors py-1 px-2 rounded-lg">
                    <div class="relative">
                      <RLAvatar
                        src={props.session?.avatar || props.session?.image}
                        alt={props.session?.name}
                        size="sm"
                      />
                      <span
                        class={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-black ${
                          props.session?.availability === "busy"
                            ? "bg-error-500"
                            : props.session?.availability === "invisible"
                              ? "bg-neutral-500"
                              : "bg-success-500"
                        }`}
                      />
                    </div>
                    <span class="hidden md:inline text-sm font-medium">{props.session?.name}</span>
                  </div>
                }
              />
            </Show>
          </div>

          <div class="block md:hidden">
            <Show
              when={props.session}
              fallback={
                <RLSlideover
                  side="right"
                  title="Actions"
                  trigger={
                    <RLButton
                      color="neutral"
                      variant="ghost"
                      rounded={true}
                      leadingIcon="i-lucide-ellipsis-vertical"
                      class="!text-white"
                      aria-label="Open Actions"
                    />
                  }
                >
                  <div class="flex flex-col gap-md">
                    <For each={actions()}>
                      {(buttonProps) => <RLButton {...buttonProps} block={true} />}
                    </For>
                  </div>
                </RLSlideover>
              }
            >
              <RLDropdownMenu
                items={userDropdownItems()}
                content={{ align: "end", side: "bottom" }}
                class="text-white"
                trigger={
                  <div class="flex items-center gap-xs cursor-pointer text-white hover:text-primary-400 transition-colors py-1 px-2 rounded-lg">
                    <div class="relative">
                      <RLAvatar
                        src={props.session?.avatar || props.session?.image}
                        alt={props.session?.name}
                        size="sm"
                      />
                      <span
                        class={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-black ${
                          props.session?.availability === "busy"
                            ? "bg-error-500"
                            : props.session?.availability === "invisible"
                              ? "bg-neutral-500"
                              : "bg-success-500"
                        }`}
                      />
                    </div>
                  </div>
                }
              />
            </Show>
          </div>
        </div>
      }
    />
  )
}

export default AppHeader
