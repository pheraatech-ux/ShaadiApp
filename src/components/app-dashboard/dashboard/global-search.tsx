"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { BookHeart, ClipboardList, Loader2, Search, Store } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SearchResult } from "@/app/api/search/route";

type Results = SearchResult | null;
type DropdownRect = { top: number; left: number; width: number };

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DropdownRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data: SearchResult = await res.json();
        setResults(data);
        updateRect();
        setOpen(true);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function updateRect() {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    setDropdownRect({ top: r.bottom + 4, left: r.left, width: r.width });
  }

  // Close on click outside — but NOT when clicking inside the portal dropdown
  useEffect(() => {
    function onMouse(e: MouseEvent) {
      const target = e.target as Node;
      const insideInput = containerRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideInput && !insideDropdown) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouse);
    return () => document.removeEventListener("mousedown", onMouse);
  }, []);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    function reposition() { updateRect(); }
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  const total = results
    ? results.weddings.length + results.tasks.length + results.vendors.length
    : 0;

  function navigate(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div ref={containerRef} className="relative hidden w-full max-w-sm items-center sm:flex">
      <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
      {loading && (
        <Loader2 className="pointer-events-none absolute right-3 size-4 animate-spin text-muted-foreground" />
      )}
      <input
        type="text"
        className="h-9 w-full rounded-xl border border-border/70 bg-muted/40 pl-9 pr-9 text-sm outline-none placeholder:text-muted-foreground focus:border-border focus:bg-background focus:ring-0"
        placeholder="Search weddings, tasks, vendors..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results && total > 0) { updateRect(); setOpen(true); } }}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        aria-label="Search"
        autoComplete="off"
      />

      {open && results && dropdownRect && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
              minWidth: 320,
              zIndex: 9999,
            }}
            className="overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
          >
            {total === 0 ? (
              <p className="px-4 py-5 text-center text-sm text-muted-foreground">No results found</p>
            ) : (
              <div className="max-h-[400px] overflow-y-auto py-1">
                {results.weddings.length > 0 && (
                  <Section label="Weddings">
                    {results.weddings.map((w) => (
                      <ResultRow
                        key={w.id}
                        icon={<BookHeart className="size-4 shrink-0 text-muted-foreground" />}
                        primary={w.coupleName}
                        secondary={w.city ?? undefined}
                        onClick={() => navigate(`${results.basePath}/weddings/${w.slug}`)}
                      />
                    ))}
                  </Section>
                )}
                {results.tasks.length > 0 && (
                  <Section label="Tasks">
                    {results.tasks.map((t) => (
                      <ResultRow
                        key={t.id}
                        icon={<ClipboardList className="size-4 shrink-0 text-muted-foreground" />}
                        primary={t.title}
                        secondary={t.weddingName}
                        onClick={() =>
                          navigate(`${results.basePath}/weddings/${t.weddingSlug}/tasks?task=${t.id}`)
                        }
                      />
                    ))}
                  </Section>
                )}
                {results.vendors.length > 0 && (
                  <Section label="Vendors">
                    {results.vendors.map((v) => (
                      <ResultRow
                        key={v.id}
                        icon={<Store className="size-4 shrink-0 text-muted-foreground" />}
                        primary={v.name}
                        secondary={v.category ?? v.weddingName}
                        onClick={() =>
                          navigate(`${results.basePath}/weddings/${v.weddingSlug}/vendors`)
                        }
                      />
                    ))}
                  </Section>
                )}
              </div>
            )}
          </div>,
          document.body
        )
      }
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </div>
  );
}

function ResultRow({
  icon,
  primary,
  secondary,
  onClick,
}: {
  icon: React.ReactNode;
  primary: string;
  secondary?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:outline-none"
      )}
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{primary}</span>
        {secondary && (
          <span className="block truncate text-xs text-muted-foreground">{secondary}</span>
        )}
      </span>
    </button>
  );
}
