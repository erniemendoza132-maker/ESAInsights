/*
  Warnings:

  - You are about to drop the column `arv` on the `DealSheet` table. All the data in the column will be lost.
  - You are about to drop the column `assignmentFee` on the `DealSheet` table. All the data in the column will be lost.
  - You are about to drop the column `closingCosts` on the `DealSheet` table. All the data in the column will be lost.
  - You are about to drop the column `holdingCosts` on the `DealSheet` table. All the data in the column will be lost.
  - You are about to drop the column `mao` on the `DealSheet` table. All the data in the column will be lost.
  - You are about to drop the column `rehab` on the `DealSheet` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `DealSheet` table. All the data in the column will be lost.
  - Added the required column `shareSlug` to the `DealSheet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `DealSheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "address" TEXT;
ALTER TABLE "Lead" ADD COLUMN "baths" INTEGER;
ALTER TABLE "Lead" ADD COLUMN "beds" INTEGER;
ALTER TABLE "Lead" ADD COLUMN "city" TEXT;
ALTER TABLE "Lead" ADD COLUMN "notes" TEXT;
ALTER TABLE "Lead" ADD COLUMN "sqft" INTEGER;
ALTER TABLE "Lead" ADD COLUMN "state" TEXT;
ALTER TABLE "Lead" ADD COLUMN "status" TEXT;
ALTER TABLE "Lead" ADD COLUMN "zip" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN "currentPeriodEnd" DATETIME;
ALTER TABLE "Subscription" ADD COLUMN "priceId" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "status" TEXT;
ALTER TABLE "Subscription" ADD COLUMN "stripeSubscriptionId" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DealSheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "shareSlug" TEXT NOT NULL,
    CONSTRAINT "DealSheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DealSheet_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DealSheet" ("createdAt", "id", "leadId", "userId") SELECT "createdAt", "id", "leadId", "userId" FROM "DealSheet";
DROP TABLE "DealSheet";
ALTER TABLE "new_DealSheet" RENAME TO "DealSheet";
CREATE UNIQUE INDEX "DealSheet_shareSlug_key" ON "DealSheet"("shareSlug");
CREATE INDEX "DealSheet_userId_idx" ON "DealSheet"("userId");
CREATE INDEX "DealSheet_leadId_idx" ON "DealSheet"("leadId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT,
    "stripeCustomerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("clerkUserId", "createdAt", "email", "id", "updatedAt") SELECT "clerkUserId", "createdAt", "email", "id", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
