import { type Component, For } from "solid-js";
import DevLayout from "#layouts/DevLayout";
import { getCurrentLocale, getLocaleUrl } from "@rimelight/i18n";
import { RLCard, RLPageSection } from "@rimelight/ui";
import { devHub, devSections } from "#layouts/DevLayout";

export const DevIndexPage: Component = () => {
  const locale = () => getCurrentLocale();

  return (
    <DevLayout title={devHub.title} description={devHub.description}>
      <RLPageSection title={devHub.title} description={devHub.sectionDescription}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <For each={devSections}>
            {(section) => (
              <RLCard
                href={getLocaleUrl(section.href, locale())}
                title={
                  <span class="flex items-center gap-2.5">
                    <span class={`${section.icon} size-5 shrink-0 text-primary`} />
                    <span class="leading-none">{section.title}</span>
                  </span>
                }
                description={section.description}
              />
            )}
          </For>
        </div>
      </RLPageSection>
    </DevLayout>
  );
};

export default DevIndexPage;
