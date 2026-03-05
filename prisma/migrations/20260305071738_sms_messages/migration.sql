-- CreateTable
CREATE TABLE "SmsMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toPhone" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT,
    "providerMessageId" TEXT,
    "buyerId" TEXT,
    CONSTRAINT "SmsMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SmsMessage_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SmsMessage_userId_idx" ON "SmsMessage"("userId");

-- CreateIndex
CREATE INDEX "SmsMessage_buyerId_idx" ON "SmsMessage"("buyerId");
