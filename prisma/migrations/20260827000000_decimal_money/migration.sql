-- AlterTable: Convert money columns from Float to Decimal(15,2)

-- Record.amount
ALTER TABLE "Record" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15, 2);

-- Budget.amount
ALTER TABLE "Budget" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15, 2);

-- Goal money columns
ALTER TABLE "Goal" ALTER COLUMN "targetAmount" SET DATA TYPE DECIMAL(15, 2);
ALTER TABLE "Goal" ALTER COLUMN "currentAmount" SET DATA TYPE DECIMAL(15, 2);
ALTER TABLE "Goal" ALTER COLUMN "monthlyContribution" SET DATA TYPE DECIMAL(15, 2);

-- RecurringRecord.amount
ALTER TABLE "RecurringRecord" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(15, 2);
