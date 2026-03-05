/*
  Warnings:

  - You are about to alter the column `Content` on the `Element` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2048)`.
  - You are about to drop the `Setting` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Setting" DROP CONSTRAINT "FK_Settings_Elements_ElementId";

-- AlterTable
ALTER TABLE "Element" ADD COLUMN     "Settings" JSONB,
ALTER COLUMN "Content" SET DATA TYPE VARCHAR(2048);

-- DropTable
DROP TABLE "Setting";
