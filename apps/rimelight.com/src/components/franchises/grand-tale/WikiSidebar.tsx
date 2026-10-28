import type { Component } from "solid-js";
import { t, getLocaleUrl } from "@rimelight/i18n";

export const WikiSidebar: Component = () => {
  const sections = [
    {
      label: t("page.wiki.sidebar.wiki"),
      items: [
        {
          label: t("page.wiki.sidebar.getting.started"),
          to: "/franchises/grand-tale/wiki/getting-started",
        },
        {
          label: t("page.wiki.sidebar.contribution.guide"),
          to: "/franchises/grand-tale/wiki/contribution-guide",
        },
      ],
    },
    {
      label: t("page.wiki.sidebar.lore"),
      items: [
        { label: t("page.wiki.sidebar.timeline"), to: "/franchises/grand-tale/wiki/lore/timeline" },
        {
          label: t("page.wiki.sidebar.characters"),
          to: "/franchises/grand-tale/wiki/lore/characters",
        },
        {
          label: t("page.wiki.sidebar.locations"),
          to: "/franchises/grand-tale/wiki/lore/locations",
        },
        { label: t("page.wiki.sidebar.species"), to: "/franchises/grand-tale/wiki/lore/species" },
        { label: t("page.wiki.sidebar.objects"), to: "/franchises/grand-tale/wiki/lore/objects" },
        { label: t("page.wiki.sidebar.groups"), to: "/franchises/grand-tale/wiki/lore/groups" },
      ],
    },
    {
      label: t("page.wiki.sidebar.game"),
      items: [
        { label: t("page.wiki.sidebar.tales"), to: "/franchises/grand-tale/wiki/game/tales" },
        { label: t("page.wiki.sidebar.items"), to: "/franchises/grand-tale/wiki/game/items" },
        { label: t("page.wiki.sidebar.quests"), to: "/franchises/grand-tale/wiki/game/quests" },
        { label: t("page.wiki.sidebar.skills"), to: "/franchises/grand-tale/wiki/game/skills" },
        { label: t("page.wiki.sidebar.settings"), to: "/franchises/grand-tale/wiki/game/settings" },
      ],
    },
  ];

  return (
    <div class="flex flex-col gap-6 px-4 py-6 bg-indigo-950/20 rounded-2xl border border-indigo-900/30">
      {sections.map((section) => (
        <div class="flex flex-col gap-2">
          <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest opacity-60 px-2">
            {section.label}
          </span>
          <nav class="flex flex-col gap-1">
            {section.items.map((item) => (
              <a
                href={getLocaleUrl(item.to)}
                class="text-sm font-medium text-indigo-300 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-indigo-900/20"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      ))}
    </div>
  );
};

export default WikiSidebar;
