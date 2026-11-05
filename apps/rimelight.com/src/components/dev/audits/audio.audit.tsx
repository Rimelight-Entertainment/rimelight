import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLAudio } from "@rimelight/ui/components/audio/RLAudio.tsx";
import type { AudioTrackItem } from "@rimelight/ui/components/audio/audio.types.ts";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const SAMPLE_TRACKS = (): AudioTrackItem[] => [
  {
    src: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    title: t("app.text.lofi-study-session-1"),
    description: t("app.text.fasssounds-chill-ambient-beats"),
    artwork:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    duration: 146,
    format: "MP3",
    bitrate: "320 kbps",
    fileSize: "4.7 MB",
    transcript:
      "00:00 — Relaxing soft piano chords begin to loop gently with background vinyl crackle...",
  },
  {
    src: "https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3",
    title: t("app.text.sunset-boulevard-walk"),
    description: t("app.text.tokyo-night-vibe-acoustic-chill"),
    artwork:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    duration: 194,
    format: "MP3",
    bitrate: "320 kbps",
    fileSize: "3.5 MB",
    transcript: "00:00 — Smooth Rhodes progression with melodic jazzy saxophone overlay...",
  },
  {
    src: "https://cdn.pixabay.com/audio/2022/10/14/audio_9939f792cb.mp3",
    title: t("app.text.midnight-coding-flow"),
    description: t("app.text.coma-media-deep-focus-session"),
    artwork:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    duration: 168,
    format: "MP3",
    bitrate: "320 kbps",
    fileSize: "5.5 MB",
    transcript: "00:00 — Minimal electronic pulse synth layered over deep sub-bass frequencies...",
  },
];

export const AudioSandbox = (): JSX.Element => {
  const [variant, setVariant] = createSignal<"solid" | "outline" | "soft" | "subtle">("outline");
  const [size, setSize] = createSignal<"sm" | "md" | "lg">("md");
  const [orientation, setOrientation] = createSignal<"horizontal" | "vertical">("horizontal");
  const [progressVariant, setProgressVariant] = createSignal<"bar" | "waveform">("waveform");
  const [color, setColor] = createSignal<string>("primary");
  const [progressColor, setProgressColor] = createSignal<string>("primary");
  const [showSkip, setShowSkip] = createSignal(true);
  const [showSpeed, setShowSpeed] = createSignal(true);
  const [showVolume, setShowVolume] = createSignal(true);
  const [showVolumeNumber, setShowVolumeNumber] = createSignal(true);
  const [showRepeat, setShowRepeat] = createSignal(true);
  const [showDownload, setShowDownload] = createSignal(true);
  const [showExternalLink, setShowExternalLink] = createSignal(true);
  const [showPlaylist, setShowPlaylist] = createSignal(true);
  const [artworkZoomable, setArtworkZoomable] = createSignal(true);

  const variants = ["outline", "subtle", "soft", "solid"] as const;
  const sizes = ["sm", "md", "lg"] as const;
  const orientations = ["horizontal", "vertical"] as const;
  const progressTypes = ["bar", "waveform"] as const;
  const colors = AUDIT_COLORS;

  return (
    <>
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="text-muted">{t("app.text.variant")}</span>
          <For each={variants}>
            {(v) => (
              <button
                type="button"
                onClick={() => setVariant(v)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  variant() === v
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {v}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="text-muted">{t("app.text.orientation")}</span>
          <For each={orientations}>
            {(o) => (
              <button
                type="button"
                onClick={() => setOrientation(o)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  orientation() === o
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {o}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="text-muted">{t("app.text.progress")}</span>
          <For each={progressTypes}>
            {(p) => (
              <button
                type="button"
                onClick={() => setProgressVariant(p)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  progressVariant() === p
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {p}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="text-muted">{t("app.text.size")}</span>
          <For each={sizes}>
            {(s) => (
              <button
                type="button"
                onClick={() => setSize(s)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  size() === s
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {s}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="text-muted">{t("app.text.theme-color")}</span>
          <For each={colors}>
            {(c) => (
              <button
                type="button"
                onClick={() => setColor(c)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  color() === c
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {c}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="text-muted">{t("app.text.progress-color")}</span>
          <For each={colors}>
            {(c) => (
              <button
                type="button"
                onClick={() => setProgressColor(c)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  progressColor() === c
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {c}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-3 border-l border-default pl-4 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showSkip()}
              onChange={(e) => setShowSkip(e.currentTarget.checked)}
            />
            <span>{t("app.text.skip")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showSpeed()}
              onChange={(e) => setShowSpeed(e.currentTarget.checked)}
            />
            <span>{t("app.text.speed")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showVolume()}
              onChange={(e) => setShowVolume(e.currentTarget.checked)}
            />
            <span>{t("app.text.volume")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showRepeat()}
              onChange={(e) => setShowRepeat(e.currentTarget.checked)}
            />
            <span>{t("app.text.repeat")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showDownload()}
              onChange={(e) => setShowDownload(e.currentTarget.checked)}
            />
            <span>{t("app.text.download")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showExternalLink()}
              onChange={(e) => setShowExternalLink(e.currentTarget.checked)}
            />
            <span>{t("app.text.external-link")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showPlaylist()}
              onChange={(e) => setShowPlaylist(e.currentTarget.checked)}
            />
            <span>{t("app.text.playlist")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showVolumeNumber()}
              onChange={(e) => setShowVolumeNumber(e.currentTarget.checked)}
            />
            <span>{t("app.text.volume-c9cc")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={artworkZoomable()}
              onChange={(e) => setArtworkZoomable(e.currentTarget.checked)}
            />
            <span>{t("app.text.zoomable-art")}</span>
          </label>
        </div>
      </div>

      <RLAudio
        playlist={SAMPLE_TRACKS()}
        variant={variant()}
        size={size()}
        color={color()}
        progressColor={progressColor()}
        orientation={orientation()}
        progressVariant={progressVariant()}
        showSkip={showSkip()}
        showSpeed={showSpeed()}
        showVolume={showVolume()}
        showVolumeNumber={showVolumeNumber()}
        showRepeat={showRepeat()}
        showDownload={showDownload()}
        showExternalLink={showExternalLink()}
        showPlaylist={showPlaylist()}
        artworkZoomable={artworkZoomable()}
      />
    </>
  );
};

export const audioAudit: ComponentAuditDefinition = {
  id: "audio",
  name: "Audio",
  category: "Media & Visuals",
  status: "Passed",
  description:
    "Accessible, CSP-safe HTML5 audio player with multi-track album playlists, waveform soundwaves, repeat looping modes, volume percentage, speed rate editing, zoomable artwork, and vertical/horizontal layout orientations.",
  importPath: "@rimelight/ui/components/audio/RLAudio.tsx",
  renderSandbox: () => <AudioSandbox />,
  testScenarios: [
    {
      id: "multi-track-playlist",
      get title() {
        return t("app.text.multi-track-album-playlist-with-top-actions");
      },
      description:
        "Full album player with playlist queue, track switching, next/previous controls, and download/link buttons.",
      render: () => (
        <RLAudio
          playlist={SAMPLE_TRACKS()}
          progressVariant="waveform"
          showRepeat
          showPlaylist
          showDownload
          showExternalLink
        />
      ),
    },
    {
      id: "vertical-poster",
      get title() {
        return t("app.text.vertical-poster-orientation-1-1-ratio");
      },
      description:
        "Album artwork hero on top with full controls, speed multiplier, repeat mode, format badge, and waveform maintaining 1:1 square ratio.",
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS()[0]?.src}
          title={SAMPLE_TRACKS()[0]?.title}
          description={SAMPLE_TRACKS()[0]?.description}
          artwork={SAMPLE_TRACKS()[0]?.artwork}
          format={SAMPLE_TRACKS()[0]?.format}
          fileSize={SAMPLE_TRACKS()[0]?.fileSize}
          bitrate={SAMPLE_TRACKS()[0]?.bitrate}
          orientation="vertical"
          progressVariant="waveform"
          showSpeed
          showRepeat
          showDownload
          showExternalLink
        />
      ),
    },
    {
      id: "waveform-vs-bar",
      get title() {
        return t("app.text.waveform-soundwave-vs-linear-progress-bar-with-c");
      },
      description:
        "Comparison between SVG interactive soundwave visualization and linear scrub bar.",
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS()[0]?.src}
          title={"Waveform Progress Variant"}
          description="progressColor='success'"
          artwork={SAMPLE_TRACKS()[0]?.artwork}
          progressVariant="waveform"
          progressColor="success"
        />
      ),
    },
    {
      id: "repeat-modes",
      get title() {
        return t("app.text.repeat-modes-off-repeat-all-repeat-one");
      },
      description:
        "Repeat looping mode support (cycle between off, playlist repeat, and single track repeat).",
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS()[0]?.src}
          title={"Repeat Loop Mode"}
          description="repeatMode='one'"
          artwork={SAMPLE_TRACKS()[0]?.artwork}
          repeatMode="one"
          showRepeat
        />
      ),
    },
    {
      id: "with-transcript",
      get title() {
        return t("app.text.with-collapsible-transcript-lyrics");
      },
      get description() {
        return t("app.text.accordion-style-transcript-drawer-below-the-play");
      },
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS()[0]?.src}
          title={"Interview Episode #42"}
          description="Audio transcript demonstration"
          artwork={SAMPLE_TRACKS()[0]?.artwork}
          transcript="Speaker 1: Welcome to the episode! Today we are discussing accessible web audio players. Speaker 2: Thanks for having me, glad to be here!"
        />
      ),
    },
    {
      id: "custom-icon-overrides",
      get title() {
        return t("app.text.custom-icon-overrides");
      },
      get description() {
        return t("app.text.overriding-control-button-icons-via-the-icons-pr");
      },
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS()[0]?.src}
          title={"Custom Control Icons"}
          description="Testing icons prop overrides"
          artwork={SAMPLE_TRACKS()[0]?.artwork}
          icons={{
            play: "sun",
            pause: "moon",
            skipBack: "arrow-left",
            skipForward: "arrow-right",
          }}
        />
      ),
    },
    {
      id: "header-slot",
      title: "Header slot",
      description: "headerSlot replaces the artwork, details, and actions row.",
      render: () => (
        <RLAudio src={SAMPLE_TRACKS()[0]?.src} headerSlot={<span>Custom header content</span>} />
      ),
    },
    {
      id: "timeline-slot",
      title: "Timeline slot",
      description: "timelineSlot replaces the progress bar and time display.",
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS()[0]?.src}
          timelineSlot={<span>Custom timeline content</span>}
        />
      ),
    },
    {
      id: "controls-slot",
      title: "Controls slot",
      description: "controlsSlot replaces the playback controls row.",
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS()[0]?.src}
          controlsSlot={<span>Custom controls content</span>}
        />
      ),
    },
    {
      id: "artwork-slot",
      title: "Artwork slot",
      description: "artworkSlot replaces the album artwork.",
      render: () => (
        <RLAudio src={SAMPLE_TRACKS()[0]?.src} artworkSlot={<span>Custom artwork content</span>} />
      ),
    },
    {
      id: "transcript-slot",
      title: "Transcript slot",
      description: "transcriptSlot replaces the transcript string inside the collapsible section.",
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS()[0]?.src}
          transcriptSlot={<span>Custom transcript content</span>}
        />
      ),
    },
    {
      id: "default-slot",
      title: "Default slot",
      description: "Children render in the default slot between the playlist and the transcript.",
      render: () => (
        <RLAudio src={SAMPLE_TRACKS()[0]?.src} title="Default slot">
          <span>Default slot content</span>
        </RLAudio>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Double-triangle fast forward / rewind skip icons",
      status: "pass",
      notes:
        "Skip buttons now use fastForward and rewind double triangles (>>) with second count badges.",
    },
    {
      criterion: "Reliable interactive progress scrub & seeking",
      status: "pass",
      notes:
        "Seek scrub inputs and waveform clicks update currentTime and preserve position without restarting.",
    },
    {
      criterion: "Refined SVG dynamic waveform with progress fill",
      status: "pass",
      notes: "Dynamic curved soundwave geometry with active progress fill and interactive seeking.",
    },
    {
      criterion: "Controls layout placement (Volume bottom-left, Repeat bottom-right)",
      status: "pass",
      notes:
        "Controls placed logically: Volume bottom-left, Playback center, Repeat & Speed bottom-right.",
    },
    {
      criterion: "Top right Download & External Link buttons",
      status: "pass",
      notes: "Optional showDownload and showExternalLink buttons in the header action bar.",
    },
    {
      criterion: "Dedicated progressColor token prop",
      status: "pass",
      notes: "Allows independent color theming for the scrub bar and waveform.",
    },
    {
      criterion: "Uncapped playback speed multiplier",
      status: "pass",
      notes: "Direct numerical speed input allows any multiplier > 0.1x.",
    },
    {
      criterion: "Multi-track playlist with working audio URLs",
      status: "pass",
      notes: "All 3 sample audio tracks verified with accessible media CDN URLs.",
    },
  ],
};
