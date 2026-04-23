import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { WeddingMessageItem } from "@/components/wedding-workspace/messages/types";

export function messagesQueryKey(weddingSlug: string) {
  return ["messages", weddingSlug] as const;
}

async function fetchMessages(weddingSlug: string): Promise<WeddingMessageItem[]> {
  const res = await fetch(`/api/weddings/${weddingSlug}/messages`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch messages");
  const data = (await res.json()) as { messages: WeddingMessageItem[] };
  return data.messages;
}

export function useMessagesQuery(weddingSlug: string, initialData: WeddingMessageItem[]) {
  return useQuery({
    queryKey: messagesQueryKey(weddingSlug),
    queryFn: () => fetchMessages(weddingSlug),
    initialData,
    initialDataUpdatedAt: Date.now(),
    staleTime: 30 * 1000,
  });
}

export function useInvalidateMessages(weddingSlug: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: messagesQueryKey(weddingSlug) });
}
