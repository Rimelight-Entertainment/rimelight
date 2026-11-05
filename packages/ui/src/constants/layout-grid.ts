export const LAYOUT_GRID_STORAGE_KEY = "rl-grid-visible";
export const LAYOUT_GRID_SHORTCUT = "meta_shift_g";
export const LAYOUT_GRID_Z_INDEX = 1000;
export const LAYOUT_GRID_ROOT_FONT_SIZE = 16;

export const LAYOUT_GRID_COLS = { base: 4, sm: 4, md: 8, lg: 12, xl: 12 } as const;
export const LAYOUT_GRID_BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280 } as const;
export const LAYOUT_GRID_SPACING = [0.75, 1, 1.5, 2, 2] as const;

export const LAYOUT_GRID_MAX_WIDTH = "1440px";
export const LAYOUT_GRID_INNER_MAX_WIDTH = "768px";

export const LAYOUT_GRID_COLORS = {
  grid: "var(--rl-error-500)",
  inner: "var(--rl-success-500)",
  fullWidth: "var(--rl-info-500)",
} as const;

export const LAYOUT_GRID_OPACITIES = { grid: 0.1, inner: 0.1, fullWidth: 0.05 } as const;
