import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const FALLBACK_USERNAME = process.env.ADMIN_USERNAME || "adminunderstory";
const FALLBACK_PASSWORD = process.env.ADMIN_PASSWORD || "Under123story@";
const SESSION_TOKEN = "understory_auth_session_token_verified_98721";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    let isValid = false;

    // 1. Check in Supabase Database first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("admin_users")
          .select("*")
          .eq("username", username?.trim())
          .maybeSingle();

        if (!error && data) {
          if (data.password === password) {
            isValid = true;
            // Update last_login timestamp
            supabase
              .from("admin_users")
              .update({ last_login: new Date().toISOString() })
              .eq("id", data.id)
              .then();
          }
        }
      } catch (err) {
        console.error("Supabase auth check error:", err);
      }
    }

    // 2. Fallback to Env / Config check if not verified by Supabase table yet
    if (!isValid) {
      if (username === FALLBACK_USERNAME && password === FALLBACK_PASSWORD) {
        isValid = true;
      }
    }

    if (isValid) {
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
        maxAge: 60 * 60 * 24 * 7,
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
