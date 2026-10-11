-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ONE_TIME', 'INSTALLMENTS', 'VARIABLE');

-- AlterTable
ALTER TABLE "Scholarship" ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'ONE_TIME';

-- CreateTable
CREATE TABLE "ScholarshipInstallment" (
    "id" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "installmentNo" INTEGER NOT NULL,
    "name" TEXT,
    "amount" INTEGER NOT NULL,
    "description" TEXT,
    "expectedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScholarshipInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicationDisbursement" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "installmentId" TEXT,
    "installmentNo" INTEGER,
    "amount" INTEGER NOT NULL,
    "status" "DisbursementStatus" NOT NULL DEFAULT 'PENDING',
    "referenceCode" TEXT,
    "notes" TEXT,
    "disbursedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicationDisbursement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScholarshipInstallment_scholarshipId_idx" ON "ScholarshipInstallment"("scholarshipId");

-- CreateIndex
CREATE UNIQUE INDEX "ScholarshipInstallment_scholarshipId_installmentNo_key" ON "ScholarshipInstallment"("scholarshipId", "installmentNo");

-- CreateIndex
CREATE INDEX "ApplicationDisbursement_applicationId_idx" ON "ApplicationDisbursement"("applicationId");

-- CreateIndex
CREATE INDEX "ApplicationDisbursement_status_idx" ON "ApplicationDisbursement"("status");

-- AddForeignKey
ALTER TABLE "ScholarshipInstallment" ADD CONSTRAINT "ScholarshipInstallment_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDisbursement" ADD CONSTRAINT "ApplicationDisbursement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicationDisbursement" ADD CONSTRAINT "ApplicationDisbursement_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "ScholarshipInstallment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
