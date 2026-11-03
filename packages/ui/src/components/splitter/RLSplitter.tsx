import type {
  DragState,
  RLSplitterHandleConfig,
  RLSplitterPanelItem,
  RLSplitterProps,
  SplitterHandleAction,
  SplitterHandleState,
  SplitterOrientation,
  SplitterPanelState,
  SplitterSize,
} from "./splitter.types";
import { RLSplitterTheme } from "./splitter.theme";
import { cx } from "../../resolver";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onSettled,
  untrack,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = [
  "orientation",
  "value",
  "defaultValue",
  "disabled",
  "keyboardDelta",
  "panels",
  "handles",
  "action",
  "intersection",
  "handleIcon",
  "translations",
  "onValueChange",
  "onResizeStart",
  "onResizeEnd",
  "onHandleKeyDown",
  "id",
] as const;

const PANEL_ITEM_KEYS = new Set([
  "id",
  "children",
  "defaultSize",
  "min",
  "max",
  "collapsible",
  "collapsibleMin",
  "defaultCollapsed",
  "collapsed",
  "onCollapse",
  "onExpand",
  "resizable",
  "class",
  "style",
]);

interface CrossDragHook {
  orientation: SplitterOrientation;
  start: (e: PointerEvent) => void;
  move: (e: PointerEvent) => void;
  end: (e: PointerEvent) => void;
}

type HandleElement = HTMLDivElement & {
  __rlCrossDrag?: CrossDragHook;
};

export function isPanelItem(val: unknown): val is RLSplitterPanelItem {
  if (!val || typeof val !== "object" || Array.isArray(val)) return false;
  if ("nodeType" in val || "t" in val) return false;
  for (const key of Object.keys(val)) {
    if (PANEL_ITEM_KEYS.has(key)) return true;
  }
  return Object.getPrototypeOf(val) === Object.prototype;
}

export function resolveConstraintPx(
  size: SplitterSize | undefined,
  totalPx: number,
  defaultRatio: number,
): number {
  if (size === undefined || size === null) return defaultRatio * totalPx;
  if (typeof size === "string") {
    const trimmed = size.trim();
    if (trimmed.endsWith("%")) {
      const pct = parseFloat(trimmed);
      return Number.isFinite(pct) ? (pct / 100) * totalPx : defaultRatio * totalPx;
    }
    const px = parseFloat(trimmed);
    return Number.isFinite(px) ? px : defaultRatio * totalPx;
  }
  if (typeof size === "number" && Number.isFinite(size)) {
    if (size === 0) return 0;
    if (size > 0 && size <= 1) return size * totalPx;
    return size;
  }
  return defaultRatio * totalPx;
}

export function resolveValuePx(
  size: SplitterSize | undefined,
  totalPx: number,
  isPercentageNumber = false,
): number | undefined {
  if (size === undefined || size === null) return undefined;
  if (typeof size === "string") {
    const trimmed = size.trim();
    if (trimmed.endsWith("%")) {
      const pct = parseFloat(trimmed);
      return Number.isFinite(pct) ? (pct / 100) * totalPx : undefined;
    }
    const px = parseFloat(trimmed);
    return Number.isFinite(px) ? px : undefined;
  }
  if (typeof size === "number" && Number.isFinite(size)) {
    if (isPercentageNumber) return (size / 100) * totalPx;
    return size;
  }
  return undefined;
}

export function inferFallbackTotalPx(
  rawSizes: readonly SplitterSize[] | undefined,
  isLegacyPct: boolean,
): number {
  if (!rawSizes || rawSizes.length === 0 || isLegacyPct) return 1000;
  let pxSum = 0;
  let pctSum = 0;
  let hasPx = false;
  for (const s of rawSizes) {
    if (typeof s === "number" && Number.isFinite(s) && s > 1) {
      pxSum += s;
      hasPx = true;
    } else if (typeof s === "string") {
      const trimmed = s.trim();
      if (trimmed.endsWith("%")) {
        const p = parseFloat(trimmed);
        if (Number.isFinite(p)) pctSum += p;
      } else {
        const p = parseFloat(trimmed);
        if (Number.isFinite(p) && p > 0) {
          pxSum += p;
          hasPx = true;
        }
      }
    }
  }
  if (hasPx) {
    const remRatio = Math.max(0.05, 1 - pctSum / 100);
    return Math.max(100, Math.round(pxSum / remRatio));
  }
  return 1000;
}

function mergeInlineStyles(
  ...styles: Array<JSX.CSSProperties | string | undefined>
): JSX.CSSProperties | string | undefined {
  const valid = styles.filter(Boolean);
  if (valid.length === 0) return undefined;
  if (valid.length === 1) return valid[0];
  if (valid.some((s) => typeof s === "string")) {
    return valid
      .map((s) => {
        if (typeof s === "string") return s.replace(/;+\s*$/, "");
        return Object.entries(s as Record<string, unknown>)
          .filter(([, v]) => v !== undefined && v !== null)
          .map(([k, v]) => `${k}: ${String(v)}`)
          .join("; ");
      })
      .filter(Boolean)
      .join("; ");
  }
  return Object.assign({}, ...valid) as JSX.CSSProperties;
}

interface PanelBounds {
  minPx: number;
  maxPx: number;
  rawMinPx: number;
  rawMaxPx: number;
  collapsible: boolean;
  collapsibleMinPx: number;
  resizable: boolean;
}

export const RLSplitter: Component<RLSplitterProps> = (props) => {
  const effectiveOrientation = (): SplitterOrientation => props.orientation ?? "horizontal";
  const isHorizontal = () => effectiveOrientation() === "horizontal";
  const isDisabled = () => Boolean(props.disabled);

  const { Tag, classes, rest, id, slots, children, theme } = RLSplitterTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["handleSlot"] as const,
    idPrefix: "rl-splitter",
    variants: () => ({
      orientation: effectiveOrientation(),
      disabled: isDisabled(),
    }),
  });

  const normalizedPanels = createMemo<RLSplitterPanelItem[]>(() => {
    const kids = [children()]
      .flat()
      .filter((kid) => kid !== undefined && kid !== null && kid !== false);
    const rawPanels = props.panels;
    if (rawPanels && rawPanels.length > 0) {
      return rawPanels.map((entry, idx) => {
        if (isPanelItem(entry)) {
          return {
            ...entry,
            children: entry.children ?? kids[idx],
          };
        }
        return {
          children: entry,
        };
      });
    }
    if (kids.length > 0) {
      return kids.map((kid) => ({ children: kid }));
    }
    const count = props.value?.length ?? props.defaultValue?.length ?? 2;
    return Array.from({ length: Math.max(1, count) }, () => ({}));
  });

  let rootRef: HTMLDivElement | undefined;
  const [measuredSize, setMeasuredSize] = createSignal(0);

  const fallbackTotalPx = createMemo(() =>
    inferFallbackTotalPx(props.value ?? props.defaultValue, false),
  );

  const getTotalPx = (): number => {
    const domSize = rootRef ? (isHorizontal() ? rootRef.clientWidth : rootRef.clientHeight) : 0;
    if (domSize > 0) return domSize;
    const m = measuredSize();
    if (m > 0) return m;
    return fallbackTotalPx();
  };

  const [internalCollapsed, setInternalCollapsed] = createSignal<Record<number, boolean>>({});
  const [savedExpandedRatios, setSavedExpandedRatios] = createSignal<Record<number, number>>({});
  const [transitioningPanels, setTransitioningPanels] = createSignal<Record<number, boolean>>({});
  const [activeHandle, setActiveHandle] = createSignal<number | null>(null);
  const [hoveredHandle, setHoveredHandle] = createSignal<number | null>(null);
  const [crossActiveHandle, setCrossActiveHandle] = createSignal<number | null>(null);
  const [drag, setDrag] = createSignal<DragState | null>(null);
  let activeCrossPartner: CrossDragHook | null = null;

  const triggerTransition = (indices: number[]) => {
    const next: Record<number, boolean> = {};
    for (const idx of indices) next[idx] = true;
    setTransitioningPanels((prev) => ({ ...prev, ...next }));
    if (typeof setTimeout !== "undefined") {
      setTimeout(() => {
        setTransitioningPanels((prev) => {
          const copy = { ...prev };
          for (const idx of indices) delete copy[idx];
          return copy;
        });
      }, 220);
    }
  };

  const isPanelCollapsed = (idx: number, panel: RLSplitterPanelItem): boolean => {
    if (!panel.collapsible) return false;
    if (panel.collapsed !== undefined) return panel.collapsed;
    const map = internalCollapsed();
    if (idx in map) return Boolean(map[idx]);
    if (panel.defaultCollapsed) return true;
    const rawSource = props.value ?? props.defaultValue;
    if (rawSource && rawSource[idx] !== undefined) {
      const totalPx = getTotalPx();
      const valPx = resolveValuePx(rawSource[idx], totalPx, false);
      const colMinPx = Math.max(
        0,
        Math.min(totalPx, resolveConstraintPx(panel.collapsibleMin, totalPx, 0)),
      );
      const rawMinPx = Math.max(0, Math.min(totalPx, resolveConstraintPx(panel.min, totalPx, 0)));
      if (valPx !== undefined && valPx <= colMinPx + 0.5 && (rawMinPx > colMinPx || valPx === 0)) {
        return true;
      }
    }
    return false;
  };

  const getBoundsList = (
    totalPx: number,
    collapsedOverride?: Record<number, boolean>,
  ): PanelBounds[] => {
    const list = normalizedPanels();
    return list.map((panel, idx) => {
      const collapsible = Boolean(panel.collapsible);
      const collapsibleMinPx = collapsible
        ? Math.max(0, Math.min(totalPx, resolveConstraintPx(panel.collapsibleMin, totalPx, 0)))
        : 0;
      const rawMinPx = Math.max(0, Math.min(totalPx, resolveConstraintPx(panel.min, totalPx, 0)));
      const rawMaxPx = Math.max(
        rawMinPx,
        Math.min(totalPx, resolveConstraintPx(panel.max, totalPx, 1)),
      );
      const collapsed =
        collapsedOverride && idx in collapsedOverride
          ? Boolean(collapsedOverride[idx])
          : isPanelCollapsed(idx, panel);
      const resizable = panel.resizable !== false;

      if (collapsible && collapsed) {
        return {
          minPx: collapsibleMinPx,
          maxPx: collapsibleMinPx,
          rawMinPx,
          rawMaxPx,
          collapsible,
          collapsibleMinPx,
          resizable,
        };
      }

      return {
        minPx: rawMinPx,
        maxPx: rawMaxPx,
        rawMinPx,
        rawMaxPx,
        collapsible,
        collapsibleMinPx,
        resizable,
      };
    });
  };

  const normalizeSizesToTotal = (
    rawInput: readonly SplitterSize[] | undefined,
    isLegacyPct: boolean,
    totalPx: number,
    collapsedOverride?: Record<number, boolean>,
  ): number[] => {
    const panels = normalizedPanels();
    const count = panels.length;
    if (count === 0) return [];

    const bounds = getBoundsList(totalPx, collapsedOverride);
    const parsed: Array<number | undefined> = Array.from({ length: count }, (_, idx) => {
      const b = bounds[idx]!;
      const isCol =
        collapsedOverride && idx in collapsedOverride
          ? Boolean(collapsedOverride[idx])
          : isPanelCollapsed(idx, panels[idx]!);
      if (b.collapsible && isCol) {
        return b.collapsibleMinPx;
      }
      const rawVal = rawInput?.[idx] ?? panels[idx]?.defaultSize;
      return resolveValuePx(rawVal, totalPx, isLegacyPct);
    });

    let knownSum = 0;
    let unknownCount = 0;
    for (let i = 0; i < count; i++) {
      if (parsed[i] !== undefined) knownSum += parsed[i]!;
      else unknownCount++;
    }

    const defaultEach =
      unknownCount > 0 ? Math.max(0, (totalPx - knownSum) / unknownCount) : totalPx / count;

    const sizes = parsed.map((val, idx) => {
      const b = bounds[idx]!;
      const initial = val !== undefined ? val : defaultEach;
      return Math.min(b.maxPx, Math.max(b.minPx, initial));
    });

    for (let pass = 0; pass < 5; pass++) {
      const sum = sizes.reduce((acc, s) => acc + s, 0);
      const diff = totalPx - sum;
      if (Math.abs(diff) <= 0.05) break;

      const adjustableIndices: number[] = [];
      for (let i = 0; i < count; i++) {
        const b = bounds[i]!;
        if (!b.resizable && pass < 3) continue;
        if (diff > 0 && sizes[i]! < b.maxPx - 0.05) adjustableIndices.push(i);
        else if (diff < 0 && sizes[i]! > b.minPx + 0.05) adjustableIndices.push(i);
      }

      if (adjustableIndices.length === 0) {
        if (pass < 3) continue;
        break;
      }

      const share = diff / adjustableIndices.length;
      for (const idx of adjustableIndices) {
        const b = bounds[idx]!;
        sizes[idx] = Math.min(b.maxPx, Math.max(b.minPx, sizes[idx]! + share));
      }
    }

    const finalSum = sizes.reduce((acc, s) => acc + s, 0);
    if (finalSum > 0 && Math.abs(finalSum - totalPx) > 0.5) {
      const scale = totalPx / finalSum;
      for (let i = 0; i < count; i++) {
        sizes[i] = sizes[i]! * scale;
      }
    }

    return sizes;
  };

  const computeInitialRatios = (): number[] => {
    const total = fallbackTotalPx();
    const raw = props.value ?? props.defaultValue;
    const px = normalizeSizesToTotal(raw, false, total);
    return px.map((v) => (total > 0 ? (v / total) * 100 : 100 / Math.max(1, px.length)));
  };

  const [internalPcts, setInternalPcts] = createSignal<number[]>(computeInitialRatios());

  createEffect(
    () => normalizedPanels().length,
    (len) => {
      const current = untrack(internalPcts);
      if (current.length !== len) {
        setInternalPcts(computeInitialRatios());
      }
    },
  );

  const currentSizesPx = createMemo<number[]>(() => {
    const totalPx = getTotalPx();
    if (props.value !== undefined) {
      return normalizeSizesToTotal(props.value, false, totalPx);
    }
    const pcts = internalPcts();
    const rawFromPcts = pcts.map((p) => `${p}%` as SplitterSize);
    return normalizeSizesToTotal(rawFromPcts, false, totalPx);
  });

  const currentPercentages = createMemo<number[]>(() => {
    const totalPx = getTotalPx();
    const px = currentSizesPx();
    if (totalPx <= 0) return px.map(() => 100 / Math.max(1, px.length));
    return px.map((v) => (v / totalPx) * 100);
  });

  const commitSizesPx = (nextPx: number[], totalPx: number) => {
    const pcts = nextPx.map((v) => (totalPx > 0 ? (v / totalPx) * 100 : 0));
    if (props.value === undefined) {
      setInternalPcts(pcts);
    }
    const rounded = nextPx.map((v) => Math.round(v));
    props.onValueChange?.(rounded);
  };

  const setCollapsedState = (panelIdx: number, collapsed: boolean, reportedPx: number) => {
    const panel = normalizedPanels()[panelIdx];
    if (!panel) return;
    const wasCollapsed = isPanelCollapsed(panelIdx, panel);
    if (wasCollapsed === collapsed) return;

    setInternalCollapsed((prev) => ({ ...prev, [panelIdx]: collapsed }));
    if (collapsed) {
      panel.onCollapse?.(Math.round(reportedPx));
    } else {
      panel.onExpand?.(Math.round(reportedPx));
    }
  };

  const getHandleConfig = (i: number): RLSplitterHandleConfig => {
    const fromHandles = props.handles?.[i];
    const fromPanel = normalizedPanels()[i]?.handle;
    return {
      ...fromPanel,
      ...fromHandles,
    };
  };

  const getHandleAction = (i: number): SplitterHandleAction => {
    const cfg = getHandleConfig(i);
    return cfg.action ?? props.action ?? "resize";
  };

  const getHandleIntersection = (i: number): boolean => {
    const cfg = getHandleConfig(i);
    return cfg.intersection ?? props.intersection ?? false;
  };

  const getCollapsibleTargetIndex = (handleIdx: number): number | null => {
    const panels = normalizedPanels();
    if (panels[handleIdx]?.collapsible) return handleIdx;
    if (panels[handleIdx + 1]?.collapsible) return handleIdx + 1;
    return null;
  };

  const toggleCollapse = (handleIdx: number) => {
    if (isDisabled() || getHandleConfig(handleIdx).disabled) return;
    const targetIdx = getCollapsibleTargetIndex(handleIdx);
    if (targetIdx === null) return;

    const neighborIdx = targetIdx === handleIdx ? handleIdx + 1 : handleIdx;
    const panels = normalizedPanels();
    const targetPanel = panels[targetIdx];
    if (!targetPanel || panels[neighborIdx] === undefined) return;

    const totalPx = getTotalPx();
    const currentPx = [...currentSizesPx()];
    const currentlyCollapsed = isPanelCollapsed(targetIdx, targetPanel);
    const collapsibleMinPx = Math.max(
      0,
      Math.min(totalPx, resolveConstraintPx(targetPanel.collapsibleMin, totalPx, 0)),
    );
    const rawMinPx = Math.max(
      0,
      Math.min(totalPx, resolveConstraintPx(targetPanel.min, totalPx, 0)),
    );
    const rawMaxPx = Math.max(
      rawMinPx,
      Math.min(totalPx, resolveConstraintPx(targetPanel.max, totalPx, 1)),
    );

    const pairTotal = (currentPx[targetIdx] ?? 0) + (currentPx[neighborIdx] ?? 0);
    const neighborBounds = getBoundsList(totalPx)[neighborIdx]!;

    triggerTransition([targetIdx, neighborIdx]);

    if (!currentlyCollapsed) {
      const currentTargetPx = currentPx[targetIdx] ?? rawMinPx;
      if (currentTargetPx > collapsibleMinPx) {
        setSavedExpandedRatios((prev) => ({
          ...prev,
          [targetIdx]: currentTargetPx / totalPx,
        }));
      }
      const nextTargetPx = collapsibleMinPx;
      const nextNeighborPx = Math.min(
        neighborBounds.maxPx,
        Math.max(neighborBounds.minPx, pairTotal - nextTargetPx),
      );
      currentPx[targetIdx] = pairTotal - nextNeighborPx;
      currentPx[neighborIdx] = nextNeighborPx;
      setCollapsedState(targetIdx, true, currentPx[targetIdx]!);
      commitSizesPx(currentPx, totalPx);
    } else {
      const savedRatio = savedExpandedRatios()[targetIdx];
      const fallbackPx = Math.max(rawMinPx, totalPx * 0.25);
      const desiredPx = savedRatio !== undefined ? savedRatio * totalPx : fallbackPx;
      const maxAvailableForTarget = Math.min(rawMaxPx, pairTotal - neighborBounds.minPx);
      const nextTargetPx = Math.max(rawMinPx, Math.min(maxAvailableForTarget, desiredPx));
      const nextNeighborPx = Math.max(neighborBounds.minPx, pairTotal - nextTargetPx);
      currentPx[targetIdx] = pairTotal - nextNeighborPx;
      currentPx[neighborIdx] = nextNeighborPx;
      setCollapsedState(targetIdx, false, currentPx[targetIdx]!);
      commitSizesPx(currentPx, totalPx);
    }
  };

  const applyPairDelta = (
    handleIdx: number,
    deltaPx: number,
    baseSizesPx: number[],
    symmetric = false,
  ) => {
    const panels = normalizedPanels();
    const panelA = panels[handleIdx];
    const panelB = panels[handleIdx + 1];
    if (!panelA || !panelB) return;
    if (panelA.resizable === false || panelB.resizable === false) return;

    const totalPx = getTotalPx();
    const nextPx = [...baseSizesPx];
    const startA = baseSizesPx[handleIdx] ?? 0;
    const startB = baseSizesPx[handleIdx + 1] ?? 0;
    const pairTotal = startA + startB;

    const rawMinA = Math.max(0, Math.min(totalPx, resolveConstraintPx(panelA.min, totalPx, 0)));
    const rawMaxA = Math.max(
      rawMinA,
      Math.min(totalPx, resolveConstraintPx(panelA.max, totalPx, 1)),
    );
    const collapsibleMinA = panelA.collapsible
      ? Math.max(0, Math.min(totalPx, resolveConstraintPx(panelA.collapsibleMin, totalPx, 0)))
      : rawMinA;

    const rawMinB = Math.max(0, Math.min(totalPx, resolveConstraintPx(panelB.min, totalPx, 0)));
    const rawMaxB = Math.max(
      rawMinB,
      Math.min(totalPx, resolveConstraintPx(panelB.max, totalPx, 1)),
    );
    const collapsibleMinB = panelB.collapsible
      ? Math.max(0, Math.min(totalPx, resolveConstraintPx(panelB.collapsibleMin, totalPx, 0)))
      : rawMinB;

    if (symmetric && handleIdx > 0 && panels[handleIdx - 1]?.resizable !== false) {
      const prevIdx = handleIdx - 1;
      const panelPrev = panels[prevIdx]!;
      const startPrev = baseSizesPx[prevIdx] ?? 0;
      const trioTotal = startPrev + startA + startB;
      const rawMinPrev = Math.max(
        0,
        Math.min(totalPx, resolveConstraintPx(panelPrev.min, totalPx, 0)),
      );
      const rawMaxPrev = Math.max(
        rawMinPrev,
        Math.min(totalPx, resolveConstraintPx(panelPrev.max, totalPx, 1)),
      );

      const desiredCenter = Math.min(rawMaxA, Math.max(rawMinA, startA + deltaPx * 2));
      const actualDelta = (desiredCenter - startA) / 2;
      const nextPrev = Math.min(rawMaxPrev, Math.max(rawMinPrev, startPrev - actualDelta));
      const nextB = Math.min(rawMaxB, Math.max(rawMinB, startB - actualDelta));
      const nextA = trioTotal - nextPrev - nextB;
      nextPx[prevIdx] = nextPrev;
      nextPx[handleIdx] = nextA;
      nextPx[handleIdx + 1] = nextB;
      commitSizesPx(nextPx, totalPx);
      return;
    }

    let desiredA = startA + deltaPx;
    let desiredB = pairTotal - desiredA;

    let collapseA = isPanelCollapsed(handleIdx, panelA);
    let collapseB = isPanelCollapsed(handleIdx + 1, panelB);

    if (panelA.collapsible && desiredA < rawMinA) {
      const thresholdA = (rawMinA + collapsibleMinA) / 2;
      if (desiredA <= thresholdA) {
        desiredA = collapsibleMinA;
        collapseA = true;
      } else {
        desiredA = rawMinA;
        collapseA = false;
      }
      desiredB = pairTotal - desiredA;
    } else if (panelA.collapsible && desiredA >= rawMinA) {
      collapseA = false;
    }

    if (panelB.collapsible && desiredB < rawMinB) {
      const thresholdB = (rawMinB + collapsibleMinB) / 2;
      if (desiredB <= thresholdB) {
        desiredB = collapsibleMinB;
        collapseB = true;
      } else {
        desiredB = rawMinB;
        collapseB = false;
      }
      desiredA = pairTotal - desiredB;
    } else if (panelB.collapsible && desiredB >= rawMinB) {
      collapseB = false;
    }

    const effectiveMinA = collapseA ? collapsibleMinA : rawMinA;
    const effectiveMaxA = collapseA ? collapsibleMinA : rawMaxA;
    const effectiveMinB = collapseB ? collapsibleMinB : rawMinB;
    const effectiveMaxB = collapseB ? collapsibleMinB : rawMaxB;

    const minAllowedA = Math.max(effectiveMinA, pairTotal - effectiveMaxB);
    const maxAllowedA = Math.min(effectiveMaxA, pairTotal - effectiveMinB);

    const clampedA = Math.min(maxAllowedA, Math.max(minAllowedA, desiredA));
    const clampedB = pairTotal - clampedA;

    nextPx[handleIdx] = clampedA;
    nextPx[handleIdx + 1] = clampedB;

    if (panelA.collapsible) {
      setCollapsedState(handleIdx, collapseA, clampedA);
    }
    if (panelB.collapsible) {
      setCollapsedState(handleIdx + 1, collapseB, clampedB);
    }

    commitSizesPx(nextPx, totalPx);
  };

  const findCrossPartner = (e: PointerEvent): CrossDragHook | null => {
    if (typeof document === "undefined") return null;
    const wantedOrientation: SplitterOrientation = isHorizontal() ? "vertical" : "horizontal";
    const candidates = document.querySelectorAll<HandleElement>(
      `[data-slot="handle"][data-orientation="${wantedOrientation}"]`,
    );
    let best: CrossDragHook | null = null;
    let bestDist = 48;
    for (const el of candidates) {
      if (!el.__rlCrossDrag) continue;
      const rect = el.getBoundingClientRect();
      const dx =
        e.clientX < rect.left
          ? rect.left - e.clientX
          : e.clientX > rect.right
            ? e.clientX - rect.right
            : 0;
      const dy =
        e.clientY < rect.top
          ? rect.top - e.clientY
          : e.clientY > rect.bottom
            ? e.clientY - rect.bottom
            : 0;
      const dist = Math.hypot(dx, dy);
      if (dist <= bestDist) {
        bestDist = dist;
        best = el.__rlCrossDrag;
      }
    }
    return best;
  };

  const startHandleDrag = (i: number, e: PointerEvent, cross = false, isPartnerCall = false) => {
    if (isDisabled() || getHandleConfig(i).disabled) return;
    const currentPx = currentSizesPx();
    if (currentPx[i + 1] === undefined) return;

    if (!isPartnerCall) {
      e.preventDefault();
      e.stopPropagation();
      const target = e.currentTarget as HTMLElement | null;
      if (target && typeof target.setPointerCapture === "function") {
        try {
          target.setPointerCapture(e.pointerId);
        } catch {
          // Ignore pointer capture errors in synthetic test environments
        }
      }
    }

    const action = getHandleAction(i);
    setActiveHandle(i);
    if (cross) {
      setCrossActiveHandle(i);
      if (!isPartnerCall) {
        activeCrossPartner = findCrossPartner(e);
        activeCrossPartner?.start(e);
      }
    }

    const startSizes = [...currentPx];
    setDrag({
      i,
      startPos: isHorizontal() ? e.clientX : e.clientY,
      startA: currentPx[i] ?? 0,
      startB: currentPx[i + 1] ?? 0,
      startSizes,
      moved: false,
      cross,
    });

    if (action !== "collapse") {
      props.onResizeStart?.(
        i,
        startSizes.map((v) => Math.round(v)),
      );
    }
  };

  const moveHandleDrag = (i: number, e: PointerEvent, isPartnerCall = false) => {
    const state = drag();
    if (!state || state.i !== i) return;
    const pos = isHorizontal() ? e.clientX : e.clientY;
    const delta = pos - state.startPos;

    if (!state.moved && Math.abs(delta) > 3) {
      state.moved = true;
      if (getHandleAction(i) === "collapse") {
        props.onResizeStart?.(
          i,
          state.startSizes.map((v) => Math.round(v)),
        );
      }
    }

    if (state.moved || getHandleAction(i) !== "collapse") {
      applyPairDelta(i, delta, state.startSizes, e.altKey);
    }

    if (state.cross && !isPartnerCall && activeCrossPartner) {
      activeCrossPartner.move(e);
    }
  };

  const endHandleDrag = (i: number, e: PointerEvent, isPartnerCall = false) => {
    const state = drag();
    if (!state || state.i !== i) return;

    if (!isPartnerCall) {
      const target = e.currentTarget as HTMLElement | null;
      if (
        target &&
        typeof target.hasPointerCapture === "function" &&
        target.hasPointerCapture(e.pointerId)
      ) {
        try {
          target.releasePointerCapture(e.pointerId);
        } catch {
          // Ignore
        }
      }
      if (state.cross && activeCrossPartner) {
        activeCrossPartner.end(e);
        activeCrossPartner = null;
      }
    }

    const wasMoved = state.moved;
    setDrag(null);
    setCrossActiveHandle(null);

    if (!wasMoved && getHandleAction(i) === "collapse") {
      toggleCollapse(i);
    } else {
      props.onResizeEnd?.(
        i,
        currentSizesPx().map((v) => Math.round(v)),
      );
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    props.onHandleKeyDown?.(e, i);
    if (e.defaultPrevented || isDisabled() || getHandleConfig(i).disabled) return;

    const currentPx = currentSizesPx();
    if (currentPx[i + 1] === undefined) return;

    const action = getHandleAction(i);
    if ((e.key === "Enter" || e.key === " ") && action === "collapse") {
      e.preventDefault();
      toggleCollapse(i);
      return;
    }

    const totalPx = getTotalPx();
    const bounds = getBoundsList(totalPx);
    const bA = bounds[i];
    const bB = bounds[i + 1];
    if (!bA || !bB) return;

    const pairTotal = (currentPx[i] ?? 0) + (currentPx[i + 1] ?? 0);
    const minAllowedA = Math.max(
      bA.collapsible ? bA.collapsibleMinPx : bA.rawMinPx,
      pairTotal - bB.rawMaxPx,
    );
    const maxAllowedA = Math.min(
      bA.rawMaxPx,
      pairTotal - (bB.collapsible ? bB.collapsibleMinPx : bB.rawMinPx),
    );

    if (e.key === "Home") {
      e.preventDefault();
      triggerTransition([i, i + 1]);
      applyPairDelta(i, minAllowedA - (currentPx[i] ?? 0), currentPx);
      return;
    }

    if (e.key === "End") {
      e.preventDefault();
      triggerTransition([i, i + 1]);
      applyPairDelta(i, maxAllowedA - (currentPx[i] ?? 0), currentPx);
      return;
    }

    const isDecrease = e.key === "ArrowLeft" || e.key === "ArrowUp";
    const isIncrease = e.key === "ArrowRight" || e.key === "ArrowDown";
    if (!isDecrease && !isIncrease) return;

    e.preventDefault();
    triggerTransition([i, i + 1]);

    if (e.shiftKey) {
      const targetA = isDecrease ? minAllowedA : maxAllowedA;
      applyPairDelta(i, targetA - (currentPx[i] ?? 0), currentPx);
      return;
    }

    const stepPx = resolveConstraintPx(props.keyboardDelta ?? "10%", totalPx, 0.1);
    const signedDelta = isIncrease ? stepPx : -stepPx;
    applyPairDelta(i, signedDelta, currentPx);
  };

  onSettled(() => {
    if (!rootRef) return undefined;
    const updateSize = () => {
      if (!rootRef) return;
      const next = isHorizontal() ? rootRef.clientWidth : rootRef.clientHeight;
      if (next > 0) setMeasuredSize(next);
    };
    updateSize();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(() => updateSize());
      ro.observe(rootRef);
      return () => ro.disconnect();
    }
    return undefined;
  });

  const isResizing = () => drag() !== null;

  const getHandleAriaLabel = (i: number, collapsed: boolean): string => {
    const cfg = getHandleConfig(i);
    if (cfg["aria-label"]) return cfg["aria-label"];
    if (getHandleAction(i) === "collapse") {
      if (collapsed && props.translations?.expand) return props.translations.expand;
      if (!collapsed && props.translations?.collapse) return props.translations.collapse;
    }
    return props.translations?.resize ?? uiT("splitter.resize");
  };

  const renderPanelContent = (panel: RLSplitterPanelItem, idx: number) => {
    const raw = panel.children;
    if (typeof raw === "function") {
      const state: SplitterPanelState = {
        size: Math.round(currentSizesPx()[idx] ?? 0),
        percentage: currentPercentages()[idx] ?? 0,
        collapsed: isPanelCollapsed(idx, panel),
        resizing: isResizing(),
        index: idx,
      };
      return (raw as (s: SplitterPanelState) => JSX.Element)(state);
    }
    return raw;
  };

  const renderHandleInner = (i: number, state: SplitterHandleState) => {
    const cfg = getHandleConfig(i);
    const custom = cfg.children ?? slots.handleSlot();
    if (custom !== undefined) {
      return typeof custom === "function"
        ? (custom as (s: SplitterHandleState) => JSX.Element)(state)
        : custom;
    }
    if (props.handleIcon === false) return null;
    const iconName =
      typeof props.handleIcon === "string"
        ? props.handleIcon
        : isHorizontal()
          ? "grip-vertical"
          : "grip-horizontal";
    return <RLIcon name={iconName} class="size-3.5 text-muted/60" aria-hidden="true" />;
  };

  return (
    <Tag
      ref={(el: HTMLDivElement) => (rootRef = el)}
      id={id()}
      class={classes().root}
      data-slot="root"
      data-resizable=""
      data-resizable-root=""
      data-orientation={effectiveOrientation()}
      data-direction={effectiveOrientation()}
      data-disabled={isDisabled() ? "" : undefined}
      data-resizing={isResizing() ? "" : undefined}
      data-theme={theme()}
      {...rest}
    >
      <For each={normalizedPanels()}>
        {(panel, i) => {
          const pct = () => currentPercentages()[i()] ?? 0;
          const collapsed = () => isPanelCollapsed(i(), panel);
          const transitioning = () => Boolean(transitioningPanels()[i()]);
          const panelId = () => panel.id ?? `${id()}-panel-${i()}`;

          const panelSizeStyle = (): JSX.CSSProperties => {
            const basis = `${pct()}%`;
            return isHorizontal()
              ? { "flex-basis": basis, width: basis }
              : { "flex-basis": basis, height: basis };
          };

          const hasNextPanel = () => i() < normalizedPanels().length - 1;
          const handleDragging = () => drag()?.i === i();
          const handleActive = () =>
            handleDragging() || activeHandle() === i() || hoveredHandle() === i();
          const handleAction = () => getHandleAction(i());
          const handleIntersection = () => getHandleIntersection(i());
          const handleDisabled = () =>
            isDisabled() ||
            Boolean(getHandleConfig(i()).disabled) ||
            panel.resizable === false ||
            normalizedPanels()[i() + 1]?.resizable === false;

          const adjacentCollapsed = () => {
            const targetIdx = getCollapsibleTargetIndex(i());
            if (targetIdx === null) return false;
            const targetPanel = normalizedPanels()[targetIdx];
            return targetPanel ? isPanelCollapsed(targetIdx, targetPanel) : false;
          };

          const handleState = (): SplitterHandleState => ({
            collapsed: adjacentCollapsed(),
            dragging: handleDragging(),
            active: handleActive(),
            index: i(),
            orientation: effectiveOrientation(),
          });

          const ariaMinPct = () => {
            const total = getTotalPx();
            if (total <= 0) return 0;
            const b = getBoundsList(total)[i()];
            return Math.round(((b?.rawMinPx ?? 0) / total) * 100);
          };

          const ariaMaxPct = () => {
            const total = getTotalPx();
            if (total <= 0) return 100;
            const b = getBoundsList(total)[i()];
            return Math.round(((b?.rawMaxPx ?? total) / total) * 100);
          };

          return (
            <>
              <div
                id={panelId()}
                class={cx(
                  classes().panel,
                  isHorizontal() ? `w-[${pct()}%]` : `h-[${pct()}%]`,
                  panel.class,
                )}
                style={mergeInlineStyles(panelSizeStyle(), panel.style)}
                data-slot="panel"
                data-resizable-panel={i()}
                data-collapsed={collapsed() ? "" : undefined}
                data-expanded={!collapsed() ? "" : undefined}
                data-resizing={isResizing() ? "" : undefined}
                data-transitioning={transitioning() ? "" : undefined}
              >
                {renderPanelContent(panel, i())}
              </div>

              {hasNextPanel() ? (
                <div
                  ref={(el: HandleElement) => {
                    el.__rlCrossDrag = {
                      orientation: effectiveOrientation(),
                      start: (ev) => startHandleDrag(i(), ev, true, true),
                      move: (ev) => moveHandleDrag(i(), ev, true),
                      end: (ev) => endHandleDrag(i(), ev, true),
                    };
                  }}
                  class={cx(classes().handle, getHandleConfig(i()).class)}
                  style={getHandleConfig(i()).style}
                  data-slot="handle"
                  data-resizable-handle={i()}
                  data-orientation={effectiveOrientation()}
                  data-active={handleActive() ? "" : undefined}
                  data-dragging={handleDragging() ? "" : undefined}
                  data-resizing={isResizing() ? "" : undefined}
                  data-collapse={handleAction() === "collapse" ? "" : undefined}
                  data-collapsed={adjacentCollapsed() ? "" : undefined}
                  data-expanded={!adjacentCollapsed() ? "" : undefined}
                  data-cross={crossActiveHandle() === i() ? "" : undefined}
                  data-disabled={handleDisabled() ? "" : undefined}
                  role="separator"
                  aria-orientation={isHorizontal() ? "vertical" : "horizontal"}
                  aria-valuenow={Math.round(pct())}
                  aria-valuemin={ariaMinPct()}
                  aria-valuemax={ariaMaxPct()}
                  aria-controls={panelId()}
                  aria-disabled={handleDisabled() ? "true" : undefined}
                  aria-label={getHandleAriaLabel(i(), adjacentCollapsed())}
                  tabindex={handleDisabled() ? -1 : 0}
                  onFocus={() => setActiveHandle(i())}
                  onBlur={() => {
                    if (activeHandle() === i()) setActiveHandle(null);
                  }}
                  onPointerEnter={() => setHoveredHandle(i())}
                  onPointerLeave={() => {
                    if (hoveredHandle() === i()) setHoveredHandle(null);
                  }}
                  onPointerDown={(e) => startHandleDrag(i(), e, false, false)}
                  onPointerMove={(e) => moveHandleDrag(i(), e, false)}
                  onPointerUp={(e) => endHandleDrag(i(), e, false)}
                  onPointerCancel={(e) => endHandleDrag(i(), e, false)}
                  onKeyDown={(e) => handleKeyDown(i(), e)}
                >
                  <div
                    class={cx(
                      classes().intersection,
                      !handleIntersection() && "hidden pointer-events-none",
                    )}
                    data-slot="intersection"
                    data-resizable-handle-start-target=""
                    data-cross={crossActiveHandle() === i() ? "" : undefined}
                    onPointerDown={(e) => {
                      if (handleIntersection()) startHandleDrag(i(), e, true, false);
                    }}
                  />

                  <div
                    class={classes().handleControl}
                    data-slot="handle-control"
                    data-active={handleActive() ? "" : undefined}
                    data-dragging={handleDragging() ? "" : undefined}
                    data-collapse={handleAction() === "collapse" ? "" : undefined}
                    data-collapsed={adjacentCollapsed() ? "" : undefined}
                  >
                    {renderHandleInner(i(), handleState())}
                  </div>

                  <div
                    class={cx(
                      classes().intersection,
                      !handleIntersection() && "hidden pointer-events-none",
                    )}
                    data-slot="intersection"
                    data-resizable-handle-end-target=""
                    data-cross={crossActiveHandle() === i() ? "" : undefined}
                    onPointerDown={(e) => {
                      if (handleIntersection()) startHandleDrag(i(), e, true, false);
                    }}
                  />
                </div>
              ) : null}
            </>
          );
        }}
      </For>
    </Tag>
  );
};
