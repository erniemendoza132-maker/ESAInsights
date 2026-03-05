/*
  Warnings:

  - A unique constraint covering the columns `[providerMessageId]` on the table `SmsMessage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SmsMessage_providerMessageId_key" ON "SmsMessage"("providerMessageId");
