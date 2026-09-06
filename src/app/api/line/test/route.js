import { NextResponse } from "next/server";
import { sendLineTestNotification, getLineConfig } from "@/lib/lineNotification";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token: providedToken, targetId: providedTargetId } = body || {};

    const activeConfig = await getLineConfig();
    const token = providedToken?.trim() || activeConfig.token;
    const targetId = providedTargetId?.trim() || activeConfig.targetId;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุ LINE Channel Access Token",
        },
        { status: 400 }
      );
    }

    if (!targetId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "กรุณาระบุ Target ID (User ID ขึ้นต้นด้วย U... หรือ Group ID ขึ้นต้นด้วย C...)",
        },
        { status: 400 }
      );
    }

    await sendLineTestNotification({ token, targetId });

    return NextResponse.json({
      success: true,
      message: "ส่งข้อความทดสอบไปยัง LINE เรียบร้อยแล้ว! กรุณาตรวจสอบใน LINE แชท/กลุ่มของคุณ",
    });
  } catch (error) {
    console.error("LINE test notification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: `ส่งข้อความไม่สำเร็จ: ${error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อ LINE API"}`,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
