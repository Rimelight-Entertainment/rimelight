import { type Component, For } from "solid-js";
import { RLFooter } from "@rimelight/ui/components/footer/RLFooter.tsx";
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLLinkGroup } from "@rimelight/ui/components/link-group/RLLinkGroup.tsx";
import { RLThemeSelector } from "@rimelight/ui/components/theme-selector/RLThemeSelector.tsx";
import { RLLocaleSelector } from "@rimelight/ui/components/locale-selector/RLLocaleSelector.tsx";
import type { RLButtonProps } from "@rimelight/ui/components/button/button.types.ts";
import type { RLLinkGroupProps } from "@rimelight/ui/components/link-group/link-group.types.ts";
import { t, getLocaleUrl } from "@rimelight/i18n";

export const AppFooter: Component = () => {
  const footerGroups = (): RLLinkGroupProps[] => [
    {
      label: t("app.footer.links.resources.label"),
      links: [
        {
          label: t("app.footer.links.resources.branding"),
          href: getLocaleUrl("/branding"),
        },
      ],
    },
    {
      label: t("app.footer.links.legal.label"),
      links: [
        {
          label: t("app.footer.links.legal.privacy-policy"),
          href: getLocaleUrl("/legal/privacy-policy"),
        },
        {
          label: t("app.footer.links.legal.cookie-policy"),
          href: getLocaleUrl("/legal/cookie-policy"),
        },
        {
          label: t("app.footer.links.legal.other-documents"),
          href: getLocaleUrl("/legal"),
        },
      ],
    },
  ];

  const socials = (): RLButtonProps[] => [
    {
      leadingIcon: "i-logos-solidjs-icon?mask text-white group-hover:text-primary-500",
      href: "https://solidjs.com/",
    },
    {
      leadingIcon: "i-logos-github-icon?mask text-white group-hover:text-primary-500",
      href: "https://github.com/Rimelight-Entertainment/rimelight",
    },
  ];

  return (
    <RLFooter
      contain={false}
      data-theme="dark"
      class="bg-black z-50"
      leadingSlot={
        <div class="flex flex-col gap-xl justify-between items-center lg:items-start">
          <div class="text-center lg:text-left text-white">{t("app.footer.newsletter.title")}</div>
          <div class="flex flex-col gap-xs items-center lg:items-start">
            <RLLogo href={getLocaleUrl("/")} variant="logomark" class="h-10 w-auto" mode="color" />
            <p class="text-sm text-center lg:text-left text-white">
              {t("app.footer.product-name")}
            </p>
            <span class="text-sm text-center lg:text-left text-white">
              © {new Date().getFullYear()} Rimelight Entertainment
            </span>
          </div>
        </div>
      }
      centerSlot={
        <div class="flex flex-col md:flex-row gap-xl">
          <For each={footerGroups()}>{(group) => <RLLinkGroup {...group} />}</For>
        </div>
      }
      trailingSlot={
        <div class="flex flex-col gap-xl justify-between items-center lg:items-end flex-1">
          <div class="flex flex-col gap-sm items-center lg:items-end">
            <RLThemeSelector class="min-w-44" />
            <RLLocaleSelector class="min-w-44" />
          </div>

          <div class="flex flex-row flex-wrap gap-sm justify-center lg:justify-end items-center lg:items-end">
            <For each={socials()}>
              {(social) => <RLButton size="xl" color="neutral" variant="ghost" {...social} />}
            </For>
          </div>
        </div>
      }
    />
  );
};

export default AppFooter;
