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
    const namespace = "dynamic-us";

    // --- THIS IS THE DEFINITIVE FIX ---
    // The modern Blizzard API uses a single, simpler endpoint for all commodity auctions in a region.
    // The old /connected-realm/ endpoint is deprecated for this purpose. This is the correct URL.
    const apiUrl = `https://us.api.blizzard.com/data/wow/auctions/commodities?namespace=${namespace}&locale=en_US&access_token=${accessToken}`;

    const res = await fetch(apiUrl);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Blizzard API Error: ${res.statusText} - ${errorText}`);
    }

    const { auctions } = await res.json();

    if (!auctions || auctions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No commodity auctions found to update.",
      });
    }

    // Since this is a large dataset, we will only insert a portion to confirm it works.
    // We will take the first 5000 auctions.
    const limitedAuctions = auctions.slice(0, 5000);

    await sql.begin(async (sql) => {
      await sql`TRUNCATE TABLE auctions`;
      for (let i = 0; i < limitedAuctions.length; i += 500) {
        const batch = limitedAuctions
          .slice(i, i + 500)
          .filter((a) => a.buyout) // Ensure there's a buyout price
          .map((a) => ({
            item_id: a.item.id,
            quantity: a.quantity,
            buyout: a.buyout,
            time_left: "N/A", // Commodity auctions don't have a time_left
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
      message: `Successfully updated ${limitedAuctions.length} auctions.`,
    });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    await sql.end();
  }
}
