export type RimelightIcons = Record<string, string>;

/**
 * Built-in icon names used by Rimelight components, mapped to their Lucide class.
 * Any key can be overridden through `UIConfig.icons`.
 */
export const DEFAULT_ICONS: Record<string, string> = {
  "align-left": "i-lucide-align-left",
  "arrow-down": "i-lucide-arrow-down",
  "arrow-left": "i-lucide-arrow-left",
  "arrow-right": "i-lucide-arrow-right",
  "arrow-up": "i-lucide-arrow-up",
  bell: "i-lucide-bell",
  check: "i-lucide-check",
  "chevron-down": "i-lucide-chevron-down",
  "chevron-left": "i-lucide-chevron-left",
  "chevron-right": "i-lucide-chevron-right",
  "chevrons-left": "i-lucide-chevrons-left",
  "chevrons-right": "i-lucide-chevrons-right",
  "chevrons-up-down": "i-lucide-chevrons-up-down",
  "circle-alert": "i-lucide-circle-alert",
  "circle-check": "i-lucide-circle-check",
  clock: "i-lucide-clock",
  "cloud-upload": "i-lucide-cloud-upload",
  columns: "i-lucide-columns-2",
  copy: "i-lucide-copy",
  download: "i-lucide-download",
  "ellipsis-vertical": "i-lucide-ellipsis-vertical",
  "external-link": "i-lucide-external-link",
  "fast-forward": "i-lucide-fast-forward",
  "file-json": "i-lucide-file-json",
  "file-question": "i-lucide-file-question-mark",
  "file-question-mark": "i-lucide-file-question-mark",
  "file-spreadsheet": "i-lucide-file-spreadsheet",
  globe: "i-lucide-globe",
  "grip-horizontal": "i-lucide-grip-horizontal",
  "grip-vertical": "i-lucide-grip-vertical",
  "hard-drive": "i-lucide-hard-drive",
  house: "i-lucide-house",
  image: "i-lucide-image",
  "image-upscale": "i-lucide-image-upscale",
  inbox: "i-lucide-inbox",
  info: "i-lucide-info",
  laptop: "i-lucide-laptop",
  layers: "i-lucide-layers",
  list: "i-lucide-list",
  "loader-circle": "i-lucide-loader-circle",
  lock: "i-lucide-lock",
  menu: "i-lucide-menu",
  minus: "i-lucide-minus",
  moon: "i-lucide-moon",
  "panel-left": "i-lucide-panel-left",
  "panel-right": "i-lucide-panel-right",
  pause: "i-lucide-pause",
  play: "i-lucide-play",
  quote: "i-lucide-quote",
  gauge: "i-lucide-gauge",
  repeat: "i-lucide-repeat",
  "repeat-1": "i-lucide-repeat-1",
  rewind: "i-lucide-rewind",
  "rotate-ccw": "i-lucide-rotate-ccw",
  "rotate-cw": "i-lucide-rotate-cw",
  search: "i-lucide-search",
  send: "i-lucide-send",
  "server-crash": "i-lucide-server-crash",
  "server-off": "i-lucide-server-off",
  "shield-alert": "i-lucide-shield-alert",
  share: "i-lucide-share",
  "skip-back": "i-lucide-skip-back",
  "skip-forward": "i-lucide-skip-forward",
  sparkles: "i-lucide-sparkles",
  square: "i-lucide-square",
  star: "i-lucide-star",
  sun: "i-lucide-sun",
  "triangle-alert": "i-lucide-triangle-alert",
  user: "i-lucide-user",
  "volume-1": "i-lucide-volume-1",
  "volume-2": "i-lucide-volume-2",
  "volume-x": "i-lucide-volume-x",
  x: "i-lucide-x",
};

/**
 * Converts an icon reference into a UnoCSS icon class.
 * - `i-<set>-<name>` class names pass through unchanged.
 * - `<set>:<name>` (Iconify notation) becomes `i-<set>-<name>`.
 * - Raw SVG markup and empty values yield `""`.
 * - Any other value passes through unchanged.
 */
export const toIconClass = (raw: string): string => {
  if (!raw || raw.startsWith("<")) return "";
  if (raw.startsWith("i-") || !raw.includes(":")) return raw;
  const [set, name] = raw.split(":");
  return `i-${set}-${name}`;
};
