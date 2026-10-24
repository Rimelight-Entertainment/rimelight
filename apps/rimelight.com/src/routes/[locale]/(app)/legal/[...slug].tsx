import { type Component, Show, createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import { PageRenderer, content } from "@rimelight/cms/solid";
import { config as cmsConfig } from "virtual:rimelight-cms";
import { RLDate } from "@rimelight/ui/components/date/RLDate.tsx";
import { t, getCurrentLocale } from "@rimelight/i18n";

export const LegalDocumentPage: Component = () => {
  const params = useParams<{ locale: string; slug?: string }>();
  const activeLocale = () => getCurrentLocale();

  const pageData = createMemo(
    async () => {
      const preview =
        typeof window !== "undefined"
          ? (new URL(location.href).searchParams.get("preview") ?? undefined)
          : undefined;
      return params.slug ? content.entry("legal", params.slug, preview) : null;
    },
    { loadingValue: null },
  );

  const title = () => t.localize(pageData()?.title) || "Legal Document";
  const description = () => t.localize(pageData()?.description ?? undefined) || "";

  return (
    <Show
      when={pageData()}
      fallback={<div class="p-16 text-center text-neutral-400">Loading document...</div>}
    >
      <article class="max-w-4xl mx-auto px-4 py-16">
        <header class="mb-12">
          <div class="text-sm text-primary-400 mb-2">
            <RLDate date={pageData()?.publishedAt ?? new Date()} />
          </div>
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            {title()}
          </h1>
          <p class="text-xl text-neutral-400 leading-relaxed">{description()}</p>
        </header>

        <PageRenderer
          blocks={pageData()?.blocks ?? []}
          blockDefinitions={cmsConfig.blocks}
          locale={activeLocale()}
        />
      </article>
    </Show>
  );
};

export default LegalDocumentPage;
