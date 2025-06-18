// src/app/api/guides/[id]/route.js

import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Fully patched version to workaround Next.js bug with params
async function getParams(context) {
  if (typeof context.params === "function") {
    return await context.params();
  }
  return context.params;
}

export async function GET(request, context) {
  await request.text();
  const params = await getParams(context);

  try {
    const guideId = parseInt(params.id, 10);
    if (isNaN(guideId)) {
      return NextResponse.json(
        { message: "Invalid Guide ID" },
        { status: 400 }
      );
    }

    const guide = await prisma.guide.findUnique({ where: { id: guideId } });
    if (!guide) {
      return NextResponse.json({ message: "Guide not found" }, { status: 404 });
    }

    return NextResponse.json(guide);
  } catch (error) {
    console.error("Error fetching guide:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  const params = await getParams(context);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const guideId = parseInt(params.id, 10);
    if (isNaN(guideId)) {
      return NextResponse.json(
        { message: "Invalid Guide ID" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const updateData = {};
    const allowedFields = [
      "title",
      "category",
      "expansion",
      "is_route",
      "is_transmog",
      "description",
      "steps",
      "youtube_video_id",
      "gold_pr_hour",
      "time_to_complete",
      "recommended_class",
      "tags",
      "status",
      "thumbnail_url",
      "slider_images",
      "addons",
      "required_items",
      "items_of_note",
      "map_image_path",
      "tsm_import_string",
      "route_string",
      "guide_type",
      "gold_sessions",
      "macro_string",
      "authorId",
    ];

    for (const key of allowedFields) {
      if (data[key] !== undefined) {
        updateData[key] = data[key];
      }
    }

    updateData.updatedAt = new Date();

    const updatedGuide = await prisma.guide.update({
      where: { id: guideId },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Guide updated successfully", guide: updatedGuide },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating guide:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { message: "Guide not found." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Failed to update guide.", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, context) {
  await request.text();
  const params = await getParams(context);
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !["ADMIN", "OWNER"].includes(session.user.role)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const guideId = parseInt(params.id, 10);
    if (isNaN(guideId)) {
      return NextResponse.json(
        { message: "Invalid Guide ID" },
        { status: 400 }
      );
    }

    await prisma.guide.delete({ where: { id: guideId } });
    return NextResponse.json(
      { message: "Guide deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json({ message: "Guide not found" }, { status: 404 });
    }
    console.error("Failed to delete guide:", error);
    return NextResponse.json(
      { message: "Failed to delete guide." },
      { status: 500 }
    );
  }
}
