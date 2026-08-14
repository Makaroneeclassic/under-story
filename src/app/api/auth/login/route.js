import { NextResponse } from "next/server";

// Default admin credentials (can be overridden by environment variables on Vercel)
const VALID_USERNAME = process.env.ADMIN_USERNAME || "adminunderstory";
const VALID_PASSWORD = process.env.ADMIN_PASSWORD || "Under123story@";

// Secret auth token
const SESSION_TOKEN = "understory_auth_session_token_verified_98721";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const response = NextResponse.json({
        success: true,
        message: "เข้าสู่ระบบสำเร็จ",
      });

      // Set secure HTTP-only cookie valid for 7 days
      response.cookies.set({
        name: "admin_session",
        value: SESSION_TOKEN,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในระบบ", error: error.message },
      { status: 500 }
    );
  }
}
