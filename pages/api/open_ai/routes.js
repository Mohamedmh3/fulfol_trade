import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { currency, price, trade_amount} = await req.json();

    const prompt = `
      Analyze market for ${currency.toUpperCase()}:
      Current price: $${price}
      Amount to trade: ${trade_amount} USD
      Provide:
      - Best time to buy
      - Best time to sell
      - Suggested amount
      - Risk assessment (low/medium/high)
      - Market trend
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt}],
    });

    const analysis = response.choices[0].message.content;

    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
