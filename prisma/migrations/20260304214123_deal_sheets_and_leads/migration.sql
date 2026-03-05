/*
  Warnings:

  - You are about to drop the column `shareSlug` on the `DealSheet` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `DealSheet` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `arv` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `asking` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `baths` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `beds` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `lotSqft` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `repairs` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `sqft` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `yearBuilt` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `currentPeriodEnd` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `priceId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `clerkUserId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `DealSheet` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DealSheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "arv" INTEGER,
    "rehab" INTEGER,
    "assignmentFee" INTEGER,
    "closingCosts" INTEGER,
    "holdingCosts" INTEGER,
    "mao" INTEGER,
    CONSTRAINT "DealSheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DealSheet_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_DealSheet" ("createdAt", "id", "leadId", "userId") SELECT "createdAt", "id", "leadId", "userId" FROM "DealSheet";
DROP TABLE "DealSheet";
ALTER TABLE "new_DealSheet" RENAME TO "DealSheet";
CREATE INDEX "DealSheet_userId_idx" ON "DealSheet"("userId");
CREATE INDEX "DealSheet_leadId_idx" ON "DealSheet"("leadId");
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE INDEX "Lead_userId_idx" ON "Lead"("userId");
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "updatedAt") SELECT "createdAt", "email", "id", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
