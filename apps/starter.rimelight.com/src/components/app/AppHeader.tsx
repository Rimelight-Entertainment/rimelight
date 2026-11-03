import { type Component, For } from "solid-js";
import { RLHeader } from "@rimelight/ui/components/header/RLHeader.tsx";
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx";
import { RLNavigationMenu } from "@rimelight/ui/components/navigation-menu/RLNavigationMenu.tsx";
import { RLLinkGroup } from "@rimelight/ui/components/link-group/RLLinkGroup.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLSlideover } from "@rimelight/ui/components/slideover/RLSlideover.tsx";
import { RLSearch } from "@rimelight/ui/components/search/RLSearch.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import type { RLButtonProps } from "@rimelight/ui/components/button/button.types.ts";
import type { RLLinkGroupProps } from "@rimelight/ui/components/link-group/link-group.types.ts";
import { useShortcuts } from "@rimelight/ui/shortcuts";
import type { NavigationMenuItem } from "@rimelight/ui/components/navigation-menu/navigation-menu.types.ts";
import { t, getLocaleUrl } from "@rimelight/i18n";

export interface AppHeaderProps {
  stackIndex?: number;
}

export const AppHeader: Component<AppHeaderProps> = (props) => {
  const doc = (path: string) => getLocaleUrl(`/docs/v1/guide/${path}`);

  const startLinkGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.start.label"),
    leadingIcon: "i-lucide-rocket",
    links: [
      {
        label: t("app.header.link-groups.center.start.links.introduction"),
        href: doc("getting-started/introduction"),
      },
      {
        label: t("app.header.link-groups.center.start.links.structure"),
        href: doc("getting-started/project-structure"),
      },
      {
        label: t("app.header.link-groups.center.start.links.deploy"),
        href: doc("deploy/cloudflare"),
      },
    ],
  });

  const customizeLinkGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.customize.label"),
    leadingIcon: "i-lucide-palette",
    links: [
      {
        label: t("app.header.link-groups.center.customize.links.branding"),
        href: doc("customize/branding-and-seo"),
      },
      {
        label: t("app.header.link-groups.center.customize.links.pages"),
        href: doc("customize/pages"),
      },
      {
        label: t("app.header.link-groups.center.customize.links.content"),
        href: doc("customize/content"),
      },
      {
        label: t("app.header.link-groups.center.customize.links.translations"),
        href: doc("customize/translations"),
      },
    ],
  });

  const resourcesLinkGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.right.resources.label"),
    leadingIcon: "i-lucide-library",
    links: [
      {
        label: t("app.header.link-groups.right.resources.links.docs"),
        href: getLocaleUrl("/docs"),
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
      to: doc("getting-started/introduction"),
      slot: "features" as const,
      children: [
        {
          label: t("app.header.link-groups.center.start.label"),
          description: t("app.header.link-groups.center.start.description"),
          to: doc("getting-started/introduction"),
        },
        {
          label: t("app.header.link-groups.center.customize.label"),
          description: t("app.header.link-groups.center.customize.description"),
          to: doc("customize/branding-and-seo"),
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
      label: t("app.text.contact"),
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
                          <RLLinkGroup {...startLinkGroup()} ui={{ title: "!text-primary-500" }} />
                          <RLLinkGroup
                            {...customizeLinkGroup()}
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
              title={t("app.header.menu.title")}
              trigger={
                <RLButton
                  color="neutral"
                  variant="ghost"
                  rounded={true}
                  leadingIcon="i-lucide-menu"
                  class="!text-white"
                  aria-label={t("app.header.menu.open")}
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
                              {...startLinkGroup()}
                              ui={{ title: "!text-primary-500" }}
                            />
                            <RLLinkGroup
                              {...customizeLinkGroup()}
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
            aria-label={t("app.header.shortcuts.open")}
            onClick={() => useShortcuts().open()}
          />
          <div class="hidden md:flex flex-row gap-md">
            <For each={actions()}>{(buttonProps) => <RLButton {...buttonProps} />}</For>
          </div>

          <div class="block md:hidden">
            <RLSlideover
              side="right"
              title={t("app.header.actions.title")}
              trigger={
                <RLButton
                  color="neutral"
                  variant="ghost"
                  rounded={true}
                  leadingIcon="i-lucide-ellipsis-vertical"
                  class="!text-white"
                  aria-label={t("app.header.actions.open")}
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
