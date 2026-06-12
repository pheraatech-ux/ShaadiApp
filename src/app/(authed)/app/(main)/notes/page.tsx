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
    <div className="relative -mx-4 -my-5 h-[calc(100svh-4rem)] overflow-hidden sm:-mx-6 sm:-my-6">
      <Suspense fallback={<NotesBoardSkeleton />}>
        <NotesPageContent />
      </Suspense>
    </div>
  );
}

function NotesBoardSkeleton() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-muted/40">
      <div className="absolute left-4 top-4 h-9 w-56 animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}
