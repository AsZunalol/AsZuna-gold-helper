// aszunalol/aszuna-gold-helper/AsZuna-gold-helper-e7b64661f52d01644dc7d7dea50098deeb640633/src/app/api/blizzard/realms/route.js

import { NextResponse } from "next/server";

// In a real application, securely store your client ID and secret
// e.g., in .env.local and access via process.env
const BLIZZARD_CLIENT_ID = process.env.BLIZZARD_CLIENT_ID;
const BLIZZARD_CLIENT_SECRET = process.env.BLIZZARD_CLIENT_SECRET;

const REGION_API_HOSTS = {
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

// Simple in-memory cache for access tokens and realm lists
const cache = {
  accessToken: {
    us: null,
    eu: null,
    kr: null,
    tw: null,
  },
  realms: {
    us: null,
    eu: null,
    kr: null,
    tw: null,
  },
  expiresAt: {
    us: 0,
    eu: 0,
    kr: 0,
    tw: 0,
  },
};

async function getAccessToken(region) {
  const now = Date.now();
  if (cache.accessToken[region] && cache.expiresAt[region] > now) {
    return cache.accessToken[region];
  }

  const oauthHost = REGION_OAUTH_HOSTS[region];
  if (!oauthHost) {
    throw new Error("Invalid region for OAuth.");
  }

  const credentials = Buffer.from(
    `${BLIZZARD_CLIENT_ID}:${BLIZZARD_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(`https://${oauthHost}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Blizzard OAuth Error:", errorData);
    throw new Error(
      `Failed to get Blizzard access token: ${response.statusText}`
    );
  }

  const data = await response.json();
  const accessToken = data.access_token;
  const expiresIn = data.expires_in; // seconds

  // Cache token with a small buffer before expiry
  cache.accessToken[region] = accessToken;
  cache.expiresAt[region] = now + expiresIn * 1000 - 5000; // 5 seconds buffer

  return accessToken;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region");

  if (!region || !REGION_API_HOSTS[region]) {
    return NextResponse.json(
      { message: "Invalid region provided." },
      { status: 400 }
    );
  }

  if (!BLIZZARD_CLIENT_ID || !BLIZZARD_CLIENT_SECRET) {
    return NextResponse.json(
      { message: "Blizzard API credentials are not configured." },
      { status: 500 }
    );
  }

  try {
    const accessToken = await getAccessToken(region);

    // Use a simpler cache for realms list as well
    const now = Date.now();
    if (cache.realms[region] && now < cache.expiresAt[region] + 3600 * 1000) {
      // Cache realms for 1 hour
      return NextResponse.json(cache.realms[region]);
    }

    const apiHost = REGION_API_HOSTS[region];
    const namespace = region === "us" ? "dynamic-us" : `dynamic-${region}`; // Adjust namespace as needed

    const response = await fetch(
      `https://${apiHost}/data/wow/realm/index?namespace=${namespace}&locale=en_US&access_token=${accessToken}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Blizzard API Error:", errorData);
      throw new Error(
        `Failed to fetch realms from Blizzard API: ${response.statusText}`
      );
    }

    const data = await response.json();
    const realms = data.realms
      .map((r) => ({
        name: r.name,
        slug: r.slug,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    cache.realms[region] = realms;
    // Update expiresAt for realms as well, or use a separate expiry for them
    // For simplicity, reusing the token expiry, but ideally realms might have longer cache
    // Or set a fixed cache time like 1 hour as above.

    return NextResponse.json(realms);
  } catch (error) {
    console.error("Error fetching realms:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch realms from Blizzard." },
      { status: 500 }
    );
  }
}
