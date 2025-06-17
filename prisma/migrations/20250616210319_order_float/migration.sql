/*
  Warnings:

  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "orderFloat" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "entityType" SET DEFAULT 'tasks',
DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO';
