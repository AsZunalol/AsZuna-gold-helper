// src/app/api/blizzard/wow-token/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// --- START OF FIX ---
// Import the centralized getAccessToken function from your utility file
import { getAccessToken } from "@/lib/wow/blizzard-api";
// --- END OF FIX ---

async function getTokenDataForRegion(region, accessToken) {
  const now = new Date();
  const lastPriceRecord = await prisma.wowTokenPrice.findUnique({
    where: { region },
  });

  const isStale =
    !lastPriceRecord ||
    new Date(lastPriceRecord.updatedAt).getHours() !== now.getHours();

  let priceData = {
    price: lastPriceRecord?.price || 0,
    trend: lastPriceRecord?.trend || "stable",
    history: {
      avg: 0,
      high: 0,
      low: 0,
    },
  };

  if (isStale) {
    console.log(
      `[WoW Token] Price for ${region} is stale. Fetching new data...`
    );
    try {
      const response = await fetch(
        `https://${region}.api.blizzard.com/data/wow/token/index?namespace=dynamic-${region}&locale=en_US`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.ok) {
        throw new Error(
          `Blizzard API responded with status ${response.status}`
        );
      }

      const data = await response.json();
      const newPrice = data.price / 10000;
      let trend = "stable";

      if (lastPriceRecord) {
        await prisma.wowTokenPriceHistory.create({
          data: {
            region: region,
            price: lastPriceRecord.price,
          },
        });

        if (newPrice > lastPriceRecord.price) trend = "up";
        else if (newPrice < lastPriceRecord.price) trend = "down";
      }

      const updatedRecord = await prisma.wowTokenPrice.upsert({
        where: { region },
        update: { price: newPrice, trend },
        create: { region, price: newPrice, trend },
      });

      priceData.price = updatedRecord.price;
      priceData.trend = updatedRecord.trend;
    } catch (fetchError) {
      console.error(
        `[WoW Token] Failed to fetch or update price for ${region}:`,
        fetchError
      );
    }
  } else {
    console.log(`[WoW Token] Serving fresh price for ${region} from DB.`);
  }

  const history = await prisma.wowTokenPriceHistory.findMany({
    where: { region },
    orderBy: { createdAt: "desc" },
    take: 168, // Last 7 days
  });

  if (history.length > 0) {
    const prices = history.map((h) => h.price);
    priceData.history.avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    priceData.history.high = Math.max(...prices);
    priceData.history.low = Math.min(...prices);
  } else if (lastPriceRecord) {
    priceData.history.avg = lastPriceRecord.price;
    priceData.history.high = lastPriceRecord.price;
    priceData.history.low = lastPriceRecord.price;
  }

  return priceData;
}

export async function GET() {
  try {
    // A single token is valid for all regions. We'll get a US token to use for all requests.
    const accessToken = await getAccessToken("us");
    
    // If no access token (missing credentials), return mock data
    if (!accessToken) {
      console.warn("[WoW Token] No access token available, returning mock data");
      return NextResponse.json({
        us: {
          price: 0,
          trend: "stable",
          history: { avg: 0, high: 0, low: 0 }
        },
        eu: {
          price: 0,
          trend: "stable", 
          history: { avg: 0, high: 0, low: 0 }
        }
      });
    }

    const [usData, euData] = await Promise.all([
      getTokenDataForRegion("us", accessToken),
      getTokenDataForRegion("eu", accessToken),
    ]);

    return NextResponse.json({ us: usData, eu: euData });
  } catch (error) {
    console.error("WoW Token API Main Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch WoW Token prices.", error: error.message },
      { status: 500 }
    );
  }
}
