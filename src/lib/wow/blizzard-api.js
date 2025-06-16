// src/lib/wow/blizzard-api.js

import { getAccessToken } from "@/app/api/blizzard/token/route";

const REGION_HOSTS = {
  us: "us.api.blizzard.com",
  eu: "eu.api.blizzard.com",
  kr: "kr.api.blizzard.com",
  tw: "tw.api.blizzard.com",
};

const BLIZZARD_LOCALE = "en_US";

// Caches to prevent re-fetching data within a short period
const realmIndexCache = new Map();
const auctionDataCache = new Map();

/**
 * Fetches the connected realm ID for a given realm slug. Caches the result.
 * @param {string} region The game region.
 * @param {string} realmSlug The slug of the realm.
 * @returns {Promise<number|null>} The connected realm ID.
 */
export async function getConnectedRealmId(region, realmSlug) {
  const cacheKey = `realm-index:${region}`;
  let realms = realmIndexCache.get(cacheKey);

  if (!realms) {
    try {
      const token = await getAccessToken(region);
      if (!token) throw new Error("Could not retrieve Blizzard API token.");

      const url = `https://${REGION_HOSTS[region]}/data/wow/realm/index?namespace=dynamic-${region}&locale=${BLIZZARD_LOCALE}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error(
          `[Blizzard API] Failed to fetch realm index for region ${region}. Status: ${res.status}`
        );
        return null;
      }
      const data = await res.json();
      realms = data.realms;
      realmIndexCache.set(cacheKey, realms);
    } catch (error) {
      console.error(`[Blizzard API error - getConnectedRealmId fetch]`, error);
      return null;
    }
  }

  const realm = realms.find((r) => r.slug === realmSlug);
  return realm?.id || null;
}

/**
 * --- NEW CORE FUNCTION ---
 * Fetches and caches the auction data for a SINGLE connected realm.
 * @param {string} region The game region.
 * @param {number} connectedRealmId The numeric ID of the connected realm.
 * @param {string} token A valid Blizzard API token.
 * @returns {Promise<object|null>} The auction data object.
 */
export async function getAuctionDataForRealm(region, connectedRealmId, token) {
  const cacheKey = `auctions:${connectedRealmId}`;
  const cached = auctionDataCache.get(cacheKey);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  try {
    const url = `https://${REGION_HOSTS[region]}/data/wow/connected-realm/${connectedRealmId}/auctions?namespace=dynamic-${region}&locale=${BLIZZARD_LOCALE}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.warn(
        `[Blizzard API] Failed to fetch auction data for connected realm ${connectedRealmId}. Status: ${res.status}`
      );
      return cached ? cached.data : null; // Return old data if available
    }

    const data = await res.json();
    auctionDataCache.set(cacheKey, {
      data,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minute cache
    });

    return data;
  } catch (error) {
    console.error(
      `Error fetching auction data for realm ${connectedRealmId}`,
      error
    );
    return cached ? cached.data : null;
  }
}

/**
 * Fetches the icon for a given item. (This function is correct).
 */
export async function getItemIcon(region, itemId) {
  try {
    const token = await getAccessToken(region);
    if (!token) throw new Error("Could not retrieve Blizzard API token.");

    const res = await fetch(
      `https://${REGION_HOSTS[region]}/data/wow/media/item/${itemId}?namespace=static-${region}&locale=${BLIZZARD_LOCALE}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      console.warn(
        `[Blizzard API] Failed to fetch icon for item ${itemId}. Status: ${res.status}`
      );
      return "inv_misc_questionmark";
    }

    const text = await res.text();
    if (!text) return "inv_misc_questionmark";

    const data = JSON.parse(text);
    return (
      data.assets?.[0]?.value?.split("/").pop()?.replace(".jpg", "") ||
      "inv_misc_questionmark"
    );
  } catch (error) {
    console.error(`[Blizzard API error - getItemIcon]`, error);
    return "inv_misc_questionmark";
  }
}
