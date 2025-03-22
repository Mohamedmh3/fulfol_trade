/*
  Warnings:

  - Added the required column `best_sell_time` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "best_sell_time" TIMESTAMP(3) NOT NULL;
