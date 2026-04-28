"use client";

import { useMemo, useState } from "react";
import { Info, ChevronDown, Upload, Search } from "lucide-react";
import { toast } from "sonner";

import type { WeddingDocumentsWorkspaceViewModel, WeddingDocumentRecord } from "./types";
import { DocumentListView } from "./document-list-view";
import { UploadDocumentDialog } from "./upload-document-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type WeddingDocumentsWorkspaceProps = {
  viewData: WeddingDocumentsWorkspaceViewModel;
};

type SortOrder = "newest" | "oldest";

const CATEGORIES = [
  { id: "all", label: "All Documents", countKey: "all" as const },
  { id: "Client Contracts", label: "Client Contracts", countKey: "client" as const },
  { id: "Vendor Contracts", label: "Vendor Contracts", countKey: "vendor" as const },
  { id: "Employee Contracts", label: "Employee Contracts", countKey: "employee" as const },
];

export function WeddingDocumentsWorkspace({ viewData }: WeddingDocumentsWorkspaceProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [docs, setDocs] = useState<WeddingDocumentRecord[]>(viewData.documents);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [search, setSearch] = useState("");

  const counts = {
    all: docs.length,
    client: docs.filter((d) => d.category === "Client Contracts").length,
    vendor: docs.filter((d) => d.category === "Vendor Contracts").length,
    employee: docs.filter((d) => d.category === "Employee Contracts").length,
  };

  const visibleDocuments = useMemo(() => {
    let result = docs.filter((doc) =>
      activeCategory === "all" || doc.category === activeCategory
    );

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (doc) =>
          doc.title.toLowerCase().includes(q) ||
          doc.description?.toLowerCase().includes(q) ||
          doc.uploadedBy.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === "newest" ? -diff : diff;
    });

    return result;
  }, [docs, activeCategory, search, sort]);

  function handleUploaded(doc: WeddingDocumentRecord) {
    setDocs((prev) => [doc, ...prev]);
  }

  async function handleDelete(id: string) {
    const doc = docs.find((d) => d.id === id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
    try {
      const res = await fetch(
        `/api/weddings/${viewData.weddingSlug}/documents/${id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) throw new Error();
      toast.success(`"${doc?.title}" deleted.`);
    } catch {
      setDocs((prev) => {
        const exists = prev.find((d) => d.id === id);
        if (exists) return prev;
        const original = viewData.documents.find((d) => d.id === id);
        return original ? [original, ...prev] : prev;
      });
      toast.error("Failed to delete document. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Documents</h1>
          <UploadDocumentDialog
            weddingId={viewData.weddingId}
            weddingSlug={viewData.weddingSlug}
            onSuccess={handleUploaded}
            trigger={
              <Button className="h-9 gap-2 rounded-xl bg-violet-600 px-4 text-[13px] font-semibold text-white shadow-sm hover:bg-violet-700">
                <Upload className="size-3.5" />
                Upload Document
              </Button>
            }
          />
        </div>
        <p className="text-[15px] text-muted-foreground">
          Store and manage all your important contracts in one place.
        </p>
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Info className="size-3.5" />
          <span>Upload limit: 10MB per file</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-medium transition-all",
                  isActive
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground dark:bg-muted/20 dark:hover:bg-muted/40"
                )}
              >
                {cat.label}
                <span
                  className={cn(
                    "flex min-w-[20px] items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                    isActive
                      ? "bg-violet-200 text-violet-700 dark:bg-violet-800/60 dark:text-violet-300"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {counts[cat.countKey]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="h-9 w-52 rounded-xl pl-8 text-[13px]"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSort((s) => (s === "newest" ? "oldest" : "newest"))}
            className="h-9 gap-1.5 rounded-xl border-border/60 bg-card px-4 text-[13px] font-medium shadow-sm"
          >
            Sort: {sort === "newest" ? "Newest" : "Oldest"}
            <ChevronDown className={cn("size-3.5 text-muted-foreground transition-transform", sort === "oldest" && "rotate-180")} />
          </Button>
        </div>
      </div>

      {/* Document Table */}
      {visibleDocuments.length > 0 ? (
        <DocumentListView documents={visibleDocuments} onDelete={handleDelete} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card py-24 text-center shadow-sm">
          <Upload className="mb-3 size-10 text-muted-foreground/40" />
          <h3 className="text-base font-semibold text-foreground">
            {search ? "No documents match your search" : "No documents yet"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try a different search term." : "No documents in this category."}
          </p>
        </div>
      )}
    </div>
  );
}
