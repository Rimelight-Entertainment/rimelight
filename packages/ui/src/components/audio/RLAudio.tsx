import type { RLAudioProps, AudioTextTrack, AudioTrackItem, AudioRepeatMode } from "./audio.types";
import { RLAudioTheme } from "./audio.theme";
import { children, createMemo, createSignal, For, onSettled, Show, type Component } from "solid-js";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import { RLLink } from "../link/RLLink";
import { RLImage } from "../image/RLImage";
import { RLPopover } from "../popover/RLPopover";
import { uiT } from "../../locale";
import { renderSlot } from "../../slot";

const OMIT_KEYS = [
  "transcript",
  "src",
  "title",
  "description",
  "artwork",
  "format",
  "fileSize",
  "bitrate",
  "playlist",
  "currentTrackIndex",
  "progressVariant",
  "waveformPeaks",
  "repeatMode",
  "autoplay",
  "muted",
  "volume",
  "playbackRate",
  "preload",
  "tracks",
  "icons",
  "progressColor",
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
  "orientation",
  "onPlay",
  "onPause",
  "onEnded",
  "onTrackChange",
  "onTimeUpdate",
  "onVolumeChange",
  "onRepeatModeChange",
  "headerSlot",
  "timelineSlot",
  "controlsSlot",
  "artworkSlot",
  "transcriptSlot",
] as const;

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

export const RLAudio: Component<RLAudioProps> = (props) => {
  const {
    Tag,
    classes,
    rest,
    id: audioId,
    slots,
    theme,
    children: childNodes,
  } = RLAudioTheme.setup(props, {
    slots: ["headerSlot", "timelineSlot", "controlsSlot", "artworkSlot", "transcriptSlot"] as const,
    omit: OMIT_KEYS,
  });

  const resolvedChildren = children(childNodes);

  const titleId = () => audioId();
  const descId = () => `${audioId()}-description`;

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
  const [repeatMode, setRepeatMode] = createSignal<AudioRepeatMode>(props.repeatMode ?? "off");

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
  const trackTranscript = () => currentTrack()?.transcript ?? props.transcript;
  const trackFormat = () => currentTrack()?.format ?? props.format;
  const trackFileSize = () => currentTrack()?.fileSize ?? props.fileSize;
  const trackBitrate = () => currentTrack()?.bitrate ?? props.bitrate;
  const activeExternalUrl = () => props.externalLink ?? currentMediaSrc();

  const hasArtwork = () => Boolean(trackArtwork()) || slots.artworkSlot() !== undefined;
  const hasDetails = () =>
    Boolean(
      trackTitle() || trackDescription() || trackFormat() || trackFileSize() || trackBitrate(),
    );
  const hasMeta = () => Boolean(trackFormat() || trackFileSize() || trackBitrate());
  const hasTranscript = () => Boolean(trackTranscript()) || slots.transcriptSlot() !== undefined;

  const selectTrack = (index: number) => {
    const list = playlist();
    if (index < 0 || index >= list.length) return;
    setActiveTrackIndex(index);
    setCurrentTime(0);
    const target = list[index];
    if (!target) return;
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

  const applyVolume = (v: number) => {
    setVolume(v);
    if (audioRef) {
      audioRef.volume = v;
      if (v > 0 && isMuted()) {
        audioRef.muted = false;
        setIsMuted(false);
      }
    }
    props.onVolumeChange?.(v, isMuted());
  };

  const handleVolumeChange = (e: Event & { currentTarget: HTMLInputElement }) => {
    const val = parseFloat(e.currentTarget.value);
    if (!isNaN(val)) {
      applyVolume(Math.min(1, Math.max(0, val / 100)));
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
  const skipForwardIconName = () => props.icons?.skipForward ?? "fast-forward";
  const prevTrackIconName = () => props.icons?.prevTrack ?? "skip-back";
  const nextTrackIconName = () => props.icons?.nextTrack ?? "skip-forward";
  const downloadIconName = () => props.icons?.download ?? "download";
  const externalLinkIconName = () => props.icons?.externalLink ?? "external-link";

  const repeatIconName = () => {
    const mode = repeatMode();
    if (mode === "one") return props.icons?.repeatOne ?? "repeat-1";
    if (mode === "all") return props.icons?.repeat ?? "repeat";
    return props.icons?.repeatOff ?? "repeat";
  };

  const volumeIconName = createMemo(() => {
    if (isMuted() || volume() === 0) return props.icons?.volumeMuted ?? "volume-x";
    if (volume() < 0.5) return props.icons?.volumeLow ?? "volume-1";
    return props.icons?.volumeHigh ?? "volume-2";
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

  const artworkUi = createMemo(() => ({
    root: classes().artworkItem,
    trigger: classes().artworkItem,
    triggerImage: classes().artworkItem,
  }));

  const renderArtwork = () => (
    <div class={classes().artwork} data-slot="artwork">
      <Show
        when={slots.artworkSlot() !== undefined}
        fallback={
          <Show when={trackArtwork()}>
            {(art) => (
              <RLImage
                src={art()}
                alt={trackTitle() ?? uiT("audio.artwork")}
                fit="cover"
                lightbox={artworkZoomable()}
                loading="lazy"
                ui={artworkUi()}
              />
            )}
          </Show>
        }
      >
        {renderSlot(slots.artworkSlot())}
      </Show>
    </div>
  );

  const downloadAttrs = (): { download: string } => ({
    download: trackTitle() ? `${trackTitle()}.mp3` : "audio.mp3",
  });

  const renderDefaultHeader = () => (
    <div class={classes().header} data-slot="header">
      <Show when={hasArtwork()}>{renderArtwork()}</Show>

      <Show when={hasDetails()}>
        <div class={classes().details} data-slot="details">
          <Show when={trackTitle()}>
            <span id={titleId()} class={classes().title} data-slot="title">
              {trackTitle()}
            </span>
          </Show>
          <Show when={trackDescription()}>
            <span id={descId()} class={classes().description} data-slot="description">
              {trackDescription()}
            </span>
          </Show>
          <Show when={hasMeta()}>
            <div class={classes().metaBadge} data-slot="meta-badge">
              <Show when={trackFormat()}>
                <span>{trackFormat()}</span>
              </Show>
              <Show when={trackBitrate()}>
                <Show when={trackFormat()}>
                  <span class={classes().metaDivider}>•</span>
                </Show>
                <span>{trackBitrate()}</span>
              </Show>
              <Show when={trackFileSize()}>
                <Show when={trackFormat() || trackBitrate()}>
                  <span class={classes().metaDivider}>•</span>
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

      <Show when={showDownload() || showExternalLink()}>
        <div class={classes().actions} data-slot="actions">
          <Show when={showDownload() && currentMediaSrc()}>
            <RLLink
              href={currentMediaSrc()}
              localize={false}
              noExternalIcon
              target="_blank"
              rel="noopener noreferrer"
              class={classes().actionButton}
              data-slot="action-button"
              aria-label={uiT("audio.download-track")}
              title={uiT("audio.download-track")}
              {...downloadAttrs()}
            >
              <RLIcon name={downloadIconName()} class={classes().actionIcon} aria-hidden="true" />
            </RLLink>
          </Show>

          <Show when={showExternalLink() && activeExternalUrl()}>
            <RLLink
              href={activeExternalUrl()}
              localize={false}
              noExternalIcon
              target="_blank"
              rel="noopener noreferrer"
              class={classes().actionButton}
              data-slot="action-button"
              aria-label={uiT("audio.open-source")}
            >
              <RLIcon
                name={externalLinkIconName()}
                class={classes().actionIcon}
                aria-hidden="true"
              />
            </RLLink>
          </Show>
        </div>
      </Show>
    </div>
  );

  const progressColorVar = (shade: string) =>
    props.progressColor ? `var(--rl-${props.progressColor}-${shade})` : undefined;

  const renderDefaultTimeline = () => (
    <div class={classes().timeline} data-slot="timeline">
      <div
        class={classes().progressContainer}
        style={{
          "--rl-bg": progressColorVar("500"),
          "--rl-ring": progressColorVar("500"),
          "--rl-border": progressColorVar("500"),
          "--rl-bg-hover": progressColorVar("600"),
          "--rl-text": progressColorVar("600"),
        }}
        data-slot="progress-container"
      >
        <Show
          when={progressVariant() === "waveform"}
          fallback={
            <div class={classes().progressTrack} data-slot="progress-track">
              <svg class={classes().progressSvg} aria-hidden="true">
                <rect
                  class={classes().progressRange}
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
                class={classes().progressInput}
                aria-label={uiT("audio.seek")}
                aria-valuemin={0}
                aria-valuemax={Math.round(getDuration())}
                aria-valuenow={Math.round(currentTime())}
                aria-valuetext={`${formatTime(currentTime())} / ${formatTime(getDuration())}`}
              />
            </div>
          }
        >
          <div
            class={classes().waveformContainer}
            data-slot="waveform-container"
            role="slider"
            tabindex={0}
            aria-label={uiT("audio.seek")}
            aria-valuemin={0}
            aria-valuemax={Math.round(getDuration())}
            aria-valuenow={Math.round(currentTime())}
            aria-valuetext={`${formatTime(currentTime())} / ${formatTime(getDuration())}`}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const pct = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
              handleWaveformClick(pct);
            }}
          >
            <svg
              class={classes().waveformSvg}
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
                      class={
                        isActive()
                          ? `${classes().waveformBar} ${classes().waveformBarActive}`
                          : classes().waveformBar
                      }
                      fill="currentColor"
                    />
                  );
                }}
              </For>
            </svg>
          </div>
        </Show>
      </div>

      <Show when={showTime()}>
        <div class={classes().timeDisplay} data-slot="time-display" aria-live="off">
          <span class={classes().timeCurrent} data-slot="time-current">
            {formatTime(currentTime())}
          </span>
          <span class={classes().timeDuration} data-slot="time-duration">
            {formatTime(duration())}
          </span>
        </div>
      </Show>
    </div>
  );

  const renderVolumePopover = () => (
    <div class={classes().volumePopover} data-slot="volume-popover">
      <Show when={showVolumeNumber()}>
        <span class={classes().volumeText} data-slot="volume-text">
          {Math.round(volumePercent())}%
        </span>
      </Show>

      <div
        class={classes().volumeSlider}
        data-slot="volume-slider"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickY = rect.bottom - e.clientY;
          const pct = Math.max(0, Math.min(100, (clickY / rect.height) * 100));
          applyVolume(pct / 100);
        }}
      >
        <div class={classes().volumeTrack} data-slot="volume-track">
          <svg
            class={classes().volumeSvg}
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
              class={classes().volumeRange}
            />
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={volumePercent()}
            onInput={handleVolumeChange}
            class={classes().volumeInput}
            aria-label={uiT("audio.volume-level")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(volumePercent())}
          />
        </div>
      </div>
    </div>
  );

  const renderDefaultControls = () => (
    <div class={classes().controls} data-slot="controls">
      {/* Bottom-Left: Vertical Volume Popover & Mute */}
      <div class={classes().controlsLeft} data-slot="controls-left">
        <Show when={showVolume()}>
          <div
            class={classes().volumeContainer}
            data-slot="volume-container"
            title={uiT("audio.volume-hint")}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleMute();
            }}
          >
            <RLPopover
              placement="top"
              mode="click"
              triggerSlot={
                <RLButton
                  variant="ghost"
                  size="xs"
                  shape="square"
                  class={classes().volumeButton}
                  data-slot="volume-button"
                  aria-label={isMuted() ? uiT("audio.unmute") : uiT("audio.mute")}
                >
                  <RLIcon name={volumeIconName()} class={classes().volumeIcon} aria-hidden="true" />
                </RLButton>
              }
            >
              {renderVolumePopover()}
            </RLPopover>
          </div>
        </Show>
      </div>

      {/* Center: Prev Track, Skip Back, Play/Pause, Skip Forward, Next Track */}
      <div class={classes().controlsCenter} data-slot="controls-center">
        <Show when={playlist().length > 1}>
          <RLButton
            variant="ghost"
            size="xs"
            shape="square"
            onClick={prevTrack}
            class={classes().navButton}
            data-slot="nav-button"
            aria-label={uiT("audio.previous")}
            disabled={activeTrackIndex() === 0 && repeatMode() !== "all"}
          >
            <RLIcon name={prevTrackIconName()} class={classes().navIcon} aria-hidden="true" />
          </RLButton>
        </Show>

        <Show when={showSkip()}>
          <RLButton
            variant="ghost"
            size="xs"
            shape="square"
            onClick={() => handleSkip(-skipSecs())}
            class={classes().skipButton}
            data-slot="skip-button"
            aria-label={uiT("audio.skip-back")}
          >
            <RLIcon name={skipBackIconName()} class={classes().skipIcon} aria-hidden="true" />
            <span class={classes().skipBadge} data-slot="skip-badge">
              {skipSecs()}
            </span>
          </RLButton>
        </Show>

        <RLButton
          variant="ghost"
          size="md"
          shape="square"
          onClick={togglePlay}
          class={classes().playButton}
          data-slot="play-button"
          aria-label={isPlaying() ? uiT("audio.pause") : uiT("audio.play")}
        >
          <RLIcon
            name={isPlaying() ? pauseIconName() : playIconName()}
            class={classes().playIcon}
            aria-hidden="true"
          />
        </RLButton>

        <Show when={showSkip()}>
          <RLButton
            variant="ghost"
            size="xs"
            shape="square"
            onClick={() => handleSkip(skipSecs())}
            class={classes().skipButton}
            data-slot="skip-button"
            aria-label={uiT("audio.skip-forward")}
          >
            <RLIcon name={skipForwardIconName()} class={classes().skipIcon} aria-hidden="true" />
            <span class={classes().skipBadge} data-slot="skip-badge">
              {skipSecs()}
            </span>
          </RLButton>
        </Show>

        <Show when={playlist().length > 1}>
          <RLButton
            variant="ghost"
            size="xs"
            shape="square"
            onClick={nextTrack}
            class={classes().navButton}
            data-slot="nav-button"
            aria-label={uiT("audio.next")}
            disabled={activeTrackIndex() === playlist().length - 1 && repeatMode() !== "all"}
          >
            <RLIcon name={nextTrackIconName()} class={classes().navIcon} aria-hidden="true" />
          </RLButton>
        </Show>
      </div>

      {/* Bottom-Right: Repeat Mode & Playback Speed */}
      <div class={classes().controlsRight} data-slot="controls-right">
        <Show when={showRepeat()}>
          <RLButton
            variant="ghost"
            size="xs"
            shape="square"
            onClick={cycleRepeatMode}
            class={
              repeatMode() !== "off"
                ? `${classes().repeatButton} ${classes().repeatButtonActive}`
                : classes().repeatButton
            }
            data-slot="repeat-button"
            aria-label={
              repeatMode() === "one"
                ? uiT("audio.repeat-one")
                : repeatMode() === "all"
                  ? uiT("audio.repeat-all")
                  : uiT("audio.repeat-off")
            }
          >
            <RLIcon name={repeatIconName()} class={classes().repeatIcon} aria-hidden="true" />
          </RLButton>
        </Show>

        <Show when={showSpeed()}>
          <div
            class={classes().speedContainer}
            data-slot="speed-container"
            title={uiT("audio.speed-hint")}
            onContextMenu={(e) => {
              e.preventDefault();
              setIsEditingSpeed(true);
            }}
          >
            <Show
              when={isEditingSpeed()}
              fallback={
                <RLButton
                  variant="ghost"
                  size="xs"
                  shape="square"
                  onClick={cycleSpeed}
                  class={classes().speedButton}
                  data-slot="speed-button"
                  aria-label={uiT("audio.speed-button")}
                >
                  {playbackRate()}x
                </RLButton>
              }
            >
              <input
                type="number"
                min="0.1"
                step="0.05"
                value={playbackRate()}
                class={classes().speedInput}
                data-slot="speed-input"
                aria-label={uiT("audio.playback-speed")}
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
  );

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      role="region"
      aria-label={uiT("audio.player")}
      aria-labelledby={trackTitle() ? titleId() : undefined}
      aria-describedby={trackDescription() ? descId() : undefined}
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

      <div class={classes().container} data-slot="container">
        <Show when={slots.headerSlot() !== undefined} fallback={renderDefaultHeader()}>
          {renderSlot(slots.headerSlot())}
        </Show>

        <Show when={slots.timelineSlot() !== undefined} fallback={renderDefaultTimeline()}>
          {renderSlot(slots.timelineSlot())}
        </Show>

        <Show when={slots.controlsSlot() !== undefined} fallback={renderDefaultControls()}>
          {renderSlot(slots.controlsSlot())}
        </Show>

        {/* Playlist / Queue View */}
        <Show when={showPlaylist() && playlist().length > 1}>
          <div class={classes().playlistContainer} data-slot="playlist-container">
            <div class={classes().playlistHeader} data-slot="playlist-header">
              <span class={classes().playlistTitle} data-slot="playlist-title">
                {uiT("audio.playlist")} ({playlist().length})
              </span>
            </div>
            <div class={classes().playlistList} data-slot="playlist-list" role="listbox">
              <For each={playlist()}>
                {(item, idx) => {
                  const isActive = () => idx() === activeTrackIndex();
                  return (
                    <div
                      role="option"
                      aria-selected={isActive() ? "true" : "false"}
                      onClick={() => selectTrack(idx())}
                      class={
                        isActive()
                          ? `${classes().playlistItem} ${classes().playlistItemActive}`
                          : classes().playlistItem
                      }
                      data-slot="playlist-item"
                    >
                      <div class={classes().playlistItemMain}>
                        <span class={classes().playlistItemIndex}>{idx() + 1}.</span>
                        <div class={classes().playlistItemInfo}>
                          <p class={classes().playlistItemTitle}>
                            {item.title || `${uiT("audio.track")} ${idx() + 1}`}
                          </p>
                          <Show when={item.description}>
                            <p class={classes().playlistItemDescription}>{item.description}</p>
                          </Show>
                        </div>
                      </div>
                      <Show when={item.duration}>
                        {(seconds) => (
                          <span class={classes().playlistItemDuration}>
                            {formatTime(seconds())}
                          </span>
                        )}
                      </Show>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>
        </Show>

        {resolvedChildren()}

        {/* Transcript Collapsible Section */}
        <Show when={hasTranscript()}>
          <div class={classes().transcript} data-slot="transcript">
            <RLButton
              variant="ghost"
              size="xs"
              onClick={() => setIsTranscriptOpen(!isTranscriptOpen())}
              class={classes().transcriptToggle}
              data-slot="transcript-toggle"
              aria-expanded={isTranscriptOpen() ? "true" : "false"}
            >
              <RLIcon
                name={isTranscriptOpen() ? "chevron-down" : "chevron-right"}
                class={classes().transcriptIcon}
                aria-hidden="true"
              />
              <span>
                {isTranscriptOpen() ? uiT("audio.hide-transcript") : uiT("audio.show-transcript")}
              </span>
            </RLButton>
            <Show when={isTranscriptOpen()}>
              <div class={classes().transcriptContent} data-slot="transcript-content">
                <Show when={slots.transcriptSlot() !== undefined} fallback={trackTranscript()}>
                  {renderSlot(slots.transcriptSlot())}
                </Show>
              </div>
            </Show>
          </div>
        </Show>
      </div>
    </Tag>
  );
};
