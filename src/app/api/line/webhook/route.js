import { NextResponse } from "next/server";
import { getLineConfig, replyLineMessage } from "@/lib/lineNotification";

// GET: LINE Webhook Verification (Ping)
export async function GET() {
  return NextResponse.json({ status: "ok", message: "LINE Webhook is active" });
}

// POST: Handle LINE Webhook Events
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const events = body.events || [];

    const { token } = await getLineConfig();

    for (const event of events) {
      // 1. When a user adds (follows) or unblocks this LINE OA
      if (event.type === "follow" && event.replyToken && token) {
        try {
          await replyLineMessage({
            token,
            replyToken: event.replyToken,
            messages: [
              {
                type: "text",
                text: "🌿 ยินดีต้อนรับสู่ระบบแจ้งเตือน Understory Venue! 🎉\n\nคุณได้เชื่อมต่อระบบเรียบร้อยแล้ว เมื่อมีลูกค้าลงทะเบียนผ่านหน้าเว็บไซต์ ระบบจะส่งข้อมูล Lead แจ้งเตือนเข้าแชทนี้ทันทีครับ ✨",
              },
            ],
          });
        } catch (err) {
          console.error("Error replying to follow event:", err);
        }
      }

      // 2. When a user sends a text message to the bot
      if (event.type === "message" && event.message?.type === "text" && event.replyToken && token) {
        const userText = event.message.text?.trim().toLowerCase();
        let replyText =
          "🤖 บอทนี้คือระบบแจ้งเตือน Lead อัตโนมัติของ Understory Venue ครับ\nเมื่อมีลูกค้าลงทะเบียนใหม่ ระบบจะส่งรายละเอียดเข้ามาที่นี่โดยอัตโนมัติ";

        if (userText === "status" || userText === "สถานะ") {
          replyText = "✅ ระบบแจ้งเตือน Understory Venue ทำงานปกติ พร้อมรับการแจ้งเตือน Lead ใหม่ครับ";
        }

        try {
          await replyLineMessage({
            token,
            replyToken: event.replyToken,
            messages: [{ type: "text", text: replyText }],
          });
        } catch (err) {
          console.error("Error replying to message event:", err);
        }
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("LINE webhook handler error:", error);
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
