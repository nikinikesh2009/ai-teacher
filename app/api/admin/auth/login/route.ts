import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { comparePassword, generateAdminToken } from "@/lib/adminAuth";

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

    const rows = await sql`
      SELECT id, email, password_hash, role FROM admins
      WHERE email = ${trimmedEmail}
      LIMIT 1
    `;

    if (!rows?.length) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const admin = rows[0] as {
      id: string;
      email: string;
      password_hash: string;
      role: string;
    };
    const isValid = await comparePassword(password, admin.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = generateAdminToken({
      adminId: admin.id,
      email: admin.email,
      role: admin.role,
    });

    const response = NextResponse.json({
      token,
      admin: { id: admin.id, email: admin.email, role: admin.role },
    });

    response.cookies.set("tutorflow_admin_token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
