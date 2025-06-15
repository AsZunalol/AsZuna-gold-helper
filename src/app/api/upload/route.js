// aszunalol/aszuna-gold-helper/AsZuna-gold-helper-e7b64661f52d01644dc7d7dea50098deeb640633/src/app/api/upload/route.js

import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route"; // Make sure this path is correct

export async function POST(request) {
  try {
    // --- Re-enabled Security Check ---
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // --------------------------------

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename || !request.body) {
      return NextResponse.json(
        { message: "No filename or file provided" },
        { status: 400 }
      );
    }

    const blob = await put(filename, request.body, {
      access: "public",
      addRandomSuffix: true, // Added this line to fix the "blob already exists" error
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      {
        message: "An unexpected error occurred.",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
