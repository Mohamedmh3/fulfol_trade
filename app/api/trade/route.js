import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as cookie from 'cookie';
 
  



const prisma = new PrismaClient();


export async function POST(req) {
  const cookies = cookie.parse(req.headers.get('Cookie' || '')); 
  const token = cookies.token; 

  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

 
  try {
    let { 
      currency, 
      trade_amount, 
      best_buy_time, 
      best_sell_time,
      suggested_amount, 
      risk_assessment, 
      market_trend, 
      userId
    } = await req.json();
    trade_amount = parseFloat(trade_amount);
    suggested_amount = parseFloat(suggested_amount);
    

const userIdFromAPI = userId;

    // const { id: userIdFromAPI } = userId;

    if (!userIdFromAPI) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    const trade = await prisma.trade.create({
      data: {
        currency,
        trade_amount,
        best_buy_time: new Date(best_buy_time),
        best_sell_time: new Date(best_sell_time),
        suggested_amount,
        risk_assessment,
        market_trend,
        user: {
          connect: {
            id: userIdFromAPI,
          },
        },
      },
    });


    return NextResponse.json(trade);

  } catch (error) {
    console.error("Error creating trade:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
