// src/app/api/blizzard/item-price/route.js

import { fetchItemPrices } from "@/lib/wow/fetchItemPrices";
import prisma from "@/lib/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const itemId = parseInt(searchParams.get("itemId"));
  const region = searchParams.get("region");
  const realmSlug = searchParams.get("realmSlug");

  if (!itemId || !region || !realmSlug) {
    return new Response(
      JSON.stringify({ error: "Missing itemId, region, or realmSlug" }),
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.itemPrice.findUnique({
      where: {
        itemId_region_realmSlug: { itemId, region, realmSlug },
      },
    });

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (existing && existing.updatedAt > oneHourAgo) {
      return new Response(
        JSON.stringify({
          userRealmPrice: existing.userRealmPrice,
          regionalAvgPrice: existing.regionalAvgPrice,
          cached: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const prices = await fetchItemPrices(itemId, region, realmSlug);

    await prisma.itemPrice.upsert({
      where: {
        itemId_region_realmSlug: { itemId, region, realmSlug },
      },
      update: {
        userRealmPrice: prices.userRealmPrice,
        regionalAvgPrice: prices.regionalAvgPrice,
      },
      create: {
        itemId,
        region,
        realmSlug,
        userRealmPrice: prices.userRealmPrice,
        regionalAvgPrice: prices.regionalAvgPrice,
      },
    });

    return new Response(JSON.stringify({ ...prices, cached: false }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Price fetch failed:", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch item prices" }),
      {
        status: 500,
      }
    );
  }
}
