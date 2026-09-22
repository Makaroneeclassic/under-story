import { NextResponse } from "next/server";
import { getAllLeads } from "@/lib/leadsStore";
import { sendLineLeadNotification } from "@/lib/lineNotification";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { leadId } = body || {};

    if (!leadId) {
      return NextResponse.json(
        { success: false, message: "Lead ID is required" },
        { status: 400 }
      );
    }

    const leads = await getAllLeads();
    const lead = leads.find((l) => l.id === leadId);

    if (!lead) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    const result = await sendLineLeadNotification(lead);
    if (!result?.success) {
      return NextResponse.json(
        {
          success: false,
          message: result?.error || result?.reason || "Failed to send LINE notification",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `ส่งการแจ้งเตือนของ ${lead.firstName} เข้า LINE เรียบร้อยแล้ว!`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
