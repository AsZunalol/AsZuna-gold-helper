import { NextResponse } from "next/server";
import postgres from "postgres";

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
  const data = await response.json();
  return data.access_token;
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
    const accessToken = await getBlizzardToken();
    const region = "us";
    const namespace = "dynamic-us";
    const locale = "en_US";
    const realmName = "Proudmoore"; // The server you want to track

    // --- THIS IS THE DEFINITIVE FIX ---

    // STEP 1: Search for the Connected Realm to get its dynamic ID.
    // This removes all guesswork and hardcoded IDs.
    const searchUrl = `https://${region}.api.blizzard.com/data/wow/search/connected-realm?namespace=${namespace}&realms.name.en_US=${encodeURIComponent(
      realmName
    )}&access_token=${accessToken}`;

    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      throw new Error(`Blizzard Search API Error: ${searchRes.statusText}`);
    }
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      throw new Error(
        `Could not find connected realm ID for server: ${realmName}`
      );
    }

    // Extract the href from the first result, which contains the correct URL.
    const realmUrl = searchData.results[0].data.realms[0].href;
    const urlParts = realmUrl.split("/");
    const connectedRealmId = urlParts[urlParts.indexOf("connected-realm") + 1];

    if (!connectedRealmId) {
      throw new Error("Failed to parse connectedRealmId from search result.");
    }

    // STEP 2: Use the discovered ID to fetch the auctions for that realm.
    const auctionsUrl = `https://${region}.api.blizzard.com/data/wow/connected-realm/${connectedRealmId}/auctions?namespace=${namespace}&locale=${locale}&access_token=${accessToken}`;

    const auctionRes = await fetch(auctionsUrl);

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
