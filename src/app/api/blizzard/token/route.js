import { NextResponse } from "next/server";

const clientId = process.env.BLIZZARD_CLIENT_ID;
const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

// This function will get an access token from Blizzard's API
async function getAccessToken() {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch("https://us.battle.net/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to fetch token: ${
          errorData.error_description || response.statusText
        }`
      );
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error fetching Blizzard access token:", error);
    throw error; // Re-throw the error to be caught by the handler
  }
}

// This is the main API route handler. We are exporting it as GET,
// but we will call it internally from our other API routes.
export async function GET() {
  try {
    const token = await getAccessToken();
    // This route is not meant to be called directly by the client,
    // but we can return the token for testing purposes if needed.
    return NextResponse.json({ accessToken: token });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to retrieve access token", error: error.message },
      { status: 500 }
    );
  }
}

// We also export the getAccessToken function so we can import and use it in other server-side files.
export { getAccessToken };
