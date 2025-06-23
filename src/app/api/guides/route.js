// src/app/api/guides/route.js

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// --- START OF FIX ---
// This new GET function will handle requests to fetch all guides.
export async function GET(request) {
  try {
    const guides = await prisma.guide.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(guides, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch guides:", error);
    return NextResponse.json(
      { message: "Failed to fetch guides", error: error.message },
      { status: 500 }
    );
  }
}
// --- END OF FIX ---

// POST handler to create a new guide
export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!currentUser || !["ADMIN", "OWNER"].includes(currentUser.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await request.json();

    const authorId = parseInt(data.authorId, 10);
    if (isNaN(authorId)) {
      return NextResponse.json(
        { message: "Invalid author ID" },
        { status: 400 }
      );
    }

    const newGuide = await prisma.guide.create({
      data: {
        title: data.title,
        category: data.category,
        expansion: data.expansion,
        is_transmog: data.is_transmog,
        description: data.description,
        steps: data.steps,
        youtube_video_id: data.youtube_video_id,
        gold_pr_hour: data.gold_pr_hour,
        time_to_complete: data.time_to_complete,
        tags: data.tags,
        thumbnail_url: data.thumbnail_url,
        slider_images: data.slider_images,
        recommended_addons: data.recommended_addons,
        required_items: data.required_items,
        items_of_note: data.items_of_note,
        map_image_url: data.map_image_url,
        tsm_import_string: data.tsm_import_string,
        route_string: data.route_string,
        macro_string: data.macro_string,
        gold_sessions: data.gold_sessions,
        guide_type: data.guide_type,
        status: data.status, // This line was missing, it's now fixed.
        authorId: authorId,
      },
    });

    return NextResponse.json(newGuide, { status: 201 });
  } catch (error) {
    console.error("Failed to create guide:", error);
    return NextResponse.json(
      { message: "Failed to create guide", error: error.message },
      { status: 500 }
    );
  }
}
