export type WeddingDocumentRecord = {
  id: string;
  title: string;
  description?: string;
  fileUrl: string | null;
  filePath?: string;
  category: "Client Contracts" | "Vendor Contracts" | "Employee Contracts" | "Other";
  uploadedBy: string;
  uploaderRole: string;
  uploaderInitials: string;
  createdAt: string;
  fileName?: string;
  fileSize?: string;
  fileType: "pdf" | "docx" | "xlsx" | "other";
};

export type WeddingDocumentsWorkspaceViewModel = {
  weddingId: string;
  weddingSlug: string;
  documents: WeddingDocumentRecord[];
  counts: {
    all: number;
    client: number;
    vendor: number;
    employee: number;
  };
};
