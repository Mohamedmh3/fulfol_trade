-- CreateTable
CREATE TABLE "Trade" (
    "id" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "trade_amount" DOUBLE PRECISION NOT NULL,
    "best_buy_time" TIMESTAMP(3) NOT NULL,
    "suggested_amount" DOUBLE PRECISION NOT NULL,
    "risk_assessment" TEXT NOT NULL,
    "market_trend" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);
