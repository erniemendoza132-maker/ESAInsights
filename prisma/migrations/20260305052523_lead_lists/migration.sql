/*
  Warnings:

  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "LeadList" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "LeadList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LeadListItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    CONSTRAINT "LeadListItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "LeadList" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeadListItem_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "email" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL
);
INSERT INTO "new_User" ("clerkUserId", "createdAt", "email", "id", "updatedAt") SELECT "clerkUserId", "createdAt", "email", "id", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "LeadList_userId_name_key" ON "LeadList"("userId", "name");

-- CreateIndex
CREATE INDEX "LeadListItem_listId_idx" ON "LeadListItem"("listId");

-- CreateIndex
CREATE INDEX "LeadListItem_leadId_idx" ON "LeadListItem"("leadId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadListItem_listId_leadId_key" ON "LeadListItem"("listId", "leadId");
