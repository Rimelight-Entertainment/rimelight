import { type Component, For, createSignal } from "solid-js";
import BlankLayout from "#layouts/BlankLayout";

interface PageItem {
  label: string;
  title: string;
  description: string;
  type: string;
  isDocs: boolean;
}

const pages: PageItem[] = [
  {
    label: "Home",
    title: "Rimelight Entertainment",
    description: "Tell your story.",
    type: "",
    isDocs: false
  },
  {
    label: "Company",
    title: "About Rimelight",
    description: "Creating interactive entertainment and software tools.",
    type: "Company",
    isDocs: false
  },
  {
    label: "Products",
    title: "Rimelight Products & Games",
    description: "Explore Grand Tale and our ecosystem of open-source tools.",
    type: "Products",
    isDocs: false
  },
  {
    label: "Docs — Overview",
    title: "Getting Started",
    description: "Everything you need to get up and running with Rimelight.",
    type: "Documentation",
    isDocs: true
  },
  {
    label: "Docs — API Reference",
    title: "API Reference",
    description: "Complete API reference for Rimelight integrations.",
    type: "Documentation",
    isDocs: true
  },
  {
    label: "Blog Post",
    title: "Announcing Grand Tale v2",
    description: "A look at what's new in our biggest update yet.",
    type: "Blog Post",
    isDocs: false
  },
  {
    label: "User Profile (Dynamic)",
    title: "idant",
    description: "View idant's profile on Rimelight.",
    type: "Profile",
    isDocs: false
  }
];

function ogUrl(page: PageItem) {
  const params = new URLSearchParams({
    title: page.title,
    description: page.description,
    ...(page.type ? { type: page.type } : {}),
    ...(page.isDocs ? { isDocs: "true" } : {})
  });
  return `/open-graph/page.png?${params.toString()}`;
}

export const DevOgPage: Component = () => {
  const [sandboxTitle, setSandboxTitle] = createSignal("My Custom Page Title");
  const [sandboxDesc, setSandboxDesc] = createSignal("A short description of this page.");
  const [sandboxType, setSandboxType] = createSignal("");
  const [sandboxDocs, setSandboxDocs] = createSignal(false);
  const [copiedUrl, setCopiedUrl] = createSignal<string | null>(null);

  const sandboxUrl = () => {
    const params = new URLSearchParams({ title: sandboxTitle(), description: sandboxDesc() });
    if (sandboxType()) params.set("type", sandboxType());
    if (sandboxDocs()) params.set("isDocs", "true");
    return `/open-graph/page.png?${params.toString()}`;
  };

  const copyUrl = async (url: string) => {
    const full = new URL(url, window.location.origin).toString();
    await navigator.clipboard.writeText(full);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <BlankLayout title="OG Image Preview" description="Preview Open Graph images for all pages">
      <main class="max-w-7xl mx-auto px-6 py-12 font-sans bg-neutral-950 text-neutral-200">
        <header class="mb-10 pb-6 border-b border-neutral-800">
          <h1 class="text-3xl font-bold text-white mb-2">OG Image Preview</h1>
          <p class="text-neutral-400 text-sm">
            Live previews of generated Open Graph images via{" "}
            <code class="bg-neutral-900 text-blue-400 px-2 py-0.5 rounded text-xs">
              /open-graph/page.png
            </code>
          </p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <For each={pages}>
            {(page) => {
              const url = ogUrl(page);
              const isCopied = () => copiedUrl() === url;
              return (
                <article class="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                  <div class="flex items-center gap-3 px-5 py-3">
                    <h2 class="text-base font-semibold text-white">{page.label}</h2>
                    {page.type && (
                      <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300">
                        {page.type}
                      </span>
                    )}
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    class="block relative group overflow-hidden bg-neutral-950"
                  >
                    <img
                      src={url}
                      alt={`OG image for ${page.label}`}
                      class="w-full aspect-[1200/630] object-cover"
                      loading="lazy"
                    />
                    <div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Open full size ↗
                    </div>
                  </a>
                  <div class="flex items-center justify-between gap-3 p-4 border-t border-neutral-800">
                    <div class="flex flex-col min-w-0">
                      <strong class="text-sm text-neutral-200 truncate">{page.title}</strong>
                      {page.description && (
                        <span class="text-xs text-neutral-500 truncate">{page.description}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyUrl(url)}
                      class="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-md text-xs font-medium text-neutral-200 transition-colors"
                      style={{
                        color: isCopied() ? "#4ade80" : undefined,
                        "border-color": isCopied() ? "rgba(74, 222, 128, 0.4)" : undefined
                      }}
                    >
                      {isCopied() ? "Copied!" : "Copy URL"}
                    </button>
                  </div>
                </article>
              );
            }}
          </For>
        </div>

        <section class="border-t border-neutral-800 pt-10">
          <h2 class="text-xl font-bold text-white mb-2">Live Sandbox</h2>
          <p class="text-neutral-400 text-sm mb-6">
            Render a custom OG image with any title and description.
          </p>

          <div class="flex flex-wrap gap-4 items-end mb-6">
            <label class="flex flex-col gap-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex-1 min-w-[180px]">
              Title
              <input
                type="text"
                value={sandboxTitle()}
                onInput={(e: any) => setSandboxTitle(e.currentTarget.value)}
                class="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-neutral-200 text-sm focus:border-blue-500 outline-none"
              />
            </label>
            <label class="flex flex-col gap-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex-1 min-w-[180px]">
              Description
              <input
                type="text"
                value={sandboxDesc()}
                onInput={(e: any) => setSandboxDesc(e.currentTarget.value)}
                class="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-neutral-200 text-sm focus:border-blue-500 outline-none"
              />
            </label>
            <label class="flex flex-col gap-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex-1 min-w-[180px]">
              Type badge
              <input
                type="text"
                value={sandboxType()}
                placeholder="e.g. Blog Post"
                onInput={(e: any) => setSandboxType(e.currentTarget.value)}
                class="px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-md text-neutral-200 text-sm focus:border-blue-500 outline-none"
              />
            </label>
            <label class="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={sandboxDocs()}
                onChange={(e: any) => setSandboxDocs(e.currentTarget.checked)}
                class="w-4 h-4 rounded bg-neutral-900"
              />
              Docs style
            </label>
          </div>

          <div class="rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900">
            <img
              src={sandboxUrl()}
              alt="Sandbox OG preview"
              class="w-full aspect-[1200/630] object-cover"
            />
          </div>
        </section>
      </main>
    </BlankLayout>
  );
};

export default DevOgPage;
