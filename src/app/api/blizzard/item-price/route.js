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
      { error: "Missing query parameters." },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.itemPrice.findFirst({
      where: {
        itemId,
        region,
        realmSlug,
      },
    });

    const oneHour = 60 * 60 * 1000;
    const now = new Date();
    const stale =
      !existing ||
      new Date(existing.updatedAt).getTime() < now.getTime() - oneHour;

    if (existing && !stale) {
      return NextResponse.json({
        userRealmPrice: existing.userRealmPrice,
        regionalAvgPrice: existing.regionalAvgPrice,
        cached: true,
      });
    }

    const data = await fetchItemPrices(itemId, region, realmSlug);

    if (!data || !data.userRealmPrice || !data.regionalAvgPrice) {
      await logEntry(
        "item-price",
        `❌ Invalid or missing price data for ${itemName} (ID ${itemId}) on ${realmSlug} (${region})`,
        "warn"
      );
      return NextResponse.json(
        { error: "Failed to fetch valid price data." },
        { status: 500 }
      );
    }

    await prisma.itemPrice.upsert({
      where: {
        itemId_region_realmSlug: {
          itemId,
          region,
          realmSlug,
        },
      },
      update: {
        userRealmPrice: data.userRealmPrice,
        regionalAvgPrice: data.regionalAvgPrice,
      },
      create: {
        itemId,
        region,
        realmSlug,
        userRealmPrice: data.userRealmPrice,
        regionalAvgPrice: data.regionalAvgPrice,
      },
    });

    await prisma.itemPriceHistory.create({
      data: {
        itemId,
        region,
        realmSlug,
        userRealmPrice: data.userRealmPrice,
        regionalAvgPrice: data.regionalAvgPrice,
        timestamp: new Date(),
      },
    });

    await logEntry(
      "item-price",
      `✅ Fetched price for ${itemName} (ID ${itemId}) on ${realmSlug} (${region})`
    );

    return NextResponse.json({
      userRealmPrice: data.userRealmPrice,
      regionalAvgPrice: data.regionalAvgPrice,
      cached: false,
    });
  } catch (err) {
    console.error("LOG API ERROR:", err);
    await logEntry(
      "item-price",
      `❌ Internal error fetching ${itemName} (${itemId}) for ${realmSlug} (${region})`,
      "error"
    );
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
