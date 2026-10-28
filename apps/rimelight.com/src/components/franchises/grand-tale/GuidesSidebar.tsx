import type { Component } from "solid-js";
import { getLocaleUrl } from "@rimelight/i18n";
import { t } from "@rimelight/i18n";

export const GuidesSidebar: Component = () => {
  const sections = [
    {
      label: t("app.text.guides-explorer"),
      items: [{ label: t("app.text.featured-guides"), to: "/franchises/grand-tale/guides" }],
    },
    {
      label: t("app.text.categories"),
      items: [
        { label: t("app.text.new-players"), to: "/franchises/grand-tale/guides/getting-started" },
        { label: t("app.text.hero-builds"), to: "/franchises/grand-tale/guides/builds" },
        { label: t("app.text.endgame-content"), to: "/franchises/grand-tale/guides/endgame" },
        { label: t("app.text.resources-crafting"), to: "/franchises/grand-tale/guides/crafting" },
      ],
    },
    {
      label: t("app.text.media"),
      items: [{ label: t("app.text.video-guides"), to: "/franchises/grand-tale/guides/videos" }],
    },
    {
      label: t("app.text.tools"),
      items: [
        { label: t("app.text.build-planners"), to: "/franchises/grand-tale/guides/build-planners" },
        { label: t("app.text.calculators"), to: "/franchises/grand-tale/guides/calculators" },
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

export default GuidesSidebar;
