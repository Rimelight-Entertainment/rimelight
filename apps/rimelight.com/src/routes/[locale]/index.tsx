import { type Component, For, Show, createMemo } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { getRelativeLocaleUrl, t, getLocale } from "@rimelight/i18n";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLLogo } from "@rimelight/ui/components/logo/RLLogo.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLVideo } from "@rimelight/ui/components/video/RLVideo.tsx";
import { RLGrid } from "@rimelight/ui/components/grid/RLGrid.tsx";
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import type { ButtonProps } from "@rimelight/ui/components/button/button.ts";

function getLocalizedText(val: unknown, locale: string): string {
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return typeof val === "string" ? val : "";
}

export const HomePage: Component = () => {
  const activeLocale = () => getLocale();

  const latestPosts = createMemo<any[]>(
    async () => {
      const loc = activeLocale();
      try {
        const res = await fetch("/api/content/pages?type=blog");
        if (!res.ok) return [];
        const data = (await res.json()) as any;
        const blogPages = (data.pages || []) as any[];

        return blogPages
          .filter((post: any) => {
            const content =
              typeof post.content === "string" ? JSON.parse(post.content) : post.content || {};
            return (content.properties?.locale || "en") === loc;
          })
          .slice(0, 3);
      } catch {
        return [];
      }
    },
    { loadingValue: [] },
  );

  const heroLinks = (): ButtonProps[] => [
    {
      label: t("page_home.section_hero_actions_join-us"),
      href: getRelativeLocaleUrl("/auth/sign-up"),
      color: "blurple",
      variant: "solid",
      class:
        "px-8 py-3 rounded-md font-bold transition-all duration-300 transform hover:scale-[1.03]",
    },
    {
      label: t("page_home.section_hero_actions_learn-more"),
      href: getRelativeLocaleUrl("/company/about"),
      color: "neutral",
      variant: "outline",
      trailingIcon: "i-lucide-arrow-right",
      class:
        "text-white ring-white bg-transparent hover:bg-white hover:text-black px-8 py-3 rounded-md font-bold transition-all duration-300 transform hover:scale-[1.03]",
    },
  ];

  const ctaLinks = (): ButtonProps[] => [
    {
      label: t("page_home.section_cta_actions_create-account"),
      href: getRelativeLocaleUrl("/auth/sign-up"),
      color: "blurple",
      variant: "solid",
      class:
        "px-8 py-3 rounded-md font-bold transition-all duration-300 transform hover:scale-[1.03]",
    },
    {
      label: t("page_home.section_cta_actions_explore-careers"),
      href: getRelativeLocaleUrl("/company/careers"),
      color: "neutral",
      variant: "outline",
      class:
        "text-white ring-white bg-transparent hover:bg-white hover:text-black px-8 py-3 rounded-md font-bold transition-all duration-300 transform hover:scale-[1.03]",
    },
  ];

  return (
    <AppLayout title={t("page_home.meta_title")} description={t("page_home.meta_description")}>
      <RLPageSection
        variant="hero"
        reverse={true}
        title={t("page_home.section_hero_title")}
        description={t("page_home.section_hero_description")}
        links={heroLinks()}
        ui={{
          title: "text-white",
          description: "text-neutral-300",
        }}
      >
        <div slot="background" class="w-full h-full">
          <RLImage
            src="https://cdn.rimelight.com/images/placeholder_home_hero_background.png"
            alt="Hero Background"
            class="h-full w-full object-cover"
            loading="eager"
            width={1999}
            height={833}
          />
          <div class="absolute inset-0 bg-black/45" />
        </div>

        <RLLogo
          class="pointer-events-none h-64 w-auto text-white"
          variant="logomark"
          mode="white"
        />
      </RLPageSection>

      <RLPageSection
        orientation="horizontal"
        title={t("page_home.section_company_title").replace("{interactive}", "interactive media")}
        description={t("page_home.section_company_description")}
        ui={{
          title: "text-white",
          description: "text-neutral-300",
        }}
      >
        <div slot="background" class="w-full h-full">
          <RLImage
            src="https://cdn.rimelight.com/images/placeholder_home_company_background.jpg"
            alt="Company Background"
            class="h-full w-full object-cover opacity-10"
            width={9000}
            height={4000}
          />
          <div class="absolute inset-0 bg-black/90" />
        </div>

        <div
          slot="body"
          class="grid grid-cols-2 gap-lg mt-8 border-t border-neutral-800/50 pt-8 max-w-xl"
        >
          <div>
            <div class="text-4xl lg:text-5xl font-black text-white tracking-tight">3+</div>
            <div class="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">
              {t("page_home.section_company_stats_titles")}
            </div>
          </div>
          <div>
            <div class="text-4xl lg:text-5xl font-black text-white tracking-tight">50+</div>
            <div class="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">
              {t("page_home.section_company_stats_creators")}
            </div>
          </div>
        </div>

        <div class="flex items-center justify-center lg:pl-12 w-full mt-10 lg:mt-0">
          <RLVideo
            src="https://www.youtube.com/watch?v=uH1Hw6SDI1M"
            title="We are Rimelight Entertainment"
            class="aspect-video w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl border border-neutral-800"
          />
        </div>
      </RLPageSection>

      <RLPageSection
        orientation="vertical"
        title={t("page_home.section_projects_title")}
        class="w-full relative z-10 py-24 bg-black border-t border-neutral-900"
        ui={{
          title:
            "text-white text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-center",
          description: "hidden",
        }}
      >
        <div slot="background" class="w-full h-full">
          <RLImage
            src="https://cdn.rimelight.com/images/placeholder_home_projects_background.jpg"
            alt="Projects Background"
            class="h-full w-full object-cover opacity-15"
            width={5000}
            height={3542}
          />
          <div class="absolute inset-0 bg-neutral-950/80" />
        </div>

        <div
          slot="body"
          class="flex flex-wrap justify-center gap-lg mt-12 w-full max-w-7xl mx-auto px-4"
        >
          <a
            href={getRelativeLocaleUrl("/franchises/grand-tale")}
            class="block relative h-128 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] group rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 transition-all duration-300"
          >
            <div class="relative h-full w-full overflow-hidden isolate transition-transform duration-700 ease-out group-hover:scale-[1.02] rounded-[inherit] will-change-transform bg-neutral-900">
              <div class="absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
                <RLImage
                  alt="Grand Tale"
                  src="https://cdn.rimelight.com/images/placeholder_home_projects_grand-tale.png"
                  class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 will-change-transform opacity-75"
                  width={900}
                  height={1512}
                />
                <div class="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
              </div>

              <div class="absolute inset-0 p-lg flex flex-col gap-sm justify-end z-10">
                <div class="flex gap-sm">
                  <span class="text-white text-xs font-bold uppercase tracking-wider bg-primary-500 px-3 py-1 rounded-full shadow-md">
                    {t("page_home.section_projects_tags_franchise")}
                  </span>
                  <span class="text-white text-xs font-bold uppercase tracking-wider bg-primary-500 px-3 py-1 rounded-full shadow-md">
                    {t("page_home.section_projects_tags_fantasy")}
                  </span>
                  <span class="text-white text-xs font-bold uppercase tracking-wider bg-primary-500 px-3 py-1 rounded-full shadow-md">
                    {t("page_home.section_projects_tags_social")}
                  </span>
                </div>

                <h3 class="text-3xl font-extrabold uppercase text-white mt-2 tracking-tight">
                  Grand Tale
                </h3>

                <p class="text-neutral-300 text-sm mt-1 leading-relaxed">
                  {t("page_home.section_projects_content_grand-tale_description")}
                </p>

                <div class="flex items-center text-primary-400 font-bold uppercase tracking-widest text-xs mt-4 group-hover:text-primary-300 transition-colors">
                  <span>{t("page_home.section_projects_actions_discover")}</span>
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
      </RLPageSection>

      <RLPageSection
        orientation="vertical"
        title={t("page_home.section_news_title")}
        description={t("page_home.section_news_description")}
        class="w-full relative z-10 py-24 bg-neutral-950 border-t border-neutral-900"
        ui={{
          title:
            "text-white text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-center",
          description: "text-neutral-400 text-center max-w-2xl mx-auto mt-4",
        }}
      >
        <div slot="background" class="w-full h-full">
          <RLImage
            src="https://cdn.rimelight.com/images/placeholder_home_news_background.jpg"
            alt="News Background"
            class="h-full w-full object-cover opacity-15"
            width={1320}
            height={743}
          />
          <div class="absolute inset-0 bg-black/85" />
        </div>

        <div slot="body" class="w-full mt-12 max-w-7xl mx-auto px-4">
          <RLGrid>
            <For each={latestPosts() || []}>
              {(post) => {
                const content =
                  typeof post.content === "string" ? JSON.parse(post.content) : post.content || {};
                const title = getLocalizedText(post.title, activeLocale());
                const description =
                  getLocalizedText(post.description, activeLocale()) ||
                  content.properties?.description ||
                  "";
                const heroImage = content.properties?.heroImage;
                const postDate = post.postedAt || post.createdAt;
                return (
                  <RLPost
                    title={title}
                    description={description}
                    date={postDate}
                    image={heroImage}
                    to={getRelativeLocaleUrl(`/company/blog/${post.slug}/`)}
                    variant="ghost"
                  />
                );
              }}
            </For>
          </RLGrid>

          <Show when={(latestPosts() || []).length > 0}>
            <div class="flex justify-center mt-14">
              <RLButton
                label={t("page_home.section_news_actions_view-all")}
                href={getRelativeLocaleUrl("/blog")}
                color="primary"
                variant="link"
                trailingIcon="i-lucide-arrow-right"
                class="font-bold uppercase tracking-widest text-primary-500 hover:text-primary-400 transition-colors flex items-center gap-xs"
              />
            </div>
          </Show>
        </div>
      </RLPageSection>

      <RLPageSection
        variant="cta"
        ctaVariant="solid"
        title={t("page_home.section_cta_title")}
        description={t("page_home.section_cta_description")}
        links={ctaLinks()}
        class="w-full relative z-10 py-24 bg-black border-t border-neutral-900 rounded-none overflow-hidden"
        ui={{
          title:
            "text-white text-5xl lg:text-6xl font-black uppercase tracking-tight text-center leading-none",
          description: "text-neutral-300 text-lg md:text-xl text-center max-w-xl mx-auto mt-4",
        }}
      >
        <div slot="background" class="w-full h-full">
          <RLImage
            src="https://cdn.rimelight.com/images/placeholder_home_cta_background.jpg"
            alt="CTA Background"
            class="h-full w-full object-cover opacity-20"
            width={3000}
            height={2000}
          />
          <div class="absolute inset-0 bg-neutral-950/80" />
        </div>
      </RLPageSection>
    </AppLayout>
  );
};

export default HomePage;
