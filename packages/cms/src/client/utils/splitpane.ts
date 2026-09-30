const SNAP_POINTS = [25, 33.333, 50, 66.667, 75];
const SNAP_THRESHOLD = 2.0;

export function initSplitPane(
  container: HTMLElement,
  leftPane: HTMLElement,
  rightPane: HTMLElement,
  handle: HTMLElement,
  onResize?: (leftPct: number) => void,
) {
  let isDragging = false;
  let animationFrameId: number | null = null;
  let pendingPercentage: number | null = null;

  const applyResize = () => {
    if (pendingPercentage === null) return;
    leftPane.style.flex = `0 0 ${pendingPercentage}%`;
    leftPane.style.width = `${pendingPercentage}%`;
    rightPane.style.flex = `0 0 ${100 - pendingPercentage}%`;
    rightPane.style.width = `${100 - pendingPercentage}%`;
    onResize?.(pendingPercentage);
    animationFrameId = null;
  };

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true;
    handle.classList.add("active");
    container.classList.add("split-dragging");
    leftPane.style.transition = "none";
    rightPane.style.transition = "none";
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    e.preventDefault();
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const containerRect = container.getBoundingClientRect();
    const offset = e.clientX - containerRect.left;
    let percentage = (offset / containerRect.width) * 100;

    // Multi-point snapping (25%, 33.33%, 50%, 66.67%, 75%)
    for (const snap of SNAP_POINTS) {
      if (Math.abs(percentage - snap) <= SNAP_THRESHOLD) {
        percentage = snap;
        break;
      }
    }

    // Keep within bounds 20% - 80%
    percentage = Math.max(20, Math.min(80, percentage));

    pendingPercentage = percentage;
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(applyResize);
    }
  };

  const onMouseUp = () => {
    if (isDragging) {
      isDragging = false;
      handle.classList.remove("active");
      container.classList.remove("split-dragging");
      leftPane.style.transition = "";
      rightPane.style.transition = "";
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }
  };

  handle.addEventListener("mousedown", onMouseDown);
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);

  return () => {
    handle.removeEventListener("mousedown", onMouseDown);
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}
