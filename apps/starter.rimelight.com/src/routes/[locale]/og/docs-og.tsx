import { type Component, Show } from "solid-js";
import { useSearchParams } from "@solidjs/router";
import OgLayout from "#layouts/OgLayout";

export const DocsOgPage: Component = () => {
  const [searchParams] = useSearchParams();

  const title = () => {
    const t = searchParams["title"];
    return Array.isArray(t) ? t[0] || "Untitled" : t || "Untitled";
  };
  const description = () => {
    const d = searchParams["description"];
    return Array.isArray(d) ? d[0] || "" : d || "";
  };
  const isPreview = () => {
    const p = searchParams["preview"];
    return (Array.isArray(p) ? p[0] : p) === "1";
  };

  return (
    <OgLayout title={`${title()} — Rimelight`} description={description()}>
      <div
        class="w-[1200px] h-[630px] flex flex-col p-14 relative overflow-hidden text-[#e5e5e5]"
        style={{
          "font-family": "'Noto Sans', system-ui, sans-serif",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
        }}
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
          <div class="w-[60px] h-1 bg-[#60a5fa] rounded mb-4" />
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
          <span class="bg-blue-500/15 border border-blue-500/30 text-blue-300 inline-block px-4 py-[6px] rounded-full text-sm font-semibold">
            Documentation
          </span>
        </div>
        <Show when={isPreview()}>
          <div class="absolute inset-0 border-[6px] border-dashed border-[#ff4444] pointer-events-none" />
          <div class="absolute top-3 right-3 bg-[#ff4444] text-white text-sm font-bold px-4 py-[6px] rounded tracking-[0.05em]">
            PREVIEW
          </div>
        </Show>
      </div>
    </OgLayout>
  );
};

export default DocsOgPage;
