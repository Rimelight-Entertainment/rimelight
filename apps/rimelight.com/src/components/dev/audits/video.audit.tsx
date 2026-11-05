import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLVideo } from "@rimelight/ui/components/video/RLVideo.tsx";
import { type ComponentAuditDefinition } from "./types";

const SOURCES = {
  watch: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  short: "https://youtu.be/jNQXAC9IVRw",
  invalid: "https://example.com/not-a-youtube-video",
} as const;

export const VideoSandbox = (): JSX.Element => {
  const [source, setSource] = createSignal<keyof typeof SOURCES>("watch");

  return (
    <div class="flex flex-col gap-6">
      <p class="text-xs text-muted">
        Shows a YouTube thumbnail. Clicking it swaps in an embedded player with autoplay.
        Unparseable URLs render a disabled trigger.
      </p>

      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-muted">Source:</span>
          <For each={Object.keys(SOURCES) as (keyof typeof SOURCES)[]}>
            {(key) => (
              <button
                type="button"
                onClick={() => setSource(key)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  source() === key
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {key}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <RLVideo src={SOURCES[source()]} title="Sample video">
          Transcript text for the sample video.
        </RLVideo>
      </div>
    </div>
  );
};

export const videoAudit: ComponentAuditDefinition = {
  id: "video",
  name: "Video",
  category: "Media & Visuals",
  status: "Auditing",
  description:
    "A YouTube video with a thumbnail trigger that loads an autoplay embed on click, with an optional transcript below.",
  importPath: "@rimelight/ui/components/video/RLVideo.tsx",
  renderSandbox: () => <VideoSandbox />,
  testScenarios: [
    {
      id: "default-transcript-children",
      title: "Default slot (children as transcript)",
      description: "Children render as the transcript when transcriptSlot is not set.",
      render: () => (
        <RLVideo src={SOURCES.watch} title="Sample video">
          Transcript text rendered from children.
        </RLVideo>
      ),
    },
    {
      id: "short-url",
      title: "Short youtu.be URL",
      description: "The youtu.be short form is parsed to the same video id.",
      render: () => <RLVideo src={SOURCES.short} title="Short URL video" />,
    },
    {
      id: "title",
      title: "title",
      description: "Title prop applied to the video.",
      render: () => <RLVideo src={SOURCES.watch} title="Titled video" />,
    },
    {
      id: "thumbnail",
      title: "thumbnail override",
      description: "Custom thumbnail image instead of the YouTube default.",
      render: () => (
        <RLVideo
          src={SOURCES.watch}
          title="Custom thumbnail"
          thumbnail="/assets/placeholder.webp"
        />
      ),
    },
    {
      id: "icon-slot",
      title: "iconSlot",
      description: "Custom JSX replaces the default play icon on the trigger.",
      render: () => (
        <RLVideo
          src={SOURCES.watch}
          title="Icon slot"
          iconSlot={() => <span class="font-semibold">Play</span>}
        />
      ),
    },
    {
      id: "transcript-slot",
      title: "transcriptSlot (takes precedence over children)",
      description: "transcriptSlot renders the transcript. Children are ignored in this case.",
      render: () => (
        <RLVideo
          src={SOURCES.watch}
          title="Transcript slot"
          transcriptSlot={() => <p>Transcript from slot.</p>}
        >
          Ignored children
        </RLVideo>
      ),
    },
    {
      id: "unavailable-source",
      title: "Unavailable source",
      description:
        "A non-YouTube URL cannot be parsed. The trigger is disabled with an unavailable label.",
      render: () => <RLVideo src={SOURCES.invalid} title="Unavailable video" />,
    },
  ],
};
