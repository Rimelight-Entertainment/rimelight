import { type Component, createSignal, For } from "solid-js";
import BlankLayout from "#layouts/BlankLayout";

const samplePages = [
  {
    label: "Home",
    title: "Rimelight Starter Template",
    description: "Look around, test, and play with interactive technologies.",
    type: "",
    isDocs: false,
  },
  {
    label: "Docs — Overview",
    title: "Getting Started",
    description: "Everything you need to get up and running.",
    type: "Documentation",
    isDocs: true,
  },
  {
    label: "Docs — API Reference",
    title: "API Reference",
    description: "Complete API reference for integrations.",
    type: "Documentation",
    isDocs: true,
  },
  {
    label: "Blog Post",
    title: "Announcing Starter v2",
    description: "A look at what's new in our update.",
    type: "Blog Post",
    isDocs: false,
  },
];

export const DevOgPage: Component = () => {
  const [copiedUrl, setCopiedUrl] = createSignal<string | null>(null);
  const [sandboxTitle, setSandboxTitle] = createSignal("My Custom Page Title");
  const [sandboxDesc, setSandboxDesc] = createSignal("A short description of this page.");
  const [sandboxType, setSandboxType] = createSignal("");
  const [sandboxDocs, setSandboxDocs] = createSignal(false);
  const [sandboxImgSrc, setSandboxImgSrc] = createSignal("");

  const bust = Date.now().toString();

  const getOgUrl = (page: (typeof samplePages)[0]) => {
    const params = new URLSearchParams({
      title: page.title,
      description: page.description,
      ...(page.type ? { type: page.type } : {}),
      ...(page.isDocs ? { isDocs: "true" } : {}),
      _t: bust,
    });
    return `/open-graph/page.png?${params.toString()}`;
  };

  const copyUrl = async (url: string) => {
    if (typeof window === "undefined") return;
    const full = new URL(url, window.location.origin).toString();
    await navigator.clipboard.writeText(full);
    setCopiedUrl(url);
    setTimeout(() => {
      setCopiedUrl(null);
    }, 2000);
  };

  const handleRenderSandbox = () => {
    const params = new URLSearchParams({
      title: sandboxTitle().trim(),
      description: sandboxDesc().trim(),
    });
    if (sandboxType().trim()) params.set("type", sandboxType().trim());
    if (sandboxDocs()) params.set("isDocs", "true");
    params.set("_t", Date.now().toString());

    setSandboxImgSrc(`/open-graph/page.png?${params.toString()}`);
  };

  return (
    <BlankLayout title="OG Image Preview" description="Preview Open Graph images for all pages">
      <main class="max-w-7xl mx-auto px-6 py-12 font-sans bg-[#0d0d0d] text-[#e5e5e5] min-h-screen">
        <header class="mb-10 border-b border-[#222] pb-6">
          <h1 class="text-3xl font-bold text-white mb-2">OG Image Preview</h1>
          <p class="text-sm text-neutral-400">
            Live previews of generated Open Graph images via{" "}
            <code class="bg-[#1a1a1a] px-1.5 py-0.5 rounded text-blue-400 text-xs font-mono">
              /open-graph/page.png
            </code>
          </p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <For each={samplePages}>
            {(page) => {
              const url = getOgUrl(page);
              return (
                <article class="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
                  <div class="flex items-center gap-2.5 px-5 py-3">
                    <h2 class="text-sm font-semibold text-white">{page.label}</h2>
                    {page.type && (
                      <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 whitespace-nowrap">
                        {page.type}
                      </span>
                    )}
                  </div>
                  <a href={url} target="_blank" class="block relative overflow-hidden group">
                    <img
                      src={url}
                      alt={`OG image for ${page.label}`}
                      class="block w-full h-auto aspect-[1200/630] object-cover bg-[#1a1a1a]"
                      width="1200"
                      height="630"
                      loading="lazy"
                    />
                    <div class="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Open full size ↗
                    </div>
                  </a>
                  <div class="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-[#1a1a1a]">
                    <div class="flex flex-col gap-0.5 min-w-0">
                      <strong class="text-xs text-neutral-200 truncate">{page.title}</strong>
                      {page.description && (
                        <span class="text-xs text-neutral-500 truncate">{page.description}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyUrl(url)}
                      class={`shrink-0 px-3.5 py-1.5 bg-[#1a1a1a] border rounded-md text-xs font-medium cursor-pointer transition-colors ${
                        copiedUrl() === url
                          ? "text-green-400 border-green-500/40"
                          : "text-neutral-300 border-[#333] hover:bg-[#222] hover:border-[#444]"
                      }`}
                    >
                      {copiedUrl() === url ? "Copied!" : "Copy URL"}
                    </button>
                  </div>
                </article>
              );
            }}
          </For>
        </div>

        <section class="border-t border-[#222] pt-10">
          <h2 class="text-xl font-bold text-white mb-1.5">Live Sandbox</h2>
          <p class="text-sm text-neutral-400 mb-6">
            Render a custom OG image with any title and description.
          </p>
          <div class="flex flex-wrap gap-3 items-end mb-6">
            <label class="flex flex-col gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex-1 min-w-[180px]">
              Title
              <input
                type="text"
                value={sandboxTitle()}
                onInput={(e) => {
                  setSandboxTitle(e.currentTarget.value);
                }}
                maxlength={80}
                class="px-3 py-2 bg-[#111] border border-[#333] rounded-md text-sm text-neutral-200 outline-none focus:border-blue-400"
              />
            </label>
            <label class="flex flex-col gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex-1 min-w-[180px]">
              Description
              <input
                type="text"
                value={sandboxDesc()}
                onInput={(e) => {
                  setSandboxDesc(e.currentTarget.value);
                }}
                maxlength={160}
                class="px-3 py-2 bg-[#111] border border-[#333] rounded-md text-sm text-neutral-200 outline-none focus:border-blue-400"
              />
            </label>
            <label class="flex flex-col gap-1.5 text-xs font-semibold text-neutral-400 uppercase tracking-wider flex-1 min-w-[180px]">
              Type badge
              <input
                type="text"
                value={sandboxType()}
                onInput={(e) => {
                  setSandboxType(e.currentTarget.value);
                }}
                placeholder="e.g. Blog Post"
                maxlength={40}
                class="px-3 py-2 bg-[#111] border border-[#333] rounded-md text-sm text-neutral-200 outline-none focus:border-blue-400"
              />
            </label>
            <label class="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={sandboxDocs()}
                onChange={(e) => setSandboxDocs(e.currentTarget.checked)}
                class="size-4"
              />
              Docs style (gradient)
            </label>
            <button
              type="button"
              onClick={handleRenderSandbox}
              class="px-5 py-2.5 bg-blue-400 hover:bg-blue-300 text-black font-bold text-sm rounded-md cursor-pointer transition-colors mb-0.5"
            >
              Render
            </button>
          </div>
          {sandboxImgSrc() && (
            <div class="mt-2">
              <img
                src={sandboxImgSrc()}
                alt="Sandbox OG preview"
                class="rounded-lg border border-[#222] w-full max-w-2xl"
                width="1200"
                height="630"
              />
            </div>
          )}
        </section>
      </main>
    </BlankLayout>
  );
};

export default DevOgPage;
