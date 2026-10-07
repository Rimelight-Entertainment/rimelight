import { type Component, createSignal, createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import DashboardLayout from "#layouts/DashboardLayout";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { getRelativeLocaleUrl, getCurrentLocale } from "@rimelight/i18n";

export const WikiEditPage: Component = () => {
  const params = useParams<{ locale: string; slug?: string }>();
  const currentLocale = () => getCurrentLocale();
  const [titleVal, setTitleVal] = createSignal("");
  const [descVal, setDescVal] = createSignal("");
  const [saving, setSaving] = createSignal(false);

  const pageData = createMemo<any>(
    async () => {
      const slug = params.slug;
      if (!slug) return null;
      try {
        const lookupSlug = `franchises/grand-tale/wiki/${slug}`;
        const res = await fetch(`/api/content/pages/${encodeURIComponent(lookupSlug)}`);
        if (!res.ok) return null;
        const page = (await res.json()) as any;
        const title =
          typeof page.title === "object"
            ? page.title?.[currentLocale()] || page.title?.en || ""
            : typeof page.title === "string"
              ? page.title
              : "";
        const desc =
          typeof page.description === "object"
            ? page.description?.[currentLocale()] || page.description?.en || ""
            : typeof page.description === "string"
              ? page.description
              : "";
        setTitleVal(title);
        setDescVal(desc);
        return page;
      } catch {
        return null;
      }
    },
    { loadingValue: null },
  );

  const handleSave = async () => {
    const page = pageData();
    if (!page) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/cms/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: { [currentLocale()]: titleVal() },
          description: { [currentLocale()]: descVal() },
        }),
      });
      if (res.ok) alert("Saved!");
      else alert("Failed to save");
    } catch {
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title={`Edit Wiki Page: ${titleVal() || "Untitled"}`}>
      <div class="flex flex-col h-screen overflow-hidden bg-neutral-950 text-white select-none">
        <header class="h-12 w-full border-b border-neutral-800 flex items-center justify-between px-4 shrink-0 z-30">
          <div class="flex items-center gap-2.5">
            <RLButton
              href={getRelativeLocaleUrl("/franchises/grand-tale/wiki", {
                locale: currentLocale(),
              })}
              variant="ghost"
              color="neutral"
              size="xs"
              leadingIcon="i-lucide-arrow-left"
              class="!px-2"
            >
              Wiki
            </RLButton>
            <span class="w-px h-4 bg-neutral-700" />
            <span class="font-semibold text-sm truncate max-w-xs">
              {titleVal() || "Untitled Page"}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <RLButton
              variant="solid"
              color="primary"
              size="xs"
              leadingIcon="i-lucide-save"
              disabled={saving()}
              onClick={handleSave}
            >
              {saving() ? "Saving..." : "Save"}
            </RLButton>
          </div>
        </header>

        <div class="p-8 max-w-5xl mx-auto w-full flex-1 overflow-y-auto">
          <input
            type="text"
            value={titleVal()}
            onInput={(e: any) => setTitleVal(e.currentTarget.value)}
            placeholder="Page Title"
            class="w-full text-3xl font-bold bg-transparent border-b border-neutral-800 py-2 mb-4 focus:outline-none focus:border-indigo-500"
          />
          <textarea
            value={descVal()}
            onInput={(e: any) => setDescVal(e.currentTarget.value)}
            placeholder="Add a description..."
            rows={3}
            class="w-full text-lg text-neutral-400 bg-transparent border border-neutral-800 rounded-lg p-3 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WikiEditPage;
