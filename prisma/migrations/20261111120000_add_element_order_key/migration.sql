-- Additive first step: existing integer positions remain authoritative until
-- all writers and cached documents have been migrated together.
ALTER TABLE "Element" ADD COLUMN "OrderKey" TEXT COLLATE "C";

CREATE INDEX "Element_PageId_OrderKey_idx" ON "Element"("PageId", "OrderKey");
CREATE INDEX "Element_ParentId_OrderKey_idx" ON "Element"("ParentId", "OrderKey");
