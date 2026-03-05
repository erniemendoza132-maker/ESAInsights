/*
  Warnings:

  - Added the required column `direction` to the `SmsMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fromPhone` to the `SmsMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SmsMessage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "TwilioConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subaccountSid" TEXT NOT NULL,
    "fromNumber" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TwilioConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SmsMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "buyerId" TEXT,
    "toPhone" TEXT NOT NULL,
    "fromPhone" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'twilio',
    "providerMessageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SmsMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SmsMessage_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SmsMessage" ("body", "buyerId", "createdAt", "id", "providerMessageId", "status", "toPhone", "userId") SELECT "body", "buyerId", "createdAt", "id", "providerMessageId", "status", "toPhone", "userId" FROM "SmsMessage";
DROP TABLE "SmsMessage";
ALTER TABLE "new_SmsMessage" RENAME TO "SmsMessage";
CREATE UNIQUE INDEX "SmsMessage_providerMessageId_key" ON "SmsMessage"("providerMessageId");
CREATE INDEX "SmsMessage_userId_createdAt_idx" ON "SmsMessage"("userId", "createdAt");
CREATE INDEX "SmsMessage_buyerId_idx" ON "SmsMessage"("buyerId");
CREATE INDEX "SmsMessage_toPhone_idx" ON "SmsMessage"("toPhone");
CREATE INDEX "SmsMessage_fromPhone_idx" ON "SmsMessage"("fromPhone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TwilioConnection_userId_key" ON "TwilioConnection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TwilioConnection_subaccountSid_key" ON "TwilioConnection"("subaccountSid");

-- CreateIndex
CREATE UNIQUE INDEX "TwilioConnection_fromNumber_key" ON "TwilioConnection"("fromNumber");
