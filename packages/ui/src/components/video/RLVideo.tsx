import type { RLVideoProps } from "./video.types";
import { RLVideoTheme } from "./video.theme";
import { createMemo, createSignal, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const PLACEHOLDER_THUMBNAIL = "/assets/placeholder.webp";
const YOUTUBE_EMBED_BASE = "https://www.youtube.com/embed/";
const VALID_ID_PATTERN = /^[\w-]{11}$/;
const KNOWN_PREFIXES = ["www.", "m.", "music.", "gaming."];
const YOUTUBE_THUMB_BASE = "https://i3.ytimg.com/vi/";

function normalizeHost(host: string): string {
  for (const prefix of KNOWN_PREFIXES) {
    if (host.startsWith(prefix)) return host.slice(prefix.length);
  }
  return host;
}

function sanitizeVideoId(id: string | null): string | null {
  if (!id) return null;
  return VALID_ID_PATTERN.test(id) ? id : null;
}

function extractYoutubeVideoId(rawUrl: string): string | null {
  if (!rawUrl) return null;
  try {
    const url = new URL(rawUrl);
    const host = normalizeHost(url.hostname);

    if (host === "youtu.be") {
      const id = url.pathname.split("/").find(Boolean) ?? null;
      return sanitizeVideoId(id);
    }

    if (host.endsWith("youtube.com")) {
      const paramsId = sanitizeVideoId(url.searchParams.get("v"));
      if (paramsId) return paramsId;

      const segments = url.pathname.split("/").filter(Boolean);
      if (!segments.length) return null;

      if (segments[0] === "embed" || segments[0] === "shorts" || segments[0] === "live") {
        return sanitizeVideoId(segments[1] ?? null);
      }

      return sanitizeVideoId(segments[segments.length - 1] ?? null);
    }
  } catch {
    if (VALID_ID_PATTERN.test(rawUrl)) {
      return rawUrl;
    }
  }
  return null;
}

const OMIT_KEYS = ["src", "title", "icon", "thumbnail"] as const;

export const RLVideo: Component<RLVideoProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLVideoTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["iconSlot", "transcriptSlot"] as const,
  });

  const [isPlaying, setIsPlaying] = createSignal(false);

  const videoId = createMemo(() => extractYoutubeVideoId(props.src || ""));
  const embedUrl = createMemo(() =>
    videoId() ? `${YOUTUBE_EMBED_BASE}${videoId()}?autoplay=1` : null,
  );
  const defaultThumbnail = createMemo(() =>
    videoId() ? `${YOUTUBE_THUMB_BASE}${videoId()}/hqdefault.jpg` : PLACEHOLDER_THUMBNAIL,
  );

  return (
    <>
      <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
        <Show
          when={isPlaying() && embedUrl()}
          fallback={
            <button
              type="button"
              class={classes().trigger}
              data-slot="trigger"
              aria-label={
                embedUrl() !== null ? uiT("video.playLabel") : uiT("video.unavailableLabel")
              }
              disabled={embedUrl() === null}
              onClick={() => setIsPlaying(true)}
            >
              <img
                src={props.thumbnail || defaultThumbnail()}
                alt={props.title || uiT("video.defaultTitle")}
                loading="lazy"
                class={classes().image}
                data-slot="image"
              />

              {slots.iconSlot() ? (
                slots.iconSlot()
              ) : (
                <RLIcon
                  name={props.icon || "play"}
                  class={classes().icon}
                  data-slot="icon"
                  aria-hidden="true"
                />
              )}
            </button>
          }
        >
          <iframe
            src={embedUrl()!}
            title={props.title || uiT("video.defaultTitle")}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
            credentialless
            referrerpolicy="strict-origin-when-cross-origin"
            class={classes().iframe}
            data-slot="iframe"
          />
        </Show>
      </Tag>

      <Show when={slots.transcriptSlot() || children()}>
        <div class={classes().transcript} data-slot="transcript">
          {slots.transcriptSlot() ? slots.transcriptSlot() : children()}
        </div>
      </Show>
    </>
  );
};
