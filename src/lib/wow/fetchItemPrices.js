// src/lib/wow/fetchItemPrices.js

// Using fetch for consistency with other API utility files
import { getAccessToken, getConnectedRealmId } from "./blizzard-api";

// This retry logic is now built for the native fetch API
const retry = async (fn, retries = 3, delayMs = 500) => {
  try {
    const res = await fn();
    // If the response is not OK (e.g., 404, 500), it's an error
    if (!res.ok) {
      const error = new Error(`Request failed with status code ${res.status}`);
      error.response = res;
      throw error;
    }
    // If successful, parse the JSON response
    return res.json();
  } catch (err) {
    if (retries > 0) {
      // Wait a moment and try again
      await new Promise((res) => setTimeout(res, delayMs));
      return retry(fn, retries - 1, delayMs);
    }
    // If all retries fail, log the error and return null so the app doesn't crash
    console.error(`Request failed after all retries:`, err.message);
    return null;
  }
};

const getItemPriceFromCommodities = async (itemId, region, accessToken) => {
  const data = await retry(() =>
    fetch(
      `https://${region}.api.blizzard.com/data/wow/auctions/commodities?namespace=dynamic-${region}&locale=en_US`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
  );

  if (!data || !data.auctions) return null;

  const itemAuctions = data.auctions.filter(
    (auction) => auction.item.id === itemId
  );

  if (itemAuctions.length === 0) return null;
  const prices = itemAuctions
    .map((a) => a.unit_price ?? a.buyout)
    .filter((price) => typeof price === "number" && price > 0);
  if (prices.length === 0) return null;

  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
};

const getItemPriceFromServer = async (
  itemId,
  connectedRealmId,
  region,
  accessToken
) => {
  if (!connectedRealmId) return null;

  const data = await retry(() =>
    fetch(
      `https://${region}.api.blizzard.com/data/wow/connected-realm/${connectedRealmId}/auctions?namespace=dynamic-${region}&locale=en_US`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
  );

  if (!data || !data.auctions) return null;

  const itemAuctions = data.auctions.filter(
    (auction) => auction.item.id === itemId
  );

  if (itemAuctions.length === 0) return null;
  const prices = itemAuctions
    .map((a) => a.unit_price ?? a.buyout)
    .filter((price) => typeof price === "number" && price > 0);
  if (prices.length === 0) return null;

  return Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
};

const fetchItemPrices = async (
  itemId,
  userServerSlug,
  region,
  regionalServerSlugs
) => {
  try {
    const accessToken = await getAccessToken(region);

    const commodityPrice = await getItemPriceFromCommodities(
      itemId,
      region,
      accessToken
    );
    if (commodityPrice !== null) {
      return {
        userServerPrice: commodityPrice,
        regionalMarketPrice: commodityPrice,
      };
    }

    const allUniqueServerSlugs = [
      ...new Set([userServerSlug, ...regionalServerSlugs]),
    ];

    const allRealmIds = (
      await Promise.all(
        allUniqueServerSlugs.map((slug) => getConnectedRealmId(region, slug))
      )
    ).filter(Boolean);

    const pricePromises = allRealmIds.map((id) =>
      getItemPriceFromServer(itemId, id, region, accessToken)
    );

    const prices = await Promise.all(pricePromises);

    const priceMap = new Map();
    allRealmIds.forEach((id, index) => {
      if (prices[index] !== null) {
        priceMap.set(id, prices[index]);
      }
    });

    const userConnectedRealmId = await getConnectedRealmId(
      region,
      userServerSlug
    );
    const userServerPrice = priceMap.get(userConnectedRealmId) ?? null;

    const validRegionalPrices = Array.from(priceMap.values());
    const regionalMarketPrice =
      validRegionalPrices.length > 0
        ? Math.round(
            validRegionalPrices.reduce((a, b) => a + b, 0) /
              validRegionalPrices.length
          )
        : null;

    return { userServerPrice, regionalMarketPrice };
  } catch (error) {
    console.error("Error in fetchItemPrices orchestration:", error);
    return { userServerPrice: null, regionalMarketPrice: null };
  }
};

export default fetchItemPrices;
