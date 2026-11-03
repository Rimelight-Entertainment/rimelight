import { describe, it, expect } from "vite-plus/test";

import { RLAudio } from "../src/components/audio/RLAudio";
import { renderSolid } from "./utils/normalize";

describe("RLAudio Solid Component Rendering & Regression Suite", () => {
  const sampleTrack = {
    src: "https://example.com/audio/sample.mp3",
    title: "Echoes of Eternity",
    description: "Symphonic ambient soundtrack",
    artwork:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    duration: 184,
    format: "MP3",
    fileSize: "4.2 MB",
    bitrate: "320 kbps",
  };

  const samplePlaylist = [
    sampleTrack,
    {
      src: "https://example.com/audio/track2.mp3",
      title: "Neon Horizon",
      description: "Synthwave / Cyberpunk",
      artwork:
        "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
      duration: 215,
      format: "WAV",
      fileSize: "36.2 MB",
    },
    {
      src: "https://example.com/audio/track3.mp3",
      title: "Solar Winds",
      description: "Deep space ambient",
      duration: 152,
    },
  ];

  describe("Core Track & Layout Rendering", () => {
    it("renders single track title, description, and audio tag", () => {
      const html = renderSolid(RLAudio, {
        ...sampleTrack,
        showVolume: true,
        showSpeed: true,
      });

      expect(html).toContain("Echoes of Eternity");
      expect(html).toContain("Symphonic ambient soundtrack");
      expect(html).toContain("<audio");
      expect(html).toContain('src="https://example.com/audio/sample.mp3"');
      expect(html).toContain('data-slot="play-button"');
    });

    it("renders artwork with 1:1 aspect ratio and object-cover", () => {
      const html = renderSolid(RLAudio, {
        ...sampleTrack,
        artworkZoomable: false,
      });

      expect(html).toContain('data-slot="artwork"');
      expect(html).toContain('data-slot="artwork-item"');
      expect(html).toContain("object-cover");
      expect(html).toContain("aspect-square");
    });

    it("renders metadata badge with format, file size, and bitrate", () => {
      const html = renderSolid(RLAudio, {
        ...sampleTrack,
      });

      expect(html).toContain('data-slot="meta-badge"');
      expect(html).toContain("MP3");
      expect(html).toContain("4.2 MB");
      expect(html).toContain("320 kbps");
    });
  });

  describe("Layout Orientations and Variants", () => {
    const orientations = ["horizontal", "vertical"] as const;
    const variants = ["solid", "outline", "soft", "subtle"] as const;
    const sizes = ["sm", "md", "lg"] as const;

    for (const orientation of orientations) {
      it(`renders orientation=${orientation}`, () => {
        const html = renderSolid(RLAudio, {
          ...sampleTrack,
          orientation,
        });
        expect(html).toContain('data-slot="root"');
        expect(html).toContain(sampleTrack.title);
      });
    }

    for (const variant of variants) {
      for (const size of sizes) {
        it(`renders variant=${variant}, size=${size}`, () => {
          const html = renderSolid(RLAudio, {
            ...sampleTrack,
            variant,
            size,
          });
          expect(html).toContain('data-slot="root"');
          expect(html).toContain('data-slot="play-button"');
        });
      }
    }
  });

  describe("Timeline & Progress Variants", () => {
    it("renders linear scrub bar with progress track and range", () => {
      const html = renderSolid(RLAudio, {
        ...sampleTrack,
        progressVariant: "bar",
        progressColor: "primary",
      });

      expect(html).toContain('data-slot="progress-track"');
      expect(html).toContain('data-slot="progress-range"');
      expect(html).toContain('data-slot="time-display"');
      expect(html).toContain('data-slot="time-current"');
      expect(html).toContain('data-slot="time-duration"');
    });

    it("renders regular whatsapp-style pill waveform soundwave", () => {
      const html = renderSolid(RLAudio, {
        ...sampleTrack,
        progressVariant: "waveform",
        progressColor: "success",
      });

      expect(html).toContain('data-slot="waveform-container"');
      expect(html).toContain("<svg");
      expect(html).toContain("<rect");
      expect(html).toContain("rl-color-success");
    });
  });

  describe("Volume Control & Popover Positioning", () => {
    it("renders volume button trigger with mute handler", () => {
      const html = renderSolid(RLAudio, {
        ...sampleTrack,
        showVolume: true,
        showVolumeNumber: true,
        volume: 0.75,
      });

      expect(html).toContain('data-slot="volume-container"');
      expect(html).toContain('data-slot="volume-button"');
      expect(html).toContain('data-slot="trigger"');
      expect(html).toContain('title="Click to adjust volume, right-click to mute/unmute"');
    });
  });

  describe("Playback Controls & Buttons", () => {
    it("renders double-triangle skip buttons with second badge", () => {
      const html = renderSolid(RLAudio, {
        ...sampleTrack,
        showSkip: true,
        skipSeconds: 15,
      });

      expect(html).toContain('data-slot="skip-button"');
      expect(html).toContain('data-slot="skip-badge"');
      expect(html).toContain("15");
    });

    it("renders repeat mode toggle button", () => {
      const html = renderSolid(RLAudio, {
        ...sampleTrack,
        showRepeat: true,
        repeatMode: "all",
      });

      expect(html).toContain('data-slot="repeat-button"');
    });

    it("renders playback speed controls", () => {
      const html = renderSolid(RLAudio, {
        ...sampleTrack,
        showSpeed: true,
        playbackRate: 1.5,
      });

      expect(html).toContain('data-slot="speed-container"');
      expect(html).toContain('data-slot="speed-button"');
      expect(html).toContain("1.5x");
    });
  });

  describe("Playlist Queue View", () => {
    it("renders multi-track playlist list with active track highlight and next/prev buttons", () => {
      const html = renderSolid(RLAudio, {
        playlist: samplePlaylist,
        showPlaylist: true,
      });

      expect(html).toContain('data-slot="playlist-container"');
      expect(html).toContain('data-slot="playlist-header"');
      expect(html).toContain("Playlist (3)");
      expect(html).toContain('data-slot="playlist-item"');
      expect(html).toContain("Echoes of Eternity");
      expect(html).toContain("Neon Horizon");
      expect(html).toContain("Solar Winds");
      expect(html).toContain('data-slot="nav-button"');
    });
  });

  describe("Top Actions & Transcript", () => {
    it("renders download and external link buttons when enabled", () => {
      const html = renderSolid(RLAudio, {
        ...sampleTrack,
        showDownload: true,
        showExternalLink: true,
      });

      expect(html).toContain('data-slot="action-button"');
      expect(html).toContain('download="Echoes of Eternity.mp3"');
      expect(html).toContain('href="https://example.com/audio/sample.mp3"');
    });

    it("renders transcript collapsible section", () => {
      const transcriptText = "This is a full transcript of the audio recording.";
      const html = renderSolid(RLAudio, {
        ...sampleTrack,
        transcript: transcriptText,
      });

      expect(html).toContain('data-slot="transcript"');
      expect(html).toContain('data-slot="transcript-toggle"');
      expect(html).toContain("Show transcript");
    });
  });
});
