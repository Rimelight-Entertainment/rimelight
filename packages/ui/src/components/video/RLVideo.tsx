import type { RLVideoProps } from "./video.types";
import { RLVideoTheme } from "./video.theme";
import { createMemo, createSignal, Show, omit, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

const PLACEHOLDER_THUMBNAIL = "/assets/placeholder.webp";
const YOUTUBE_EMBED_BASE = "https://www.youtube.com/embed/";
const VALID_ID_PATTERN = /^[\w-]{11}$/;
const KNOWN_PREFIXES = ["www.", "m.", "music.", "gaming."];
const YOUTUBE_THUMB_BASE = "https://i3.ytimg.com/vi/";

function normalizeHost(host: string): string {
  for (const prefix of KNOWN_PREFIXES) {
    if (host.startsWith(prefix)) {
      return host.slice(prefix.length);
    }
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
    return null;
  }
  return null;
}

export const RLVideo: Component<RLVideoProps> = (props) => {
  const rest = omit(
    props,
    "src",
    "title",
    "icon",
    "thumbnail",
    "iconSlot",
    "transcriptSlot",
    "ui",
    "class",
    "children",
  );

  const [isPlaying, setIsPlaying] = createSignal(false);

  const videoId = createMemo(() => extractYoutubeVideoId(props.src || ""));
  const embedUrl = createMemo(() =>
    videoId() ? `${YOUTUBE_EMBED_BASE}${videoId()}?autoplay=1` : null,
  );
  const defaultThumbnail = createMemo(() =>
    videoId() ? `${YOUTUBE_THUMB_BASE}${videoId()}/hqdefault.jpg` : PLACEHOLDER_THUMBNAIL,
  );

  const titleText = () => props.title || "YouTube Video Player";
  const iconName = () => props.icon || "play";
  const isPlayable = () => Boolean(embedUrl());

  const classes = createMemo(() =>
    RLVideoTheme({
      title: !!props.title,
      icon: !!props.icon,
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div>
      <div class={classes().root} data-slot="root" {...rest}>
        <Show
          when={isPlaying() && embedUrl()}
          fallback={
            <button
              type="button"
              class={classes().trigger}
              data-slot="trigger"
              aria-label={isPlayable() ? "Play YouTube Video" : "YouTube Video Unavailable"}
              disabled={!isPlayable()}
              onClick={() => setIsPlaying(true)}
            >
              <img
                src={props.thumbnail || defaultThumbnail()}
                alt={titleText()}
                loading="lazy"
                class={classes().image}
                data-slot="image"
              />

              {props.iconSlot ? (
                props.iconSlot
              ) : (
                <RLIcon
                  name={iconName()}
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
            title={titleText()}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
            referrerpolicy="strict-origin-when-cross-origin"
            class={classes().iframe}
            data-slot="iframe"
          />
        </Show>
      </div>

      <Show when={props.transcriptSlot || props.children}>
        <div class={classes().transcript} data-slot="transcript">
          {props.transcriptSlot ? props.transcriptSlot : props.children}
        </div>
      </Show>
    </div>
  );
};
