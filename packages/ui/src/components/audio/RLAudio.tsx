import {
  children,
  createMemo,
  createSignal,
  createUniqueId,
  For,
  onSettled,
  Show,
  omit,
  type Component,
} from "solid-js";
import type { RLAudioProps, AudioTextTrack, AudioTrackItem, AudioRepeatMode } from "./audio";
import { audioTheme } from "./audio.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLImage } from "../image/RLImage";
import { RLAspectRatio } from "../aspect-ratio/RLAspectRatio";
import { RLPopover } from "../popover/RLPopover";

function formatTime(seconds: number): string {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function formatFileSize(bytes: number | string): string {
  if (typeof bytes === "string") return bytes;
  if (isNaN(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function generateDefaultPeaks(count = 36): number[] {
  // Regular, clean WhatsApp-style voice note rhythmic wave pattern
  const voicePattern = [
    22, 36, 58, 42, 74, 52, 86, 64, 46, 78, 56, 90, 68, 40, 64, 82, 48, 74, 92, 58, 44, 70, 86, 50,
    78, 62, 88, 66, 42, 72, 54, 80, 46, 60, 34, 22,
  ];
  if (count === voicePattern.length) return voicePattern;
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor((i / count) * voicePattern.length);
    peaks.push(voicePattern[idx] ?? 40);
  }
  return peaks;
}

const SPEED_OPTIONS = [0.5, 1, 1.25, 1.5, 2, 3, 4];

export const RLAudio: Component<RLAudioProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "src",
    "title",
    "description",
    "artwork",
    "format",
    "fileSize",
    "bitrate",
    "playlist",
    "currentTrackIndex",
    "orientation",
    "progressVariant",
    "waveformPeaks",
    "repeatMode",
    "autoplay",
    "loop",
    "muted",
    "volume",
    "playbackRate",
    "preload",
    "tracks",
    "icons",
    "color",
    "progressColor",
    "size",
    "variant",
    "showTime",
    "showVolume",
    "showVolumeNumber",
    "showSpeed",
    "showSkip",
    "skipSeconds",
    "showRepeat",
    "showDownload",
    "showExternalLink",
    "externalLink",
    "showPlaylist",
    "artworkZoomable",
    "ui",
    "class",
    "children",
    "transcript",
    "headerSlot",
    "timelineSlot",
    "controlsSlot",
    "artworkSlot",
    "onPlay",
    "onPause",
    "onEnded",
    "onTrackChange",
    "onTimeUpdate",
    "onVolumeChange",
    "onRepeatModeChange",
  );

  const resolvedChildren = children(() => props.children);
  const resolvedHeaderSlot = children(() => props.headerSlot);
  const resolvedTimelineSlot = children(() => props.timelineSlot);
  const resolvedControlsSlot = children(() => props.controlsSlot);
  const resolvedArtworkSlot = children(() => props.artworkSlot);
  const resolvedTranscript = children(() => props.transcript);

  const titleId = createUniqueId();
  const descId = createUniqueId();

  let audioRef: HTMLAudioElement | undefined;

  // Multi-track Playlist handling
  const [activeTrackIndex, setActiveTrackIndex] = createSignal(props.currentTrackIndex ?? 0);

  const playlist = createMemo<AudioTrackItem[]>(() => {
    if (props.playlist && props.playlist.length > 0) {
      return props.playlist;
    }
    if (props.src) {
      const singleTrack: AudioTrackItem = {
        src: props.src,
        title: props.title,
        description: props.description,
        artwork: props.artwork,
        transcript: typeof props.transcript === "string" ? props.transcript : undefined,
        tracks: props.tracks,
      };
      return [singleTrack];
    }
    return [];
  });

  const currentTrack = createMemo<AudioTrackItem | undefined>(() => {
    const list = playlist();
    if (list.length === 0) return undefined;
    const idx = Math.max(0, Math.min(list.length - 1, activeTrackIndex()));
    return list[idx];
  });

  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);
  const [duration, setDuration] = createSignal(0);
  const [volume, setVolume] = createSignal(props.volume ?? 1);
  const [isMuted, setIsMuted] = createSignal(props.muted ?? false);
  const [playbackRate, setPlaybackRate] = createSignal(props.playbackRate ?? 1);
  const [isEditingSpeed, setIsEditingSpeed] = createSignal(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = createSignal(false);
  const [repeatMode, setRepeatMode] = createSignal<AudioRepeatMode>(
    props.repeatMode ?? (props.loop ? "all" : "off"),
  );

  const orientation = () => props.orientation ?? "horizontal";
  const progressVariant = () => props.progressVariant ?? "bar";
  const showTime = () => props.showTime ?? true;
  const showVolume = () => props.showVolume ?? true;
  const showVolumeNumber = () => props.showVolumeNumber ?? true;
  const showSpeed = () => props.showSpeed ?? true;
  const showSkip = () => props.showSkip ?? true;
  const showRepeat = () => props.showRepeat ?? true;
  const showDownload = () => props.showDownload ?? false;
  const showExternalLink = () => props.showExternalLink ?? false;
  const showPlaylist = () => props.showPlaylist ?? true;
  const artworkZoomable = () => props.artworkZoomable ?? true;
  const skipSecs = () => props.skipSeconds ?? 15;

  const resolvedClasses = createMemo(() =>
    audioTheme({
      variant: props.variant ?? "outline",
      orientation: orientation(),
      color: props.color ?? "primary",
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class,
    }),
  );

  const progressColorClass = createMemo(() => {
    const pColor = props.progressColor ?? props.color ?? "primary";
    return `rl-color-${pColor}`;
  });

  const peaks = createMemo(() => props.waveformPeaks ?? generateDefaultPeaks(64));

  const getDuration = () => {
    if (
      audioRef &&
      !isNaN(audioRef.duration) &&
      isFinite(audioRef.duration) &&
      audioRef.duration > 0
    ) {
      return audioRef.duration;
    }
    if (duration() > 0) return duration();
    const trackDur = currentTrack()?.duration;
    if (trackDur && isFinite(trackDur) && trackDur > 0) return trackDur;
    return 0;
  };

  const progressPercent = createMemo(() => {
    const dur = getDuration();
    if (!dur || dur <= 0) return 0;
    return Math.min(100, Math.max(0, (currentTime() / dur) * 100));
  });

  const volumePercent = createMemo(() => {
    if (isMuted()) return 0;
    return Math.min(100, Math.max(0, volume() * 100));
  });

  const currentMediaSrc = createMemo<string>(() => {
    const track = currentTrack();
    if (!track) return "";
    if (typeof track.src === "string") return track.src;
    if (Array.isArray(track.src) && track.src[0]) return track.src[0].src;
    return "";
  });

  const currentTracks = createMemo<AudioTextTrack[]>(() => {
    const track = currentTrack();
    return track?.tracks ?? props.tracks ?? [];
  });

  const trackTitle = () => currentTrack()?.title ?? props.title;
  const trackDescription = () => currentTrack()?.description ?? props.description;
  const trackArtwork = () => currentTrack()?.artwork ?? props.artwork;
  const trackTranscript = () => currentTrack()?.transcript ?? resolvedTranscript();
  const trackFormat = () => currentTrack()?.format ?? props.format;
  const trackFileSize = () => currentTrack()?.fileSize ?? props.fileSize;
  const trackBitrate = () => currentTrack()?.bitrate ?? props.bitrate;
  const activeExternalUrl = () => props.externalLink ?? currentMediaSrc();

  const selectTrack = (index: number) => {
    const list = playlist();
    if (index < 0 || index >= list.length) return;
    setActiveTrackIndex(index);
    setCurrentTime(0);
    const target = list[index]!;
    if (target.duration) {
      setDuration(target.duration);
    }
    props.onTrackChange?.(index, target);
    if (audioRef) {
      const targetSrc = typeof target.src === "string" ? target.src : (target.src[0]?.src ?? "");
      if (audioRef.src !== targetSrc) {
        audioRef.src = targetSrc;
        audioRef.load();
      }
      if (isPlaying()) {
        audioRef.play().catch(() => setIsPlaying(false));
      }
    }
  };

  const nextTrack = () => {
    const list = playlist();
    if (list.length <= 1) return;
    const nextIdx = activeTrackIndex() + 1;
    if (nextIdx < list.length) {
      selectTrack(nextIdx);
    } else if (repeatMode() === "all") {
      selectTrack(0);
    }
  };

  const prevTrack = () => {
    const list = playlist();
    if (list.length <= 1) return;
    if (currentTime() > 3) {
      if (audioRef) audioRef.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const prevIdx = activeTrackIndex() - 1;
    if (prevIdx >= 0) {
      selectTrack(prevIdx);
    } else if (repeatMode() === "all") {
      selectTrack(list.length - 1);
    }
  };

  const togglePlay = () => {
    if (!audioRef) return;
    if (isPlaying()) {
      audioRef.pause();
    } else {
      const srcToPlay = currentMediaSrc();
      if (
        !audioRef.src ||
        audioRef.src === "" ||
        (!audioRef.src.includes(srcToPlay) && srcToPlay !== "")
      ) {
        audioRef.src = srcToPlay;
        audioRef.load();
      }
      audioRef.play().catch((err) => {
        console.warn("RLAudio playback play() error:", err);
        setIsPlaying(false);
      });
    }
  };

  const handleSkip = (seconds: number) => {
    if (!audioRef) return;
    const dur = getDuration();
    const cur =
      !isNaN(audioRef.currentTime) && isFinite(audioRef.currentTime)
        ? audioRef.currentTime
        : currentTime();
    const target = cur + seconds;
    const newTime = dur > 0 ? Math.max(0, Math.min(target, dur)) : Math.max(0, target);
    try {
      audioRef.currentTime = newTime;
      setCurrentTime(newTime);
    } catch {
      // ignore
    }
  };

  const handleProgressChange = (e: Event & { currentTarget: HTMLInputElement }) => {
    const val = parseFloat(e.currentTarget.value);
    if (!isNaN(val) && audioRef) {
      const dur = getDuration();
      if (dur > 0) {
        const newTime = (val / 100) * dur;
        try {
          audioRef.currentTime = newTime;
          setCurrentTime(newTime);
        } catch {
          // ignore
        }
      }
    }
  };

  const handleWaveformClick = (percent: number) => {
    if (audioRef) {
      const dur = getDuration();
      if (dur > 0) {
        const newTime = (percent / 100) * dur;
        try {
          audioRef.currentTime = newTime;
          setCurrentTime(newTime);
        } catch {
          // ignore
        }
      }
    }
  };

  const handleVolumeChange = (e: Event & { currentTarget: HTMLInputElement }) => {
    const val = parseFloat(e.currentTarget.value);
    if (!isNaN(val)) {
      const v = Math.min(1, Math.max(0, val / 100));
      setVolume(v);
      if (audioRef) {
        audioRef.volume = v;
        if (v > 0 && isMuted()) {
          audioRef.muted = false;
          setIsMuted(false);
        }
      }
      props.onVolumeChange?.(v, isMuted());
    }
  };

  const toggleMute = () => {
    if (!audioRef) return;
    const newMuted = !isMuted();
    audioRef.muted = newMuted;
    setIsMuted(newMuted);
    props.onVolumeChange?.(volume(), newMuted);
  };

  const cycleRepeatMode = () => {
    const current = repeatMode();
    const next: AudioRepeatMode = current === "off" ? "all" : current === "all" ? "one" : "off";
    setRepeatMode(next);
    props.onRepeatModeChange?.(next);
  };

  const cycleSpeed = () => {
    const current = playbackRate();
    const currentIndex = SPEED_OPTIONS.indexOf(current);
    const nextIndex =
      currentIndex === -1 || currentIndex === SPEED_OPTIONS.length - 1 ? 0 : currentIndex + 1;
    const nextSpeed = SPEED_OPTIONS[nextIndex] ?? 1;
    setPlaybackRate(nextSpeed);
    if (audioRef) {
      audioRef.playbackRate = nextSpeed;
    }
  };

  const setCustomSpeed = (val: number) => {
    if (isNaN(val) || val <= 0) return;
    const clamped = Math.max(0.1, val);
    setPlaybackRate(clamped);
    if (audioRef) {
      audioRef.playbackRate = clamped;
    }
  };

  // Icons resolution (support custom overrides prop + defaults)
  const playIconName = () => props.icons?.play ?? "play";
  const pauseIconName = () => props.icons?.pause ?? "pause";
  const skipBackIconName = () => props.icons?.skipBack ?? "rewind";
  const skipForwardIconName = () => props.icons?.skipForward ?? "fastForward";
  const prevTrackIconName = () => props.icons?.prevTrack ?? "skipBack";
  const nextTrackIconName = () => props.icons?.nextTrack ?? "skipForward";
  const downloadIconName = () => props.icons?.download ?? "download";
  const externalLinkIconName = () => props.icons?.externalLink ?? "externalLink";

  const repeatIconName = () => {
    const mode = repeatMode();
    if (mode === "one") return props.icons?.repeatOne ?? "repeat1";
    if (mode === "all") return props.icons?.repeat ?? "repeat";
    return props.icons?.repeatOff ?? "repeat";
  };

  const volumeIconName = createMemo(() => {
    if (isMuted() || volume() === 0) return props.icons?.volumeMuted ?? "volumeX";
    if (volume() < 0.5) return props.icons?.volumeLow ?? "volume1";
    return props.icons?.volumeHigh ?? "volume2";
  });

  onSettled(() => {
    const audio = audioRef;
    if (!audio) return;

    audio.volume = volume();
    audio.muted = isMuted();
    audio.playbackRate = playbackRate();

    const onPlayEvent = () => {
      setIsPlaying(true);
      props.onPlay?.();
    };

    const onPauseEvent = () => {
      setIsPlaying(false);
      props.onPause?.();
    };

    const onTimeUpdateEvent = () => {
      if (!audioRef) return;
      setCurrentTime(audioRef.currentTime);
      props.onTimeUpdate?.(audioRef.currentTime, audioRef.duration || duration());
    };

    const onLoadedMetadataEvent = () => {
      if (!audioRef) return;
      if (!isNaN(audioRef.duration) && isFinite(audioRef.duration) && audioRef.duration > 0) {
        setDuration(audioRef.duration);
      }
    };

    const onEndedEvent = () => {
      if (repeatMode() === "one") {
        if (audioRef) {
          audioRef.currentTime = 0;
          audioRef.play().catch(() => setIsPlaying(false));
        }
      } else if (activeTrackIndex() < playlist().length - 1) {
        nextTrack();
      } else if (repeatMode() === "all") {
        selectTrack(0);
      } else {
        setIsPlaying(false);
        props.onEnded?.();
      }
    };

    audio.addEventListener("play", onPlayEvent);
    audio.addEventListener("pause", onPauseEvent);
    audio.addEventListener("timeupdate", onTimeUpdateEvent);
    audio.addEventListener("loadedmetadata", onLoadedMetadataEvent);
    audio.addEventListener("durationchange", onLoadedMetadataEvent);
    audio.addEventListener("canplay", onLoadedMetadataEvent);
    audio.addEventListener("ended", onEndedEvent);

    return () => {
      audio.removeEventListener("play", onPlayEvent);
      audio.removeEventListener("pause", onPauseEvent);
      audio.removeEventListener("timeupdate", onTimeUpdateEvent);
      audio.removeEventListener("loadedmetadata", onLoadedMetadataEvent);
      audio.removeEventListener("durationchange", onLoadedMetadataEvent);
      audio.removeEventListener("canplay", onLoadedMetadataEvent);
      audio.removeEventListener("ended", onEndedEvent);
    };
  });

  const renderArtwork = () => {
    const art = trackArtwork();
    if (!art && !resolvedArtworkSlot()) return null;

    const imageElement = () =>
      resolvedArtworkSlot() ? (
        resolvedArtworkSlot()
      ) : artworkZoomable() && art ? (
        <RLImage
          src={art}
          alt={trackTitle() ? `${trackTitle()} artwork` : "Audio artwork"}
          fit="cover"
          class="!size-full !h-full !w-full"
          ui={{
            root: "!size-full !h-full !w-full !block",
            trigger: "!size-full !h-full !w-full !block",
            triggerImage: "!size-full !h-full !w-full !max-w-none !object-cover",
          }}
          lightbox
        />
      ) : (
        <img
          src={art}
          alt={trackTitle() ? `${trackTitle()} artwork` : "Audio artwork"}
          class="!size-full !h-full !w-full !object-cover"
          data-slot="artwork-item"
          loading="lazy"
        />
      );

    if (orientation() === "vertical") {
      return (
        <div class={resolvedClasses().artwork} data-slot="artwork">
          <RLAspectRatio ratio={1} class="w-full">
            {imageElement()}
          </RLAspectRatio>
        </div>
      );
    }

    return (
      <div class={resolvedClasses().artwork} data-slot="artwork">
        {imageElement()}
      </div>
    );
  };

  return (
    <div
      class={resolvedClasses().root}
      data-slot="root"
      role="region"
      aria-label={trackTitle() ? `${trackTitle()} audio player` : "Audio player"}
      aria-labelledby={trackTitle() ? titleId : undefined}
      aria-describedby={trackDescription() ? descId : undefined}
      {...rest}
    >
      <audio
        ref={(el) => (audioRef = el)}
        src={currentMediaSrc()}
        autoplay={props.autoplay}
        preload={props.preload ?? "metadata"}
        aria-hidden="true"
        tabindex={-1}
      >
        <For each={currentTracks()}>
          {(track) => (
            <track
              src={track.src}
              kind={track.kind ?? "subtitles"}
              srclang={track.srclang}
              label={track.label}
              default={track.default}
            />
          )}
        </For>
      </audio>

      <div class={resolvedClasses().container} data-slot="container">
        {/* 1. Header with Artwork, Track Details & Top Actions */}
        <Show
          when={resolvedHeaderSlot()}
          fallback={
            <div class={resolvedClasses().header} data-slot="header">
              {renderArtwork()}

              <Show
                when={
                  trackTitle() ||
                  trackDescription() ||
                  trackFormat() ||
                  trackFileSize() ||
                  trackBitrate()
                }
              >
                <div class={resolvedClasses().details} data-slot="details">
                  <Show when={trackTitle()}>
                    <span id={titleId} class={resolvedClasses().title} data-slot="title">
                      {trackTitle()}
                    </span>
                  </Show>
                  <Show when={trackDescription()}>
                    <span id={descId} class={resolvedClasses().description} data-slot="description">
                      {trackDescription()}
                    </span>
                  </Show>
                  <Show when={trackFormat() || trackFileSize() || trackBitrate()}>
                    <div class={resolvedClasses().metaBadge} data-slot="meta-badge">
                      <Show when={trackFormat()}>
                        <span>{trackFormat()}</span>
                      </Show>
                      <Show when={trackBitrate()}>
                        <Show when={trackFormat()}>
                          <span class="opacity-40">•</span>
                        </Show>
                        <span>{trackBitrate()}</span>
                      </Show>
                      <Show when={trackFileSize()}>
                        <Show when={trackFormat() || trackBitrate()}>
                          <span class="opacity-40">•</span>
                        </Show>
                        <span>
                          {typeof trackFileSize() === "number"
                            ? formatFileSize(trackFileSize() as number)
                            : trackFileSize()}
                        </span>
                      </Show>
                    </div>
                  </Show>
                </div>
              </Show>

              {/* Optional Top Right Download & External Link Actions */}
              <Show when={showDownload() || showExternalLink()}>
                <div class={resolvedClasses().actions} data-slot="actions">
                  <Show when={showDownload() && currentMediaSrc()}>
                    <a
                      href={currentMediaSrc()}
                      download={trackTitle() ? `${trackTitle()}.mp3` : "audio.mp3"}
                      target="_blank"
                      rel="noopener noreferrer"
                      class={resolvedClasses().actionButton}
                      data-slot="download-button"
                      aria-label="Download audio track"
                      title="Download audio track"
                    >
                      <RLIcon name={downloadIconName()} class="size-4" aria-hidden="true" />
                    </a>
                  </Show>

                  <Show when={showExternalLink() && activeExternalUrl()}>
                    <a
                      href={activeExternalUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      class={resolvedClasses().actionButton}
                      data-slot="external-link-button"
                      aria-label="Open source link"
                      title="Open source link"
                    >
                      <RLIcon name={externalLinkIconName()} class="size-4" aria-hidden="true" />
                    </a>
                  </Show>
                </div>
              </Show>
            </div>
          }
        >
          {resolvedHeaderSlot()}
        </Show>

        {/* 2. Timeline Section (Progress Scrub Bar or Waveform + Time) */}
        <Show
          when={resolvedTimelineSlot()}
          fallback={
            <div class={resolvedClasses().timeline} data-slot="timeline">
              <div
                class={`${resolvedClasses().progressContainer} ${progressColorClass()}`}
                data-slot="progress-container"
              >
                <Show
                  when={progressVariant() === "waveform"}
                  fallback={
                    <div class={resolvedClasses().progressTrack} data-slot="progress-track">
                      <svg
                        class="h-full w-full overflow-visible pointer-events-none"
                        aria-hidden="true"
                      >
                        <rect
                          class={resolvedClasses().progressRange}
                          data-slot="progress-range"
                          width={`${progressPercent()}%`}
                          fill="currentColor"
                          rx="4"
                        />
                      </svg>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="0.1"
                        value={progressPercent()}
                        onInput={handleProgressChange}
                        onChange={handleProgressChange}
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        aria-label="Seek audio timeline"
                        aria-valuemin={0}
                        aria-valuemax={Math.round(getDuration())}
                        aria-valuenow={Math.round(currentTime())}
                        aria-valuetext={`${formatTime(currentTime())} of ${formatTime(getDuration())}`}
                        data-slot="progress-input"
                      />
                    </div>
                  }
                >
                  <div
                    class={resolvedClasses().waveformContainer}
                    data-slot="waveform-container"
                    role="slider"
                    tabindex={0}
                    aria-label="Seek audio timeline"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(getDuration())}
                    aria-valuenow={Math.round(currentTime())}
                    aria-valuetext={`${formatTime(currentTime())} of ${formatTime(getDuration())}`}
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
                      handleWaveformClick(pct);
                    }}
                  >
                    <svg
                      class={resolvedClasses().waveformSvg}
                      viewBox={`0 0 ${peaks().length * 6} 100`}
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <For each={peaks()}>
                        {(peak, idx) => {
                          const isActive = () => {
                            const total = peaks().length;
                            const barPct = total > 1 ? (idx() / (total - 1)) * 100 : 0;
                            return barPct <= progressPercent();
                          };
                          const height = () => Math.max(16, peak);
                          const y = () => (100 - height()) / 2;
                          return (
                            <rect
                              x={idx() * 6 + 1.5}
                              y={y()}
                              width="3"
                              height={height()}
                              rx="1.5"
                              class={`${resolvedClasses().waveformBar} ${
                                isActive() ? resolvedClasses().waveformBarActive : ""
                              }`}
                              fill="currentColor"
                            />
                          );
                        }}
                      </For>
                    </svg>
                  </div>
                </Show>
              </div>

              {/* Time Display */}
              <Show when={showTime()}>
                <div class={resolvedClasses().timeDisplay} data-slot="time-display" aria-live="off">
                  <span class={resolvedClasses().timeCurrent} data-slot="time-current">
                    {formatTime(currentTime())}
                  </span>
                  <span class={resolvedClasses().timeDuration} data-slot="time-duration">
                    {formatTime(duration())}
                  </span>
                </div>
              </Show>
            </div>
          }
        >
          {resolvedTimelineSlot()}
        </Show>

        {/* 3. Controls Section: Left (Volume), Center (Playback), Right (Repeat & Speed) */}
        <Show
          when={resolvedControlsSlot()}
          fallback={
            <div class={resolvedClasses().controls} data-slot="controls">
              {/* Bottom-Left: Vertical Volume Popover & Mute */}
              <div class={resolvedClasses().controlsLeft} data-slot="controls-left">
                <Show when={showVolume()}>
                  <div class={resolvedClasses().volumeContainer} data-slot="volume-container">
                    <RLPopover
                      placement="top"
                      mode="click"
                      ui={{
                        root: () => "relative inline-flex items-center justify-center",
                        trigger: () => "inline-flex items-center justify-center",
                        content: () => resolvedClasses().volumePopover,
                      }}
                      trigger={
                        <button
                          type="button"
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleMute();
                          }}
                          class={resolvedClasses().volumeButton}
                          data-slot="volume-button"
                          aria-label={
                            isMuted()
                              ? "Unmute audio (right click) / adjust volume (left click)"
                              : "Mute audio (right click) / adjust volume (left click)"
                          }
                          title="Click to adjust volume, right-click to mute/unmute"
                        >
                          <RLIcon
                            name={volumeIconName()}
                            class={resolvedClasses().volumeIcon}
                            aria-hidden="true"
                          />
                        </button>
                      }
                    >
                      <Show when={showVolumeNumber()}>
                        <span class={resolvedClasses().volumeText} data-slot="volume-text">
                          {Math.round(volumePercent())}%
                        </span>
                      </Show>

                      <div
                        class={resolvedClasses().volumeSlider}
                        data-slot="volume-slider"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const clickY = rect.bottom - e.clientY;
                          const pct = Math.max(0, Math.min(100, (clickY / rect.height) * 100));
                          const v = pct / 100;
                          setVolume(v);
                          if (audioRef) {
                            audioRef.volume = v;
                            if (v > 0 && isMuted()) {
                              audioRef.muted = false;
                              setIsMuted(false);
                            }
                          }
                          props.onVolumeChange?.(v, isMuted());
                        }}
                      >
                        <div class={resolvedClasses().volumeTrack} data-slot="volume-track">
                          <svg
                            class="h-full w-full overflow-visible pointer-events-none"
                            viewBox="0 0 6 100"
                            preserveAspectRatio="none"
                            aria-hidden="true"
                          >
                            <rect
                              x="0"
                              y={100 - volumePercent()}
                              width="6"
                              height={volumePercent()}
                              rx="3"
                              fill="currentColor"
                              class={resolvedClasses().volumeRange}
                            />
                          </svg>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={volumePercent()}
                            onInput={handleVolumeChange}
                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 [writing-mode:vertical-lr] [direction:rtl]"
                            aria-label="Volume level"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(volumePercent())}
                            data-slot="volume-input"
                          />
                        </div>
                      </div>
                    </RLPopover>
                  </div>
                </Show>
              </div>

              {/* Center: Prev Track, Skip Back (>> double triangle), Play/Pause, Skip Fwd (>> double triangle), Next Track */}
              <div class={resolvedClasses().controlsCenter} data-slot="controls-center">
                {/* Previous Track Button (for playlists) */}
                <Show when={playlist().length > 1}>
                  <button
                    type="button"
                    onClick={prevTrack}
                    class={resolvedClasses().navButton}
                    data-slot="nav-button-prev"
                    aria-label="Previous track"
                    disabled={activeTrackIndex() === 0 && repeatMode() !== "all"}
                  >
                    <RLIcon
                      name={prevTrackIconName()}
                      class={resolvedClasses().navIcon}
                      aria-hidden="true"
                    />
                  </button>
                </Show>

                {/* Skip Back Button with double triangle icons & second amount badge */}
                <Show when={showSkip()}>
                  <button
                    type="button"
                    onClick={() => handleSkip(-skipSecs())}
                    class={resolvedClasses().skipButton}
                    data-slot="skip-button-back"
                    aria-label={`Skip backward ${skipSecs()} seconds`}
                  >
                    <RLIcon
                      name={skipBackIconName()}
                      class={resolvedClasses().skipIcon}
                      aria-hidden="true"
                    />
                    <span class={resolvedClasses().skipBadge} data-slot="skip-badge">
                      {skipSecs()}
                    </span>
                  </button>
                </Show>

                {/* Play / Pause Primary Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  class={resolvedClasses().playButton}
                  data-slot="play-button"
                  aria-label={isPlaying() ? "Pause audio" : "Play audio"}
                >
                  <RLIcon
                    name={isPlaying() ? pauseIconName() : playIconName()}
                    class={resolvedClasses().playIcon}
                    aria-hidden="true"
                  />
                </button>

                {/* Skip Forward Button with double triangle icons & second amount badge */}
                <Show when={showSkip()}>
                  <button
                    type="button"
                    onClick={() => handleSkip(skipSecs())}
                    class={resolvedClasses().skipButton}
                    data-slot="skip-button-forward"
                    aria-label={`Skip forward ${skipSecs()} seconds`}
                  >
                    <RLIcon
                      name={skipForwardIconName()}
                      class={resolvedClasses().skipIcon}
                      aria-hidden="true"
                    />
                    <span class={resolvedClasses().skipBadge} data-slot="skip-badge">
                      {skipSecs()}
                    </span>
                  </button>
                </Show>

                {/* Next Track Button (for playlists) */}
                <Show when={playlist().length > 1}>
                  <button
                    type="button"
                    onClick={nextTrack}
                    class={resolvedClasses().navButton}
                    data-slot="nav-button-next"
                    aria-label="Next track"
                    disabled={
                      activeTrackIndex() === playlist().length - 1 && repeatMode() !== "all"
                    }
                  >
                    <RLIcon
                      name={nextTrackIconName()}
                      class={resolvedClasses().navIcon}
                      aria-hidden="true"
                    />
                  </button>
                </Show>
              </div>

              {/* Bottom-Right: Repeat Mode & Playback Speed */}
              <div class={resolvedClasses().controlsRight} data-slot="controls-right">
                {/* Repeat Mode Toggle Button */}
                <Show when={showRepeat()}>
                  <button
                    type="button"
                    onClick={cycleRepeatMode}
                    class={`${resolvedClasses().repeatButton} ${
                      repeatMode() !== "off" ? "text-primary bg-primary/10" : "text-muted"
                    }`}
                    data-slot="repeat-button"
                    aria-label={`Repeat mode: ${repeatMode()}`}
                  >
                    <RLIcon
                      name={repeatIconName()}
                      class={resolvedClasses().repeatIcon}
                      aria-hidden="true"
                    />
                  </button>
                </Show>

                {/* Playback Speed Selector */}
                <Show when={showSpeed()}>
                  <div class={resolvedClasses().speedContainer} data-slot="speed-container">
                    <Show
                      when={isEditingSpeed()}
                      fallback={
                        <button
                          type="button"
                          onClick={cycleSpeed}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setIsEditingSpeed(true);
                          }}
                          class={resolvedClasses().speedButton}
                          data-slot="speed-button"
                          aria-label={`Playback speed ${playbackRate()}x (right click to type)`}
                          title="Click to cycle, right-click to enter value"
                        >
                          {playbackRate()}x
                        </button>
                      }
                    >
                      <input
                        type="number"
                        min="0.1"
                        step="0.05"
                        value={playbackRate()}
                        class={resolvedClasses().speedInput}
                        data-slot="speed-input"
                        aria-label="Set specific playback speed"
                        onBlur={(e) => {
                          setCustomSpeed(parseFloat(e.currentTarget.value));
                          setIsEditingSpeed(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setCustomSpeed(parseFloat(e.currentTarget.value));
                            setIsEditingSpeed(false);
                          } else if (e.key === "Escape") {
                            setIsEditingSpeed(false);
                          }
                        }}
                      />
                    </Show>
                  </div>
                </Show>
              </div>
            </div>
          }
        >
          {resolvedControlsSlot()}
        </Show>

        {/* 4. Playlist / Queue View */}
        <Show when={showPlaylist() && playlist().length > 1}>
          <div class={resolvedClasses().playlistContainer} data-slot="playlist-container">
            <div class={resolvedClasses().playlistHeader} data-slot="playlist-header">
              <span class={resolvedClasses().playlistTitle} data-slot="playlist-title">
                Playlist ({playlist().length} tracks)
              </span>
            </div>
            <div class={resolvedClasses().playlistList} data-slot="playlist-list" role="listbox">
              <For each={playlist()}>
                {(item, idx) => {
                  const isActive = () => idx() === activeTrackIndex();
                  return (
                    <div
                      role="option"
                      aria-selected={isActive() ? "true" : "false"}
                      onClick={() => selectTrack(idx())}
                      class={`${resolvedClasses().playlistItem} ${
                        isActive() ? resolvedClasses().playlistItemActive : ""
                      }`}
                      data-slot="playlist-item"
                    >
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="text-[10px] font-mono opacity-60 w-4">{idx() + 1}.</span>
                        <div class="min-w-0">
                          <p class={resolvedClasses().playlistItemTitle}>
                            {item.title || `Track ${idx() + 1}`}
                          </p>
                          <Show when={item.description}>
                            <p class={resolvedClasses().playlistItemDescription}>
                              {item.description}
                            </p>
                          </Show>
                        </div>
                      </div>
                      <Show when={item.duration}>
                        <span class={resolvedClasses().playlistItemDuration}>
                          {formatTime(item.duration!)}
                        </span>
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </Show>

        {/* 5. Children Slot */}
        <Show when={resolvedChildren()}>
          <div data-slot="children">{resolvedChildren()}</div>
        </Show>

        {/* 6. Transcript Collapsible Section */}
        <Show when={trackTranscript() !== undefined}>
          <div class={resolvedClasses().transcript} data-slot="transcript">
            <button
              type="button"
              onClick={() => setIsTranscriptOpen(!isTranscriptOpen())}
              class={resolvedClasses().transcriptToggle}
              data-slot="transcript-toggle"
              aria-expanded={isTranscriptOpen() ? "true" : "false"}
            >
              <RLIcon
                name={isTranscriptOpen() ? "chevronDown" : "chevronRight"}
                class="size-3.5"
                aria-hidden="true"
              />
              <span>{isTranscriptOpen() ? "Hide transcript" : "Show transcript"}</span>
            </button>
            <Show when={isTranscriptOpen()}>
              <div class={resolvedClasses().transcriptContent} data-slot="transcript-content">
                {trackTranscript()}
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
};
