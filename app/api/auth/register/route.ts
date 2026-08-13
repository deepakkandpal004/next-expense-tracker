import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { rateLimitRegister } from "@/lib/rate-limit";
import { withApiLogging } from "@/lib/server/logger";

const MIN_PASSWORD_LENGTH = 8;

export const POST = withApiLogging(async (request: Request) => {
  const limit = await rateLimitRegister(request);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)),
        },
      },
    );
  }

  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        {
          error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
        },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "If this email is already registered, please sign in." },
        { status: 400 },
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate nice avatar image using UI-Avatars
    const formattedName = encodeURIComponent(name);
    const imageUrl = `https://ui-avatars.com/api/?name=${formattedName}&background=10b981&color=fff&bold=true&size=128`;

    // Create user in DB
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        imageUrl,
      },
    });

    await createSession(newUser.id);

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          imageUrl: newUser.imageUrl,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
});
