import { type Component, For, Show, onSettled } from "solid-js";
import {
  RLHeader,
  RLLogo,
  RLNavigationMenu,
  RLLinkGroup,
  RLButton,
  RLSlideover,
  RLAvatar,
  RLSearch,
  RLDropdownMenu,
  RLImage,
  type RLButtonProps,
  type RLLinkGroupProps,
} from "@rimelight/ui";
import type { NavigationMenuItem } from "@rimelight/ui/components/navigation-menu/navigation-menu.types.ts";
import type { DropdownMenuItem } from "@rimelight/ui/components/dropdown-menu/dropdown-menu.types.ts";
import { t, getLocaleUrl } from "@rimelight/i18n";

export interface AppHeaderProps {
  session?: any;
  stackIndex?: number;
}

export const AppHeader: Component<AppHeaderProps> = (props) => {
  onSettled(() => {
    const btn = document.getElementById("rla-shortcuts-btn");
    const handler = () => {
      document.dispatchEvent(new CustomEvent("rl-shortcuts:open"));
      document.dispatchEvent(new CustomEvent("rla-shortcuts:open"));
    };
    btn?.addEventListener("click", handler);
    return () => {
      btn?.removeEventListener("click", handler);
    };
  });

  const currentUser = () => props.session?.user ?? props.session;

  const grandTaleLinkGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_grand-tale_main_title"),
    links: [
      {
        label: t("app_header.link-groups_center_grand-tale_main_news"),
        href: getLocaleUrl("/franchises/grand-tale/news"),
      },
      {
        label: t("app_header.link-groups_center_grand-tale_main_about"),
        href: getLocaleUrl("/franchises/grand-tale/about"),
      },
      {
        label: t("app_header.link-groups_center_grand-tale_main_wiki"),
        href: getLocaleUrl("/franchises/grand-tale/wiki"),
      },
      {
        label: t("app_header.link-groups_center_grand-tale_main_guides"),
        href: getLocaleUrl("/franchises/grand-tale/guides"),
      },
      {
        label: t("app_header.link-groups_center_grand-tale_main_forums"),
        href: getLocaleUrl("/franchises/grand-tale/forums"),
      },
      {
        label: t("app_header.link-groups_center_grand-tale_main_leaderboards"),
        href: getLocaleUrl("/franchises/grand-tale/leaderboards"),
      },
    ],
  });

  const grandTaleSeriesLinkGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_grand-tale_series_title"),
    links: [
      {
        label: t("app_header.link-groups_center_grand-tale_series_children-of-the-light"),
        href: getLocaleUrl("/franchises/grand-tale/wiki/series/children-of-the-light"),
      },
      {
        label: t("app_header.link-groups_center_grand-tale_series_grand-academy"),
        href: getLocaleUrl("/franchises/grand-tale/wiki/series/grand-academy"),
      },
      {
        label: t("app_header.link-groups_center_grand-tale_series_goldy-adventures"),
        href: getLocaleUrl("/franchises/grand-tale/wiki/series/goldy-adventures"),
      },
    ],
  });

  const grandTaleBooksLinkGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_grand-tale_books_title"),
    links: [
      {
        label: t("app_header.link-groups_center_grand-tale_books_the-first-tale"),
        href: getLocaleUrl("/franchises/grand-tale/wiki/books/the-first-tale"),
      },
    ],
  });

  const grandTaleComicsLinkGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_grand-tale_comics_title"),
    links: [
      {
        label: t("app_header.link-groups_center_grand-tale_comics_ori-friends"),
        href: getLocaleUrl("/franchises/grand-tale/wiki/comics/ori-and-friends"),
      },
    ],
  });

  const grandTaleResourcesGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_right_grand-tale_resources_title"),
    links: [
      {
        label: t("app_header.link-groups_right_grand-tale_resources_download"),
        href: getLocaleUrl("/franchises/grand-tale/download"),
        leadingIcon: "i-lucide-download",
      },
      {
        label: t("app_header.link-groups_right_grand-tale_resources_support"),
        href: getLocaleUrl("/franchises/grand-tale/support"),
        leadingIcon: "i-lucide-headset",
      },
    ],
  });

  const grandTaleSocialsGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_right_grand-tale_socials_title"),
    links: [
      {
        label: t("app_header.link-groups_right_grand-tale_socials_discord"),
        href: "https://discord.com/",
        leadingIcon: "i-ic-baseline-discord",
      },
      {
        label: t("app_header.link-groups_right_grand-tale_socials_youtube"),
        href: "https://youtube.com/",
        leadingIcon: "i-mdi-youtube",
      },
      {
        label: t("app_header.link-groups_right_grand-tale_socials_instagram"),
        href: "https://instagram.com/",
        leadingIcon: "i-mdi-instagram",
      },
    ],
  });

  const commForumsGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_community_forums_title"),
    links: [
      {
        label: t("app_header.link-groups_center_community_forums_rimelight"),
        href: getLocaleUrl("/forums/rimelight"),
      },
      {
        label: t("app_header.link-groups_center_community_forums_grand-tale"),
        href: getLocaleUrl("/forums/grand-tale"),
      },
    ],
  });

  const commEventsGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_community_events_title"),
    links: [
      {
        label: t("app_header.link-groups_center_community_events_lightcon"),
        href: getLocaleUrl("/events/lightcon"),
      },
    ],
  });

  const commSocialsGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_right_grand-tale_socials_title"),
    links: [
      {
        label: t("app_header.link-groups_right_community_socials_instagram"),
        href: "https://www.instagram.com/",
        leadingIcon: "i-mdi-instagram",
      },
      {
        label: t("app_header.link-groups_right_community_socials_discord"),
        href: "https://discord.com/",
        leadingIcon: "i-ic-baseline-discord",
      },
      {
        label: t("app_header.link-groups_right_community_socials_spotify"),
        href: "https://open.spotify.com",
        leadingIcon: "i-mdi-spotify",
      },
    ],
  });

  const compStudioGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_company_main_studio_title"),
    links: [
      {
        label: t("app_header.link-groups_center_company_main_studio_about-us"),
        href: getLocaleUrl("/company/about"),
      },
      {
        label: t("app_header.link-groups_center_company_main_studio_partnerships"),
        href: getLocaleUrl("/company/studio/partnerships"),
      },
    ],
  });

  const compCareersGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_company_main_careers_title"),
    links: [
      {
        label: t("app_header.link-groups_center_company_main_careers_life"),
        href: getLocaleUrl("/company/careers/culture"),
      },
      {
        label: t("app_header.link-groups_center_company_main_careers_jobs"),
        href: getLocaleUrl("/company/careers"),
      },
    ],
  });

  const compNewsGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_company_main_news_title"),
    links: [
      {
        label: t("app_header.link-groups_center_company_main_news_blog"),
        href: getLocaleUrl("/company/blog"),
      },
    ],
  });

  const compResourcesGroup = (): RLLinkGroupProps => ({
    label: t("app_header.links_company_resources_title"),
    links: [
      {
        label: t("app_header.link-groups_right_company_resources_docs"),
        href: getLocaleUrl("/company/docs"),
        leadingIcon: "i-lucide-file-text",
      },
      {
        label: t("app_header.link-groups_right_company_resources_branding"),
        href: getLocaleUrl("/company/branding"),
        leadingIcon: "i-lucide-image",
      },
      {
        label: t("app_header.link-groups_right_company_resources_legal"),
        href: getLocaleUrl("/company/legal"),
        leadingIcon: "i-lucide-scale",
      },
      {
        label: t("app_header.link-groups_right_company_resources_contact"),
        href: getLocaleUrl("/company/contact"),
        leadingIcon: "i-lucide-mail",
      },
    ],
  });

  const compSocialsGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_right_company_socials_title"),
    links: [
      {
        label: t("app_header.link-groups_right_company_socials_linkedin"),
        href: "https://linkedin.com/",
        leadingIcon: "i-logos-linkedin-icon",
      },
      {
        label: t("app_header.link-groups_right_company_socials_github"),
        href: "https://github.com/Rimelight-Entertainment",
        leadingIcon: "i-logos-github-icon",
      },
    ],
  });

  const storeDealsGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_store_main_deals_title"),
    links: [
      {
        label: t("app_header.link-groups_center_store_main_deals_new-releases"),
        href: getLocaleUrl("/store/deals/new"),
      },
      {
        label: t("app_header.link-groups_center_store_main_deals_sales"),
        href: getLocaleUrl("/store/deals/sales"),
      },
      {
        label: t("app_header.link-groups_center_store_main_deals_bundles"),
        href: getLocaleUrl("/store/deals/bundles"),
      },
    ],
  });

  const storeClothingGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_store_main_clothing_title"),
    links: [
      {
        label: t("app_header.link-groups_center_store_main_clothing_headwear"),
        href: getLocaleUrl("/store/clothing/headwear"),
      },
      {
        label: t("app_header.link-groups_center_store_main_clothing_tops"),
        href: getLocaleUrl("/store/clothing/tops"),
      },
      {
        label: t("app_header.link-groups_center_store_main_clothing_bottoms"),
        href: getLocaleUrl("/store/clothing/bottoms"),
      },
    ],
  });

  const storeAccessoriesGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_store_main_accessories_title"),
    links: [
      {
        label: t("app_header.link-groups_center_store_main_accessories_jewelry"),
        href: getLocaleUrl("/store/accessories/jewelry"),
      },
      {
        label: t("app_header.link-groups_center_store_main_accessories_pins-patches"),
        href: getLocaleUrl("/store/merch/pins"),
      },
      {
        label: t("app_header.link-groups_center_store_main_accessories_keychains"),
        href: getLocaleUrl("/store/accessories/keychains"),
      },
    ],
  });

  const storeApparelGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_store_main_apparel_title"),
    links: [
      {
        label: t("app_header.link-groups_center_store_main_apparel_bottles-mugs"),
        href: getLocaleUrl("/store/apparel/bottles-mugs"),
      },
    ],
  });

  const storeCollectiblesGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_store_main_collectibles_title"),
    links: [
      {
        label: t("app_header.link-groups_center_store_main_collectibles_figurines-statues"),
        href: getLocaleUrl("/store/collectibles/figurines"),
      },
      {
        label: t("app_header.link-groups_center_store_main_collectibles_plushies"),
        href: getLocaleUrl("/store/merch/plushies"),
      },
    ],
  });

  const storeArtGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_center_store_main_art_title"),
    links: [
      {
        label: t("app_header.link-groups_center_store_main_art_posters-prints"),
        href: getLocaleUrl("/store/merch/posters"),
      },
      {
        label: t("app_header.link-groups_center_store_main_art_comics-books"),
        href: getLocaleUrl("/store/art/books"),
      },
      {
        label: t("app_header.link-groups_center_store_main_art_physical-games"),
        href: getLocaleUrl("/store/art/games"),
      },
    ],
  });

  const storeAssistanceGroup = (): RLLinkGroupProps => ({
    label: t("app_header.link-groups_right_store_assistance_title"),
    links: [
      {
        label: t("app_header.link-groups_right_store_assistance_orders"),
        href: getLocaleUrl("/store/orders"),
        leadingIcon: "i-lucide-shopping-bag",
      },
      {
        label: t("app_header.link-groups_right_store_assistance_customer-support"),
        href: getLocaleUrl("/franchises/grand-tale/support"),
        leadingIcon: "i-lucide-help-circle",
      },
    ],
  });

  const leftLinks = (): NavigationMenuItem[] => [
    {
      label: t("app_header.left-links_grand-tale_label"),
      to: getLocaleUrl("/franchises/grand-tale"),
      slot: "grand-tale" as const,
      children: [
        {
          label: t("app_header.link-groups_center_grand-tale_main_title"),
          children: [
            {
              label: t("app_header.link-groups_center_grand-tale_main_news"),
              to: getLocaleUrl("/franchises/grand-tale/news"),
            },
            {
              label: t("app_header.link-groups_center_grand-tale_main_about"),
              to: getLocaleUrl("/franchises/grand-tale/about"),
            },
            {
              label: t("app_header.link-groups_center_grand-tale_main_wiki"),
              to: getLocaleUrl("/franchises/grand-tale/wiki"),
            },
            {
              label: t("app_header.link-groups_center_grand-tale_main_guides"),
              to: getLocaleUrl("/franchises/grand-tale/guides"),
            },
            {
              label: t("app_header.link-groups_center_grand-tale_main_forums"),
              to: getLocaleUrl("/franchises/grand-tale/forums"),
            },
            {
              label: t("app_header.link-groups_center_grand-tale_main_leaderboards"),
              to: getLocaleUrl("/franchises/grand-tale/leaderboards"),
            },
          ],
        },
        {
          label: t("app_header.link-groups_center_grand-tale_series_title"),
          children: [
            {
              label: t("app_header.link-groups_center_grand-tale_series_children-of-the-light"),
              to: getLocaleUrl("/franchises/grand-tale/wiki/series/children-of-the-light"),
            },
            {
              label: t("app_header.link-groups_center_grand-tale_series_grand-academy"),
              to: getLocaleUrl("/franchises/grand-tale/wiki/series/grand-academy"),
            },
            {
              label: t("app_header.link-groups_center_grand-tale_series_goldy-adventures"),
              to: getLocaleUrl("/franchises/grand-tale/wiki/series/goldy-adventures"),
            },
          ],
        },
        {
          label: t("app_header.link-groups_center_grand-tale_books_title"),
          children: [
            {
              label: t("app_header.link-groups_center_grand-tale_books_the-first-tale"),
              to: getLocaleUrl("/franchises/grand-tale/wiki/books/the-first-tale"),
            },
          ],
        },
        {
          label: t("app_header.link-groups_center_grand-tale_comics_title"),
          children: [
            {
              label: t("app_header.link-groups_center_grand-tale_comics_ori-friends"),
              to: getLocaleUrl("/franchises/grand-tale/wiki/comics/ori-and-friends"),
            },
          ],
        },
      ],
    },
    {
      label: t("app_header.left-links_community_label"),
      slot: "community" as const,
      children: [
        {
          label: t("app_header.link-groups_center_community_forums_title"),
          children: [
            {
              label: t("app_header.link-groups_center_community_forums_rimelight"),
              to: getLocaleUrl("/forums/rimelight"),
            },
            {
              label: t("app_header.link-groups_center_community_forums_grand-tale"),
              to: getLocaleUrl("/forums/grand-tale"),
            },
          ],
        },
        {
          label: t("app_header.link-groups_center_community_events_title"),
          children: [
            {
              label: t("app_header.link-groups_center_community_events_lightcon"),
              to: getLocaleUrl("/events/lightcon"),
            },
          ],
        },
      ],
    },
    {
      label: t("app_header.left-links_company_label"),
      to: getLocaleUrl("/company"),
      slot: "company" as const,
      children: [
        {
          label: t("app_header.link-groups_center_company_main_studio_title"),
          children: [
            {
              label: t("app_header.link-groups_center_company_main_studio_about-us"),
              to: getLocaleUrl("/company/about"),
            },
            {
              label: t("app_header.link-groups_center_company_main_studio_partnerships"),
              to: getLocaleUrl("/company/studio/partnerships"),
            },
          ],
        },
        {
          label: t("app_header.link-groups_center_company_main_careers_title"),
          children: [
            {
              label: t("app_header.link-groups_center_company_main_careers_life"),
              to: getLocaleUrl("/company/careers/culture"),
            },
            {
              label: t("app_header.link-groups_center_company_main_careers_jobs"),
              to: getLocaleUrl("/company/careers"),
            },
          ],
        },
        {
          label: t("app_header.link-groups_center_company_main_news_title"),
          children: [
            {
              label: t("app_header.link-groups_center_company_main_news_blog"),
              to: getLocaleUrl("/company/blog"),
            },
          ],
        },
        {
          label: t("app_header.links_company_resources_title"),
          children: [
            {
              label: t("app_header.link-groups_right_company_resources_docs"),
              to: getLocaleUrl("/company/docs"),
            },
          ],
        },
      ],
    },
    {
      label: t("app_header.left-links_store_label"),
      to: getLocaleUrl("/store"),
      slot: "store" as const,
      children: [
        {
          label: t("app_header.link-groups_center_store_main_digital-goods_title"),
          to: getLocaleUrl("/store/digital"),
        },
        {
          label: t("app_header.link-groups_center_store_main_deals_title"),
          children: [
            {
              label: t("app_header.link-groups_center_store_main_deals_new-releases"),
              to: getLocaleUrl("/store/deals/new"),
            },
            {
              label: t("app_header.link-groups_center_store_main_deals_sales"),
              to: getLocaleUrl("/store/deals/sales"),
            },
            {
              label: t("app_header.link-groups_center_store_main_deals_bundles"),
              to: getLocaleUrl("/store/deals/bundles"),
            },
          ],
        },
        {
          label: t("app_header.link-groups_center_store_main_clothing_title"),
          children: [
            {
              label: t("app_header.link-groups_center_store_main_clothing_headwear"),
              to: getLocaleUrl("/store/clothing/headwear"),
            },
            {
              label: t("app_header.link-groups_center_store_main_clothing_tops"),
              to: getLocaleUrl("/store/clothing/tops"),
            },
            {
              label: t("app_header.link-groups_center_store_main_clothing_bottoms"),
              to: getLocaleUrl("/store/clothing/bottoms"),
            },
          ],
        },
        {
          label: t("app_header.link-groups_center_store_main_accessories_title"),
          children: [
            {
              label: t("app_header.link-groups_center_store_main_accessories_jewelry"),
              to: getLocaleUrl("/store/accessories/jewelry"),
            },
            {
              label: t("app_header.link-groups_center_store_main_accessories_pins-patches"),
              to: getLocaleUrl("/store/merch/pins"),
            },
            {
              label: t("app_header.link-groups_center_store_main_accessories_keychains"),
              to: getLocaleUrl("/store/accessories/keychains"),
            },
          ],
        },
        {
          label: t("app_header.link-groups_center_store_main_apparel_title"),
          children: [
            {
              label: t("app_header.link-groups_center_store_main_apparel_bottles-mugs"),
              to: getLocaleUrl("/store/apparel/bottles-mugs"),
            },
          ],
        },
        {
          label: t("app_header.link-groups_center_store_main_collectibles_title"),
          children: [
            {
              label: t("app_header.link-groups_center_store_main_collectibles_figurines-statues"),
              to: getLocaleUrl("/store/collectibles/figurines"),
            },
            {
              label: t("app_header.link-groups_center_store_main_collectibles_plushies"),
              to: getLocaleUrl("/store/merch/plushies"),
            },
          ],
        },
        {
          label: t("app_header.link-groups_center_store_main_art_title"),
          children: [
            {
              label: t("app_header.link-groups_center_store_main_art_posters-prints"),
              to: getLocaleUrl("/store/merch/posters"),
            },
            {
              label: t("app_header.link-groups_center_store_main_art_comics-books"),
              to: getLocaleUrl("/store/art/books"),
            },
            {
              label: t("app_header.link-groups_center_store_main_art_physical-games"),
              to: getLocaleUrl("/store/art/games"),
            },
          ],
        },
      ],
    },
  ];

  const actions = (): RLButtonProps[] => [
    {
      color: "neutral",
      variant: "outline",
      href: "/api/auth/login?screen_hint=signup",
      label: t("app_header.actions_sign-up"),
    },
    {
      variant: "solid",
      color: "primary",
      href: "/api/auth/login",
      label: t("app_header.actions_sign-in"),
    },
  ];

  const userDropdownItems = (): DropdownMenuItem[] =>
    props.session
      ? [
          {
            type: "label",
            label:
              currentUser()?.tag && currentUser()?.tag !== "0000"
                ? `${currentUser()?.name} #${currentUser()?.tag}`
                : `${currentUser()?.name || currentUser()?.email || "User"}`,
          },
          {
            label: t("app_header.user_dropdown_dashboard"),
            icon: "i-lucide-layout-dashboard",
            to: getLocaleUrl("/dashboard"),
          },
          {
            label: t("app_header.user_dropdown_profile"),
            icon: "i-lucide-user",
            to: getLocaleUrl("/dashboard/profile"),
          },
          {
            label: t("app_header.user_dropdown_settings"),
            icon: "i-lucide-cog",
            to: getLocaleUrl("/dashboard/settings"),
          },
          {
            type: "separator",
          },
          {
            label: t("app_header.user_dropdown_sign-out"),
            icon: "i-lucide-log-out",
            to: "/api/auth/logout",
            color: "error",
          },
        ]
      : [];

  return (
    <RLHeader
      fixed={true}
      stackIndex={props.stackIndex ?? 1}
      data-theme="dark"
      class="scroll-header bg-black"
      left={
        <div class="flex items-center gap-md">
          <div class="hidden md:flex flex-row gap-md items-center">
            <RLLogo variant="logomark" class="h-10 w-auto" mode="color" />
            <RLNavigationMenu
              items={leftLinks()}
              variant="link"
              slots={{
                "grand-tale": () => (
                  <div class="flex flex-col lg:flex-row gap-lg bg-default w-full">
                    <div class="bg-default flex flex-col lg:flex-row gap-lg p-lg flex-1">
                      <RLImage
                        class="h-32 lg:h-full w-full lg:w-auto object-cover lg:max-w-80 shrink-0 rounded"
                        src="https://cdn.rimelight.com/images/placeholder_header_grand-tale.jpg"
                        alt=""
                      />
                      <div class="flex flex-col gap-sm flex-2">
                        <div class="grid grid-cols-2 gap-xl gap-y-4">
                          <RLLinkGroup
                            {...grandTaleLinkGroup()}
                            ui={{ title: "!text-primary-500" }}
                          />
                          <div class="flex flex-col gap-lg">
                            <RLLinkGroup
                              {...grandTaleSeriesLinkGroup()}
                              ui={{ title: "!text-primary-500" }}
                            />
                            <RLLinkGroup
                              {...grandTaleBooksLinkGroup()}
                              ui={{ title: "!text-primary-500" }}
                            />
                            <RLLinkGroup
                              {...grandTaleComicsLinkGroup()}
                              ui={{ title: "!text-primary-500" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="bg-muted p-lg w-64 shrink-0">
                      <RLLinkGroup
                        {...grandTaleResourcesGroup()}
                        ui={{ title: "!text-primary-500" }}
                      />
                      <RLLinkGroup
                        {...grandTaleSocialsGroup()}
                        ui={{ title: "!text-primary-500" }}
                      />
                    </div>
                  </div>
                ),
                community: () => (
                  <div class="flex flex-col lg:flex-row gap-lg bg-default w-full">
                    <div class="bg-default flex flex-col lg:flex-row gap-lg p-lg flex-1">
                      <RLImage
                        class="h-32 lg:h-full w-full lg:w-auto object-cover lg:max-w-80 shrink-0 rounded"
                        src="https://cdn.rimelight.com/images/placeholder_header_community.jpg"
                        alt=""
                      />
                      <div class="flex flex-col gap-sm flex-2">
                        <div class="grid grid-cols-2 gap-1">
                          <RLLinkGroup {...commForumsGroup()} ui={{ title: "!text-primary-500" }} />
                          <RLLinkGroup {...commEventsGroup()} ui={{ title: "!text-primary-500" }} />
                        </div>
                      </div>
                    </div>
                    <div class="bg-muted p-lg w-64 shrink-0">
                      <RLLinkGroup {...commSocialsGroup()} ui={{ title: "!text-primary-500" }} />
                    </div>
                  </div>
                ),
                company: () => (
                  <div class="flex flex-col lg:flex-row gap-lg bg-default w-full">
                    <div class="bg-default flex flex-col lg:flex-row gap-lg p-lg flex-1">
                      <RLImage
                        class="h-32 lg:h-full w-full lg:w-auto object-cover lg:max-w-80 shrink-0 rounded"
                        src="https://cdn.rimelight.com/images/placeholder_header_company.jpg"
                        alt=""
                      />
                      <div class="flex flex-col gap-sm flex-2">
                        <div class="grid grid-cols-3 gap-1">
                          <RLLinkGroup {...compStudioGroup()} ui={{ title: "!text-primary-500" }} />
                          <RLLinkGroup
                            {...compCareersGroup()}
                            ui={{ title: "!text-primary-500" }}
                          />
                          <RLLinkGroup {...compNewsGroup()} ui={{ title: "!text-primary-500" }} />
                        </div>
                      </div>
                    </div>
                    <div class="bg-muted p-lg w-64 shrink-0">
                      <RLLinkGroup {...compResourcesGroup()} ui={{ title: "!text-primary-500" }} />
                      <RLLinkGroup {...compSocialsGroup()} ui={{ title: "!text-primary-500" }} />
                    </div>
                  </div>
                ),
                store: () => (
                  <div class="flex flex-col lg:flex-row gap-lg bg-default w-full">
                    <div class="bg-default flex flex-col lg:flex-row gap-lg p-lg flex-1">
                      <RLImage
                        class="h-32 lg:h-full w-full lg:w-auto object-cover lg:max-w-80 shrink-0 rounded"
                        src="https://cdn.rimelight.com/images/placeholder_header_store.jpg"
                        alt=""
                      />
                      <div class="flex flex-col gap-sm flex-2">
                        <div class="grid grid-cols-3 gap-xl gap-y-4">
                          <div class="flex flex-col gap-lg">
                            <RLLinkGroup
                              {...storeDealsGroup()}
                              ui={{ title: "!text-primary-500" }}
                            />
                          </div>
                          <div class="flex flex-col gap-lg">
                            <RLLinkGroup
                              {...storeClothingGroup()}
                              ui={{ title: "!text-primary-500" }}
                            />
                            <RLLinkGroup
                              {...storeAccessoriesGroup()}
                              ui={{ title: "!text-primary-500" }}
                            />
                          </div>
                          <div class="flex flex-col gap-lg">
                            <RLLinkGroup
                              {...storeApparelGroup()}
                              ui={{ title: "!text-primary-500" }}
                            />
                            <RLLinkGroup
                              {...storeCollectiblesGroup()}
                              ui={{ title: "!text-primary-500" }}
                            />
                            <RLLinkGroup {...storeArtGroup()} ui={{ title: "!text-primary-500" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="bg-muted p-lg w-64 shrink-0">
                      <RLLinkGroup
                        {...storeAssistanceGroup()}
                        ui={{ title: "!text-primary-500" }}
                      />
                    </div>
                  </div>
                ),
              }}
              ui={{
                viewportWrapper:
                  "top-[var(--rl-header-height,64px)] flex justify-center fixed left-0 right-0 z-[150] mt-0 bg-transparent",
                viewport:
                  "w-full rounded-none border-none shadow-xl mt-0 pointer-events-auto overflow-hidden",
                link: "text-white transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400",
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
                ui={{
                  link: "flex justify-start items-center w-full text-left py-2 text-lg transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400",
                }}
              />
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
                        src={currentUser()?.avatar || currentUser()?.image}
                        alt={currentUser()?.name}
                        size="sm"
                      />
                      <span
                        class={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-black ${
                          currentUser()?.availability === "busy"
                            ? "bg-error-500"
                            : currentUser()?.availability === "invisible"
                              ? "bg-neutral-500"
                              : "bg-success-500"
                        }`}
                      />
                    </div>
                    <span class="hidden md:inline text-sm font-medium">{currentUser()?.name}</span>
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
                        src={currentUser()?.avatar || currentUser()?.image}
                        alt={currentUser()?.name}
                        size="sm"
                      />
                      <span
                        class={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-black ${
                          currentUser()?.availability === "busy"
                            ? "bg-error-500"
                            : currentUser()?.availability === "invisible"
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
  );
};

export default AppHeader;
