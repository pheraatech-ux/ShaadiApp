"use client";

import { useEffect, useRef, useState } from "react";
import { CloudUpload, ExternalLink, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const BUCKET = "Wedding-Documents";
const SECTION_LABEL = "mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60";

type VendorDoc = {
  id: string;
  title: string;
  category: string;
  file_url: string | null;
  file_name: string | null;
  file_size_bytes: number | null;
  file_type: string | null;
  created_at: string;
};

type VendorDocumentsTabProps = {
  weddingSlug: string;
  weddingId: string;
  vendorId: string;
};

function fmtSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function sanitize(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

const DOC_ICON_CLASS: Record<string, string> = {
  pdf: "text-red-400",
  docx: "text-sky-400",
  xlsx: "text-emerald-400",
};

export function VendorDocumentsTab({ weddingSlug, weddingId, vendorId }: VendorDocumentsTabProps) {
  const [docs, setDocs] = useState<VendorDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const apiBase = `/api/weddings/${weddingSlug}/vendors/${vendorId}/documents`;

  useEffect(() => {
    fetch(apiBase, { credentials: "include" })
      .then((r) => r.json())
      .then((data: unknown) => setDocs(Array.isArray(data) ? (data as VendorDoc[]) : []))
      .catch(() => toast.error("Failed to load documents."))
      .finally(() => setLoading(false));
  }, [apiBase]);

  function handleFileSelect(f: File | null) {
    if (!f) return;
    setFile(f);
    if (!docTitle) setDocTitle(f.name.replace(/\.[^.]+$/, ""));
  }

  async function handleUpload() {
    if (!file || !docTitle.trim() || uploading) return;
    setUploading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const storagePath = `${weddingId}/${crypto.randomUUID()}/${sanitize(file.name)}`;

      const { error: storageErr } = await supabase.storage
        .from(BUCKET)
        .upload(storagePath, file, { upsert: false, contentType: file.type });

      if (storageErr) { toast.error("File upload failed."); return; }

      const ext = file.name.split(".").pop()?.toLowerCase() ?? "other";
      const fileType = ["pdf", "docx", "xlsx"].includes(ext) ? ext : ext || "other";

      const res = await fetch(`/api/weddings/${weddingSlug}/documents`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: docTitle.trim(),
          category: "Vendor Contracts",
          filePath: storagePath,
          fileName: file.name,
          fileSizeBytes: file.size,
          fileType,
          vendorId,
        }),
      });

      if (!res.ok) {
        await supabase.storage.from(BUCKET).remove([storagePath]);
        toast.error("Failed to save document.");
        return;
      }

      const saved: VendorDoc = await res.json();
      setDocs((prev) => [saved, ...prev]);
      setFile(null);
      setDocTitle("");
      setShowForm(false);
      toast.success(`"${saved.title}" uploaded.`);
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(doc: VendorDoc) {
    setDeletingId(doc.id);
    try {
      if (doc.file_url) {
        const supabase = getSupabaseBrowserClient();
        await supabase.storage.from(BUCKET).remove([doc.file_url]);
      }
      const res = await fetch(`/api/weddings/${weddingSlug}/documents/${doc.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      toast.success("Document deleted.");
    } catch {
      toast.error("Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  }

  async function getSignedUrl(filePath: string) {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 60);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast.error("Could not open file.");
  }

  return (
    <div className="space-y-5 px-6 py-6">
      <div className="flex items-center justify-between">
        <p className={cn(SECTION_LABEL, "mb-0")}>Documents</p>
        <Button size="sm" className="h-7 rounded-xl gap-1" onClick={() => setShowForm((v) => !v)}>
          <CloudUpload className="size-3.5" />
          Upload
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
          <p className="text-xs font-semibold">Upload document</p>
          <div className="space-y-1">
            <label className="text-[11px] text-muted-foreground">Document name *</label>
            <Input
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="e.g. Photography Contract"
              className="h-8 rounded-lg border-border/70 bg-muted/20 text-sm"
            />
          </div>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0] ?? null); }}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-4 text-center transition-colors cursor-pointer",
              dragOver ? "border-primary bg-primary/5" : file ? "border-primary/50 bg-primary/5" : "border-border/60 hover:border-border",
            )}
            onClick={() => fileRef.current?.click()}
          >
            {file ? (
              <>
                <FileText className="size-6 text-primary" />
                <p className="text-xs font-medium">{file.name}</p>
                <p className="text-[11px] text-muted-foreground">{fmtSize(file.size)}</p>
              </>
            ) : (
              <>
                <CloudUpload className="size-6 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Click or drag to upload</p>
                <p className="text-[11px] text-muted-foreground/60">PDF, DOC, XLS, JPG, PNG</p>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-7 rounded-xl"
              disabled={!file || !docTitle.trim() || uploading}
              onClick={handleUpload}
            >
              {uploading ? <Loader2 className="size-3.5 animate-spin" /> : null}
              {uploading ? "Uploading…" : "Upload"}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 rounded-xl" onClick={() => { setShowForm(false); setFile(null); setDocTitle(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : docs.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-border/60 py-12 text-center">
          <FileText className="mb-3 size-8 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">No documents yet</p>
          <p className="mt-1 text-xs text-muted-foreground/60">Contracts, invoices, and proposals go here.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/60 rounded-xl border border-border/70 overflow-hidden">
          {docs.map((doc) => {
            const ext = doc.file_type ?? "other";
            return (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3">
                <div className={cn("flex size-8 items-center justify-center rounded-lg bg-muted shrink-0", DOC_ICON_CLASS[ext] ?? "text-muted-foreground")}>
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{doc.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {doc.file_name ?? ""}
                    {doc.file_size_bytes ? ` · ${fmtSize(doc.file_size_bytes)}` : ""}
                    {` · ${fmtDate(doc.created_at)}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {doc.file_url && (
                    <button
                      type="button"
                      onClick={() => void getSignedUrl(doc.file_url!)}
                      className="rounded-lg p-1.5 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ExternalLink className="size-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleDelete(doc)}
                    disabled={deletingId === doc.id}
                    className="rounded-lg p-1.5 text-muted-foreground/40 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                  >
                    {deletingId === doc.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[11px] text-muted-foreground/50">
        Documents uploaded here appear in the wedding's Documents tab under Vendor Contracts.
      </p>
    </div>
  );
}
