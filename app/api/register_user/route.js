import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const userId = uuidv4();

    const user = await prisma.user.create({
      data: {
        userId,
      },
    });

    return NextResponse.json({
      message: "User registered successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error("❌ Error registering user:", error);  
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    );
  }
}
