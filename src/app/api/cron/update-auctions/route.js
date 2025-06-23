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
    max: 1, // Recommended for serverless functions
  });

  try {
    const accessToken = await getBlizzardToken();
    const connectedRealmId = 11; // Example for Proudmoore US
    const namespace = "dynamic-us";

    // --- THIS IS THE FIX ---
    // STEP 1: Get the main Auction House ID.
    // We are targeting the main cross-faction auction house (ID: 2)
    // Other IDs are 6 (Horde) and 7 (Alliance), but 2 contains everything.
    const auctionHouseId = 2;

    // STEP 2: Use that ID to fetch the actual auction listings.
    const apiUrl = `https://us.api.blizzard.com/data/wow/connected-realm/${connectedRealmId}/auctions/${auctionHouseId}?namespace=${namespace}&locale=en_US&access_token=${accessToken}`;

    const res = await fetch(apiUrl);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Blizzard API Error: ${res.statusText} - ${errorText}`);
    }

    const { auctions } = await res.json();

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
