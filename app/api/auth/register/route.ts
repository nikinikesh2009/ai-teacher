import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password: string): boolean {
  return typeof password === "string" && password.length >= 6;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    if (!validateEmail(trimmedEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const rows = await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${trimmedEmail}, ${passwordHash})
      RETURNING id, email, created_at
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    const user = rows[0] as { id: string; email: string; created_at: string };
    const token = generateToken(user.id);

    const response = NextResponse.json({
      token,
      user: { id: user.id, email: user.email },
    });

    response.cookies.set("tutorflow_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed";
    if (message.includes("duplicate") || message.includes("unique")) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
