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
import { t, getRelativeLocaleUrl, getCurrentLocale } from "@rimelight/i18n";
import NewsletterSignup from "./NewsletterSignup";

export const AppFooter: Component = () => {
  const columns = (): RLLinkGroupProps[] => [
    {
      label: t("app_footer.links_resources_label"),
      links: [
        {
          label: t("app_footer.links_resources_branding"),
          href: getRelativeLocaleUrl("/branding"),
        },
      ],
    },
    {
      label: t("app_footer.links_legal_label"),
      links: [
        {
          label: t("app_footer.links_legal_terms-of-service"),
          href: getRelativeLocaleUrl("/legal/terms-of-service"),
        },
        {
          label: t("app_footer.links_legal_code-of-conduct"),
          href: getRelativeLocaleUrl("/legal/code-of-conduct"),
        },
        {
          label: t("app_footer.links_legal_privacy-policy"),
          href: getRelativeLocaleUrl("/legal/privacy-policy"),
        },
        {
          label: t("app_footer.links_legal_cookie-policy"),
          href: getRelativeLocaleUrl("/legal/cookie-policy"),
        },
        {
          label: t("app_footer.links_legal_shipping-policy"),
          href: getRelativeLocaleUrl("/legal/shipping-policy"),
        },
        {
          label: t("app_footer.links_legal_other-documents"),
          href: getRelativeLocaleUrl("/legal"),
        },
      ],
    },
  ];

  const socials = (): RLButtonProps[] => [
    {
      leadingIcon: "i-logos-instagram-icon?mask text-white hover:text-primary-500",
      href: "https://www.instagram.com/idantity.me",
    },
    {
      leadingIcon: "i-logos-discord-icon?mask text-white hover:text-primary-500",
      href: "https://discord.com/users/682049695173836979",
    },
    {
      leadingIcon: "i-logos-spotify-icon?mask text-white hover:text-primary-500",
      href: "https://open.spotify.com/user/v5m4qoc9j35ccc6nbzqcookvj?si=d795f9bc1cb34222",
    },
    {
      leadingIcon: "i-logos-github-icon?mask text-white hover:text-primary-500",
      href: "https://www.github.com/idantitydotme",
    },
    {
      leadingIcon: "i-logos-linkedin-icon?mask text-white hover:text-primary-500",
      href: "https://www.linkedin.com/daniel-marchi",
    },
  ];

  const targetLanguages = () => [
    { code: "en", label: "English", href: getRelativeLocaleUrl("/en") },
    { code: "pt", label: "Português", href: getRelativeLocaleUrl("/pt") },
    { code: "es", label: "Español", href: getRelativeLocaleUrl("/es") },
  ];

  return (
    <RLFooter
      contain={false}
      data-theme="dark"
      class="bg-black z-50"
      left={
        <div class="flex flex-col gap-xl justify-between items-center lg:items-start flex-1">
          <NewsletterSignup />
          <div class="flex flex-col items-center gap-xs lg:items-start mt-auto">
            <RLLogo variant="logotype" class="h-6 w-auto" mode="color" />
            <p class="text-sm text-white">Accessing me.</p>
            <span class="text-sm text-white">© {new Date().getFullYear()} idantity.me</span>
          </div>
        </div>
      }
      center={
        <div class="flex flex-col md:flex-row gap-12">
          <For each={columns()}>{(column) => <RLLinkGroup {...column} theme="flat" />}</For>
        </div>
      }
      right={
        <div class="flex flex-col items-center lg:items-end flex-1 justify-between gap-sm">
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
