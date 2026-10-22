import { type Component, For } from "solid-js";
import {
  RLFooter,
  RLLogo,
  RLButton,
  RLLinkGroup,
  RLThemeSelector,
  RLLocaleSelector,
  type RLButtonProps,
  type RLLinkGroupProps,
} from "@rimelight/ui";
import { t, getLocaleUrl, getCurrentLocale } from "@rimelight/i18n";

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

  const targetLanguages = () => [
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
  ];

  return (
    <RLFooter
      contain={false}
      data-theme="dark"
      class="bg-black z-50"
      left={
        <div class="flex flex-col gap-xl justify-between items-center lg:items-start">
          <div class="text-center lg:text-left text-white">Newsletter Signup</div>
          <div class="flex flex-col gap-xs items-center lg:items-start">
            <RLLogo variant="logomark" class="h-10 w-auto" mode="color" />
            <p class="text-sm text-center lg:text-left text-white">Rimelight Starter</p>
            <span class="text-sm text-center lg:text-left text-white">
              © {new Date().getFullYear()} Rimelight Entertainment
            </span>
          </div>
        </div>
      }
      center={
        <div class="flex flex-col md:flex-row gap-xl">
          <For each={footerGroups()}>{(group) => <RLLinkGroup {...group} />}</For>
        </div>
      }
      right={
        <div class="flex flex-col gap-xl justify-between items-center lg:items-end flex-1">
          <div class="flex flex-col gap-sm items-center lg:items-end">
            <RLThemeSelector class="min-w-44" />
            <RLLocaleSelector
              locales={targetLanguages()}
              currentLocale={getCurrentLocale()}
              class="min-w-44"
            />
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
