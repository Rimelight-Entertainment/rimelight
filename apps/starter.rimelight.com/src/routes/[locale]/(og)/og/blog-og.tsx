import { type Component, Show } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import { useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";

export const BlogOgPage: Component = () => {
  const [searchParams] = useSearchParams();

  const title = () => {
    const t = searchParams["title"];
    return Array.isArray(t) ? t[0] || "Untitled" : t || "Untitled";
  };
  const description = () => {
    const d = searchParams["description"];
    return Array.isArray(d) ? d[0] || "" : d || "";
  };
  const type = () => {
    const typ = searchParams["type"];
    return Array.isArray(typ) ? typ[0] || "" : typ || "";
  };
  const displayType = () => {
    const raw = type();
    return raw
      ? raw
          .split("-")
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Blog Post";
  };
  const date = () => {
    const dt = searchParams["date"];
    return Array.isArray(dt) ? dt[0] || "" : dt || "";
  };
  const isPreview = () => {
    const p = searchParams["preview"];
    return (Array.isArray(p) ? p[0] : p) === "1";
  };

  useHead(() =>
    createSeoHead({
      title: `${title()} — Rimelight`,
      description: description(),
      noindex: true,
    }),
  );

  return (
    <div
      class="w-[1200px] h-[630px] flex flex-col p-14 relative overflow-hidden bg-[#0a0a0a] text-[#e5e5e5]"
      style={{ "font-family": "'Noto Sans', system-ui, sans-serif" }}
    >
      <div class="flex items-center gap-3">
        <img class="h-9 w-auto" src="https://cdn.rimelight.com/logos/logomark_white.svg" alt="" />
        <img
          class="h-[22px] w-auto"
          src="https://cdn.rimelight.com/logos/logotype_white.svg"
          alt="Rimelight"
        />
      </div>
      <div class="flex-1 flex flex-col justify-center pt-5">
        <div class="w-[60px] h-1 bg-[#4ade80] rounded mb-4" />
        <h1 class="text-[52px] font-bold leading-[1.15] text-white max-w-[950px] line-clamp-2">
          {title()}
        </h1>
        <Show when={description()}>
          <p class="text-[22px] font-normal leading-[1.4] text-[#94a3b8] mt-3 max-w-[800px] line-clamp-2">
            {description()}
          </p>
        </Show>
      </div>
      <div class="flex items-center gap-3 mt-auto">
        <span class="bg-green-500/15 border border-green-500/30 text-green-300 inline-block px-4 py-[6px] rounded-full text-sm font-semibold">
          {displayType()}
        </span>
        <Show when={date()}>
          <span class="text-[#64748b] text-[15px]">•</span>
          <span class="text-[#94a3b8] text-[15px]">{date()}</span>
        </Show>
      </div>
      <Show when={isPreview()}>
        <div class="absolute inset-0 border-[6px] border-dashed border-[#ff4444] pointer-events-none" />
        <div class="absolute top-3 right-3 bg-[#ff4444] text-white text-[16px] font-bold px-4 py-[6px] rounded tracking-[0.05em]">
          PREVIEW
        </div>
      </Show>
    </div>
  );
};

export default BlogOgPage;
