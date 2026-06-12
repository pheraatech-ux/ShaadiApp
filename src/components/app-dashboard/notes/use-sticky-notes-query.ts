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

/**
 * Direct cache mutation helpers — used for instant optimistic updates
 * and for pushing realtime events from other users without a round-trip.
 */
export function useNotesCache() {
  const queryClient = useQueryClient();

  function getSnapshot(visibility: NoteVisibility): StickyNote[] {
    return queryClient.getQueryData(notesQueryKey(visibility)) ?? [];
  }

  function setNotes(visibility: NoteVisibility, updater: (prev: StickyNote[]) => StickyNote[]) {
    queryClient.setQueryData(notesQueryKey(visibility), updater);
  }

  function invalidate(visibility?: NoteVisibility) {
    if (visibility) {
      void queryClient.invalidateQueries({ queryKey: notesQueryKey(visibility) });
    } else {
      void queryClient.invalidateQueries({ queryKey: ["sticky-notes"] });
    }
  }

  /** Prepend a note to the correct tab's cache immediately. */
  function pushNote(note: StickyNote) {
    setNotes(note.visibility, (prev) => {
      if (prev.some((n) => n.id === note.id)) return prev;
      return [note, ...prev];
    });
  }

  /** Apply a partial patch to a note in whichever tab it lives in. */
  function patchNote(id: string, patch: Partial<StickyNote>) {
    for (const vis of ["public", "private"] as NoteVisibility[]) {
      setNotes(vis, (prev) => prev.map((n) => (n.id === id ? { ...n, ...patch } : n)));
    }
  }

  /** Remove a note from whichever tab it lives in. */
  function removeNote(id: string) {
    for (const vis of ["public", "private"] as NoteVisibility[]) {
      setNotes(vis, (prev) => prev.filter((n) => n.id !== id));
    }
  }

  /** Swap a temp id for the real one once the server confirms. */
  function confirmNote(tempId: string, realNote: StickyNote) {
    setNotes(realNote.visibility, (prev) =>
      prev.map((n) => (n.id === tempId ? realNote : n)),
    );
  }

  return { getSnapshot, setNotes, invalidate, pushNote, patchNote, removeNote, confirmNote };
}
