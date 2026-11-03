import { defineTheme } from "../../resolver";

export const RLAudioTheme = defineTheme("audio", {
  slots: [
    "root",
    "container",
    "header",
    "artwork",
    "artworkItem",
    "details",
    "title",
    "description",
    "metaBadge",
    "actions",
    "actionButton",
    "timeline",
    "progressContainer",
    "progressTrack",
    "progressRange",
    "waveformContainer",
    "waveformSvg",
    "waveformBar",
    "waveformBarActive",
    "timeDisplay",
    "timeCurrent",
    "timeDuration",
    "timeDivider",
    "controls",
    "controlsLeft",
    "controlsCenter",
    "controlsRight",
    "playButton",
    "playIcon",
    "skipButton",
    "skipIcon",
    "skipBadge",
    "navButton",
    "navIcon",
    "repeatButton",
    "repeatIcon",
    "volumeContainer",
    "volumeButton",
    "volumeIcon",
    "volumePopover",
    "volumeSlider",
    "volumeTrack",
    "volumeRange",
    "volumeText",
    "speedContainer",
    "speedButton",
    "speedInput",
    "playlistContainer",
    "playlistHeader",
    "playlistTitle",
    "playlistList",
    "playlistItem",
    "playlistItemActive",
    "playlistItemTitle",
    "playlistItemDescription",
    "playlistItemDuration",
    "transcript",
    "transcriptToggle",
    "transcriptContent",
  ],
  base: {
    root: "relative w-full rounded-2xl transition-all select-none overflow-visible",
    container: "flex flex-col gap-4 p-5",
    header: "flex items-center gap-4 w-full relative",
    artwork:
      "relative aspect-square shrink-0 rounded-xl overflow-hidden bg-elevated/50 flex items-center justify-center",
    artworkItem: "size-full object-cover",
    details: "flex flex-col min-w-0 flex-1 justify-center",
    title: "font-semibold text-highlighted truncate text-base",
    description: "text-xs text-muted truncate mt-0.5",
    metaBadge: "inline-flex items-center gap-1.5 text-[11px] font-mono text-muted mt-1 select-none",
    actions: "flex items-center gap-1 shrink-0 self-start ml-auto",
    actionButton:
      "inline-flex items-center justify-center size-8 rounded-lg text-muted hover:text-highlighted hover:bg-elevated/60 active:bg-elevated transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)] no-underline",
    timeline: "flex flex-col gap-1.5 w-full",
    progressContainer: "flex items-center gap-2 w-full",
    progressTrack:
      "relative h-2.5 w-full grow overflow-hidden rounded-full bg-elevated/80 cursor-pointer",
    progressRange:
      "absolute h-full text-[var(--rl-bg)] fill-[var(--rl-bg)] bg-[var(--rl-bg)] rounded-full transition-[width] duration-75",
    waveformContainer:
      "relative flex items-center h-12 w-full cursor-pointer overflow-hidden rounded-lg transition-colors px-0.5 py-1",
    waveformSvg: "size-full overflow-visible pointer-events-none",
    waveformBar: "transition-all duration-75 text-muted/40",
    waveformBarActive: "text-[var(--rl-bg)]",
    timeDisplay:
      "flex items-center justify-between text-[11px] font-mono tabular-nums text-muted w-full px-0.5",
    timeCurrent: "text-toned font-medium",
    timeDuration: "text-muted",
    timeDivider: "hidden",
    controls: "grid grid-cols-[1fr_auto_1fr] items-center gap-2 w-full pt-1",
    controlsLeft: "flex items-center gap-1.5 sm:gap-2 justify-start min-w-0",
    controlsCenter: "flex items-center gap-1.5 sm:gap-2 justify-center shrink-0",
    controlsRight: "flex items-center gap-1.5 sm:gap-2 justify-end min-w-0",
    playButton:
      "inline-flex items-center justify-center shrink-0 rounded-full bg-[var(--rl-bg)] text-white hover:bg-[var(--rl-bg-hover)] active:bg-[var(--rl-bg-hover)] transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--rl-ring)] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm",
    playIcon: "size-5",
    skipButton:
      "relative inline-flex items-center justify-center shrink-0 rounded-lg p-2 text-muted hover:text-highlighted hover:bg-elevated/60 active:bg-elevated transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)] disabled:opacity-50 disabled:cursor-not-allowed",
    skipIcon: "size-4.5",
    skipBadge:
      "absolute -bottom-1 text-[8px] font-mono font-bold leading-none select-none text-toned",
    navButton:
      "inline-flex items-center justify-center shrink-0 rounded-lg p-2 text-muted hover:text-highlighted hover:bg-elevated/60 active:bg-elevated transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)] disabled:opacity-40 disabled:cursor-not-allowed",
    navIcon: "size-4.5",
    repeatButton:
      "inline-flex items-center justify-center shrink-0 rounded-lg p-2 text-muted hover:text-highlighted hover:bg-elevated/60 active:bg-elevated transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)]",
    repeatIcon: "size-4.5",
    volumeContainer: "relative inline-flex items-center justify-start shrink-0",
    volumeButton:
      "inline-flex items-center justify-center size-8 rounded-lg text-muted hover:text-highlighted hover:bg-elevated/60 active:bg-elevated transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)]",
    volumeIcon: "size-4.5",
    volumePopover: "flex flex-col items-center gap-1.5 w-9",
    volumeSlider:
      "relative w-2 h-20 flex flex-col justify-end items-center cursor-pointer my-0.5 select-none",
    volumeTrack:
      "relative w-1.5 h-full grow overflow-hidden rounded-full bg-default/80 border border-default/30",
    volumeRange: "text-[var(--rl-bg)] fill-[var(--rl-bg)] rounded-full transition-all duration-75",
    volumeText:
      "text-[10px] font-mono font-semibold tabular-nums text-highlighted text-center leading-none",
    speedContainer: "relative shrink-0 flex items-center",
    speedButton:
      "inline-flex items-center justify-center px-2 py-1 rounded-md text-[11px] font-mono font-bold text-muted hover:text-highlighted hover:bg-elevated/60 active:bg-elevated transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--rl-ring)]",
    speedInput:
      "w-14 text-xs font-mono px-1 py-0.5 bg-elevated rounded border border-default text-highlighted",
    playlistContainer: "mt-2 pt-3 border-t border-default/40 flex flex-col gap-1 text-xs",
    playlistHeader: "flex items-center justify-between pb-1",
    playlistTitle: "text-xs font-bold text-highlighted uppercase tracking-wider text-[10px]",
    playlistList: "flex flex-col gap-1 max-h-48 overflow-y-auto pr-1",
    playlistItem:
      "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-toned hover:text-highlighted hover:bg-elevated/50",
    playlistItemActive: "bg-primary/10 text-primary font-bold hover:bg-primary/15",
    playlistItemTitle: "truncate text-xs",
    playlistItemDescription: "text-[11px] text-muted truncate",
    playlistItemDuration: "text-[10px] font-mono text-muted tabular-nums ml-2 shrink-0",
    transcript: "mt-2 pt-3 border-t border-default/40 flex flex-col gap-1.5 text-xs text-muted",
    transcriptToggle:
      "inline-flex items-center gap-1 text-xs font-medium text-toned hover:text-highlighted cursor-pointer transition-colors self-start outline-none focus-visible:underline",
    transcriptContent:
      "text-xs leading-relaxed text-toned bg-elevated/20 p-3 rounded-lg border border-default/40",
  },
  variants: {
    variant: {
      solid: {
        root: "bg-inverted text-inverted",
      },
      outline: {
        root: "bg-default border border-default shadow-xs",
      },
      soft: {
        root: "bg-elevated/40",
      },
      subtle: {
        root: "bg-elevated/40 border border-default",
      },
    },
    orientation: {
      horizontal: {
        header: "flex items-center gap-4 w-full",
        artwork: "aspect-square shrink-0 rounded-xl",
      },
      vertical: {
        header: "flex flex-col items-center gap-4 text-center w-full",
        artwork:
          "w-full !size-auto max-w-xs sm:max-w-sm aspect-square rounded-2xl overflow-hidden shadow-lg border border-default/30",
        details: "items-center text-center w-full",
        metaBadge: "mx-auto self-center",
      },
    },
    color: "auto",
    size: {
      sm: {
        container: "p-3.5 gap-2.5",
        artwork: "size-12",
        title: "text-xs",
        playButton: "size-9",
        playIcon: "size-4",
      },
      md: {
        container: "p-5 gap-3.5",
        artwork: "size-16",
        title: "text-sm",
        playButton: "size-11",
        playIcon: "size-5",
      },
      lg: {
        container: "p-6 gap-4.5",
        artwork: "size-20",
        title: "text-base",
        playButton: "size-13",
        playIcon: "size-6",
      },
    },
  },
  compoundVariants: [],
  defaultVariants: {
    variant: "outline",
    orientation: "horizontal",
    color: "primary",
    size: "md",
  },
});
