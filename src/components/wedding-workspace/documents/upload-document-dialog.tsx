"use client";

import { useRef, useState } from "react";
import { CloudUpload, Info, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { WeddingDocumentRecord } from "./types";

const DESCRIPTION_MAX = 300;
const BUCKET = "Wedding-Documents";

function deriveFileType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (ext === "doc" || ext === "docx") return "docx";
  if (ext === "xls" || ext === "xlsx") return "xlsx";
  return ext || "other";
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

type UploadDocumentDialogProps = {
  weddingId: string;
  weddingSlug: string;
  trigger: React.ReactNode;
  onSuccess?: (doc: WeddingDocumentRecord) => void;
};

export function UploadDocumentDialog({ weddingId, weddingSlug, trigger, onSuccess }: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setName("");
    setCategory("");
    setFile(null);
    setDragOver(false);
    setDescription("");
    setUploading(false);
  }

  function handleOpenChange(next: boolean) {
    if (uploading) return;
    setOpen(next);
    if (!next) reset();
  }

  function handleFile(incoming: File | null) {
    if (!incoming) return;
    setFile(incoming);
    if (!name) setName(incoming.name.replace(/\.[^.]+$/, ""));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }

  async function handleSubmit() {
    if (!name.trim() || !category || !file || uploading) return;
    setUploading(true);

    try {
      const supabase = getSupabaseBrowserClient();
      const ext = file.name.split(".").pop() ?? "";
      const uniqueId = crypto.randomUUID();
      const storagePath = `${weddingId}/${uniqueId}/${sanitizeName(file.name)}`;

      // 1. Upload file to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { upsert: false, contentType: file.type });

      if (storageError) {
        console.error("Storage upload error:", storageError);
        toast.error("File upload failed. Please try again.");
        return;
      }

      // 2. Save metadata via API
      const res = await fetch(`/api/weddings/${weddingSlug}/documents`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: name.trim(),
          category,
          description: description.trim() || null,
          filePath: storagePath,
          fileName: file.name,
          fileSizeBytes: file.size,
          fileType: deriveFileType(file.name),
        }),
      });

      if (!res.ok) {
        // Best-effort cleanup of orphaned storage file
        await supabase.storage.from(BUCKET).remove([storagePath]);
        toast.error("Failed to save document. Please try again.");
        return;
      }

      const saved = await res.json();

      const fullName = "You";
      const newDoc: WeddingDocumentRecord = {
        id: saved.id,
        title: saved.title,
        description: saved.description ?? undefined,
        fileUrl: saved.file_url,
        filePath: saved.file_url,
        category: saved.category,
        uploadedBy: fullName,
        uploaderRole: "Planner",
        uploaderInitials: name.slice(0, 2).toUpperCase(),
        createdAt: saved.created_at ?? new Date().toISOString(),
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        fileType: deriveFileType(file.name) as WeddingDocumentRecord["fileType"],
      };

      toast.success(`"${saved.title}" uploaded successfully.`);
      onSuccess?.(newDoc);
      handleOpenChange(false);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  const isValid = name.trim().length > 0 && category !== "" && file !== null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <span onClick={() => setOpen(true)} className="contents">
        {trigger}
      </span>

      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92vh] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3">
          <DialogTitle className="text-[15px] font-semibold text-foreground">
            Upload Document
          </DialogTitle>
          <button
            onClick={() => handleOpenChange(false)}
            disabled={uploading}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="size-3.5" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-3.5 overflow-y-auto px-5 py-4">
          {/* Document Name */}
          <div className="space-y-1">
            <label className="text-[13px] font-semibold text-foreground">
              Document Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Venue Contract – The Grand Palace"
              disabled={uploading}
              className="h-9 rounded-lg border-border/70 bg-background text-[13px] placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="text-[13px] font-semibold text-foreground">
              Category <span className="text-rose-500">*</span>
            </label>
            <Select value={category} onValueChange={(v) => setCategory(v ?? "")} disabled={uploading}>
              <SelectTrigger className="h-9 w-full rounded-lg border-border/70 bg-background text-[13px] data-placeholder:text-muted-foreground/60">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Client Contracts">Client Contracts</SelectItem>
                <SelectItem value="Vendor Contracts">Vendor Contracts</SelectItem>
                <SelectItem value="Employee Contracts">Employee Contracts</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Upload File */}
          <div className="space-y-1">
            <label className="text-[13px] font-semibold text-foreground">
              Upload File <span className="text-rose-500">*</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={uploading ? undefined : handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors",
                uploading && "pointer-events-none opacity-60",
                dragOver
                  ? "border-violet-500 bg-violet-50/60 dark:bg-violet-900/10"
                  : file
                  ? "border-violet-400 bg-violet-50/30 dark:bg-violet-900/10"
                  : "border-violet-300/70 bg-muted/20 hover:border-violet-400 hover:bg-violet-50/20 dark:border-violet-700/50 dark:hover:border-violet-600"
              )}
            >
              {file ? (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/40">
                    <CloudUpload className="size-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[13px] font-semibold text-foreground">{file.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {!uploading && (
                    <button
                      onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="text-[11px] font-medium text-rose-500 hover:underline"
                    >
                      Remove file
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex size-9 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-900/30">
                    <CloudUpload className="size-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-[13px] text-muted-foreground">Drag and drop your file here</p>
                  <p className="text-[12px] text-muted-foreground/50">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-md border border-violet-300 bg-white px-4 py-1.5 text-[13px] font-medium text-violet-600 transition-colors hover:bg-violet-50 dark:border-violet-700 dark:bg-transparent dark:text-violet-400 dark:hover:bg-violet-900/20"
                  >
                    Choose File
                  </button>
                  <div className="space-y-0.5">
                    <p className="text-[11px] text-muted-foreground/60">Max file size: 1GB per file</p>
                    <p className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground/60">
                      Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
                      <Info className="size-3" />
                    </p>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[13px] font-semibold text-foreground">
              Description{" "}
              <span className="font-normal text-muted-foreground">(Optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))}
                placeholder="Add a short description..."
                rows={3}
                disabled={uploading}
                className="w-full resize-none rounded-lg border border-border/70 bg-background px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 disabled:opacity-60"
              />
              <span className="absolute right-2.5 bottom-2.5 text-[10px] text-muted-foreground/50">
                {description.length}/{DESCRIPTION_MAX}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border/60 px-5 py-3">
          <button
            onClick={() => handleOpenChange(false)}
            disabled={uploading}
            className="rounded-lg border border-border/60 bg-background px-4 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || uploading}
            className={cn(
              "flex items-center gap-2 rounded-lg px-5 py-1.5 text-[13px] font-semibold text-white transition-all",
              isValid && !uploading
                ? "bg-violet-600 hover:bg-violet-700 active:scale-[0.98]"
                : "cursor-not-allowed bg-violet-300 dark:bg-violet-900/50 dark:text-violet-400"
            )}
          >
            {uploading && <Loader2 className="size-3.5 animate-spin" />}
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
