import type { JSX } from "@solidjs/web";

export interface AudioSource {
  src: string;
  type?: string | undefined;
}

export interface AudioTextTrack {
  src: string;
  kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata" | undefined;
  srclang?: string | undefined;
  label?: string | undefined;
  default?: boolean | undefined;
}

export interface AudioTrackItem {
  src: string | AudioSource[];
  title?: string | undefined;
  description?: string | undefined;
  artwork?: string | undefined;
  duration?: number | undefined;
  transcript?: string | undefined;
  tracks?: AudioTextTrack[] | undefined;
  format?: string | undefined;
  fileSize?: string | number | undefined;
  bitrate?: string | undefined;
}

export type AudioSlotRenderer = () => any;

export type AudioProgressVariant = "bar" | "waveform";
export type AudioOrientation = "horizontal" | "vertical";
export type AudioRepeatMode = "off" | "all" | "one";

export interface AudioIconOverrides {
  play?: string | undefined;
  pause?: string | undefined;
  skipBack?: string | undefined;
  skipForward?: string | undefined;
  prevTrack?: string | undefined;
  nextTrack?: string | undefined;
  repeat?: string | undefined;
  repeatOne?: string | undefined;
  repeatOff?: string | undefined;
  shuffle?: string | undefined;
  volumeHigh?: string | undefined;
  volumeLow?: string | undefined;
  volumeMuted?: string | undefined;
  speed?: string | undefined;
  download?: string | undefined;
  externalLink?: string | undefined;
}

export interface RLAudioProps {
  /**
   * Audio source URL or array of source objects with mime types.
   */
  src?: string | AudioSource[] | undefined;
  /**
   * Audio title / track name (when single track or fallback).
   */
  title?: string | undefined;
  /**
   * Artist or subtitle description.
   */
  description?: string | undefined;
  /**
   * Album artwork or thumbnail image URL.
   */
  artwork?: string | undefined;
  /**
   * Audio format label (e.g., 'MP3', 'FLAC', 'WAV', 'OGG').
   */
  format?: string | undefined;
  /**
   * Audio file size (e.g., '4.2 MB' or byte number).
   */
  fileSize?: string | number | undefined;
  /**
   * Audio bitrate (e.g., '320 kbps').
   */
  bitrate?: string | undefined;
  /**
   * Playlist / album tracks for multi-track audio player.
   */
  playlist?: AudioTrackItem[] | undefined;
  /**
   * Currently active track index in the playlist.
   *
   * @default 0
   */
  currentTrackIndex?: number | undefined;
  /**
   * Layout orientation: 'horizontal' (compact row) or 'vertical' (large album art on top).
   *
   * @default "horizontal"
   */
  orientation?: AudioOrientation | undefined;
  /**
   * Progress bar visual variant: 'bar' (standard linear bar) or 'waveform' (soundwave bars).
   *
   * @default "bar"
   */
  progressVariant?: AudioProgressVariant | undefined;
  /**
   * Custom waveform peaks / heights array (values 0 - 100) or auto-generated.
   */
  waveformPeaks?: number[] | undefined;
  /**
   * Repeat mode: 'off' | 'all' (loop playlist/track) | 'one' (repeat single track).
   *
   * @default "off"
   */
  repeatMode?: AudioRepeatMode | undefined;
  /**
   * Whether to autoplay the audio on mount (browser autoplay policies apply).
   *
   * @default false
   */
  autoplay?: boolean | undefined;
  /**
   * Legacy loop prop (sets repeatMode="all" when true).
   */
  loop?: boolean | undefined;
  /**
   * Whether the audio should start muted.
   *
   * @default false
   */
  muted?: boolean | undefined;
  /**
   * Initial playback volume between 0 and 1.
   *
   * @default 1
   */
  volume?: number | undefined;
  /**
   * Initial playback rate (e.g., 1, 1.25, 1.5, 2).
   *
   * @default 1
   */
  playbackRate?: number | undefined;
  /**
   * Preload behavior for the HTML5 audio element ('auto' | 'metadata' | 'none').
   *
   * @default "metadata"
   */
  preload?: "auto" | "metadata" | "none" | undefined;
  /**
   * Text tracks for captions/subtitles/chapters.
   */
  tracks?: AudioTextTrack[] | undefined;
  /**
   * Custom icon overrides for all player control buttons.
   */
  icons?: AudioIconOverrides | undefined;
  /**
   * Optional primary accent color token.
   *
   * @default "primary"
   */
  color?: string | undefined;
  /**
   * Color token specifically for the progress bar / waveform (e.g. 'primary', 'success',
   * 'secondary', 'warning').
   *
   * @default inherit from color prop
   */
  progressColor?: string | undefined;
  /**
   * Visual layout size.
   *
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | undefined;
  /**
   * Visual style variant.
   *
   * @default "outline"
   */
  variant?: "solid" | "outline" | "soft" | "subtle" | undefined;
  /**
   * Whether to show or hide the time display (current / duration).
   *
   * @default true
   */
  showTime?: boolean | undefined;
  /**
   * Whether to show or hide the volume control.
   *
   * @default true
   */
  showVolume?: boolean | undefined;
  /**
   * Whether to show or hide the volume percentage / number.
   *
   * @default true
   */
  showVolumeNumber?: boolean | undefined;
  /**
   * Whether to show or hide the playback speed control.
   *
   * @default true
   */
  showSpeed?: boolean | undefined;
  /**
   * Whether to show or hide skip back/forward buttons (15s default).
   *
   * @default true
   */
  showSkip?: boolean | undefined;
  /**
   * Number of seconds to skip backward / forward when skip buttons are clicked.
   *
   * @default 15
   */
  skipSeconds?: number | undefined;
  /**
   * Whether to show or hide repeat toggle button.
   *
   * @default true
   */
  showRepeat?: boolean | undefined;
  /**
   * Whether to show or hide top right download audio button.
   *
   * @default false
   */
  showDownload?: boolean | undefined;
  /**
   * Whether to show or hide top right external link button.
   *
   * @default false
   */
  showExternalLink?: boolean | undefined;
  /**
   * Custom external link URL (defaults to active audio src).
   */
  externalLink?: string | undefined;
  /**
   * Whether to show playlist / queue list when playlist is provided.
   *
   * @default true
   */
  showPlaylist?: boolean | undefined;
  /**
   * Whether album artwork allows lightbox zoom on click.
   *
   * @default true
   */
  artworkZoomable?: boolean | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element | undefined;
  transcript?: JSX.Element | undefined;
  headerSlot?: JSX.Element | undefined;
  timelineSlot?: JSX.Element | undefined;
  controlsSlot?: JSX.Element | undefined;
  artworkSlot?: JSX.Element | undefined;
  onPlay?: (() => void) | undefined;
  onPause?: (() => void) | undefined;
  onEnded?: (() => void) | undefined;
  onTrackChange?: ((index: number, track: AudioTrackItem) => void) | undefined;
  onTimeUpdate?: ((currentTime: number, duration: number) => void) | undefined;
  onVolumeChange?: ((volume: number, muted: boolean) => void) | undefined;
  onRepeatModeChange?: ((mode: AudioRepeatMode) => void) | undefined;
  [key: string]: unknown;
}
