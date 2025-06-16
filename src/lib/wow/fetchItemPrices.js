// src/utils/fetchItemPrices.js

import axios from "axios";

const CLIENT_ID = process.env.BLIZZARD_CLIENT_ID;
const CLIENT_SECRET = process.env.BLIZZARD_CLIENT_SECRET;

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const cache = new Map();

const getAccessToken = async () => {
  const cacheKey = "blizzard_access_token";
  const cached = cache.get(cacheKey);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  const response = await axios.post(
    `https://oauth.battle.net/token`,
    "grant_type=client_credentials",
    {
      auth: {
        username: CLIENT_ID,
        password: CLIENT_SECRET,
      },
    }
  );

  const token = response.data.access_token;
  const expiresInMs = response.data.expires_in * 1000; // typically 86400 seconds
  const expiresAt = Date.now() + expiresInMs;

  cache.set(cacheKey, { token, expiresAt });
  return token;
};

const retry = async (fn, retries = 3, delayMs = 500) => {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      await new Promise((res) => setTimeout(res, delayMs));
      return retry(fn, retries - 1, delayMs);
    }
    throw err;
  }
};

const getConnectedRealmIdFromSlug = async (realmSlug, region, accessToken) => {
  const cacheKey = `realmId:${region}:${realmSlug}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.value;
  }

  const response = await retry(() =>
    axios.get(
      `https://${region}.api.blizzard.com/data/wow/realm/${realmSlug}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          namespace: `dynamic-${region}`,
          locale: "en_US",
        },
      }
    )
  );

  const href = response.data.connected_realm.href;
  const match = href.match(/connected-realm\/(\d+)/);
  if (!match) throw new Error("Failed to parse connected realm ID");

  const realmId = match[1];
  cache.set(cacheKey, { value: realmId, timestamp: Date.now() });
  return realmId;
};

const getItemPriceFromCommodities = async (itemId, region, accessToken) => {
  console.log(
    `📦 Fetching commodity auctions for region ${region}, item ${itemId}...`
  );

  const cacheKey = `commodity:${region}:${itemId}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.value;
  }

  const response = await retry(() =>
    axios.get(
      `https://${region}.api.blizzard.com/data/wow/auctions/commodities`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          namespace: `dynamic-${region}`,
          locale: "en_US",
        },
      }
    )
  );

  const auctions = response.data.auctions;
  const itemAuctions = auctions.filter((auction) => auction.item.id === itemId);

  console.log(`🔎 Commodities: ${itemAuctions.length} matched item ID`);

  if (itemAuctions.length === 0) return null;

  const prices = itemAuctions
    .map((a) => a.unit_price ?? a.buyout)
    .filter((price) => typeof price === "number" && price > 0);

  if (prices.length === 0) return null;

  const avgPrice = Math.round(
    prices.reduce((a, b) => a + b, 0) / prices.length
  );
  cache.set(cacheKey, { value: avgPrice, timestamp: Date.now() });
  return avgPrice;
};

const getItemPriceFromServer = async (
  itemId,
  connectedRealmId,
  region,
  accessToken
) => {
  const cacheKey = `price:${region}:${connectedRealmId}:${itemId}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.value;
  }

  console.log(
    `📦 Fetching auctions for realm ${connectedRealmId}, item ${itemId}...`
  );

  const response = await retry(() =>
    axios.get(
      `https://${region}.api.blizzard.com/data/wow/connected-realm/${connectedRealmId}/auctions`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          namespace: `dynamic-${region}`,
          locale: "en_US",
        },
      }
    )
  );

  const auctions = response.data.auctions;
  console.log(
    `🔍 Realm ${connectedRealmId}: ${auctions.length} total auctions`
  );

  const itemIds = new Set();
  auctions.forEach((a) => {
    if (a.item && a.item.id) itemIds.add(a.item.id);
  });

  console.log(
    `🧾 Realm ${connectedRealmId}: Found ${itemIds.size} unique item IDs`
  );
  console.log("🔢 Sample item IDs:", Array.from(itemIds).slice(0, 10));

  const itemAuctions = auctions.filter((auction) => auction.item.id === itemId);
  console.log(
    `🔎 Realm ${connectedRealmId}: ${itemAuctions.length} matched item ID`
  );

  if (itemAuctions.length === 0) return null;

  const prices = itemAuctions
    .map((a) => a.unit_price ?? a.buyout)
    .filter((price) => typeof price === "number" && price > 0);

  console.log(`💰 Realm ${connectedRealmId}: ${prices.length} valid prices`);

  if (prices.length === 0) return null;

  const avgPrice = Math.round(
    prices.reduce((a, b) => a + b, 0) / prices.length
  );
  cache.set(cacheKey, { value: avgPrice, timestamp: Date.now() });
  return avgPrice;
};

const fetchItemPrices = async (
  itemId,
  userServerSlug,
  region,
  regionalServerSlugs
) => {
  try {
    const accessToken = await getAccessToken();

    const userPriceFromCommodity = await getItemPriceFromCommodities(
      itemId,
      region,
      accessToken
    );

    if (userPriceFromCommodity !== null) {
      return {
        userServerPrice: userPriceFromCommodity,
        regionalMarketPrice: userPriceFromCommodity,
      };
    }

    const userConnectedRealmId = await getConnectedRealmIdFromSlug(
      userServerSlug,
      region,
      accessToken
    );

    const regionalConnectedRealmIds = await Promise.all(
      regionalServerSlugs.map((slug) =>
        getConnectedRealmIdFromSlug(slug, region, accessToken)
      )
    );

    const userServerPricePromise = getItemPriceFromServer(
      itemId,
      userConnectedRealmId,
      region,
      accessToken
    );

    const regionalPricesPromises = regionalConnectedRealmIds.map((id) =>
      getItemPriceFromServer(itemId, id, region, accessToken)
    );

    const [userServerPrice, ...regionalPrices] = await Promise.all([
      userServerPricePromise,
      ...regionalPricesPromises,
    ]);

    const validRegionalPrices = regionalPrices.filter(
      (price) => price !== null
    );
    const regionalMarketPrice =
      validRegionalPrices.length > 0
        ? Math.round(
            validRegionalPrices.reduce((a, b) => a + b, 0) /
              validRegionalPrices.length
          )
        : null;

    return {
      userServerPrice,
      regionalMarketPrice,
    };
  } catch (error) {
    console.error("Error fetching item prices:", error);
    return {
      userServerPrice: null,
      regionalMarketPrice: null,
    };
  }
};

export default fetchItemPrices;
