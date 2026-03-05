/*
  Warnings:

  - You are about to drop the column `email` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Lead` table. All the data in the column will be lost.
  - You are about to alter the column `baths` on the `Lead` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "beds" INTEGER,
    "baths" INTEGER,
    "sqft" INTEGER,
    "lotSqft" INTEGER,
    "yearBuilt" INTEGER,
    "arv" INTEGER,
    "repairs" INTEGER,
    "asking" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'new',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lead" ("address", "baths", "beds", "city", "createdAt", "id", "notes", "sqft", "state", "updatedAt", "userId", "zip") SELECT "address", "baths", "beds", "city", "createdAt", "id", "notes", "sqft", "state", "updatedAt", "userId", "zip" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE INDEX "Lead_userId_idx" ON "Lead"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
