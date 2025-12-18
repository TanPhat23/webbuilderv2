-- Remove ProjectId from Element if it exists (shouldn't be there)
ALTER TABLE "Element" DROP COLUMN IF EXISTS "ProjectId";

-- Add IsLocked column if it doesn't exist
ALTER TABLE "Element" ADD COLUMN IF NOT EXISTS "IsLocked" BOOLEAN NOT NULL DEFAULT false;

-- Create index on IsLocked
CREATE INDEX IF NOT EXISTS "Element_IsLocked_idx" ON "Element"("IsLocked");
