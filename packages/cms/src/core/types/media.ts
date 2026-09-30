export interface MediaValue {
  id: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  blurhash?: string;
  previewUrl?: string;
  provider: "r2" | "external" | "local";
  meta?: Record<string, unknown>;
}
