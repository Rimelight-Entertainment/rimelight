const svg = (inner: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" width="100%" height="100%">${inner}</svg>`

export const DEFAULT_ICONS = {
  alertTriangle: svg(
    `<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4M12 17h.01"/>`
  ),
  alignLeft: svg(
    `<line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/>`
  ),
  arrowLeft: svg(`<path d="M19 12H5M12 19l-7-7 7-7"/>`),
  arrowRight: svg(`<path d="M5 12h14M12 5l7 7-7 7"/>`),
  bell: svg(`<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0"/>`),
  check: svg(`<path d="M20 6 9 17l-5-5"/>`),
  chevronDown: svg(`<path d="m6 9 6 6 6-6"/>`),
  chevronLeft: svg(`<path d="m15 18-6-6 6-6"/>`),
  chevronRight: svg(`<path d="m9 18 6-6-6-6"/>`),
  chevronsUpDown: svg(`<path d="m7 15 5 5 5-5M7 9l5-5 5 5"/>`),
  circleCheck: svg(`<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>`),
  circleX: svg(`<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>`),
  close: svg(`<path d="M18 6 6 18M6 6l12 12"/>`),
  copy: svg(
    `<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`
  ),
  download: svg(`<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>`),
  externalLink: svg(
    `<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>`
  ),
  fileQuestion: svg(
    `<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M9.1 11.8a3 3 0 0 1 5.8 1c0 .9-.6 1.4-1.1 1.8-.4.3-.8.7-.8 1.4M12 19h.01"/>`
  ),
  gripHorizontal: svg(
    `<circle cx="12" cy="9" r="1"/><circle cx="19" cy="9" r="1"/><circle cx="5" cy="9" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="19" cy="15" r="1"/><circle cx="5" cy="15" r="1"/>`
  ),
  gripVertical: svg(
    `<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>`
  ),
  hardDrive: svg(
    `<rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 18h.01M10 18h.01M2 14L5 3h14l3 11"/>`
  ),
  image: svg(
    `<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>`
  ),
  imageUpscale: svg(
    `<path d="M16 3H3v13h13V3z"/><path d="M21 21v-4a2 2 0 0 0-2-2h-3M21 11V9M21 5a2 2 0 0 0-2-2h-1"/>`
  ),
  info: svg(`<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>`),
  layers: svg(`<path d="m12 3-10 5L12 13l10-5-10-5Z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>`),
  list: svg(
    `<line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>`
  ),
  loaderCircle: svg(`<path d="M21 12a9 9 0 1 1-6.219-8.56"/>`),
  moon: svg(`<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`),
  panelLeft: svg(`<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/>`),
  play: svg(`<polygon points="6 3 20 12 6 21 6 3"/>`),
  quote: svg(
    `<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3c0 4-3 6-3 6Zm11 0c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h3c0 4-3 6-3 6Z"/>`
  ),
  search: svg(`<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>`),
  share: svg(
    `<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>`
  ),
  sun: svg(
    `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>`
  ),
  uploadCloud: svg(
    `<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242M12 12v9M9 15l3-3 3 3"/>`
  ),
  user: svg(`<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>`),
  star: svg(
    `<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>`
  ),
  lock: svg(
    `<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>`
  ),
  eye: svg(
    `<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/>`
  ),
  eyeOff: svg(
    `<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499A10.75 10.75 0 0 1 2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.225-4.22"/><line x1="2" x2="22" y1="2" y2="22"/>`
  )
} as const

export type RimelightIcons = Partial<Record<keyof typeof DEFAULT_ICONS, string>> &
  Record<string, string | undefined>
