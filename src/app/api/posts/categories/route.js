import { NextResponse } from "next/server";
import { getLocalCategories, saveLocalCategories, DEFAULT_CATEGORIES } from "@/lib/postsStore";

export async function GET() {
  try {
    const categories = getLocalCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return NextResponse.json({ success: true, categories: DEFAULT_CATEGORIES });
  }
}

export async function POST(request) {
  try {
    const { name } = await request.json();
    const cleanName = (name || "").trim();
    if (!cleanName) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุชื่อหมวดหมู่" },
        { status: 400 }
      );
    }

    const current = getLocalCategories();
    if (current.includes(cleanName)) {
      return NextResponse.json({ success: true, categories: current });
    }

    const updated = [...current, cleanName];
    saveLocalCategories(updated);
    return NextResponse.json({ success: true, categories: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
