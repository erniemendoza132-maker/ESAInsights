/*
  Warnings:

  - You are about to drop the column `company` on the `Buyer` table. All the data in the column will be lost.
  - Made the column `phone` on table `Buyer` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "BuyerTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "buyerId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "BuyerTag_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Buyer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "markets" TEXT,
    "notes" TEXT,
    CONSTRAINT "Buyer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Buyer" ("createdAt", "email", "id", "markets", "name", "notes", "phone", "updatedAt", "userId") SELECT "createdAt", "email", "id", "markets", "name", "notes", "phone", "updatedAt", "userId" FROM "Buyer";
DROP TABLE "Buyer";
ALTER TABLE "new_Buyer" RENAME TO "Buyer";
CREATE INDEX "Buyer_userId_idx" ON "Buyer"("userId");
CREATE UNIQUE INDEX "Buyer_userId_phone_key" ON "Buyer"("userId", "phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "BuyerTag_buyerId_idx" ON "BuyerTag"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerTag_buyerId_tag_key" ON "BuyerTag"("buyerId", "tag");
