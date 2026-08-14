import { NextResponse } from "next/server";
import { getAllLeads, createLead, updateLeadStatus, deleteLeadById } from "@/lib/leadsStore";

// GET: Fetch all leads (sorted newest first)
export async function GET() {
  try {
    const leads = await getAllLeads();
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch leads", error: error.message },
      { status: 500 }
    );
  }
}

// POST: Submit a new lead from client form
export async function POST(request) {
  try {
    const body = await request.json();
    const { firstName, lastName, eventMonth, phone, notes } = body;

    // Validation
    if (!firstName || !lastName || !eventMonth || !phone) {
      return NextResponse.json(
        {
          success: false,
          message: "กรุณากรอกข้อมูลให้ครบถ้วน (ชื่อ, นามสกุล, ช่วงเดือนที่จัดงาน, เบอร์โทรศัพท์)",
        },
        { status: 400 }
      );
    }

    const newLead = await createLead({
      firstName,
      lastName,
      eventMonth,
      phone,
      notes: notes || "",
    });

    return NextResponse.json(
      {
        success: true,
        message: "บันทึกข้อมูลเรียบร้อยแล้ว ทีมงาน Understory จะติดต่อกลับโดยเร็วที่สุด",
        lead: newLead,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update lead status or notes
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, notes, visitDate } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Lead ID is required" },
        { status: 400 }
      );
    }

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (visitDate !== undefined) updates.visitDate = visitDate;

    const updated = await updateLeadStatus(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update lead", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete a lead
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Lead ID is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteLeadById(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Lead not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Lead deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete lead", error: error.message },
      { status: 500 }
    );
  }
}
