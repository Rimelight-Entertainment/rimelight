import type { Component } from "solid-js";
import { RLHeader } from "@rimelight/ui/components/header/RLHeader.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { getLocaleUrl } from "@rimelight/i18n";

export const GrandTaleHeader: Component = () => {
  const links = [
    { label: "News", to: "/franchises/grand-tale/news" },
    { label: "About", to: "/franchises/grand-tale/about" },
    { label: "Wiki", to: "/franchises/grand-tale/wiki" },
    { label: "Guides", to: "/franchises/grand-tale/guides" },
    { label: "Forums", to: "/franchises/grand-tale/forums" },
    { label: "Leaderboards", to: "/franchises/grand-tale/leaderboards" },
  ];

  const rightLinks = [{ label: "Support", to: "/franchises/grand-tale/support" }];

  return (
    <RLHeader
      fixed={true}
      stackIndex={1}
      class="bg-indigo-950 border-b border-indigo-900 shadow-md"
      left={
        <div class="flex flex-row items-center gap-6">
          <a href={getLocaleUrl("/franchises/grand-tale")}>
            <img
              src="https://cdn.rimelight.com/Franchises/Grand%20Tale/Logos/Grand%20Tale%20-%20Logomark.png"
              alt="Grand Tale Logo"
              class="size-10"
            />
          </a>

          <nav class="hidden lg:flex items-center gap-4">
            {links.map((link) => (
              <a
                href={getLocaleUrl(link.to)}
                class="text-sm font-medium text-indigo-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      }
      right={
        <div class="flex flex-row items-center gap-6">
          <nav class="hidden lg:flex items-center gap-4">
            {rightLinks.map((link) => (
              <a
                href={getLocaleUrl(link.to)}
                class="text-sm font-medium text-indigo-300 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <a href={getLocaleUrl("/franchises/grand-tale/download")}>
            <RLButton
              variant="solid"
              label="Play Now"
              class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm rounded-xl py-2 px-4 shadow-md"
            />
          </a>
        </div>
      }
    />
  );
};

export default GrandTaleHeader;
