// src/app/api/blizzard/token/route.js

import { NextResponse } from "next/server";
import { getAccessToken as getNewAccessToken } from "@/lib/wow/blizzard-api"; // Import the centralized function

// This is the main API route handler.
export async function GET() {
  try {
    const token = await getNewAccessToken("us"); // Default to 'us' or get from params
    return NextResponse.json({ accessToken: token });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to retrieve access token", error: error.message },
      { status: 500 }
    );
  }
}
