// src/app/api/blizzard/item-price/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fetchItemPrices from "@/lib/wow/fetchItemPrices";
import { logEntry } from "@/lib/logEntry";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const itemId = parseInt(searchParams.get("itemId"));
  const region = searchParams.get("region");
  const realmSlug = searchParams.get("realmSlug");
  const itemName = searchParams.get("itemName") || "unknown item";

  if (!itemId || !region || !realmSlug) {
    return NextResponse.json(
      {
        error:
          "Missing query parameters: itemId, region, and realmSlug are required.",
      },
      { status: 400 }
    );
  }

  // Define the high-population server lists for accurate regional averages
  const serverLists = {
    us: [
      "area-52",
      "illidan",
      "stormrage",
      "tichondrius",
      "sargeras",
      "zuljin",
      "aegwynn",
      "malganis",
      "kelthuzad",
      "proudmoore",
    ],
    eu: [
      "draenor",
      "silvermoon",
      "tarren-mill",
      "kazzak",
      "ravencrest",
      "outland",
      "twisting-nether",
      "argent-dawn",
      "stormscale",
      "hyjal",
    ],
  };

  const regionalServerSlugs = serverLists[region] || [];

  try {
    // 1. Check for a cached price in the database
    const existing = await prisma.itemPrice.findFirst({
      where: {
        itemId,
        region,
        realmSlug,
      },
    });

    const now = new Date();

    // 2. Determine if the cache is stale. It's stale if it doesn't exist,
    // or if the hour of the last update is not the same as the current hour.
    const isStale =
      !existing || new Date(existing.updatedAt).getHours() !== now.getHours();

    if (existing && !isStale) {
      console.log(
        `✅ Serving CACHED price for ${itemName} on ${realmSlug}-${region}.`
      );
      return NextResponse.json({
        serverPrice: existing.userRealmPrice,
        regionalAveragePrice: existing.regionalAvgPrice,
        cached: true,
      });
    }

    // 3. If stale or non-existent, fetch fresh prices
    console.log(
      `🔥 Fetching NEW price for ${itemName} on ${realmSlug}-${region}.`
    );
    const data = await fetchItemPrices(
      itemId,
      realmSlug,
      region,
      regionalServerSlugs
    );

    if (data.userServerPrice === null) {
      await logEntry(
        "item-price",
        `⚠️ Valid price not found for ${itemName} (ID ${itemId}) on user's server ${realmSlug}.`,
        "warn"
      );
      // Return regional average if server price is not available
      if (data.regionalMarketPrice !== null) {
        return NextResponse.json({
          serverPrice: null, // Explicitly send null
          regionalAveragePrice: data.regionalMarketPrice,
          cached: false,
        });
      }
    }

    if (data.userServerPrice === null && data.regionalMarketPrice === null) {
      throw new Error(`No price data could be fetched for item ${itemId}.`);
    }

    // 4. Update the database with the new prices
    await prisma.itemPrice.upsert({
      where: {
        itemId_region_realmSlug: {
          // The unique identifier we created
          itemId,
          region,
          realmSlug,
        },
      },
      update: {
        userRealmPrice: data.userServerPrice,
        regionalAvgPrice: data.regionalMarketPrice,
      },
      create: {
        itemId,
        region,
        realmSlug,
        userRealmPrice: data.userServerPrice,
        regionalAvgPrice: data.regionalMarketPrice,
      },
    });

    // 5. Store a historical record of this price update
    await prisma.itemPriceHistory.create({
      data: {
        itemId,
        region,
        realmSlug,
        userRealmPrice: data.userServerPrice,
        regionalAvgPrice: data.regionalMarketPrice,
        timestamp: new Date(),
      },
    });

    await logEntry(
      "item-price",
      `💾 Saved new price for ${itemName} (ID ${itemId}) on ${realmSlug} (${region})`
    );

    return NextResponse.json({
      serverPrice: data.userServerPrice,
      regionalAveragePrice: data.regionalMarketPrice,
      cached: false,
    });
  } catch (err) {
    console.error("Item Price API ERROR:", err);
    await logEntry(
      "item-price",
      `❌ Internal error fetching ${itemName} (${itemId}) for ${realmSlug} (${region})`,
      "error"
    );
    return NextResponse.json(
      { error: "Internal server error.", details: err.message },
      { status: 500 }
    );
  }
}
