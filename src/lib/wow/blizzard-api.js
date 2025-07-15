// src/lib/wow/blizzard-api.js

import { NextResponse } from "next/server";

const CLIENT_ID = process.env.BLIZZARD_CLIENT_ID;
const CLIENT_SECRET = process.env.BLIZZARD_CLIENT_SECRET;

// Validate credentials are available
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.warn("[Blizzard API] Missing credentials. Set BLIZZARD_CLIENT_ID and BLIZZARD_CLIENT_SECRET in .env.local");
}

const REGION_HOSTS = {
  us: "us.api.blizzard.com",
  eu: "eu.api.blizzard.com",
  kr: "kr.api.blizzard.com",
  tw: "tw.api.blizzard.com",
};

const REGION_OAUTH_HOSTS = {
  us: "us.battle.net",
  eu: "eu.battle.net",
  kr: "kr.battle.net",
  tw: "tw.battle.net",
};

const BLIZZARD_LOCALE = "en_US";

// A simple in-memory cache
const cache = new Map();

export async function getAccessToken(region = "us") {
  // Return null if credentials are missing
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.warn("[Blizzard API] Cannot get access token: missing credentials");
    return null;
  }

  const cacheKey = `blizzard_access_token:${region}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  const oauthHost = REGION_OAUTH_HOSTS[region];
  if (!oauthHost) {
    throw new Error(`Invalid region provided for getAccessToken: ${region}`);
  }

  const response = await fetch(`https://${oauthHost}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${CLIENT_ID}:${CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    console.error("Blizzard OAuth Error:", await response.text());
    throw new Error(`Failed to get Blizzard access token for region ${region}`);
  }

  const data = await response.json();
  const token = data.access_token;
  const expiresInMs = data.expires_in * 1000;
  const expiresAt = Date.now() + expiresInMs - 5000; // 5 sec buffer

  cache.set(cacheKey, { token, expiresAt });
  return token;
}

// --- START OF FIX ---
// This is the new, corrected function. It directly fetches the realm details
// to get the correct connected_realm ID, which is required by the auction house API.
export async function getConnectedRealmId(region, realmSlug) {
  const cacheKey = `connected-realm-id:${region}:${realmSlug}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  try {
    const token = await getAccessToken(region);
    if (!token) throw new Error("Could not retrieve Blizzard API token.");

    const url = `https://${REGION_HOSTS[region]}/data/wow/realm/${realmSlug}?namespace=dynamic-${region}&locale=${BLIZZARD_LOCALE}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.error(
        `[Blizzard API] Failed to fetch realm data for ${realmSlug}. Status: ${res.status}`
      );
      return null;
    }

    const data = await res.json();
    const href = data.connected_realm.href;
    const match = href.match(/connected-realm\/(\d+)/);

    if (!match || !match[1]) {
      console.error(`Could not parse connected realm ID from href: ${href}`);
      return null;
    }

    const connectedRealmId = parseInt(match[1], 10);
    cache.set(cacheKey, connectedRealmId); // Cache the result
    return connectedRealmId;
  } catch (error) {
    console.error(
      `[Blizzard API error - getConnectedRealmId for ${realmSlug}]`,
      error
    );
    return null;
  }
}
// --- END OF FIX ---

export async function getAuctionDataForRealm(region, connectedRealmId, token) {
  const cacheKey = `auctions:${connectedRealmId}`;
  const cached = cache.get(cacheKey);

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
      return cached ? cached.data : null;
    }

    const data = await res.json();
    cache.set(cacheKey, {
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
