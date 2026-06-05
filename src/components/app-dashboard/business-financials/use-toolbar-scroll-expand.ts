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
    const header = inset?.querySelector("header");
    const viewport = getScrollViewport(shell);
    const paddingX = getHorizontalPadding();

    if (inset) {
      const insetRect = inset.getBoundingClientRect();
      const headerRect = header?.getBoundingClientRect();
      setLayout({
        left: insetRect.left,
        width: insetRect.width,
        top: headerRect?.bottom ?? insetRect.top,
        paddingX,
      });
    }

    if (viewport) {
      const next = Math.min(1, Math.max(0, viewport.scrollTop / EXPAND_DISTANCE));
      setProgress((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
    }

    if (bar) {
      setBarHeight(bar.offsetHeight);
    }
  }, []);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    let viewport: HTMLElement | null = null;
    let raf = 0;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    const bindViewport = () => {
      const next = getScrollViewport(shell);
      if (!next) {
        retryTimer = setTimeout(bindViewport, 50);
        return;
      }
      if (viewport === next) return;
      viewport?.removeEventListener("scroll", onScroll);
      viewport = next;
      viewport.addEventListener("scroll", onScroll, { passive: true });
      measure();
    };

    bindViewport();
    window.addEventListener("resize", onScroll);

    const inset = shell.closest('[data-slot="sidebar-inset"]');
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && inset
        ? new ResizeObserver(onScroll)
        : null;
    resizeObserver?.observe(inset);

    measure();

    return () => {
      clearTimeout(retryTimer);
      cancelAnimationFrame(raf);
      viewport?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      resizeObserver?.disconnect();
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
