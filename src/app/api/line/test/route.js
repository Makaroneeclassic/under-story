import { NextResponse } from "next/server";
import { sendLineTestNotification, getLineConfig } from "@/lib/lineNotification";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token: providedToken, targetId: providedTargetId, sendMode: providedSendMode } =
      body || {};

    const activeConfig = await getLineConfig();
    const token = providedToken?.trim() || activeConfig.token;
    const targetId = providedTargetId?.trim() || activeConfig.targetId;
    const sendMode = providedSendMode || activeConfig.sendMode || (targetId ? "push" : "broadcast");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณาระบุ LINE Channel Access Token",
        },
        { status: 400 }
      );
    }

    if (sendMode === "push" && !targetId) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ในโหมด Push จำเป็นต้องระบุ Target ID (User ID ขึ้นต้นด้วย U... หรือ Group ID ขึ้นต้นด้วย C...)",
        },
        { status: 400 }
      );
    }

    await sendLineTestNotification({ token, targetId, sendMode });

    const targetDesc =
      sendMode === "broadcast"
        ? "ทุกคนที่เพิ่มเพื่อน (Add Friend) LINE OA นี้แล้ว"
        : "Target ID ที่ระบุ";

    return NextResponse.json({
      success: true,
      message: `ส่งข้อความทดสอบไปยัง ${targetDesc} เรียบร้อยแล้ว! กรุณาตรวจสอบใน LINE แชทของคุณ`,
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
