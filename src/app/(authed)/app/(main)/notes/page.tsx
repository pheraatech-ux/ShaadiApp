import { Suspense } from "react";

import { StickyNotesBoard } from "@/components/app-dashboard/notes/sticky-notes-board";
import { getStickyNotesViewModel } from "@/components/app-dashboard/notes/notes-data";

export const metadata = { title: "Notes" };

async function NotesPageContent() {
  const view = await getStickyNotesViewModel();
  return <StickyNotesBoard view={view} />;
}

export default function NotesPage() {
  return (
    <div className="flex h-full flex-col p-6">
      <Suspense fallback={<NotesBoardSkeleton />}>
        <NotesPageContent />
      </Suspense>
    </div>
  );
}

function NotesBoardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="h-9 w-56 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-8 w-24 animate-pulse rounded-xl bg-muted/60" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </div>
    </div>
  );
}
