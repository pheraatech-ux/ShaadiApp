-- Auto-sync weddings.spent_budget_paise whenever budget_items changes.
-- Replaces the application-level syncWeddingBudgetSpent fetch-sum-write loop,
-- saving 2 DB round-trips per budget mutation.

CREATE OR REPLACE FUNCTION sync_wedding_spent_budget()
RETURNS TRIGGER AS $$
DECLARE
  target_wedding_id uuid;
BEGIN
  -- On DELETE the affected row is in OLD; on INSERT/UPDATE it's in NEW.
  target_wedding_id := COALESCE(NEW.wedding_id, OLD.wedding_id);

  UPDATE weddings
  SET spent_budget_paise = (
    SELECT COALESCE(SUM(spent_paise), 0)
    FROM budget_items
    WHERE wedding_id = target_wedding_id
  )
  WHERE id = target_wedding_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_wedding_spent_budget ON budget_items;

CREATE TRIGGER trg_sync_wedding_spent_budget
AFTER INSERT OR UPDATE OF spent_paise OR DELETE
ON budget_items
FOR EACH ROW
EXECUTE FUNCTION sync_wedding_spent_budget();
