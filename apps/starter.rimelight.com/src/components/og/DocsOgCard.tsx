import { type Component, Show } from "solid-js";

export interface DocsOgProps {
  title?: string;
  description?: string;
  brand?: string;
}

export const DocsOgCard: Component<DocsOgProps> = (props) => {
  const truncatedTitle = () =>
    props.title && props.title.length > 150 ? props.title.slice(0, 149) + "…" : props.title;

  const truncatedDesc = () =>
    props.description && props.description.length > 220
      ? props.description.slice(0, 219) + "…"
      : props.description;

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
      <defs>
        <linearGradient id="docs-og-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a0a0a" />
          <stop offset="100%" stop-color="#1a1a2e" />
        </linearGradient>
        <style>{`
          .brand-text { font-family: 'Noto Sans', system-ui, sans-serif; font-size: 24px; font-weight: 700; fill: #ffffff; }
          .og-title { font-family: 'Noto Sans', system-ui, sans-serif; font-size: 52px; font-weight: 700; fill: #ffffff; letter-spacing: -0.02em; }
          .og-desc { font-family: 'Noto Sans', system-ui, sans-serif; font-size: 22px; font-weight: 400; fill: #94a3b8; }
          .badge-text { font-family: 'Noto Sans', system-ui, sans-serif; font-size: 14px; font-weight: 600; fill: #93c5fd; }
        `}</style>
      </defs>

      <rect width="1200" height="630" fill="url(#docs-og-gradient)" />

      <Show when={props.brand}>
        <g transform="translate(80, 60)">
          <circle cx="16" cy="16" r="16" fill="#60a5fa" fill-opacity="0.2" />
          <circle cx="16" cy="16" r="8" fill="#60a5fa" />
          <text x="44" y="24" class="brand-text">
            {props.brand}
          </text>
        </g>
      </Show>

      <rect x="80" y="190" width="60" height="4" rx="2" fill="#60a5fa" />

      <Show when={truncatedTitle()}>
        <text x="80" y="275" class="og-title">
          {truncatedTitle()}
        </text>
      </Show>

      <Show when={truncatedDesc()}>
        <text x="80" y="340" class="og-desc">
          {truncatedDesc()}
        </text>
      </Show>

      <g transform="translate(80, 520)">
        <rect
          width="150"
          height="38"
          rx="19"
          fill="rgba(96, 165, 250, 0.15)"
          stroke="rgba(96, 165, 250, 0.3)"
          stroke-width="1"
        />
        <text x="75" y="24" text-anchor="middle" class="badge-text">
          Documentation
        </text>
      </g>
    </svg>
  );
};

export default DocsOgCard;
