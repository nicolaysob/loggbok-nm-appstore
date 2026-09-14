-- CreateTable
CREATE TABLE "CustomerMessageReply" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CustomerMessageReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CustomerMessageReply_messageId_createdAt_idx" ON "CustomerMessageReply"("messageId", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerMessageReply_userId_idx" ON "CustomerMessageReply"("userId");

-- AddForeignKey
ALTER TABLE "CustomerMessageReply" ADD CONSTRAINT "CustomerMessageReply_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "CustomerMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerMessageReply" ADD CONSTRAINT "CustomerMessageReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
