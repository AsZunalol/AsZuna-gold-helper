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
    const connectedRealmId = 11; // Example for Proudmoore US
    const namespace = "dynamic-us";

    // --- THIS IS THE DEFINITIVE FIX ---
    // STEP 1: Fetch the Connected Realm data to get the correct auction house URL.
    const realmApiUrl = `https://us.api.blizzard.com/data/wow/connected-realm/${connectedRealmId}?namespace=${namespace}&locale=en_US&access_token=${accessToken}`;

    const realmRes = await fetch(realmApiUrl);
    if (!realmRes.ok) {
      const errorText = await realmRes.text();
      throw new Error(
        `Blizzard Realm API Error: ${realmRes.statusText} - ${errorText}`
      );
    }
    const realmData = await realmRes.json();

    // STEP 2: Extract the correct auctions URL from the response and use it.
    const auctionsUrl = realmData.auctions.href;
    if (!auctionsUrl) {
      throw new Error("Could not find auction house URL in realm data.");
    }

    // Now fetch the auctions using the URL Blizzard provided
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
