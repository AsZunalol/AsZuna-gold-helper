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
  if (!response.ok) throw new Error("Failed to get Blizzard token");
  const data = await response.json();
  return data.access_token;
}

export async function GET(request) {
  // Final check for security header
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // --- THIS IS THE FIX ---
  // We are using the 'postgres' library which has a more robust SSL/Auth implementation.
  // The '?sslmode=require' in your connection string is still important.
  const sql = postgres(process.env.POSTGRES_AUCTION_URL, {
    // This library recommends explicit SSL settings for serverless environments.
    ssl: "require",
  });

  try {
    const accessToken = await getBlizzardToken();
    const realmId = 4728; // Proudmoore US
    const namespace = "dynamic-us";
    const locale = "en_US";

    const apiUrl = `https://us.api.blizzard.com/data/wow/connected-realm/${realmId}/auctions?namespace=${namespace}&locale=${locale}&access_token=${accessToken}`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Blizzard API Error: ${res.statusText} - ${errorText}`);
    }

    const { auctions } = await res.json();

    // Use a transaction for database operations
    await sql.begin(async (sql) => {
      await sql`TRUNCATE TABLE auctions`;

      // Batch insert for performance
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
    // The library handles connection closing automatically.
    await sql.end();
  }
}
