import { NextResponse } from "next/server";
import { createClient } from "@vercel/kv";
import { getAccessToken } from "../token/route";

const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// This function now only fetches and returns the price, and caches ONLY the price.
async function getItemPrice(accessToken, region, realmSlug, itemId) {
  const cacheKey = `price:${region}-${realmSlug}:${itemId}`;

  try {
    const cachedPrice = await kv.get(cacheKey);
    if (cachedPrice !== null && cachedPrice !== undefined) {
      console.log(`[CACHE HIT] Found price for item ${itemId} on ${realmSlug}`);
      return cachedPrice;
    }

    console.log(
      `[API] No cache for item ${itemId} on ${realmSlug}. Fetching fresh data.`
    );

    const connectedRealmSearchUrl = `https://${region}.api.blizzard.com/data/wow/search/connected-realm?namespace=dynamic-${region}&realms.slug=${realmSlug.toLowerCase()}`;
    const searchResponse = await fetch(connectedRealmSearchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!searchResponse.ok) return null;

    const searchData = await searchResponse.json();
    if (!searchData.results || searchData.results.length === 0) return null;

    const connectedRealmUrl = searchData.results[0].key.href;
    const realmResponse = await fetch(connectedRealmUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!realmResponse.ok) return null;

    const realmData = await realmResponse.json();
    const auctionHouseUrl = realmData.auctions.href;
    if (!auctionHouseUrl) return null;

    const ahResponse = await fetch(auctionHouseUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!ahResponse.ok) return null;

    const data = await ahResponse.json();

    // Find the specific item's price
    const itemData = data.auctions.find(
      (auction) => auction.item.id === parseInt(itemId, 10)
    );
    const price = itemData
      ? itemData.buyout || itemData.unit_price || null
      : null;

    // Save ONLY the price to the cache with a 5-hour expiration
    await kv.set(cacheKey, price, { ex: 18000 });
    console.log(`[CACHE SET] Saved price for item ${itemId} on ${realmSlug}.`);

    return price;
  } catch (e) {
    console.error(
      `Failed to get price for ${itemId} on ${realmSlug}:`,
      e.message
    );
    return null;
  }
}

const regionalHubs = {
  us: ["stormrage", "area-52", "illidan"],
  eu: ["kazzak", "draenor", "silvermoon"],
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get("itemId");
  const region = searchParams.get("region");
  const realmSlug = searchParams.get("realmSlug");

  if (!itemId || !region || !realmSlug) {
    return NextResponse.json(
      { message: "itemId, region, and realmSlug are required" },
      { status: 400 }
    );
  }

  let hubsToFetch = regionalHubs[region] || [];
  hubsToFetch = hubsToFetch.filter(
    (hub) => hub.toLowerCase() !== realmSlug.toLowerCase()
  );

  try {
    const accessToken = await getAccessToken();

    const allPriceFetches = [
      getItemPrice(accessToken, region, realmSlug, itemId),
      ...hubsToFetch.map((hub) =>
        getItemPrice(accessToken, region, hub, itemId)
      ),
    ];

    const allPrices = await Promise.all(allPriceFetches);

    const serverPrice = allPrices[0];
    const hubPrices = allPrices.slice(1).filter((price) => price !== null);

    const regionalAveragePrice =
      hubPrices.length > 0
        ? hubPrices.reduce((a, b) => a + b, 0) / hubPrices.length
        : null;

    return NextResponse.json({ serverPrice, regionalAveragePrice });
  } catch (error) {
    console.error("[HANDLER CATCH] Final catch block error:", error.message);
    return NextResponse.json(
      { message: "Failed to get item price.", error: error.message },
      { status: 500 }
    );
  }
}
