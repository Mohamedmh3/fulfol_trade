import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import * as cookie from 'cookie';
const BASE_URL = process.env.BASE_URL;
const USER_DATA = process.env.USER_DATA;
const REGISTER_USER = process.env.REGISTER_USER;
const CURRENCY_FETCH = process.env.CURRENCY_FETCH;
const OPEN_AI_FETCH = process.env.OPEN_AI_FETCH;
const DATABASE_FETCH = process.env.DATABASE_FETCH;


const JWT_SECRET = process.env.JWT_SECRET;
export async function POST(req) {

  try {
    const cookies = cookie.parse(req.headers.get("cookie") || "");
    const token = cookies.token; 
    console.log("Cookies:", cookies);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
    }

    const userIdFromToken = decoded.id;
    const userInput = await req.json();

    if (!userInput.currency || !userInput.amount || !userInput.userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const userRes = await fetch(USER_DATA, {
      method: "POST",
      headers: { "Content-Type": "application/json",
         "Cookie":`token=${token}`
       },
      body: JSON.stringify(userInput),
    });

    if (!userRes.ok) {
      const err = await userRes.json();
      return NextResponse.json({ error: "User API failed", details: err }, { status: 400 });
    }

    const currencyRes = await fetch(`${CURRENCY_FETCH}currency=${userInput.currency}`, {
      method: "GET",
      headers: { "Content-Type": "application/json",
        "Cookie":`token=${token}`
       },
    });
    console.log('Currency API Response:', currencyRes.status, currencyRes.statusText);

    const currencyData = await currencyRes.json();
    if (!currencyRes.ok) {
      return NextResponse.json({ error: "Failed to fetch currency data" }, { status: 400 });
    }

    const latestPrice = currencyData.prices?.[0]?.price;
    if (!latestPrice) {
      return NextResponse.json({ error: "No price data available" }, { status: 500 });
    }

    const aiRes = await fetch(OPEN_AI_FETCH, {
      method: "POST",
      headers: { "Content-Type": "application/json",
         "Cookie":`token=${token}`
       },
      body: JSON.stringify({
        currency: userInput.currency,
        price: latestPrice,
        trade_amount: userInput.amount,
      }),
    });

    const aiData = await aiRes.json();
    if (!aiRes.ok) {
      return NextResponse.json({ error: "OpenAI analysis failed", details: aiData }, { status: 500 });
    }

    const dbRes = await fetch(DATABASE_FETCH, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        "Cookie":`token=${token}`
       },
      body: JSON.stringify({
        currency: userInput.currency,
        userId:userInput.userId,
        trade_amount: userInput.amount,
        ...aiData.analysis,
      }),
    });

    const savedTrade = await dbRes.json();
    if (!dbRes.ok) {
      return NextResponse.json({ error: "DB save failed", details: savedTrade }, { status: 500 });
    }

    return NextResponse.json({ message: "Trade processed successfully", savedTrade });

  } catch (err) {
    console.error("Flow Error:", err);
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
