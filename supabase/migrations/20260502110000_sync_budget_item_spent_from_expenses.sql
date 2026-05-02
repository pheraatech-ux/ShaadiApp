-- Auto-sync budget_items.spent_paise from sum of budget_expenses whenever expenses change.
CREATE OR REPLACE FUNCTION sync_budget_item_spent()
RETURNS TRIGGER AS $$
DECLARE
  target_item_id uuid;
BEGIN
  target_item_id := COALESCE(NEW.budget_item_id, OLD.budget_item_id);

  UPDATE budget_items
  SET spent_paise = (
    SELECT COALESCE(SUM(amount_paise), 0)
    FROM budget_expenses
    WHERE budget_item_id = target_item_id
  )
  WHERE id = target_item_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_budget_item_spent ON budget_expenses;

CREATE TRIGGER trg_sync_budget_item_spent
AFTER INSERT OR UPDATE OF amount_paise OR DELETE
ON budget_expenses
FOR EACH ROW
EXECUTE FUNCTION sync_budget_item_spent();
