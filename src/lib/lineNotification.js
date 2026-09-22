import { getSettings } from "./settingsStore.js";

/**
 * Get active LINE OA Messaging API configuration
 */
const DEFAULT_LINE_TOKEN =
  "0vjbGCrH7ewxX7ONv09MifjQftiHNIezT6HF/cHr9Voasgv0ncL2jIjxk6NSfhNIJlFwFbabfCeqvx28h2Bf8V6VuGalAi3IH/EtpmV0hkXXdj/vKY9ueloykCStspEECMGPtn/VXhQrN+8pMS/y8AdB04t89/1O/w1cDnyilFU=";

export async function getLineConfig() {
  try {
    const settings = await getSettings();
    const token =
      settings?.lineChannelAccessToken?.trim() ||
      process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() ||
      DEFAULT_LINE_TOKEN;
    const targetId =
      settings?.lineTargetId?.trim() ||
      process.env.LINE_TARGET_ID?.trim() ||
      process.env.LINE_USER_ID?.trim() ||
      process.env.LINE_GROUP_ID?.trim() ||
      "";
    const sendMode = settings?.lineSendMode || (targetId ? "push" : "broadcast");
    const enabled =
      typeof settings?.enableLineNotify === "boolean"
        ? settings.enableLineNotify
        : Boolean(token);

    return { token, targetId, enabled, sendMode };
  } catch (error) {
    console.error("Error loading LINE config, using default fallback:", error);
    return {
      token: process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() || DEFAULT_LINE_TOKEN,
      targetId: process.env.LINE_TARGET_ID?.trim() || "",
      enabled: true,
      sendMode: "broadcast",
    };
  }
}

/**
 * Format Thai date/time string
 */
function formatThaiDateTime(dateInput) {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    return date.toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Create LINE Flex Message payload for a new Lead
 */
export function createLeadFlexMessage(lead, adminUrl = "https://understoryvenue.com/admin") {
  const fullName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "ไม่ระบุชื่อ";
  const phone = lead.phone || "ไม่ระบุ";
  const eventMonth = lead.eventMonth || "ไม่ระบุ";
  const notes = lead.notes || "-";
  const formattedTime = formatThaiDateTime(lead.createdAt);

  const cleanPhone = phone.replace(/[^0-9+]/g, "");

  return {
    type: "flex",
    altText: `🔔 มี Lead ใหม่: คุณ ${fullName} (${phone})`,
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#1F1D1A",
        paddingAll: "20px",
        paddingBottom: "16px",
        contents: [
          {
            type: "text",
            text: "UNDERSTORY VENUE",
            weight: "bold",
            color: "#D3CCC0",
            size: "xxs",
          },
          {
            type: "text",
            text: "🌿 มี Lead ใหม่ติดต่อเข้ามา!",
            weight: "bold",
            color: "#FFFFFF",
            size: "lg",
            margin: "sm",
          },
          {
            type: "text",
            text: "แบบฟอร์มลงทะเบียนแสดงความสนใจจัดงาน",
            color: "#9C8B72",
            size: "xs",
            margin: "xs",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#FAF9F5",
        paddingAll: "20px",
        spacing: "md",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "👤 ชื่อลูกค้า",
                size: "xs",
                color: "#665340",
                flex: 3,
                weight: "bold",
              },
              {
                type: "text",
                text: fullName,
                size: "sm",
                color: "#1C1917",
                flex: 7,
                weight: "bold",
                wrap: true,
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "📞 เบอร์โทร",
                size: "xs",
                color: "#665340",
                flex: 3,
                weight: "bold",
              },
              {
                type: "text",
                text: phone,
                size: "sm",
                color: "#1E3A8A",
                flex: 7,
                weight: "bold",
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "📅 เดือนจัดงาน",
                size: "xs",
                color: "#665340",
                flex: 3,
                weight: "bold",
              },
              {
                type: "text",
                text: eventMonth,
                size: "xs",
                color: "#1C1917",
                flex: 7,
                wrap: true,
              },
            ],
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "📝 หมายเหตุ",
                size: "xs",
                color: "#665340",
                flex: 3,
                weight: "bold",
              },
              {
                type: "text",
                text: notes,
                size: "xs",
                color: "#4A4742",
                flex: 7,
                wrap: true,
              },
            ],
          },
          {
            type: "separator",
            margin: "md",
            color: "#E5E0D8",
          },
          {
            type: "box",
            layout: "horizontal",
            margin: "md",
            contents: [
              {
                type: "text",
                text: "⏰ เวลาส่งข้อมูล",
                size: "xxs",
                color: "#9C8B72",
                flex: 3,
              },
              {
                type: "text",
                text: formattedTime,
                size: "xxs",
                color: "#9C8B72",
                flex: 7,
              },
            ],
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        backgroundColor: "#FFFFFF",
        paddingAll: "16px",
        contents: [
          ...(cleanPhone
            ? [
                {
                  type: "button",
                  style: "primary",
                  height: "sm",
                  color: "#166534",
                  action: {
                    type: "uri",
                    label: "📞 โทรหาลูกค้า",
                    uri: `tel:${cleanPhone}`,
                  },
                },
              ]
            : []),
          {
            type: "button",
            style: "primary",
            height: "sm",
            color: "#665340",
            action: {
              type: "uri",
              label: "📊 ดูในระบบ Admin",
              uri: adminUrl,
            },
          },
        ],
      },
    },
  };
}

/**
 * Send Broadcast Message to ALL followers via LINE Messaging API
 * (Anyone who adds the LINE Official Account as a friend will receive it)
 */
export async function broadcastLineMessage({ token, messages }) {
  if (!token) {
    throw new Error("Missing LINE Channel Access Token");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/broadcast", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messages: Array.isArray(messages) ? messages : [messages],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detailMsg = data?.details?.map((d) => `${d.property ? d.property + ": " : ""}${d.message}`).join("; ");
    const errorMsg = detailMsg
      ? `${data?.message || "LINE API Error"} (${detailMsg})`
      : data?.message || `LINE API returned status ${response.status}`;
    throw new Error(errorMsg);
  }

  return { success: true, data };
}

/**
 * Reply to an incoming webhook message/follow event
 */
export async function replyLineMessage({ token, replyToken, messages }) {
  if (!token || !replyToken) {
    throw new Error("Missing token or replyToken");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: Array.isArray(messages) ? messages : [messages],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detailMsg = data?.details?.map((d) => `${d.property ? d.property + ": " : ""}${d.message}`).join("; ");
    const errorMsg = detailMsg
      ? `${data?.message || "LINE API Error"} (${detailMsg})`
      : data?.message || `LINE API returned status ${response.status}`;
    throw new Error(errorMsg);
  }

  return { success: true, data };
}

/**
 * Send Push Message via LINE Messaging API to specific user or group
 */
export async function pushLineMessage({ token, targetId, messages }) {
  if (!token || !targetId) {
    throw new Error("Missing LINE token or targetId");
  }

  const response = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to: targetId,
      messages: Array.isArray(messages) ? messages : [messages],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detailMsg = data?.details?.map((d) => `${d.property ? d.property + ": " : ""}${d.message}`).join("; ");
    const errorMsg = detailMsg
      ? `${data?.message || "LINE API Error"} (${detailMsg})`
      : data?.message || `LINE API returned status ${response.status}`;
    throw new Error(errorMsg);
  }

  return { success: true, data };
}

/**
 * Send notification for a newly created lead
 * Supports both Broadcast (to all friends who added the bot) and Push (to specific user/group ID)
 */
export async function sendLineLeadNotification(lead, retryCount = 1) {
  try {
    const { token, targetId, enabled, sendMode } = await getLineConfig();

    if (!enabled || !token) {
      console.warn("[LINE Notify] Skipped: disabled or unconfigured", { enabled, hasToken: Boolean(token) });
      return { success: false, reason: "disabled_or_unconfigured" };
    }

    const host =
      process.env.NEXT_PUBLIC_SITE_URL ||
      "https://understoryvenue.com";
    const adminUrl = `${host.replace(/\/$/, "")}/admin`;

    const flexMsg = createLeadFlexMessage(lead, adminUrl);

    let lastError = null;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        if (sendMode === "broadcast" || !targetId) {
          await broadcastLineMessage({
            token,
            messages: [flexMsg],
          });
        } else {
          await pushLineMessage({
            token,
            targetId,
            messages: [flexMsg],
          });
        }
        console.log(`[LINE Notify] Successfully delivered lead notification for ${lead.firstName || "Customer"}`);
        return { success: true };
      } catch (err) {
        lastError = err;
        console.error(`[LINE Notify] Attempt ${attempt + 1} failed:`, err.message);
        if (attempt < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }
    }

    return { success: false, error: lastError?.message || "Send failed after retries" };
  } catch (error) {
    console.error("[LINE Notify] Failed to send LINE lead notification:", error.message || error);
    return { success: false, error: error.message };
  }
}

/**
 * Send test notification from Admin page
 */
export async function sendLineTestNotification({ token, targetId, sendMode = "broadcast" }) {
  const dummyLead = {
    firstName: "ทดสอบ",
    lastName: "ระบบแจ้งเตือน",
    phone: "089-999-9999",
    eventMonth: "พฤศจิกายน 2568",
    notes: "นี่คือข้อความทดสอบการเชื่อมต่อ LINE Official Account (Messaging API)",
    createdAt: new Date().toISOString(),
  };

  const flexMsg = createLeadFlexMessage(dummyLead);
  const messages = [
    {
      type: "text",
      text: "✅ [Understory Venue] ทดสอบการเชื่อมต่อ LINE OA สำเร็จเรียบร้อยแล้ว!",
    },
    flexMsg,
  ];

  if (sendMode === "broadcast" || !targetId) {
    return broadcastLineMessage({ token, messages });
  }

  return pushLineMessage({
    token,
    targetId,
    messages,
  });
}
