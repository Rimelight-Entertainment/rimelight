import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLAudioTheme } from "./audio.theme";

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

export type AudioProgressVariant = "bar" | "waveform";
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
  volumeHigh?: string | undefined;
  volumeLow?: string | undefined;
  volumeMuted?: string | undefined;
  download?: string | undefined;
  externalLink?: string | undefined;
}

export type RLAudioProps = Omit<
  InferThemeProps<typeof RLAudioTheme>,
  "onPlay" | "onPause" | "onEnded" | "onTimeUpdate" | "onVolumeChange"
> & {
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
   * Custom waveform peaks / heights array (values 0 - 100) or auto-generated.
   */
  waveformPeaks?: number[] | undefined;
  /**
   * Progress bar visual variant: 'bar' (standard linear bar) or 'waveform' (soundwave bars).
   *
   * @default "bar"
   */
  progressVariant?: AudioProgressVariant | undefined;
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
   * Custom icon overrides for the player control buttons.
   */
  icons?: AudioIconOverrides | undefined;
  /**
   * Color token specifically for the progress bar / waveform (e.g. 'primary', 'success',
   * 'secondary', 'warning').
   *
   * @default inherit from color prop
   */
  progressColor?: string | undefined;
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
   * Whether to show or hide skip back/forward buttons.
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
   * Transcript text for the active track (shown in a collapsible section).
   */
  transcript?: string | undefined;
  /**
   * Custom header content replacing the artwork / details / actions row.
   */
  headerSlot?: SlotRenderer | undefined;
  /**
   * Custom timeline content replacing the progress bar and time display.
   */
  timelineSlot?: SlotRenderer | undefined;
  /**
   * Custom controls content replacing the default playback controls row.
   */
  controlsSlot?: SlotRenderer | undefined;
  /**
   * Custom artwork content replacing the default album artwork.
   */
  artworkSlot?: SlotRenderer | undefined;
  /**
   * Custom transcript content replacing the transcript string.
   */
  transcriptSlot?: SlotRenderer | undefined;
  /**
   * Called when playback starts.
   */
  onPlay?: (() => void) | undefined;
  /**
   * Called when playback pauses.
   */
  onPause?: (() => void) | undefined;
  /**
   * Called when the last track ends and playback stops.
   */
  onEnded?: (() => void) | undefined;
  /**
   * Called when the active track changes.
   */
  onTrackChange?: ((index: number, track: AudioTrackItem) => void) | undefined;
  /**
   * Called on playback time updates.
   */
  onTimeUpdate?: ((currentTime: number, duration: number) => void) | undefined;
  /**
   * Called when volume or mute state changes.
   */
  onVolumeChange?: ((volume: number, muted: boolean) => void) | undefined;
  /**
   * Called when the repeat mode is cycled.
   */
  onRepeatModeChange?: ((mode: AudioRepeatMode) => void) | undefined;
};
