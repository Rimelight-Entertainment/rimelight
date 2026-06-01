import { computed, onMounted, onUnmounted, ref } from "vue";
import { defaultDocument, defaultWindow } from "@/utils/ssr";

const scrollPercentage = ref(0);

export const useScrollToTop = () => {
  const minScrollThreshold = 15;

  const isVisible = computed(() => scrollPercentage.value >= minScrollThreshold);

  function updatePageScroll() {
    if (!defaultWindow || !defaultDocument) {
      return;
    }

    const scrollY = defaultWindow.scrollY;
    const maxScroll = defaultDocument.body.scrollHeight - defaultWindow.innerHeight;

    if (maxScroll <= 0) {
      scrollPercentage.value = 0;
      return;
    }

    scrollPercentage.value = Math.min((scrollY / maxScroll) * 100, 100);
  }

  function scrollToTop() {
    if (!defaultWindow) return;

    defaultWindow.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Lifecycle
  if (typeof window !== "undefined") {
    onMounted(() => {
      if (!defaultWindow) return;
      defaultWindow.addEventListener("scroll", updatePageScroll, { passive: true });
      updatePageScroll();
    });

    onUnmounted(() => {
      if (!defaultWindow) return;
      defaultWindow.removeEventListener("scroll", updatePageScroll);
    });
  }

  return {
    scrollPercentage,
    isVisible,
    scrollToTop,
  };
};
