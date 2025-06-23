import { NextResponse } from "next/server";
import { Pool } from "pg";

// Helper function to get an access token from Blizzard
async function getBlizzardToken() {
  const credentials = Buffer.from(
    `${process.env.BLIZZARD_CLIENT_ID}:${process.env.BLIZZARD_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(
    "https://us.battle.net/oauth/token?grant_type=client_credentials",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to get Blizzard token");
  }
  const data = await response.json();
  return data.access_token;
}

export async function GET(request) {
  // Secure your cron job
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Connect to Supabase using the standard 'pg' library
  const pool = new Pool({
    connectionString: process.env.POSTGRES_AUCTION_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const client = await pool.connect();

  try {
    const accessToken = await getBlizzardToken();
    const realmId = 4728; // Example: Proudmoore US.
    const namespace = "dynamic-us";
    const locale = "en_US";

    const apiUrl = `https://us.api.blizzard.com/data/wow/connected-realm/${realmId}/auctions?namespace=${namespace}&locale=${locale}&access_token=${accessToken}`;
    const res = await fetch(apiUrl);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(
        `Failed to fetch auction data: ${res.statusText} - ${errorText}`
      );
    }

    const { auctions } = await res.json();

    await client.query("BEGIN");
    await client.query("TRUNCATE TABLE auctions");

    const batchSize = 500;
    for (let i = 0; i < auctions.length; i += batchSize) {
      const batch = auctions.slice(i, i + batchSize);
      const values = [];
      const queryParams = [];

      batch.forEach((auction, index) => {
        if (auction.buyout) {
          const valueIndex = values.length * 4;
          queryParams.push(
            `($${valueIndex + 1}, $${valueIndex + 2}, $${valueIndex + 3}, $${
              valueIndex + 4
            })`
          );
          values.push(
            auction.item.id,
            auction.quantity,
            auction.buyout,
            auction.time_left
          );
        }
      });

      if (queryParams.length > 0) {
        const queryText = `INSERT INTO auctions(item_id, quantity, buyout, time_left) VALUES ${queryParams.join(
          ", "
        )}`;
        await client.query(queryText, values);
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${auctions.length} auctions.`,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    client.release();
    await pool.end();
  }
}
