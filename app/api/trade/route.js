import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { 
      currency, 
      trade_amount, 
      best_buy_time, 
      best_sell_time,
      suggested_amount, 
      risk_assessment, 
      market_trend 
    } = await req.json();

    const trade = await prisma.trade.create({
      data: {
        currency,
        trade_amount,
        best_buy_time: new Date(best_buy_time),  
        best_sell_time:new Date(best_sell_time), 
        suggested_amount,
        risk_assessment,
        market_trend,
      },
    });

    return NextResponse.json(trade);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
