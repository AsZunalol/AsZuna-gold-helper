import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let region, realm;
  try {
    const body = await req.json();
    region = body.region;
    realm = body.realm;
  } catch (err) {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  if (!region || !realm) {
    return NextResponse.json(
      { message: "Region and Realm are required." },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        region: region,
        realm: realm,
      },
    });

    return NextResponse.json(
      {
        message: "Profile updated successfully.",
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          username: updatedUser.username,
          role: updatedUser.role,
          region: updatedUser.region,
          realm: updatedUser.realm,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json(
      { message: "Failed to update profile settings." },
      { status: 500 }
    );
  }
}
