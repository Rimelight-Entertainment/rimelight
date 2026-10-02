import { type Component, For, createMemo } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { t, getRelativeLocaleUrl, getLocale } from "@rimelight/i18n";

function getLocalizedText(val: unknown, locale: string): string {
  if (typeof val === "object" && val !== null) {
    const record = val as Record<string, string>;
    return record[locale] || record["en"] || "";
  }
  return typeof val === "string" ? val : "";
}

export const LegalIndexPage: Component = () => {
  const activeLocale = () => getLocale();

  const legalPages = createMemo<any[]>(
    async () => {
      try {
        const res = await fetch("/api/content/pages?type=legal");
        if (!res.ok) return [];
        const data = (await res.json()) as any;
        return (data.pages || []) as any[];
      } catch {
        return [];
      }
    },
    { loadingValue: [] },
  );

  return (
    <AppLayout title={t("legal.title")} description="Legal information and documentation.">
      <div class="container mx-auto px-4 py-16 max-w-3xl">
        <section class="legal-section">
          <h1 class="text-3xl font-extrabold text-white mb-8">{t("legal.heading")}</h1>
          <ul class="legal-list flex flex-col gap-6">
            <For each={legalPages() || []}>
              {(doc) => {
                const title = getLocalizedText(doc.title, activeLocale());
                const description = getLocalizedText(doc.description, activeLocale());
                const pubDate = doc.postedAt || doc.createdAt;
                return (
                  <li class="legal-item border-b border-neutral-800 pb-6 last:border-b-0">
                    <h3 class="text-xl font-bold text-white mb-2">
                      <a
                        class="text-primary-400 hover:text-primary-300 transition-colors"
                        href={getRelativeLocaleUrl(`/legal/${doc.slug}/`)}
                      >
                        {title}
                      </a>
                    </h3>
                    <p class="text-neutral-400 mb-2 text-sm">{description}</p>
                    <span class="date text-xs text-neutral-500">
                      {t("legal.lastUpdated")} {new Date(pubDate).toLocaleDateString()}
                    </span>
                  </li>
                );
              }}
            </For>
          </ul>
        </section>
      </div>
    </AppLayout>
  );
};

export default LegalIndexPage;
