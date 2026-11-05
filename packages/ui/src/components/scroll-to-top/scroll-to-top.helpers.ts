import type { ScrollState, ScrollToTopGaugeVars } from "./scroll-to-top.types";

export const DEFAULT_THRESHOLD = 200;
export const DEFAULT_PROGRESS_WIDTH = 6;

export function scrollState(
  scrollTop: number,
  documentHeight: number,
  viewportHeight: number,
  threshold: number,
): ScrollState {
  const scrollable = documentHeight - viewportHeight;
  return {
    isVisible: scrollTop > threshold,
    scrollPercentage: scrollable > 0 ? Math.min(100, (scrollTop / scrollable) * 100) : 0,
  };
}

export function gaugeVars(progressWidth: number, scrollPercentage: number): ScrollToTopGaugeVars {
  const sweep = `${(scrollPercentage / 100) * 360}deg`;
  return {
    "--rl-stt-border": `${progressWidth * 0.5}px`,
    "--rl-stt-gauge": `conic-gradient(from 0deg, currentColor ${sweep}, transparent ${sweep})`,
  };
}

export function trackScroll(threshold: number, onUpdate: (state: ScrollState) => void): () => void {
  let frame: number | null = null;

  function measure() {
    frame = null;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    onUpdate(
      scrollState(scrollTop, document.documentElement.scrollHeight, window.innerHeight, threshold),
    );
  }

  function update() {
    if (frame === null) {
      frame = requestAnimationFrame(measure);
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  update();

  return () => {
    window.removeEventListener("scroll", update);
    if (frame !== null) {
      cancelAnimationFrame(frame);
    }
  };
}

export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
