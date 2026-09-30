import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLAudio } from "@rimelight/ui/components/audio/RLAudio.tsx";
import type { AudioTrackItem } from "@rimelight/ui/components/audio/audio.ts";
import type { ComponentAuditDefinition } from "./types";

const SAMPLE_TRACKS: AudioTrackItem[] = [
  {
    src: "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",
    title: "Lofi Study Session #1",
    description: "FassSounds — Chill Ambient Beats",
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
    title: "Sunset Boulevard Walk",
    description: "Tokyo Night Vibe — Acoustic & Chill",
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
    title: "Midnight Coding Flow",
    description: "Coma-Media — Deep Focus Session",
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
  const colors = [
    "primary",
    "secondary",
    "success",
    "info",
    "warning",
    "error",
    "neutral",
  ] as const;

  return (
    <>
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5">
          <span class="text-muted">Variant:</span>
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
          <span class="text-muted">Orientation:</span>
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
          <span class="text-muted">Progress:</span>
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
          <span class="text-muted">Size:</span>
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
          <span class="text-muted">Theme Color:</span>
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
          <span class="text-muted">Progress Color:</span>
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
            <span>Skip</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showSpeed()}
              onChange={(e) => setShowSpeed(e.currentTarget.checked)}
            />
            <span>Speed</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showVolume()}
              onChange={(e) => setShowVolume(e.currentTarget.checked)}
            />
            <span>Volume</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showRepeat()}
              onChange={(e) => setShowRepeat(e.currentTarget.checked)}
            />
            <span>Repeat</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showDownload()}
              onChange={(e) => setShowDownload(e.currentTarget.checked)}
            />
            <span>Download</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showExternalLink()}
              onChange={(e) => setShowExternalLink(e.currentTarget.checked)}
            />
            <span>External Link</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showPlaylist()}
              onChange={(e) => setShowPlaylist(e.currentTarget.checked)}
            />
            <span>Playlist</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={showVolumeNumber()}
              onChange={(e) => setShowVolumeNumber(e.currentTarget.checked)}
            />
            <span>Volume %</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-muted select-none">
            <input
              type="checkbox"
              checked={artworkZoomable()}
              onChange={(e) => setArtworkZoomable(e.currentTarget.checked)}
            />
            <span>Zoomable Art</span>
          </label>
        </div>
      </div>

      <RLAudio
        playlist={SAMPLE_TRACKS}
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
  status: "Auditing",
  description:
    "Accessible, CSP-safe HTML5 audio player with multi-track album playlists, waveform soundwaves, repeat looping modes, volume percentage, speed rate editing, zoomable artwork, and vertical/horizontal layout orientations.",
  importPath: "@rimelight/ui/components/audio/RLAudio.tsx",
  renderSandbox: () => <AudioSandbox />,
  testScenarios: [
    {
      id: "multi-track-playlist",
      title: "Multi-Track Album Playlist with Top Actions",
      description:
        "Full album player with playlist queue, track switching, next/previous controls, and download/link buttons.",
      render: () => (
        <RLAudio
          playlist={SAMPLE_TRACKS}
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
      title: "Vertical Poster Orientation (1:1 Ratio)",
      description:
        "Album artwork hero on top with full controls, speed multiplier, repeat mode, format badge, and waveform maintaining 1:1 square ratio.",
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS[0]?.src}
          title={SAMPLE_TRACKS[0]?.title}
          description={SAMPLE_TRACKS[0]?.description}
          artwork={SAMPLE_TRACKS[0]?.artwork}
          format={SAMPLE_TRACKS[0]?.format}
          fileSize={SAMPLE_TRACKS[0]?.fileSize}
          bitrate={SAMPLE_TRACKS[0]?.bitrate}
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
      title: "Waveform Soundwave vs Linear Progress Bar with Color Tokens",
      description:
        "Comparison between SVG interactive soundwave visualization and linear scrub bar.",
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS[0]?.src}
          title="Waveform Progress Variant"
          description="progressColor='success'"
          artwork={SAMPLE_TRACKS[0]?.artwork}
          progressVariant="waveform"
          progressColor="success"
        />
      ),
    },
    {
      id: "repeat-modes",
      title: "Repeat Modes (Off, Repeat All, Repeat One)",
      description:
        "Repeat looping mode support (cycle between off, playlist repeat, and single track repeat).",
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS[0]?.src}
          title="Repeat Loop Mode"
          description="repeatMode='one'"
          artwork={SAMPLE_TRACKS[0]?.artwork}
          repeatMode="one"
          showRepeat
        />
      ),
    },
    {
      id: "with-transcript",
      title: "With Collapsible Transcript & Lyrics",
      description: "Accordion-style transcript drawer below the playback controls.",
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS[0]?.src}
          title="Interview Episode #42"
          description="Audio transcript demonstration"
          artwork={SAMPLE_TRACKS[0]?.artwork}
          transcript="Speaker 1: Welcome to the episode! Today we are discussing accessible web audio players. Speaker 2: Thanks for having me, glad to be here!"
        />
      ),
    },
    {
      id: "custom-icon-overrides",
      title: "Custom Icon Overrides",
      description: "Overriding control button icons via the icons prop.",
      render: () => (
        <RLAudio
          src={SAMPLE_TRACKS[0]?.src}
          title="Custom Control Icons"
          description="Testing icons prop overrides"
          artwork={SAMPLE_TRACKS[0]?.artwork}
          icons={{
            play: "sun",
            pause: "moon",
            skipBack: "arrowLeft",
            skipForward: "arrowRight",
          }}
        />
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
