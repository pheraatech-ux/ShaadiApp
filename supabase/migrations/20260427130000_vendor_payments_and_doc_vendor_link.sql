-- vendor_payments: track individual payment instalments per vendor
CREATE TABLE IF NOT EXISTS vendor_payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id           uuid NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  wedding_id          uuid NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  amount_paise        bigint NOT NULL CHECK (amount_paise > 0),
  note                text,
  paid_at             timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  created_by_user_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS vendor_payments_vendor_id_idx ON vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS vendor_payments_wedding_id_idx ON vendor_payments(wedding_id);

ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;

-- Wedding members (planner + team) can manage payments
CREATE POLICY "vendor_payments_select_member"
  ON vendor_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM wedding_members wm
      WHERE wm.wedding_id = vendor_payments.wedding_id
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "vendor_payments_insert_member"
  ON vendor_payments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wedding_members wm
      WHERE wm.wedding_id = vendor_payments.wedding_id
        AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "vendor_payments_delete_member"
  ON vendor_payments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM wedding_members wm
      WHERE wm.wedding_id = vendor_payments.wedding_id
        AND wm.user_id = auth.uid()
    )
  );

-- Add vendor_id to documents so vendor-uploaded / vendor-linked docs can be filtered
ALTER TABLE documents ADD COLUMN IF NOT EXISTS vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS documents_vendor_id_idx ON documents(vendor_id);
