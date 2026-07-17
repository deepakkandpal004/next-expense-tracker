-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "cadence" TEXT NOT NULL DEFAULT 'monthly',
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Budget_userId_cadence_effectiveFrom_key"
ON "Budget"("userId", "cadence", "effectiveFrom");

-- CreateIndex
CREATE INDEX "Budget_userId_effectiveFrom_idx"
ON "Budget"("userId", "effectiveFrom");

-- AddForeignKey
ALTER TABLE "Budget"
ADD CONSTRAINT "Budget_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
