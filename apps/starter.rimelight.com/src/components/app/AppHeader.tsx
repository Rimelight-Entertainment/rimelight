import { type Component, For } from "solid-js";
import {
  RLHeader,
  RLLogo,
  RLNavigationMenu,
  RLLinkGroup,
  RLButton,
  RLSlideover,
  RLSearch,
  RLImage,
  type RLButtonProps,
  type RLLinkGroupProps,
} from "@rimelight/ui";
import { useShortcuts } from "@rimelight/ui/shortcuts";
import type { NavigationMenuItem } from "@rimelight/ui/components/navigation-menu/navigation-menu.types.ts";
import { t, getLocaleUrl } from "@rimelight/i18n";

export interface AppHeaderProps {
  stackIndex?: number;
}

export const AppHeader: Component<AppHeaderProps> = (props) => {
  const foundationLinkGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.foundations.label"),
    leadingIcon: "i-lucide-layout",
    links: [
      {
        label: t("app.header.link-groups.center.foundations.links.tokens"),
        href: getLocaleUrl("/docs/tokens"),
      },
      {
        label: t("app.header.link-groups.center.foundations.links.colors"),
        href: getLocaleUrl("/docs/colors"),
      },
      {
        label: t("app.header.link-groups.center.foundations.links.typography"),
        href: getLocaleUrl("/docs/typography"),
      },
    ],
  });

  const componentsLinkGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.components.label"),
    leadingIcon: "i-lucide-blocks",
    links: [
      {
        label: t("app.header.link-groups.center.components.links.solid"),
        href: getLocaleUrl("/docs/solid"),
      },
      {
        label: t("app.header.link-groups.center.components.links.integrations"),
        href: getLocaleUrl("/docs/integrations"),
      },
    ],
  });

  const resourcesLinkGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.right.resources.label"),
    leadingIcon: "i-lucide-library",
    links: [
      {
        label: t("app.header.link-groups.right.resources.links.docs"),
        href: "/docs",
        leadingIcon: "i-lucide-file-text size-4",
      },
      {
        label: t("app.header.link-groups.right.resources.links.github"),
        href: "https://github.com/Rimelight-Entertainment/rimelight",
        leadingIcon: "i-logos-github-icon size-4",
      },
    ],
  });

  const leftLinks = (): NavigationMenuItem[] => [
    {
      label: t("app.header.left-links.features.label"),
      to: getLocaleUrl("/features"),
      slot: "features" as const,
      children: [
        {
          label: t("app.header.link-groups.center.foundations.label"),
          description: t("app.header.link-groups.center.foundations.description"),
        },
        {
          label: t("app.header.link-groups.center.components.label"),
          description: t("app.header.link-groups.center.components.description"),
        },
        {
          label: t("app.header.link-groups.center.components.links.integrations"),
          description: t("app.header.link-groups.center.components.description"),
        },
      ],
    },
    {
      label: t("app.header.left-links.about.label"),
      to: getLocaleUrl("/about"),
    },
    {
      label: t("app.header.left-links.blog.label"),
      to: getLocaleUrl("/blog"),
    },
    {
      label: t("app.header.left-links.docs.label"),
      to: getLocaleUrl("/docs"),
    },
    {
      label: "Contact",
      to: getLocaleUrl("/contact"),
    },
  ];

  const actions = (): RLButtonProps[] => [];

  return (
    <RLHeader
      fixed={true}
      stackIndex={props.stackIndex ?? 0}
      data-theme="dark"
      class="bg-black"
      left={
        <div class="flex items-center gap-md">
          <div class="hidden md:flex flex-row gap-md items-center">
            <RLLogo href={getLocaleUrl("/")} variant="logomark" class="h-10 w-auto" mode="color" />
            <RLNavigationMenu
              items={leftLinks()}
              variant="link"
              slots={{
                features: () => (
                  <div class="flex flex-col lg:flex-row gap-lg bg-default w-full">
                    <div class="bg-default flex flex-col lg:flex-row gap-lg p-lg flex-1">
                      <RLImage
                        class="h-32 lg:h-full w-full lg:w-auto object-cover lg:max-w-80 shrink-0 rounded"
                        src="https://cdn.rimelight.com/images/placeholder.webp"
                        alt=""
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
                ),
              }}
            />
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
                slots={{
                  features: () => (
                    <div class="flex flex-col lg:flex-row gap-lg bg-default w-full">
                      <div class="bg-default flex flex-col lg:flex-row gap-lg p-lg flex-1">
                        <RLImage
                          class="h-32 lg:h-full w-full lg:w-auto object-cover lg:max-w-80 shrink-0 rounded mb-2 lg:mb-0"
                          src="https://cdn.rimelight.com/images/placeholder.webp"
                          alt=""
                          ui={{
                            trigger: "absolute inset-0 w-full h-full overflow-hidden rounded-lg",
                            triggerImage: "w-full h-full object-cover",
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
                        <RLLinkGroup
                          {...resourcesLinkGroup()}
                          ui={{ title: "!text-primary-500" }}
                        />
                      </div>
                    </div>
                  ),
                }}
              />
            </RLSlideover>
          </div>
        </div>
      }
      center={
        <div class="flex items-center gap-md">
          <div class="block md:hidden">
            <RLLogo href={getLocaleUrl("/")} variant="logomark" class="h-10 w-auto" mode="color" />
          </div>
        </div>
      }
      right={
        <div class="flex items-center gap-md">
          <RLSearch />
          <RLButton
            variant="ghost"
            color="neutral"
            leadingIcon="i-lucide-keyboard"
            aria-label="Keyboard Shortcuts"
            onClick={() => useShortcuts().open()}
          />
          <div class="hidden md:flex flex-row gap-md">
            <For each={actions()}>{(buttonProps) => <RLButton {...buttonProps} />}</For>
          </div>

          <div class="block md:hidden">
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
          </div>
        </div>
      }
    />
  );
};

export default AppHeader;
