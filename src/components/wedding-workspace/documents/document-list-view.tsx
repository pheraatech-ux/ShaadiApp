"use client";

import { useState } from "react";
import { MoreVertical, ExternalLink, Download, Trash2, File as FileIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { WeddingDocumentRecord } from "./types";

const BUCKET = "Wedding-Documents";

type DocumentListViewProps = {
  documents: WeddingDocumentRecord[];
  onDelete?: (id: string) => void;
};

function getAvatarColor(initials: string): string {
  const palette = [
    "bg-violet-700",
    "bg-purple-600",
    "bg-indigo-700",
    "bg-fuchsia-700",
    "bg-violet-600",
    "bg-purple-700",
  ];
  const n = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  return palette[n % palette.length];
}

function getFileIcon(type: WeddingDocumentRecord["fileType"]) {
  switch (type) {
    case "pdf":
      return (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-500 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wide text-white">PDF</span>
        </div>
      );
    case "docx":
      return (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-wide text-white">DOCX</span>
        </div>
      );
    case "xlsx":
      return (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-wide text-white">XLSX</span>
        </div>
      );
    default:
      return (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-400 shadow-sm">
          <FileIcon className="size-5 text-white" />
        </div>
      );
  }
}

function getCategoryBadge(category: WeddingDocumentRecord["category"]) {
  switch (category) {
    case "Client Contracts":
      return (
        <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-[12px] font-medium text-indigo-600 dark:border-indigo-900/30 dark:bg-indigo-900/20 dark:text-indigo-400">
          Client Contracts
        </Badge>
      );
    case "Vendor Contracts":
      return (
        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[12px] font-medium text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400">
          Vendor Contracts
        </Badge>
      );
    case "Employee Contracts":
      return (
        <Badge variant="outline" className="border-orange-200 bg-orange-50 text-[12px] font-medium text-orange-600 dark:border-orange-900/30 dark:bg-orange-900/20 dark:text-orange-400">
          Employee Contracts
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="text-[12px] font-medium">
          {category}
        </Badge>
      );
  }
}

function DocumentRow({ doc, onDelete }: { doc: WeddingDocumentRecord; onDelete?: (id: string) => void }) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loadingView, setLoadingView] = useState(false);
  const [loadingDownload, setLoadingDownload] = useState(false);

  async function handleView() {
    if (!doc.filePath) return;
    setLoadingView(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(doc.filePath, 3600);
      if (error || !data?.signedUrl) throw error;
      window.open(data.signedUrl, "_blank");
    } catch {
      toast.error("Could not open document.");
    } finally {
      setLoadingView(false);
      setPopoverOpen(false);
    }
  }

  async function handleDownload() {
    if (!doc.filePath) return;
    setLoadingDownload(true);
    try {
      const supabase = getSupabaseBrowserClient();
      // Pass download filename so Supabase sets Content-Disposition: attachment
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(doc.filePath, 60, { download: doc.title });
      if (error || !data?.signedUrl) throw error;
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = doc.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch {
      toast.error("Could not download document.");
    } finally {
      setLoadingDownload(false);
      setPopoverOpen(false);
    }
  }

  function handleDeleteClick() {
    setPopoverOpen(false);
    setDeleteDialogOpen(true);
  }

  const busy = loadingView || loadingDownload;

  return (
    <>
      <article className="grid grid-cols-1 gap-2 px-6 py-4 transition-colors hover:bg-muted/20 md:grid-cols-[3fr_1.5fr_1.5fr_1.2fr_0.8fr_0.4fr] md:items-center md:gap-4">
        {/* Document Name */}
        <div className="flex items-center gap-3.5 min-w-0">
          {getFileIcon(doc.fileType)}
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-foreground">{doc.title}</p>
            {doc.fileName && (
              <p className="truncate text-[11px] text-muted-foreground">{doc.fileName}</p>
            )}
            {doc.description && (
              <p className="truncate text-[11px] text-muted-foreground/70">{doc.description}</p>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="flex justify-center">
          {getCategoryBadge(doc.category)}
        </div>

        {/* Uploaded By */}
        <div className="flex items-center justify-center gap-2.5">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className={cn("text-[11px] font-bold text-white", getAvatarColor(doc.uploaderInitials))}>
              {doc.uploaderInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-foreground">{doc.uploadedBy}</p>
            <p className="truncate text-[11px] text-muted-foreground">{doc.uploaderRole}</p>
          </div>
        </div>

        {/* Uploaded On */}
        <div className="flex flex-col items-center text-center">
          <span className="text-[13px] text-foreground">{format(new Date(doc.createdAt), "d MMM, yyyy")}</span>
          <span className="text-[11px] text-muted-foreground">{format(new Date(doc.createdAt), "h:mm a")}</span>
        </div>

        {/* Size */}
        <div className="text-center text-[13px] text-foreground">
          {doc.fileSize ?? "—"}
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "size-8 rounded-lg text-muted-foreground hover:text-foreground"
              )}
            >
              <MoreVertical className="size-4" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1">
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start font-normal"
                  disabled={!doc.filePath || busy}
                  onClick={handleView}
                >
                  {loadingView
                    ? <Loader2 className="mr-2 size-4 animate-spin text-muted-foreground" />
                    : <ExternalLink className="mr-2 size-4 text-muted-foreground" />}
                  View Document
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start font-normal"
                  disabled={!doc.filePath || busy}
                  onClick={handleDownload}
                >
                  {loadingDownload
                    ? <Loader2 className="mr-2 size-4 animate-spin text-muted-foreground" />
                    : <Download className="mr-2 size-4 text-muted-foreground" />}
                  Download
                </Button>
                <div className="my-1 h-px bg-border/60" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={handleDeleteClick}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </article>

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">&ldquo;{doc.title}&rdquo;</span> will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => onDelete?.(doc.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function DocumentListView({ documents, onDelete }: DocumentListViewProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
      {/* Column headers */}
      <header className="hidden grid-cols-[3fr_1.5fr_1.5fr_1.2fr_0.8fr_0.4fr] items-center gap-4 border-b border-border/60 bg-muted/20 px-6 py-3.5 text-[13px] font-medium text-muted-foreground md:grid">
        <span>Document Name</span>
        <span className="text-center">Category</span>
        <span className="text-center">Uploaded By</span>
        <span className="text-center">Uploaded On</span>
        <span className="text-center">Size</span>
        <span />
      </header>

      <div className="divide-y divide-border/50">
        {documents.map((doc) => (
          <DocumentRow key={doc.id} doc={doc} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}
