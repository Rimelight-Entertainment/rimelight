import { describe, it, expect } from "vite-plus/test";

import { RLAudio } from "../src/components/audio/RLAudio";
import { renderSolid } from "./utils/normalize";

const SRC = "https://example.com/audio/sample.mp3";

const samplePlaylist = [
  { src: "https://example.com/audio/one.mp3", title: "First" },
  { src: "https://example.com/audio/two.mp3", title: "Second" },
];

describe("RLAudio", () => {
  it("renders the root with the audio theme", () => {
    const html = renderSolid(RLAudio, { src: SRC, theme: "audio" });
    expect(html).toMatch(
      /data-slot="root"[^>]*data-theme="audio"|data-theme="audio"[^>]*data-slot="root"/,
    );
  });

  it("renders the track title and description", () => {
    const html = renderSolid(RLAudio, {
      src: SRC,
      title: "Echoes",
      description: "Ambient",
    });
    expect(html).toMatch(/data-slot="title"/);
    expect(html).toMatch(/data-slot="description"/);
    expect(html).toContain("Echoes");
    expect(html).toContain("Ambient");
  });

  it("points the audio element at the source", () => {
    const html = renderSolid(RLAudio, { src: SRC });
    expect(html).toContain(`src="${SRC}"`);
  });

  it("renders the metadata badge from format, bitrate, and file size", () => {
    const html = renderSolid(RLAudio, {
      src: SRC,
      format: "MP3",
      bitrate: "320 kbps",
      fileSize: "4.2 MB",
    });
    expect(html).toContain("MP3");
    expect(html).toContain("320 kbps");
    expect(html).toContain("4.2 MB");
  });

  it("omits the metadata badge when no metadata is given", () => {
    const html = renderSolid(RLAudio, { src: SRC });
    expect(html).not.toMatch(/data-slot="meta-badge"/);
  });

  it("renders a playlist when more than one track is provided", () => {
    const html = renderSolid(RLAudio, { playlist: samplePlaylist });
    expect(html).toMatch(/data-slot="playlist-container"/);
    expect(html.match(/data-slot="playlist-item"/g)?.length).toBe(2);
  });

  it("omits the playlist for a single track", () => {
    const html = renderSolid(RLAudio, { src: SRC });
    expect(html).not.toMatch(/data-slot="playlist-container"/);
  });

  it("hides the playlist when showPlaylist is false", () => {
    const html = renderSolid(RLAudio, { playlist: samplePlaylist, showPlaylist: false });
    expect(html).not.toMatch(/data-slot="playlist-container"/);
  });

  it("renders the waveform timeline for progressVariant waveform", () => {
    const html = renderSolid(RLAudio, { src: SRC, progressVariant: "waveform" });
    expect(html).toMatch(/data-slot="waveform-container"/);
    expect(html).not.toMatch(/data-slot="progress-track"/);
  });

  it("renders the bar timeline by default", () => {
    const html = renderSolid(RLAudio, { src: SRC });
    expect(html).toMatch(/data-slot="progress-track"/);
    expect(html).not.toMatch(/data-slot="waveform-container"/);
  });

  it("hides the time display when showTime is false", () => {
    const html = renderSolid(RLAudio, { src: SRC, showTime: false });
    expect(html).not.toMatch(/data-slot="time-display"/);
  });

  it("hides the volume control when showVolume is false", () => {
    const html = renderSolid(RLAudio, { src: SRC, showVolume: false });
    expect(html).not.toMatch(/data-slot="volume-container"/);
  });

  it("hides the skip buttons when showSkip is false", () => {
    const html = renderSolid(RLAudio, { src: SRC, showSkip: false });
    expect(html).not.toMatch(/data-slot="skip-button"/);
  });

  it("keeps the skip buttons by default", () => {
    const html = renderSolid(RLAudio, { src: SRC });
    expect(html.match(/data-slot="skip-button"/g)?.length).toBe(2);
  });

  it("hides the repeat button when showRepeat is false", () => {
    const html = renderSolid(RLAudio, { src: SRC, showRepeat: false });
    expect(html).not.toMatch(/data-slot="repeat-button"/);
  });

  it("hides the speed control when showSpeed is false", () => {
    const html = renderSolid(RLAudio, { src: SRC, showSpeed: false });
    expect(html).not.toMatch(/data-slot="speed-container"/);
  });

  it("shows the download link only when showDownload is true", () => {
    const hidden = renderSolid(RLAudio, { src: SRC });
    expect(hidden).not.toMatch(/download=/);
    const shown = renderSolid(RLAudio, { src: SRC, showDownload: true });
    expect(shown).toMatch(
      /<a[^>]*download=[^>]*data-slot="action-button"|<a[^>]*data-slot="action-button"[^>]*download=/,
    );
  });

  it("shows the external link only when showExternalLink is true", () => {
    const hidden = renderSolid(RLAudio, { src: SRC });
    expect(hidden).not.toMatch(/data-slot="action-button"/);
    const shown = renderSolid(RLAudio, { src: SRC, showExternalLink: true });
    expect(shown).toMatch(/data-slot="action-button"/);
  });

  it("renders the transcript toggle when a transcript is provided", () => {
    const html = renderSolid(RLAudio, { src: SRC, transcript: "Hello" });
    expect(html).toMatch(/data-slot="transcript-toggle"/);
  });

  it("renders no transcript section without a transcript or transcriptSlot", () => {
    const html = renderSolid(RLAudio, { src: SRC });
    expect(html).not.toMatch(/data-slot="transcript"/);
  });

  it("renders the transcript section when transcriptSlot is provided", () => {
    const html = renderSolid(RLAudio, { src: SRC, transcriptSlot: "Slot text" });
    expect(html).toMatch(/data-slot="transcript"/);
  });

  it("renders children into the default slot", () => {
    const html = renderSolid(RLAudio, { src: SRC }, "Extra content");
    expect(html).toContain("Extra content");
  });

  it("replaces the default header with headerSlot", () => {
    const html = renderSolid(RLAudio, {
      src: SRC,
      title: "Hidden title",
      headerSlot: "CUSTOM HEADER",
    });
    expect(html).toContain("CUSTOM HEADER");
    expect(html).not.toMatch(/data-slot="header"/);
    expect(html).not.toContain("Hidden title");
  });

  it("replaces the default timeline with timelineSlot", () => {
    const html = renderSolid(RLAudio, { src: SRC, timelineSlot: "CUSTOM TIMELINE" });
    expect(html).toContain("CUSTOM TIMELINE");
    expect(html).not.toMatch(/data-slot="progress-track"/);
  });

  it("replaces the default controls with controlsSlot", () => {
    const html = renderSolid(RLAudio, { src: SRC, controlsSlot: "CUSTOM CONTROLS" });
    expect(html).toContain("CUSTOM CONTROLS");
    expect(html).not.toMatch(/data-slot="play-button"/);
  });

  it("replaces the artwork with artworkSlot", () => {
    const html = renderSolid(RLAudio, { src: SRC, artworkSlot: "CUSTOM ART" });
    expect(html).toContain("CUSTOM ART");
    expect(html).toMatch(/data-slot="artwork"/);
  });

  it("omits the artwork container without artwork or artworkSlot", () => {
    const html = renderSolid(RLAudio, { src: SRC });
    expect(html).not.toMatch(/data-slot="artwork"/);
  });
});
