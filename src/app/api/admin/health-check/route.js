import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getAccessToken } from "@/app/api/blizzard/token/route";
import { kv } from "@vercel/kv";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "OWNER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const accessToken = await getAccessToken();

    const response = await fetch(
      `https://us.api.blizzard.com/data/wow/token/index?namespace=dynamic-us`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Blizzard API responded with status: ${response.status}`);
    }

    let redisStatus = "ok";
    try {
      await kv.set("health-check", "ok");
      const redisTest = await kv.get("health-check");
      if (redisTest !== "ok") redisStatus = "fail";
    } catch (e) {
      console.error("[Redis Check] Error:", e.message);
      redisStatus = "error";
    }

    let dbStatus = "ok";
    try {
      await prisma.user.findFirst();
    } catch (e) {
      console.error("[Database Check] Error:", e.message);
      dbStatus = "error";
    }

    return NextResponse.json({
      blizzardApi: "ok",
      database: dbStatus,
      redis: redisStatus,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("[API Health Check] Error:", error.message);
    return NextResponse.json(
      {
        blizzardApi: "error",
        database: "unknown",
        redis: "unknown",
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
