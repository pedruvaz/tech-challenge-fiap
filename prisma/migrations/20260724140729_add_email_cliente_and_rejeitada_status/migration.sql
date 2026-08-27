-- AlterEnum
ALTER TYPE "Status" ADD VALUE 'rejeitada';

-- AlterTable
ALTER TABLE "cliente" ADD COLUMN     "email" TEXT;
