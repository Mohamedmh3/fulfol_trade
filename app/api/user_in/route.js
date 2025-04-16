import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const body = await request.json();
    const { currency, amount, userId } = body;

    if (!currency || !amount || !userId) {
      return new Response(JSON.stringify({ error: "Currency, amount, and userId are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "Invalid User ID" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Transaction authorized for user:", user.id);


    const token = jwt.sign(
      { id: user.id },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const cookieOptions = {
      httpOnly: true, 
      maxAge: 3600,    
      sameSite: "Strict", 
      path: '/', 
    };

    const cookieHeader = cookie.serialize('token', token, cookieOptions);


    return new Response(JSON.stringify({
      message: "Transaction data received successfully",
      data: { token }
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Set-Cookie": cookieHeader 
      }
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
