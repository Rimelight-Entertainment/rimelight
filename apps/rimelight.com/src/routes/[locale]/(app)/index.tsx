import { type Component, For, Show, createMemo } from "solid-js";
import { getLocaleUrl, t, getCurrentLocale } from "@rimelight/i18n";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLVideo } from "@rimelight/ui/components/video/RLVideo.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import type { RLButtonProps } from "@rimelight/ui/components/button/button.types.ts";
import { content, type PublicEntry } from "@rimelight/cms/solid";
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx";

export const HomePage: Component = () => {
  const activeLocale = () => getCurrentLocale();

  /** The 3 most recent published blog posts, from the CMS delivery API. */
  const latestPosts = createMemo<PublicEntry[]>(
    async () => (await content.entries("blog", { limit: 3, locale: activeLocale() })).entries,
  );

  const heroLinks = (): RLButtonProps[] => [
    {
      label: t("page.home.section.hero.actions.join-us"),
      href: getLocaleUrl("/auth/sign-up"),
      color: "blurple",
      variant: "solid",
      class:
        "px-8 py-3 rounded-md font-bold transition-all duration-300 transform hover:scale-[1.03]",
    },
    {
      label: t("page.home.section.hero.actions.learn-more"),
      href: getLocaleUrl("/company/about"),
      color: "neutral",
      variant: "outline",
      trailingIcon: "i-lucide-arrow-right",
      class:
        "text-white ring-white bg-transparent hover:bg-white hover:text-black px-8 py-3 rounded-md font-bold transition-all duration-300 transform hover:scale-[1.03]",
    },
  ];

  const ctaLinks = (): RLButtonProps[] => [
    {
      label: t("page.home.section.cta.actions.create-account"),
      href: getLocaleUrl("/auth/sign-up"),
      color: "blurple",
      variant: "solid",
      class:
        "px-8 py-3 rounded-md font-bold transition-all duration-300 transform hover:scale-[1.03]",
    },
    {
      label: t("page.home.section.cta.actions.explore-careers"),
      href: getLocaleUrl("/company/careers"),
      color: "neutral",
      variant: "outline",
      class:
        "text-white ring-white bg-transparent hover:bg-white hover:text-black px-8 py-3 rounded-md font-bold transition-all duration-300 transform hover:scale-[1.03]",
    },
  ];

  return (
    <>
      <RLPageSection
        variant="hero"
        reverse={true}
        title={t("page.home.section.hero.title")}
        description={t("page.home.section.hero.description")}
        links={heroLinks()}
        ui={{
          title: "text-white",
          description: "text-neutral-300",
        }}
        backgroundSlot={
          <div class="w-full h-full">
            <RLImage
              src="https://cdn.rimelight.com/images/placeholder_home_hero_background.webp"
              alt={t("app.text.hero-background")}
              class="h-full w-full object-cover"
              loading="eager"
              width={1999}
              height={833}
            />
            <div class="absolute inset-0 bg-black/45" />
          </div>
        }
      >
        <RLLogo
          class="pointer-events-none h-64 w-auto text-white"
          variant="logomark"
          mode="white"
        />
      </RLPageSection>

      <RLPageSection
        orientation="horizontal"
        title={t("page.home.section.company.title", { interactive: "interactive media" })}
        description={t("page.home.section.company.description")}
        ui={{
          title: "text-white",
          description: "text-neutral-300",
        }}
        backgroundSlot={
          <div class="w-full h-full">
            <RLImage
              src="https://cdn.rimelight.com/images/placeholder_home_company_background.webp"
              alt={t("app.text.company-background")}
              class="h-full w-full object-cover opacity-10"
              width={9000}
              height={4000}
            />
            <div class="absolute inset-0 bg-black/90" />
          </div>
        }
        bodySlot={
          <div class="grid grid-cols-2 gap-lg mt-8 border-t border-neutral-800/50 pt-8 max-w-xl">
            <div>
              <div class="text-4xl lg:text-5xl font-black text-white tracking-tight">3+</div>
              <div class="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">
                {t("page.home.section.company.stats.titles")}
              </div>
            </div>
            <div>
              <div class="text-4xl lg:text-5xl font-black text-white tracking-tight">50+</div>
              <div class="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">
                {t("page.home.section.company.stats.creators")}
              </div>
            </div>
          </div>
        }
      >
        <div class="flex items-center justify-center lg:pl-12 w-full mt-10 lg:mt-0">
          <RLVideo
            src="https://www.youtube.com/watch?v=uH1Hw6SDI1M"
            title={t("app.text.we-are-rimelight-entertainment")}
            class="aspect-video w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl border border-neutral-800"
          />
        </div>
      </RLPageSection>

      <RLPageSection
        orientation="vertical"
        title={t("page.home.section.projects.title")}
        class="w-full relative z-10 py-24 bg-black border-t border-neutral-900"
        ui={{
          title:
            "text-white text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-center",
          description: "hidden",
        }}
        backgroundSlot={
          <div class="w-full h-full">
            <RLImage
              src="https://cdn.rimelight.com/images/placeholder_home_projects_background.webp"
              alt={t("app.text.projects-background")}
              class="h-full w-full object-cover opacity-15"
              width={5000}
              height={3542}
            />
            <div class="absolute inset-0 bg-neutral-950/80" />
          </div>
        }
        bodySlot={
          <div class="flex flex-wrap justify-center gap-lg mt-12 w-full max-w-7xl mx-auto px-4">
            <a
              href={getLocaleUrl("/franchises/grand-tale")}
              class="block relative h-128 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] group rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 transition-all duration-300"
            >
              <div class="relative h-full w-full overflow-hidden isolate transition-transform duration-700 ease-out group-hover:scale-[1.02] rounded-[inherit] will-change-transform bg-neutral-900">
                <div class="absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
                  <RLImage
                    alt={t("app.text.grand-tale")}
                    src="https://cdn.rimelight.com/images/placeholder_home_projects_grand-tale.webp"
                    class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 will-change-transform opacity-75"
                    width={900}
                    height={1512}
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                </div>

                <div class="absolute inset-0 p-lg flex flex-col gap-sm justify-end z-10">
                  <div class="flex gap-sm">
                    <span class="text-white text-xs font-bold uppercase tracking-wider bg-primary-500 px-3 py-1 rounded-full shadow-md">
                      {t("page.home.section.projects.tags.franchise")}
                    </span>
                    <span class="text-white text-xs font-bold uppercase tracking-wider bg-primary-500 px-3 py-1 rounded-full shadow-md">
                      {t("page.home.section.projects.tags.fantasy")}
                    </span>
                    <span class="text-white text-xs font-bold uppercase tracking-wider bg-primary-500 px-3 py-1 rounded-full shadow-md">
                      {t("page.home.section.projects.tags.social")}
                    </span>
                  </div>

                  <h3 class="text-3xl font-extrabold uppercase text-white mt-2 tracking-tight">
                    Grand Tale
                  </h3>

                  <p class="text-neutral-300 text-sm mt-1 leading-relaxed">
                    {t("page.home.section.projects.content.grand-tale.description")}
                  </p>

                  <div class="flex items-center text-primary-400 font-bold uppercase tracking-widest text-xs mt-4 group-hover:text-primary-300 transition-colors">
                    <span>{t("page.home.section.projects.actions.discover")}</span>
                    <svg
                      class="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1.5 duration-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          </div>
        }
      />

      <RLPageSection
        orientation="vertical"
        title={t("page.home.section.news.title")}
        description={t("page.home.section.news.description")}
        class="w-full relative z-10 py-24 bg-neutral-950 border-t border-neutral-900"
        ui={{
          title:
            "text-white text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-center",
          description: "text-neutral-400 text-center max-w-2xl mx-auto mt-4",
        }}
        backgroundSlot={
          <div class="w-full h-full">
            <RLImage
              src="https://cdn.rimelight.com/images/placeholder_home_news_background.webp"
              alt={t("app.text.news-background")}
              class="h-full w-full object-cover opacity-15"
              width={1320}
              height={743}
            />
            <div class="absolute inset-0 bg-black/85" />
          </div>
        }
        bodySlot={
          <div class="w-full mt-12 max-w-7xl mx-auto px-4">
            <RLGrid>
              <For each={latestPosts() || []}>
                {(post) => {
                  const category = post.terms?.find((x) => x.taxonomy === "category")?.label;
                  const date = post.publishedAt || post.updatedAt;
                  return (
                    <RLPost
                      title={t.localize(post.title)}
                      description={
                        t.localize(post.description ?? {}) || post.properties?.["excerpt"] || ""
                      }
                      date={date ? new Date(date) : undefined}
                      image={post.properties?.["cover"] as string | Record<string, any> | undefined}
                      badge={
                        category
                          ? typeof category === "string"
                            ? category
                            : t.localize(category as any)
                          : undefined
                      }
                      to={getLocaleUrl(`/company/blog/${post.slug}/`)}
                      variant="ghost"
                    />
                  );
                }}
              </For>
            </RLGrid>

            <Show when={(latestPosts() || []).length > 0}>
              <div class="flex justify-center mt-14">
                <RLButton
                  label={t("page.home.section.news.actions.view-all")}
                  href={getLocaleUrl("/company/blog")}
                  color="primary"
                  variant="link"
                  trailingIcon="i-lucide-arrow-right"
                  class="font-bold uppercase tracking-widest text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-xs"
                />
              </div>
            </Show>
          </div>
        }
      />

      <RLPageSection
        variant="cta"
        ctaVariant="solid"
        title={t("page.home.section.cta.title")}
        description={t("page.home.section.cta.description")}
        links={ctaLinks()}
        class="w-full relative z-10 py-24 bg-black border-t border-neutral-900 rounded-none overflow-hidden"
        ui={{
          title:
            "text-white text-5xl lg:text-6xl font-black uppercase tracking-tight text-center leading-none",
          description: "text-neutral-300 text-lg md:text-xl text-center max-w-xl mx-auto mt-4",
        }}
        backgroundSlot={
          <div class="w-full h-full">
            <RLImage
              src="https://cdn.rimelight.com/images/placeholder_home_cta_background.webp"
              alt={t("app.text.cta-background")}
              class="h-full w-full object-cover opacity-20"
              width={3000}
              height={2000}
            />
            <div class="absolute inset-0 bg-neutral-950/80" />
          </div>
        }
      />
    </>
  );
};

export default HomePage;
