import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== "OWNER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const userIdToUpdate = parseInt(params.id, 10);
  if (isNaN(userIdToUpdate)) {
    return NextResponse.json({ message: "Invalid User ID" }, { status: 400 });
  }

  try {
    const { role, status, imageUrl } = await request.json(); // Can now accept imageUrl

    if (!role && !status && !imageUrl) {
      return NextResponse.json(
        { message: "Role, status, or imageUrl is required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userIdToUpdate },
      data: {
        ...(role && { role }),
        ...(status && { status }),
        ...(imageUrl && { imageUrl }), // Add imageUrl to the update data
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { message: "Failed to update user", error: error.message },
      { status: 500 }
    );
  }
}
