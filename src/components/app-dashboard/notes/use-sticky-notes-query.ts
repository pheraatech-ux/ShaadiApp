import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { StickyNote, NoteVisibility } from "@/components/app-dashboard/notes/types";

export function notesQueryKey(visibility: NoteVisibility) {
  return ["sticky-notes", visibility] as const;
}

async function fetchNotes(visibility: NoteVisibility): Promise<StickyNote[]> {
  const res = await fetch(`/api/notes?tab=${visibility}`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch notes");
  const data = (await res.json()) as { notes: StickyNote[] };
  return data.notes;
}

export function useStickyNotesQuery(visibility: NoteVisibility, initialData: StickyNote[]) {
  return useQuery({
    queryKey: notesQueryKey(visibility),
    queryFn: () => fetchNotes(visibility),
    initialData,
    initialDataUpdatedAt: Date.now(),
    staleTime: 30 * 1000,
  });
}

export function useInvalidateNotes() {
  const queryClient = useQueryClient();
  return (visibility?: NoteVisibility) => {
    if (visibility) {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey(visibility) });
    } else {
      void queryClient.invalidateQueries({ queryKey: ["sticky-notes"] });
    }
  };
}
