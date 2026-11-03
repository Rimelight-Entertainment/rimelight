import { type Component, For, Show } from "solid-js";
import { RLHeader } from "@rimelight/ui/components/header/RLHeader.tsx";
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx";
import { RLNavigationMenu } from "@rimelight/ui/components/navigation-menu/RLNavigationMenu.tsx";
import { RLLinkGroup } from "@rimelight/ui/components/link-group/RLLinkGroup.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLSlideover } from "@rimelight/ui/components/slideover/RLSlideover.tsx";
import { RLAvatar } from "@rimelight/ui/components/avatar/RLAvatar.tsx";
import { RLSearch } from "@rimelight/ui/components/search/RLSearch.tsx";
import { RLDropdownMenu } from "@rimelight/ui/components/dropdown-menu/RLDropdownMenu.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import type { RLButtonProps } from "@rimelight/ui/components/button/button.types.ts";
import type { RLLinkGroupProps } from "@rimelight/ui/components/link-group/link-group.types.ts";
import { useShortcuts } from "@rimelight/ui/shortcuts";
import type { NavigationMenuItem } from "@rimelight/ui/components/navigation-menu/navigation-menu.types.ts";
import type { DropdownMenuItem } from "@rimelight/ui/components/dropdown-menu/dropdown-menu.types.ts";
import { t, getLocaleUrl } from "@rimelight/i18n";

export interface AppHeaderProps {
  session?: any;
  stackIndex?: number;
}

export const AppHeader: Component<AppHeaderProps> = (props) => {
  const currentUser = () => props.session?.user ?? props.session;

  const grandTaleLinkGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.grand-tale.main.title"),
    links: [
      {
        label: t("app.header.link-groups.center.grand-tale.main.news"),
        href: getLocaleUrl("/franchises/grand-tale/news"),
      },
      {
        label: t("app.header.link-groups.center.grand-tale.main.about"),
        href: getLocaleUrl("/franchises/grand-tale/about"),
      },
      {
        label: t("app.header.link-groups.center.grand-tale.main.wiki"),
        href: getLocaleUrl("/franchises/grand-tale/wiki"),
      },
      {
        label: t("app.header.link-groups.center.grand-tale.main.guides"),
        href: getLocaleUrl("/franchises/grand-tale/guides"),
      },
      {
        label: t("app.header.link-groups.center.grand-tale.main.forums"),
        href: getLocaleUrl("/franchises/grand-tale/forums"),
      },
      {
        label: t("app.header.link-groups.center.grand-tale.main.leaderboards"),
        href: getLocaleUrl("/franchises/grand-tale/leaderboards"),
      },
    ],
  });

  const grandTaleSeriesLinkGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.grand-tale.series.title"),
    links: [
      {
        label: t("app.header.link-groups.center.grand-tale.series.children-of-the-light"),
        href: getLocaleUrl("/franchises/grand-tale/wiki/series/children-of-the-light"),
      },
      {
        label: t("app.header.link-groups.center.grand-tale.series.grand-academy"),
        href: getLocaleUrl("/franchises/grand-tale/wiki/series/grand-academy"),
      },
      {
        label: t("app.header.link-groups.center.grand-tale.series.goldy-adventures"),
        href: getLocaleUrl("/franchises/grand-tale/wiki/series/goldy-adventures"),
      },
    ],
  });

  const grandTaleBooksLinkGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.grand-tale.books.title"),
    links: [
      {
        label: t("app.header.link-groups.center.grand-tale.books.the-first-tale"),
        href: getLocaleUrl("/franchises/grand-tale/wiki/books/the-first-tale"),
      },
    ],
  });

  const grandTaleComicsLinkGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.grand-tale.comics.title"),
    links: [
      {
        label: t("app.header.link-groups.center.grand-tale.comics.ori-friends"),
        href: getLocaleUrl("/franchises/grand-tale/wiki/comics/ori-and-friends"),
      },
    ],
  });

  const grandTaleResourcesGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.right.grand-tale.resources.title"),
    links: [
      {
        label: t("app.header.link-groups.right.grand-tale.resources.download"),
        href: getLocaleUrl("/franchises/grand-tale/download"),
        leadingIcon: "i-lucide-download",
      },
      {
        label: t("app.header.link-groups.right.grand-tale.resources.support"),
        href: getLocaleUrl("/franchises/grand-tale/support"),
        leadingIcon: "i-lucide-headset",
      },
    ],
  });

  const grandTaleSocialsGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.right.grand-tale.socials.title"),
    links: [
      {
        label: t("app.header.link-groups.right.grand-tale.socials.discord"),
        href: "https://discord.com/",
        leadingIcon: "i-logos-discord-icon",
      },
      {
        label: t("app.header.link-groups.right.grand-tale.socials.youtube"),
        href: "https://youtube.com/",
        leadingIcon: "i-logos-youtube-icon",
      },
      {
        label: t("app.header.link-groups.right.grand-tale.socials.instagram"),
        href: "https://instagram.com/",
        leadingIcon: "i-logos-instagram-icon",
      },
    ],
  });

  const commForumsGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.community.forums.title"),
    links: [
      {
        label: t("app.header.link-groups.center.community.forums.rimelight"),
        href: getLocaleUrl("/forums/rimelight"),
      },
      {
        label: t("app.header.link-groups.center.community.forums.grand-tale"),
        href: getLocaleUrl("/forums/grand-tale"),
      },
    ],
  });

  const commEventsGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.community.events.title"),
    links: [
      {
        label: t("app.header.link-groups.center.community.events.lightcon"),
        href: getLocaleUrl("/events/lightcon"),
      },
    ],
  });

  const commSocialsGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.right.grand-tale.socials.title"),
    links: [
      {
        label: t("app.header.link-groups.right.community.socials.instagram"),
        href: "https://www.instagram.com/",
        leadingIcon: "i-logos-instagram-icon",
      },
      {
        label: t("app.header.link-groups.right.community.socials.discord"),
        href: "https://discord.com/",
        leadingIcon: "i-logos-discord-icon",
      },
      {
        label: t("app.header.link-groups.right.community.socials.spotify"),
        href: "https://open.spotify.com",
        leadingIcon: "i-logos-spotify-icon",
      },
    ],
  });

  const compStudioGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.company.main.studio.title"),
    links: [
      {
        label: t("app.header.link-groups.center.company.main.studio.about-us"),
        href: getLocaleUrl("/company/about"),
      },
      {
        label: t("app.header.link-groups.center.company.main.studio.partnerships"),
        href: getLocaleUrl("/company/studio/partnerships"),
      },
    ],
  });

  const compCareersGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.company.main.careers.title"),
    links: [
      {
        label: t("app.header.link-groups.center.company.main.careers.life"),
        href: getLocaleUrl("/company/careers/culture"),
      },
      {
        label: t("app.header.link-groups.center.company.main.careers.jobs"),
        href: getLocaleUrl("/company/careers"),
      },
    ],
  });

  const compNewsGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.company.main.news.title"),
    links: [
      {
        label: t("app.header.link-groups.center.company.main.news.blog"),
        href: getLocaleUrl("/company/blog"),
      },
    ],
  });

  const compResourcesGroup = (): RLLinkGroupProps => ({
    label: t("app.header.links.company.resources.title"),
    links: [
      {
        label: t("app.header.link-groups.right.company.resources.docs"),
        href: getLocaleUrl("/company/docs"),
        leadingIcon: "i-lucide-file-text",
      },
      {
        label: t("app.header.link-groups.right.company.resources.branding"),
        href: getLocaleUrl("/company/branding"),
        leadingIcon: "i-lucide-image",
      },
      {
        label: t("app.header.link-groups.right.company.resources.legal"),
        href: getLocaleUrl("/company/legal"),
        leadingIcon: "i-lucide-scale",
      },
    ],
  });

  const compSocialsGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.right.company.socials.title"),
    links: [
      {
        label: t("app.header.link-groups.right.company.socials.linkedin"),
        href: "https://linkedin.com/",
        leadingIcon: "i-logos-linkedin-icon",
      },
      {
        label: t("app.header.link-groups.right.company.socials.github"),
        href: "https://github.com/Rimelight-Entertainment",
        leadingIcon: "i-logos-github-icon",
      },
    ],
  });

  const storeDealsGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.store.main.deals.title"),
    links: [
      {
        label: t("app.header.link-groups.center.store.main.deals.new-releases"),
        href: getLocaleUrl("/store/deals/new"),
      },
      {
        label: t("app.header.link-groups.center.store.main.deals.sales"),
        href: getLocaleUrl("/store/deals/sales"),
      },
      {
        label: t("app.header.link-groups.center.store.main.deals.bundles"),
        href: getLocaleUrl("/store/deals/bundles"),
      },
    ],
  });

  const storeClothingGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.store.main.clothing.title"),
    links: [
      {
        label: t("app.header.link-groups.center.store.main.clothing.headwear"),
        href: getLocaleUrl("/store/clothing/headwear"),
      },
      {
        label: t("app.header.link-groups.center.store.main.clothing.tops"),
        href: getLocaleUrl("/store/clothing/tops"),
      },
      {
        label: t("app.header.link-groups.center.store.main.clothing.bottoms"),
        href: getLocaleUrl("/store/clothing/bottoms"),
      },
    ],
  });

  const storeAccessoriesGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.store.main.accessories.title"),
    links: [
      {
        label: t("app.header.link-groups.center.store.main.accessories.jewelry"),
        href: getLocaleUrl("/store/accessories/jewelry"),
      },
      {
        label: t("app.header.link-groups.center.store.main.accessories.pins-patches"),
        href: getLocaleUrl("/store/merch/pins"),
      },
      {
        label: t("app.header.link-groups.center.store.main.accessories.keychains"),
        href: getLocaleUrl("/store/accessories/keychains"),
      },
    ],
  });

  const storeApparelGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.store.main.apparel.title"),
    links: [
      {
        label: t("app.header.link-groups.center.store.main.apparel.bottles-mugs"),
        href: getLocaleUrl("/store/apparel/bottles-mugs"),
      },
    ],
  });

  const storeCollectiblesGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.store.main.collectibles.title"),
    links: [
      {
        label: t("app.header.link-groups.center.store.main.collectibles.figurines-statues"),
        href: getLocaleUrl("/store/collectibles/figurines"),
      },
      {
        label: t("app.header.link-groups.center.store.main.collectibles.plushies"),
        href: getLocaleUrl("/store/merch/plushies"),
      },
    ],
  });

  const storeArtGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.center.store.main.art.title"),
    links: [
      {
        label: t("app.header.link-groups.center.store.main.art.posters-prints"),
        href: getLocaleUrl("/store/merch/posters"),
      },
      {
        label: t("app.header.link-groups.center.store.main.art.comics-books"),
        href: getLocaleUrl("/store/art/books"),
      },
      {
        label: t("app.header.link-groups.center.store.main.art.physical-games"),
        href: getLocaleUrl("/store/art/games"),
      },
    ],
  });

  const storeAssistanceGroup = (): RLLinkGroupProps => ({
    label: t("app.header.link-groups.right.store.assistance.title"),
    links: [
      {
        label: t("app.header.link-groups.right.store.assistance.orders"),
        href: getLocaleUrl("/store/orders"),
        leadingIcon: "i-lucide-shopping-bag",
      },
      {
        label: t("app.header.link-groups.right.store.assistance.customer-support"),
        href: getLocaleUrl("/franchises/grand-tale/support"),
        leadingIcon: "i-lucide-help-circle",
      },
    ],
  });

  const leftLinks = (): NavigationMenuItem[] => [
    {
      label: t("app.header.left-links.grand-tale.label"),
      to: getLocaleUrl("/franchises/grand-tale"),
      panel: "grand-tale" as const,
      children: [
        {
          label: t("app.header.link-groups.center.grand-tale.main.title"),
          children: [
            {
              label: t("app.header.link-groups.center.grand-tale.main.news"),
              to: getLocaleUrl("/franchises/grand-tale/news"),
            },
            {
              label: t("app.header.link-groups.center.grand-tale.main.about"),
              to: getLocaleUrl("/franchises/grand-tale/about"),
            },
            {
              label: t("app.header.link-groups.center.grand-tale.main.wiki"),
              to: getLocaleUrl("/franchises/grand-tale/wiki"),
            },
            {
              label: t("app.header.link-groups.center.grand-tale.main.guides"),
              to: getLocaleUrl("/franchises/grand-tale/guides"),
            },
            {
              label: t("app.header.link-groups.center.grand-tale.main.forums"),
              to: getLocaleUrl("/franchises/grand-tale/forums"),
            },
            {
              label: t("app.header.link-groups.center.grand-tale.main.leaderboards"),
              to: getLocaleUrl("/franchises/grand-tale/leaderboards"),
            },
          ],
        },
        {
          label: t("app.header.link-groups.center.grand-tale.series.title"),
          children: [
            {
              label: t("app.header.link-groups.center.grand-tale.series.children-of-the-light"),
              to: getLocaleUrl("/franchises/grand-tale/wiki/series/children-of-the-light"),
            },
            {
              label: t("app.header.link-groups.center.grand-tale.series.grand-academy"),
              to: getLocaleUrl("/franchises/grand-tale/wiki/series/grand-academy"),
            },
            {
              label: t("app.header.link-groups.center.grand-tale.series.goldy-adventures"),
              to: getLocaleUrl("/franchises/grand-tale/wiki/series/goldy-adventures"),
            },
          ],
        },
        {
          label: t("app.header.link-groups.center.grand-tale.books.title"),
          children: [
            {
              label: t("app.header.link-groups.center.grand-tale.books.the-first-tale"),
              to: getLocaleUrl("/franchises/grand-tale/wiki/books/the-first-tale"),
            },
          ],
        },
        {
          label: t("app.header.link-groups.center.grand-tale.comics.title"),
          children: [
            {
              label: t("app.header.link-groups.center.grand-tale.comics.ori-friends"),
              to: getLocaleUrl("/franchises/grand-tale/wiki/comics/ori-and-friends"),
            },
          ],
        },
      ],
    },
    {
      label: t("app.header.left-links.community.label"),
      panel: "community" as const,
      children: [
        {
          label: t("app.header.link-groups.center.community.forums.title"),
          children: [
            {
              label: t("app.header.link-groups.center.community.forums.rimelight"),
              to: getLocaleUrl("/forums/rimelight"),
            },
            {
              label: t("app.header.link-groups.center.community.forums.grand-tale"),
              to: getLocaleUrl("/forums/grand-tale"),
            },
          ],
        },
        {
          label: t("app.header.link-groups.center.community.events.title"),
          children: [
            {
              label: t("app.header.link-groups.center.community.events.lightcon"),
              to: getLocaleUrl("/events/lightcon"),
            },
          ],
        },
      ],
    },
    {
      label: t("app.header.left-links.company.label"),
      to: getLocaleUrl("/company"),
      panel: "company" as const,
      children: [
        {
          label: t("app.header.link-groups.center.company.main.studio.title"),
          children: [
            {
              label: t("app.header.link-groups.center.company.main.studio.about-us"),
              to: getLocaleUrl("/company/about"),
            },
            {
              label: t("app.header.link-groups.center.company.main.studio.partnerships"),
              to: getLocaleUrl("/company/studio/partnerships"),
            },
          ],
        },
        {
          label: t("app.header.link-groups.center.company.main.careers.title"),
          children: [
            {
              label: t("app.header.link-groups.center.company.main.careers.life"),
              to: getLocaleUrl("/company/careers/culture"),
            },
            {
              label: t("app.header.link-groups.center.company.main.careers.jobs"),
              to: getLocaleUrl("/company/careers"),
            },
          ],
        },
        {
          label: t("app.header.link-groups.center.company.main.news.title"),
          children: [
            {
              label: t("app.header.link-groups.center.company.main.news.blog"),
              to: getLocaleUrl("/company/blog"),
            },
          ],
        },
        {
          label: t("app.header.links.company.resources.title"),
          children: [
            {
              label: t("app.header.link-groups.right.company.resources.docs"),
              to: getLocaleUrl("/company/docs"),
            },
          ],
        },
      ],
    },
    {
      label: t("app.header.left-links.store.label"),
      to: getLocaleUrl("/store"),
      panel: "store" as const,
      children: [
        {
          label: t("app.header.link-groups.center.store.main.digital-goods.title"),
          to: getLocaleUrl("/store/digital"),
        },
        {
          label: t("app.header.link-groups.center.store.main.deals.title"),
          children: [
            {
              label: t("app.header.link-groups.center.store.main.deals.new-releases"),
              to: getLocaleUrl("/store/deals/new"),
            },
            {
              label: t("app.header.link-groups.center.store.main.deals.sales"),
              to: getLocaleUrl("/store/deals/sales"),
            },
            {
              label: t("app.header.link-groups.center.store.main.deals.bundles"),
              to: getLocaleUrl("/store/deals/bundles"),
            },
          ],
        },
        {
          label: t("app.header.link-groups.center.store.main.clothing.title"),
          children: [
            {
              label: t("app.header.link-groups.center.store.main.clothing.headwear"),
              to: getLocaleUrl("/store/clothing/headwear"),
            },
            {
              label: t("app.header.link-groups.center.store.main.clothing.tops"),
              to: getLocaleUrl("/store/clothing/tops"),
            },
            {
              label: t("app.header.link-groups.center.store.main.clothing.bottoms"),
              to: getLocaleUrl("/store/clothing/bottoms"),
            },
          ],
        },
        {
          label: t("app.header.link-groups.center.store.main.accessories.title"),
          children: [
            {
              label: t("app.header.link-groups.center.store.main.accessories.jewelry"),
              to: getLocaleUrl("/store/accessories/jewelry"),
            },
            {
              label: t("app.header.link-groups.center.store.main.accessories.pins-patches"),
              to: getLocaleUrl("/store/merch/pins"),
            },
            {
              label: t("app.header.link-groups.center.store.main.accessories.keychains"),
              to: getLocaleUrl("/store/accessories/keychains"),
            },
          ],
        },
        {
          label: t("app.header.link-groups.center.store.main.apparel.title"),
          children: [
            {
              label: t("app.header.link-groups.center.store.main.apparel.bottles-mugs"),
              to: getLocaleUrl("/store/apparel/bottles-mugs"),
            },
          ],
        },
        {
          label: t("app.header.link-groups.center.store.main.collectibles.title"),
          children: [
            {
              label: t("app.header.link-groups.center.store.main.collectibles.figurines-statues"),
              to: getLocaleUrl("/store/collectibles/figurines"),
            },
            {
              label: t("app.header.link-groups.center.store.main.collectibles.plushies"),
              to: getLocaleUrl("/store/merch/plushies"),
            },
          ],
        },
        {
          label: t("app.header.link-groups.center.store.main.art.title"),
          children: [
            {
              label: t("app.header.link-groups.center.store.main.art.posters-prints"),
              to: getLocaleUrl("/store/merch/posters"),
            },
            {
              label: t("app.header.link-groups.center.store.main.art.comics-books"),
              to: getLocaleUrl("/store/art/books"),
            },
            {
              label: t("app.header.link-groups.center.store.main.art.physical-games"),
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
      label: t("app.header.actions.sign-up"),
    },
    {
      variant: "solid",
      color: "primary",
      href: "/api/auth/login",
      label: t("app.header.actions.sign-in"),
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
            label: t("app.header.user.dropdown.dashboard"),
            icon: "i-lucide-layout-dashboard",
            href: getLocaleUrl("/dashboard"),
          },
          {
            label: t("app.header.user.dropdown.profile"),
            icon: "i-lucide-user",
            href: getLocaleUrl("/dashboard/profile"),
          },
          {
            label: t("app.header.user.dropdown.settings"),
            icon: "i-lucide-cog",
            href: getLocaleUrl("/dashboard/settings"),
          },
          {
            type: "separator",
          },
          {
            label: t("app.header.user.dropdown.sign-out"),
            icon: "i-lucide-log-out",
            href: "/api/auth/logout",
            color: "error",
          },
        ]
      : [];

  const leftSlots = () => ({
    "grand-tale": () => (
      <div class="flex flex-col lg:flex-row gap-lg bg-default w-full">
        <div class="bg-default flex flex-col lg:flex-row gap-lg p-lg flex-1">
          <RLImage
            class="h-32 lg:h-full w-full lg:w-auto object-cover lg:max-w-80 shrink-0 rounded"
            src="https://cdn.rimelight.com/images/placeholder_header_grand-tale.webp"
            alt=""
          />
          <div class="flex flex-col gap-sm flex-2">
            <div class="grid grid-cols-2 gap-xl gap-y-4">
              <RLLinkGroup {...grandTaleLinkGroup()} ui={{ title: "!text-primary-500" }} />
              <div class="flex flex-col gap-lg">
                <RLLinkGroup {...grandTaleSeriesLinkGroup()} ui={{ title: "!text-primary-500" }} />
                <RLLinkGroup {...grandTaleBooksLinkGroup()} ui={{ title: "!text-primary-500" }} />
                <RLLinkGroup {...grandTaleComicsLinkGroup()} ui={{ title: "!text-primary-500" }} />
              </div>
            </div>
          </div>
        </div>
        <div class="bg-muted p-lg w-64 shrink-0">
          <RLLinkGroup {...grandTaleResourcesGroup()} ui={{ title: "!text-primary-500" }} />
          <RLLinkGroup {...grandTaleSocialsGroup()} ui={{ title: "!text-primary-500" }} />
        </div>
      </div>
    ),
    community: () => (
      <div class="flex flex-col lg:flex-row gap-lg bg-default w-full">
        <div class="bg-default flex flex-col lg:flex-row gap-lg p-lg flex-1">
          <RLImage
            class="h-32 lg:h-full w-full lg:w-auto object-cover lg:max-w-80 shrink-0 rounded"
            src="https://cdn.rimelight.com/images/placeholder_header_community.webp"
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
            src="https://cdn.rimelight.com/images/placeholder_header_company.webp"
            alt=""
          />
          <div class="flex flex-col gap-sm flex-2">
            <div class="grid grid-cols-3 gap-1">
              <RLLinkGroup {...compStudioGroup()} ui={{ title: "!text-primary-500" }} />
              <RLLinkGroup {...compCareersGroup()} ui={{ title: "!text-primary-500" }} />
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
            src="https://cdn.rimelight.com/images/placeholder_header_store.webp"
            alt=""
          />
          <div class="flex flex-col gap-sm flex-2">
            <div class="grid grid-cols-3 gap-xl gap-y-4">
              <div class="flex flex-col gap-lg">
                <RLLinkGroup {...storeDealsGroup()} ui={{ title: "!text-primary-500" }} />
              </div>
              <div class="flex flex-col gap-lg">
                <RLLinkGroup {...storeClothingGroup()} ui={{ title: "!text-primary-500" }} />
                <RLLinkGroup {...storeAccessoriesGroup()} ui={{ title: "!text-primary-500" }} />
              </div>
              <div class="flex flex-col gap-lg">
                <RLLinkGroup {...storeApparelGroup()} ui={{ title: "!text-primary-500" }} />
                <RLLinkGroup {...storeCollectiblesGroup()} ui={{ title: "!text-primary-500" }} />
                <RLLinkGroup {...storeArtGroup()} ui={{ title: "!text-primary-500" }} />
              </div>
            </div>
          </div>
        </div>
        <div class="bg-muted p-lg w-64 shrink-0">
          <RLLinkGroup {...storeAssistanceGroup()} ui={{ title: "!text-primary-500" }} />
        </div>
      </div>
    ),
  });

  /** Mobile accordion panel: header image on top, then every link group stacked in one column. */
  const mobilePanel = (src: string, groups: Array<() => any>) => () => (
    <div class="flex flex-col gap-lg py-md">
      <RLImage class="h-32 w-full object-cover rounded" src={src} alt="" />
      {groups.map((group) => (
        <RLLinkGroup {...group()} ui={{ title: "!text-primary-500" }} />
      ))}
    </div>
  );

  const leftMobileSlots = {
    "grand-tale": mobilePanel(
      "https://cdn.rimelight.com/images/placeholder_header_grand-tale.webp",
      [
        grandTaleLinkGroup,
        grandTaleSeriesLinkGroup,
        grandTaleBooksLinkGroup,
        grandTaleComicsLinkGroup,
        grandTaleResourcesGroup,
        grandTaleSocialsGroup,
      ],
    ),
    community: mobilePanel("https://cdn.rimelight.com/images/placeholder_header_community.webp", [
      commForumsGroup,
      commEventsGroup,
      commSocialsGroup,
    ]),
    company: mobilePanel("https://cdn.rimelight.com/images/placeholder_header_company.webp", [
      compStudioGroup,
      compCareersGroup,
      compNewsGroup,
      compResourcesGroup,
      compSocialsGroup,
    ]),
    store: mobilePanel("https://cdn.rimelight.com/images/placeholder_header_store.webp", [
      storeDealsGroup,
      storeClothingGroup,
      storeAccessoriesGroup,
      storeApparelGroup,
      storeCollectiblesGroup,
      storeArtGroup,
      storeAssistanceGroup,
    ]),
  };

  return (
    <RLHeader
      fixed={true}
      stackIndex={props.stackIndex ?? 0}
      data-theme="dark"
      class="scroll-header bg-black"
      leadingSlot={
        <div class="flex items-center gap-md">
          <div class="hidden md:flex flex-row gap-md items-center">
            <RLLogo variant="logomark" class="h-10 w-auto" mode="color" />
            <RLNavigationMenu
              items={leftLinks()}
              panels={leftSlots()}
              ui={{
                link: "text-white transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400",
              }}
            />
          </div>

          <div class="block md:hidden">
            <RLSlideover
              side="left"
              title={t("app.text.menu")}
              triggerSlot={
                <RLButton
                  color="neutral"
                  variant="ghost"
                  rounded={true}
                  leadingIcon="i-lucide-menu"
                  class="!text-white"
                  aria-label={t("app.text.open-menu")}
                />
              }
            >
              <RLNavigationMenu
                items={leftLinks()}
                panels={leftMobileSlots}
                orientation="vertical"
                ui={{
                  link: "flex justify-start items-center w-full text-left py-2 text-lg transition-colors duration-200 hover:text-primary-400 data-[state=open]:text-primary-400 aria-[current]:text-primary-400",
                }}
              />
            </RLSlideover>
          </div>
        </div>
      }
      centerSlot={
        <div class="flex items-center gap-md">
          <div class="block md:hidden">
            <RLLogo variant="logomark" class="h-10 w-auto" mode="color" />
          </div>
        </div>
      }
      trailingSlot={
        <div class="flex items-center gap-md">
          <RLSearch />
          <RLButton
            variant="ghost"
            color="neutral"
            leadingIcon="i-lucide-keyboard"
            aria-label={t("app.text.keyboard-shortcuts")}
            onClick={() => useShortcuts().open()}
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
                triggerSlot={
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
                  title={t("app.text.actions")}
                  triggerSlot={
                    <RLButton
                      color="neutral"
                      variant="ghost"
                      rounded={true}
                      leadingIcon="i-lucide-ellipsis-vertical"
                      class="!text-white"
                      aria-label={t("app.text.open-actions")}
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
                triggerSlot={
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
