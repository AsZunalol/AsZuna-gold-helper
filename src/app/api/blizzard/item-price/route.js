import { NextResponse } from "next/server";
import { getAccessToken } from "../../../../../lib/blizzard/token";
import { getRealmSlugFromProfile } from "../../../../../lib/blizzard/realm";
import retry from "../../../../../lib/utils/retry";
import db from "../../../../../lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  const region = searchParams.get("region");
  const realmSlug = searchParams.get("realmSlug");
  const itemName = searchParams.get("itemName");

  if (!itemId || !region || !realmSlug || !itemName) {
    return NextResponse.json(
      { error: "Missing required query parameters" },
      { status: 400 }
    );
  }

  try {
    console.log("Getting connectedRealmId for", { region, realmSlug });
    const connectedRealmId = await retry(() =>
      getRealmSlugFromProfile(region, realmSlug)
    );

    if (!connectedRealmId) {
      console.error("connectedRealmId not found");
      return NextResponse.json(
        { error: "Failed to get connectedRealmId" },
        { status: 500 }
      );
    }

    const accessToken = await getAccessToken();

    const url = `https://${region}.api.blizzard.com/data/wow/connected-realm/${connectedRealmId}/auctions?namespace=dynamic-${region}&locale=en_US&access_token=${accessToken}`;
    console.log("Fetching auction data from URL:", url);

    const response = await retry(() => fetch(url));

    if (!response.ok) {
      throw new Error(`Failed to fetch auction data: ${response.status}`);
    }

    const auctionData = await response.json();

    const itemAuctions = auctionData.auctions.filter(
      (auction) => auction.item.id === parseInt(itemId)
    );

    const prices = itemAuctions.map(
      (auction) => auction.unit_price || auction.buyout
    );
    const validPrices = prices.filter((price) => typeof price === "number");

    const averagePrice =
      validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length ||
      0;

    await db.itemPrice.upsert({
      where: {
        itemId_region_realm: {
          itemId: parseInt(itemId),
          region,
          realm: realmSlug,
        },
      },
      update: {
        price: averagePrice,
        lastUpdated: new Date(),
        itemName,
      },
      create: {
        itemId: parseInt(itemId),
        region,
        realm: realmSlug,
        price: averagePrice,
        lastUpdated: new Date(),
        itemName,
      },
    });

    return NextResponse.json({ price: averagePrice });
  } catch (error) {
    console.error("Error fetching item price:", error);
    return NextResponse.json(
      { error: "Failed to fetch item price" },
      { status: 500 }
    );
  }
}
