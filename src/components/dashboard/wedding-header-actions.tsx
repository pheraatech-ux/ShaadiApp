import { ArrowRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

type WeddingHeaderActionsProps = {
  onCreateWedding?: () => void;
  onViewAll?: () => void;
};

export function WeddingHeaderActions({
  onCreateWedding,
  onViewAll,
}: WeddingHeaderActionsProps) {
  return (
    <>
      <Button variant="outline" size="sm" className="rounded-xl" onClick={onCreateWedding}>
        <Plus />
        New wedding
      </Button>
      <Button variant="ghost" size="sm" className="rounded-xl" onClick={onViewAll}>
        View all
        <ArrowRight />
      </Button>
    </>
  );
}
