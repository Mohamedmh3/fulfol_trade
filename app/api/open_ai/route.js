import { NextResponse } from "next/server";
import OpenAI from "openai";
import cookie from 'cookie'; 
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const cookies = cookie.parse(req.headers.get('Cookie') || ''); 
  const token = cookies.token; 

  if (!token) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
       const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Decoded token:", decoded);

    const { currency, prices, trade_amount } = await req.json();

    if (!currency || typeof currency !== "string") {
      return NextResponse.json({ error: "Invalid or missing currency" }, { status: 400 });
    }

    const prompt = `
    You are a market forecaster. Based on the following historical prices for ${currency}:
    ${JSON.stringify(prices)}
    and considering an amount of ${trade_amount} USD to trade, forecast the future market trends.
    IMPORTANT: Do not simply return the historical dates. Instead, predict optimal future dates (after the latest historical date) for buying and selling ${currency}.
    Your response must be a valid JSON object, and nothing else. Use the ISO date format for the predicted dates.
    The JSON object should have these keys:
    {
      "best_buy_time": "Predicted future date to buy (ISO format)",
      "best_sell_time": "Predicted future date to sell (ISO format)",
      "suggested_amount": "Suggested trade amount in USD",
      "risk_assessment": "Risk assessment (low/medium/high)",
      "market_trend": "Market trend (bullish/bearish/neutral)"
    }
    Output only the JSON object.
  `;
  
  

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let analysisText = response.choices[0].message.content.trim();

    const regex = /^```(?:json)?\s*([\s\S]+?)\s*```$/;
    const match = analysisText.match(regex);
    if (match) {
      analysisText = match[1];
    }

    const analysis = JSON.parse(analysisText);

    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: "Failed to parse OpenAI response", details: error.message }, { status: 500 });
  }
}
