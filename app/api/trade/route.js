import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import cookie from 'cookie'; 
import jwt from 'jsonwebtoken';
  

const JWT_SECRET = process.env.JWT_SECRET;


const prisma = new PrismaClient();


export async function POST(req) {
  const cookies = cookie.parse(req.headers.get('Cookie' || '')); 
  const token = cookies.token; 
  // console.log("Decoded token:", token);

  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

 
  try {

        const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);

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
