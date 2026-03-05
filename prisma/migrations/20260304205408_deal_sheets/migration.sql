-- CreateTable
CREATE TABLE "DealSheet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "shareSlug" TEXT NOT NULL,
    CONSTRAINT "DealSheet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DealSheet_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "DealSheet_shareSlug_key" ON "DealSheet"("shareSlug");

-- CreateIndex
CREATE INDEX "DealSheet_userId_idx" ON "DealSheet"("userId");

-- CreateIndex
CREATE INDEX "DealSheet_leadId_idx" ON "DealSheet"("leadId");
