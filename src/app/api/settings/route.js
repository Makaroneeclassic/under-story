import { NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/lib/settingsStore";

// GET: Fetch tracking settings
export async function GET() {
  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to load settings", error: error.message },
      { status: 500 }
    );
  }
}

// POST / PATCH: Update tracking settings
export async function POST(request) {
  try {
    const body = await request.json();
    const updated = await updateSettings(body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Failed to save settings" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "บันทึกการตั้งค่า Tracking & Analytics เรียบร้อยแล้ว",
      settings: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error saving settings", error: error.message },
      { status: 500 }
    );
  }
}
