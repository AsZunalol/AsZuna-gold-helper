import { NextResponse } from "next/server";
import postgres from "postgres";

// Helper function to decode the JWT access token
function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    throw new Error("Could not decode access token.");
  }
}

// Helper function to get an access token from Blizzard
async function getBlizzardToken() {
  const credentials = Buffer.from(
    `${process.env.BLIZZARD_CLIENT_ID}:${process.env.BLIZZARD_CLIENT_SECRET}`
  ).toString("base64");
  const response = await fetch(
    "https://us.battle.net/oauth/token?grant_type=client_credentials",
    {
      method: "POST",
      headers: { Authorization: `Basic ${credentials}` },
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to get Blizzard token: ${response.statusText} - ${errorText}`
    );
  }
  return await response.json();
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const sql = postgres(process.env.POSTGRES_AUCTION_URL, {
    ssl: "require",
    max: 1,
  });

  try {
    // --- THIS IS THE DEFINITIVE FIX ---

    // STEP 1: Get the token and decode it to find the correct API endpoint
    const tokenResponse = await getBlizzardToken();
    const accessToken = tokenResponse.access_token;
    const decodedToken = decodeJwt(accessToken);
    const blizzardApiEndpoint = decodedToken.iss; // This is the correct base URL!

    if (!blizzardApiEndpoint) {
      throw new Error("Could not determine API endpoint from token.");
    }

    const namespace = "dynamic-us";
    const locale = "en_US";
    const realmName = "Proudmoore";

    // STEP 2: Use the discovered endpoint to search for the Connected Realm ID
    const searchUrl = `${blizzardApiEndpoint}/data/wow/search/connected-realm?namespace=${namespace}&realms.name.en_US=${encodeURIComponent(
      realmName
    )}&access_token=${accessToken}`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      throw new Error(
        `Blizzard Search API Error: ${searchRes.statusText} at URL: ${searchUrl}`
      );
    }
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error(
        `Could not find connected realm ID for server: ${realmName}`
      );
    }

    const realmDataUrl = searchData.results[0].key.href;
    const realmRes = await fetch(`${realmDataUrl}&access_token=${accessToken}`);
    if (!realmRes.ok) {
      throw new Error(`Blizzard Realm API Error: ${realmRes.statusText}`);
    }
    const realmData = await realmRes.json();

    // STEP 3: Extract the correct auctions URL and fetch the data
    const auctionsUrl = realmData.auctions.href;
    if (!auctionsUrl) {
      throw new Error("Could not find auction house URL in realm data.");
    }

    const auctionRes = await fetch(
      `${auctionsUrl}&access_token=${accessToken}`
    );

    if (!auctionRes.ok) {
      const errorText = await auctionRes.text();
      throw new Error(
        `Blizzard Auction API Error: ${auctionRes.statusText} - ${errorText}`
      );
    }

    const { auctions } = await auctionRes.json();

    if (!auctions || auctions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No auctions found to update.",
      });
    }

    await sql.begin(async (sql) => {
      await sql`TRUNCATE TABLE auctions`;
      for (let i = 0; i < auctions.length; i += 500) {
        const batch = auctions
          .slice(i, i + 500)
          .filter((a) => a.buyout)
          .map((a) => ({
            item_id: a.item.id,
            quantity: a.quantity,
            buyout: a.buyout,
            time_left: a.time_left,
          }));
        if (batch.length > 0) {
          await sql`INSERT INTO auctions ${sql(
            batch,
            "item_id",
            "quantity",
            "buyout",
            "time_left"
          )}`;
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${auctions.length} auctions.`,
    });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await sql.end();
  }
}
