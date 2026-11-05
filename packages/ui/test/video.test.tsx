import { describe, it, expect } from "vite-plus/test";

import { RLVideo } from "../src/components/video/RLVideo";
import { renderSolid } from "./utils/normalize";

const VIDEO_ID = "dQw4w9WgXcQ";
const WATCH_URL = `https://www.youtube.com/watch?v=${VIDEO_ID}`;

describe("RLVideo", () => {
  it("renders the root with the video theme", () => {
    const html = renderSolid(RLVideo, { src: WATCH_URL, theme: "video" });
    expect(html).toMatch(
      /data-slot="root"[^>]*data-theme="video"|data-theme="video"[^>]*data-slot="root"/,
    );
  });

  it("renders an enabled trigger for a YouTube URL", () => {
    const html = renderSolid(RLVideo, { src: WATCH_URL });
    expect(html).toMatch(/data-slot="trigger"/);
    expect(html).not.toMatch(/<button[^>]*data-slot="trigger"[^>]*\sdisabled/);
  });

  it("uses the YouTube thumbnail for the video id", () => {
    const html = renderSolid(RLVideo, { src: WATCH_URL });
    expect(html).toContain(`https://i3.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`);
  });

  it("extracts the id from short youtu.be links", () => {
    const html = renderSolid(RLVideo, { src: `https://youtu.be/${VIDEO_ID}` });
    expect(html).toContain(`https://i3.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`);
  });

  it("prefers the thumbnail prop over the YouTube thumbnail", () => {
    const html = renderSolid(RLVideo, {
      src: WATCH_URL,
      thumbnail: "https://example.com/poster.jpg",
    });
    expect(html).toContain("https://example.com/poster.jpg");
    expect(html).not.toContain(`/vi/${VIDEO_ID}/hqdefault.jpg`);
  });

  it("disables the trigger and shows the placeholder for an invalid URL", () => {
    const html = renderSolid(RLVideo, { src: "https://example.com/not-youtube" });
    expect(html).toContain("/assets/placeholder.webp");
    expect(html).toMatch(
      /<button[^>]*data-slot="trigger"[^>]*disabled|<button[^>]*disabled[^>]*data-slot="trigger"/,
    );
  });

  it("replaces the default play icon with iconSlot", () => {
    const html = renderSolid(RLVideo, { src: WATCH_URL, iconSlot: "CUSTOM" });
    expect(html).toContain("CUSTOM");
    expect(html).not.toMatch(/data-slot="icon"/);
  });

  it("keeps the default play icon when iconSlot is absent", () => {
    const html = renderSolid(RLVideo, { src: WATCH_URL });
    expect(html).toMatch(/data-slot="icon"/);
  });

  it("renders children as the transcript", () => {
    const html = renderSolid(RLVideo, { src: WATCH_URL }, "Transcript text");
    expect(html).toMatch(/data-slot="transcript"/);
    expect(html).toContain("Transcript text");
  });

  it("prefers transcriptSlot over children", () => {
    const html = renderSolid(
      RLVideo,
      { src: WATCH_URL, transcriptSlot: "Slot transcript" },
      "Child transcript",
    );
    expect(html).toContain("Slot transcript");
    expect(html).not.toContain("Child transcript");
  });

  it("renders no transcript block without children or transcriptSlot", () => {
    const html = renderSolid(RLVideo, { src: WATCH_URL });
    expect(html).not.toMatch(/data-slot="transcript"/);
  });

  it("forwards extra attributes to the root element", () => {
    const html = renderSolid(RLVideo, { src: WATCH_URL, id: "video-1" });
    expect(html).toMatch(
      /<div[^>]*data-slot="root"[^>]*id="video-1"|<div[^>]*id="video-1"[^>]*data-slot="root"/,
    );
  });
});
