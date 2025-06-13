import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
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

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: "USER", // All new users are "USER" by default
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: { id: newUser.id, username: newUser.username },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle cases where username or email already exists
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Username or email already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "An error occurred.", error: error.message },
      { status: 500 }
    );
  }
}
