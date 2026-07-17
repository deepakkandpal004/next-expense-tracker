-- CreateTable
CREATE TABLE "MutationRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "recordId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MutationRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MutationRequest_userId_requestId_operation_key" ON "MutationRequest"("userId", "requestId", "operation");

-- CreateIndex
CREATE INDEX "MutationRequest_userId_idx" ON "MutationRequest"("userId");
