import type { JSX } from "@solidjs/web";

export type CarouselSlide = {
  src?: string;
  imageSrc?: string;
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
  [key: string]: unknown;
};

export interface RLCarouselProps {
  slides?: CarouselSlide[];
  autoplay?: boolean;
  ui?: any;
  class?: any;
  children?: JSX.Element;
  [key: string]: unknown;
}
