"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const EXPAND_DISTANCE = 80;

function getHorizontalPadding() {
  if (typeof window === "undefined") return 16;
  return window.matchMedia("(min-width: 640px)").matches ? 24 : 16;
}

function getScrollViewport(el: HTMLElement): HTMLElement | null {
  const host = el.closest(".os-host");
  const viewport = host?.querySelector(".os-viewport");
  if (viewport instanceof HTMLElement) return viewport;

  let parent: HTMLElement | null = el.parentElement;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

function getScrollTargets(shell: HTMLElement): HTMLElement[] {
  const targets: HTMLElement[] = [];
  const viewport = getScrollViewport(shell);
  if (viewport) targets.push(viewport);

  const main = shell.closest("main");
  if (main instanceof HTMLElement && !targets.includes(main)) {
    targets.push(main);
  }

  return targets;
}

type ToolbarLayout = {
  left: number;
  width: number;
  top: number;
  paddingX: number;
};

export function useToolbarScrollExpand() {
  const shellRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [layout, setLayout] = useState<ToolbarLayout>({
    left: 0,
    width: 0,
    top: 0,
    paddingX: 16,
  });
  const [barHeight, setBarHeight] = useState(0);

  const measure = useCallback(() => {
    const shell = shellRef.current;
    const bar = barRef.current;
    if (!shell) return;

    const inset = shell.closest('[data-slot="sidebar-inset"]') as HTMLElement | null;
    const mainColumn = shell.closest("main") as HTMLElement | null;
    const header = inset?.querySelector("header");
    const paddingX = getHorizontalPadding();

    const insetRect = inset?.getBoundingClientRect();
    const columnRect = mainColumn?.getBoundingClientRect();
    const headerRect = header?.getBoundingClientRect();
    const stickTop = headerRect?.bottom ?? insetRect?.top ?? 0;

    if (columnRect || insetRect) {
      setLayout({
        left: columnRect?.left ?? insetRect!.left,
        width: columnRect?.width ?? insetRect!.width,
        top: stickTop,
        paddingX,
      });
    }

    const shellRect = shell.getBoundingClientRect();
    const scrolled = stickTop - shellRect.top;
    const next = Math.min(1, Math.max(0, scrolled / EXPAND_DISTANCE));
    setProgress((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));

    if (bar) {
      setBarHeight(bar.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const boundTargets = new Set<HTMLElement>();
    let raf = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    const bindScrollTargets = () => {
      const targets = getScrollTargets(shell);
      if (targets.length === 0) {
        retryTimer = setTimeout(bindScrollTargets, 50);
        return;
      }

      for (const target of targets) {
        if (boundTargets.has(target)) continue;
        target.addEventListener("scroll", onScroll, { passive: true });
        boundTargets.add(target);
      }

      measure();
    };

    bindScrollTargets();
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });

    const inset = shell.closest('[data-slot="sidebar-inset"]');
    const osHost = shell.closest(".os-host");

    const resizeObserver =
      typeof ResizeObserver !== "undefined" && inset ? new ResizeObserver(onScroll) : null;
    if (resizeObserver && inset) {
      resizeObserver.observe(inset);
    }

    const mutationObserver =
      typeof MutationObserver !== "undefined" && osHost
        ? new MutationObserver(() => {
            bindScrollTargets();
            onScroll();
          })
        : null;
    if (mutationObserver && osHost) {
      mutationObserver.observe(osHost, { childList: true, subtree: true });
    }

    measure();

    return () => {
      clearTimeout(retryTimer);
      cancelAnimationFrame(raf);
      for (const target of boundTargets) {
        target.removeEventListener("scroll", onScroll);
      }
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [measure]);

  const isFloating = progress > 0;
  const inset = layout.paddingX * (1 - progress);

  return {
    shellRef,
    barRef,
    progress,
    layout,
    barHeight,
    isFloating,
    floatStyle: isFloating
      ? {
          position: "fixed" as const,
          top: layout.top,
          left: layout.left + inset,
          width: layout.width - inset * 2,
          zIndex: 30,
        }
      : undefined,
  };
}
