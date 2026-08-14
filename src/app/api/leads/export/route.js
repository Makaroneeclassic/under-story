import { getAllLeads } from "@/lib/leadsStore";

export async function GET() {
  try {
    const leads = await getAllLeads();

    // Generate CSV string with BOM for Excel Thai language support
    const bom = "\uFEFF";
    const headers = [
      "ID",
      "ชื่อ",
      "นามสกุล",
      "เบอร์โทรศัพท์",
      "ช่วงเดือนที่ต้องการจัดงาน",
      "สถานะ",
      "วันนัดหมายเข้าชม",
      "บันทึกเพิ่มเติม",
      "วันที่ส่งข้อมูล",
    ];

    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${(l.firstName || "").replace(/"/g, '""')}"`,
      `"${(l.lastName || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.eventMonth || "").replace(/"/g, '""')}"`,
      `"${l.status || "NEW"}"`,
      `"${(l.visitDate || "").replace(/"/g, '""')}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      `"${new Date(l.createdAt || Date.now()).toLocaleString("th-TH")}"`,
    ]);

    const csvContent =
      bom + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="understory_leads_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    return new Response(`Export error: ${error.message}`, { status: 500 });
  }
}
