/*
  Warnings:

  - The values [USER] on the enum `EntityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EntityType_new" AS ENUM ('users');
ALTER TYPE "EntityType" RENAME TO "EntityType_old";
ALTER TYPE "EntityType_new" RENAME TO "EntityType";
DROP TYPE "EntityType_old";
COMMIT;
