-- AlterEnum
ALTER TYPE "Category" ADD VALUE 'OTHER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EducationLevel" ADD VALUE 'CLASS_9';
ALTER TYPE "EducationLevel" ADD VALUE 'CLASS_11';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ScholarshipCategory" ADD VALUE 'STUDY_ABROAD';
ALTER TYPE "ScholarshipCategory" ADD VALUE 'STARTUP';
