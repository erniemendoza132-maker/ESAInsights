/*
  Warnings:

  - You are about to drop the column `bets` on the `Lead` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "tags" TEXT,
    "beds" INTEGER,
    "baths" REAL,
    "sqft" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("address", "baths", "city", "createdAt", "email", "id", "name", "notes", "phone", "source", "sqft", "state", "tags", "updatedAt", "userId", "zip") SELECT "address", "baths", "city", "createdAt", "email", "id", "name", "notes", "phone", "source", "sqft", "state", "tags", "updatedAt", "userId", "zip" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE INDEX "Lead_userId_idx" ON "Lead"("userId");
CREATE UNIQUE INDEX "Lead_userId_phone_key" ON "Lead"("userId", "phone");
CREATE UNIQUE INDEX "Lead_userId_email_key" ON "Lead"("userId", "email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
