-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'TASK_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE 'DOCUMENT_EXPIRING';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "documentNumber" TEXT,
ADD COLUMN     "extractedData" JSONB,
ADD COLUMN     "isMetadataConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "issueDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Scholarship" ADD COLUMN     "isVerifiedDeadline" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sourceVerificationDate" TIMESTAMP(3),
ADD COLUMN     "verificationSource" TEXT;

-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "calendarSyncDaysAhead" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "inAppReminders" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "StudentTask" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" TIMESTAMP(3),
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "scholarshipId" TEXT,
    "applicationId" TEXT,
    "requirementType" TEXT,
    "requirementKey" TEXT,
    "isSystemGenerated" BOOLEAN NOT NULL DEFAULT false,
    "reminderDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentTask_userId_isCompleted_idx" ON "StudentTask"("userId", "isCompleted");

-- CreateIndex
CREATE INDEX "StudentTask_userId_dueDate_idx" ON "StudentTask"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "StudentTask_userId_requirementKey_idx" ON "StudentTask"("userId", "requirementKey");

-- CreateIndex
CREATE INDEX "Document_userId_expiryDate_idx" ON "Document"("userId", "expiryDate");

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentTask" ADD CONSTRAINT "StudentTask_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE SET NULL ON UPDATE CASCADE;
