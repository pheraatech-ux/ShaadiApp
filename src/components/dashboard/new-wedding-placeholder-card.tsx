import { Plus } from "lucide-react";

type NewWeddingPlaceholderCardProps = {
  onCreateWedding?: () => void;
};

export function NewWeddingPlaceholderCard({
  onCreateWedding,
}: NewWeddingPlaceholderCardProps) {
  return (
    <button
      type="button"
      onClick={onCreateWedding}
      className="flex h-full min-h-[168px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/30 p-5 text-center transition-colors hover:bg-muted/50"
    >
      <span className="flex size-10 items-center justify-center rounded-full border border-dashed border-primary/60 bg-background">
        <Plus className="size-4 text-primary" />
      </span>
      <p className="mt-3 text-sm font-medium">Add new wedding</p>
      <p className="mt-1 text-xs text-muted-foreground">Create a new couple workspace</p>
    </button>
  );
}
