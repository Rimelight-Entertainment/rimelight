import { type Component, For, createSignal } from "solid-js";
import DevLayout from "#layouts/DevLayout";

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
    isDocs: false,
  },
  {
    label: "Company",
    title: "About Rimelight",
    description: "Creating interactive entertainment and software tools.",
    type: "Company",
    isDocs: false,
  },
  {
    label: "Products",
    title: "Rimelight Products & Games",
    description: "Explore Grand Tale and our ecosystem of open-source tools.",
    type: "Products",
    isDocs: false,
  },
  {
    label: "Docs — Overview",
    title: "Getting Started",
    description: "Everything you need to get up and running with Rimelight.",
    type: "Documentation",
    isDocs: true,
  },
  {
    label: "Docs — API Reference",
    title: "API Reference",
    description: "Complete API reference for Rimelight integrations.",
    type: "Documentation",
    isDocs: true,
  },
  {
    label: "Blog Post",
    title: "Announcing Grand Tale v2",
    description: "A look at what's new in our biggest update yet.",
    type: "Blog Post",
    isDocs: false,
  },
  {
    label: "User Profile (Dynamic)",
    title: "idant",
    description: "View idant's profile on Rimelight.",
    type: "Profile",
    isDocs: false,
  },
];

function ogUrl(page: PageItem) {
  const params = new URLSearchParams({
    title: page.title,
    description: page.description,
    ...(page.type ? { type: page.type } : {}),
    ...(page.isDocs ? { isDocs: "true" } : {}),
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
    <DevLayout
      title="OG Image Preview"
      description="Preview and generate Open Graph banner images"
      currentSection="og"
      maxWidth="7xl"
    >
      <div class="flex flex-col gap-8">
        <div class="border-b border-default pb-6">
          <h1 class="text-3xl font-bold tracking-tight text-highlighted">OG Image Preview</h1>
          <p class="text-sm text-muted mt-2">
            Live previews of generated Open Graph images via{" "}
            <code class="bg-elevated text-primary px-2 py-0.5 rounded text-xs font-mono">
              /open-graph/page.png
            </code>
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <For each={pages}>
            {(page) => {
              const url = ogUrl(page);
              const isCopied = () => copiedUrl() === url;
              return (
                <article class="bg-elevated/20 border border-default rounded-xl overflow-hidden shadow-xs">
                  <div class="flex items-center gap-3 px-5 py-3 border-b border-default/40">
                    <h2 class="text-base font-semibold text-highlighted">{page.label}</h2>
                    {page.type && (
                      <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                        {page.type}
                      </span>
                    )}
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    class="block relative group overflow-hidden bg-default"
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
                  <div class="flex items-center justify-between gap-3 p-4 border-t border-default/40">
                    <div class="flex flex-col min-w-0">
                      <strong class="text-sm text-highlighted truncate">{page.title}</strong>
                      {page.description && (
                        <span class="text-xs text-muted truncate">{page.description}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyUrl(url)}
                      class="px-3 py-1.5 bg-elevated hover:bg-elevated/80 border border-default rounded-md text-xs font-medium text-toned transition-colors shrink-0"
                      style={{
                        color: isCopied() ? "#4ade80" : undefined,
                        "border-color": isCopied() ? "rgba(74, 222, 128, 0.4)" : undefined,
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

        <section class="border-t border-default pt-8">
          <h2 class="text-xl font-bold text-highlighted mb-2">Live Sandbox</h2>
          <p class="text-muted text-sm mb-6">
            Render a custom OG image with any title, description, and tags.
          </p>

          <div class="flex flex-wrap gap-4 items-end mb-6">
            <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider flex-1 min-w-[180px]">
              Title
              <input
                type="text"
                value={sandboxTitle()}
                onInput={(e: any) => setSandboxTitle(e.currentTarget.value)}
                class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
              />
            </label>
            <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider flex-1 min-w-[180px]">
              Description
              <input
                type="text"
                value={sandboxDesc()}
                onInput={(e: any) => setSandboxDesc(e.currentTarget.value)}
                class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
              />
            </label>
            <label class="flex flex-col gap-1 text-xs font-semibold text-muted uppercase tracking-wider flex-1 min-w-[180px]">
              Type badge
              <input
                type="text"
                value={sandboxType()}
                placeholder="e.g. Blog Post"
                onInput={(e: any) => setSandboxType(e.currentTarget.value)}
                class="px-3 py-2 bg-default border border-default rounded-md text-highlighted text-sm focus:border-primary outline-none"
              />
            </label>
            <label class="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-wider cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={sandboxDocs()}
                onChange={(e: any) => setSandboxDocs(e.currentTarget.checked)}
                class="size-4 rounded accent-primary"
              />
              Docs style
            </label>
          </div>

          <div class="rounded-xl overflow-hidden border border-default bg-elevated/20">
            <img
              src={sandboxUrl()}
              alt="Sandbox OG preview"
              class="w-full aspect-[1200/630] object-cover"
            />
          </div>
        </section>
      </div>
    </DevLayout>
  );
};

export default DevOgPage;
