// src/app/api/auth/register/route.js
import prisma from "@/lib/prisma"; // Use the shared prisma instance
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { PROFILE_IMAGES } from "@/lib/constants";

const saltRounds = 10;

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const randomImage =
      PROFILE_IMAGES[Math.floor(Math.random() * PROFILE_IMAGES.length)];

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        imageUrl: randomImage,
        role: "USER",
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          username: newUser.username,
          imageUrl: newUser.imageUrl,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Username or email already exists." },
        { status: 409 }
      );
    }
    // Log the full error for better debugging on the server
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "An error occurred.", error: error.message },
      { status: 500 }
    );
  }
}
