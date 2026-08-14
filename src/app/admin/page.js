"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

const STATUS_CONFIG = {
  NEW: { label: "ใหม่ (ยังไม่ติดต่อ)", bg: "bg-amber-100 text-amber-900 border-amber-300" },
  CONTACTED: { label: "ติดต่อแล้ว", bg: "bg-blue-100 text-blue-900 border-blue-300" },
  VISIT_SCHEDULED: { label: "นัดเข้าชมสถานที่", bg: "bg-purple-100 text-purple-900 border-purple-300" },
  PACKAGE_SENT: { label: "ส่งแพ็กเกจแล้ว", bg: "bg-cyan-100 text-cyan-900 border-cyan-300" },
  WON: { label: "จองสำเร็จ (Won)", bg: "bg-emerald-100 text-emerald-900 border-emerald-300" },
  ARCHIVED: { label: "ยกเลิก / เก็บถาวร", bg: "bg-stone-200 text-stone-700 border-stone-300" },
};

export default function AdminDashboardPage() {
  // Navigation Tabs: 'leads' | 'tracking'
  const [activeTab, setActiveTab] = useState("leads");

  // --- Leads State ---
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);

  // --- Tracking Settings State ---
  const [settings, setSettings] = useState({
    enableGTM: false,
    gtmId: "",
    enableGA4: false,
    ga4Id: "",
    enableFBPixel: false,
    fbPixelId: "",
    enableTikTokPixel: false,
    tiktokPixelId: "",
    customHeadScript: "",
    customBodyScript: "",
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState(null);

  // Fetch Leads
  useEffect(() => {
    let ignore = false;
    async function loadLeads() {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (!ignore && data.success) {
          setLeads(data.leads);
        }
      } catch (err) {
        console.error("Failed to load leads", err);
      } finally {
        if (!ignore) setLoadingLeads(false);
      }
    }
    loadLeads();
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch Settings
  useEffect(() => {
    let ignore = false;
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (!ignore && data.success) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to load tracking settings", err);
      } finally {
        if (!ignore) setLoadingSettings(false);
      }
    }
    loadSettings();
    return () => {
      ignore = true;
    };
  }, []);

  // Update lead status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      }
    } catch (err) {
      console.error("Status update error", err);
    }
  };

  // Update lead notes
  const handleUpdateNotes = async (id, newNotes) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, notes: newNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes: newNotes } : l)));
      }
    } catch (err) {
      console.error("Note update error", err);
    }
  };

  // Delete lead
  const handleDelete = async (id) => {
    if (!confirm("คุณต้องการลบข้อมูล Lead รายการนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Save Tracking Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        setSettingsMessage({ type: "success", text: "✅ บันทึกการตั้งค่า Tracking & Analytics สำเร็จแล้ว" });
      } else {
        setSettingsMessage({ type: "error", text: "❌ เกิดข้อผิดพลาดในการบันทึก" });
      }
    } catch (err) {
      console.error("Settings save error:", err);
      setSettingsMessage({ type: "error", text: "❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์" });
    } finally {
      setSavingSettings(false);
      setTimeout(() => setSettingsMessage(null), 5000);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter((l) => l.status === "NEW").length;
    const visits = leads.filter((l) => l.status === "VISIT_SCHEDULED").length;
    const won = leads.filter((l) => l.status === "WON").length;
    return { total, newLeads, visits, won };
  }, [leads]);

  // Months available
  const availableMonths = useMemo(() => {
    const months = new Set(leads.map((l) => l.eventMonth).filter(Boolean));
    return Array.from(months);
  }, [leads]);

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        `${l.firstName} ${l.lastName} ${l.phone} ${l.notes}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "ALL" || l.status === statusFilter;
      const matchMonth = monthFilter === "ALL" || l.eventMonth === monthFilter;
      return matchSearch && matchStatus && matchMonth;
    });
  }, [leads, searchQuery, statusFilter, monthFilter]);

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#2D2A26] font-sans antialiased">
      {/* Top Admin Header */}
      <header className="bg-[#ECEAE3] border-b border-[#9C8B72]/30 px-6 py-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo_understory_authentic.png"
                alt="Understory Logo"
                width={130}
                height={55}
                className="h-8 w-auto object-contain"
              />
            </Link>
            <div className="h-5 w-[1px] bg-[#9C8B72]/40 hidden sm:block"></div>
            <div>
              <h1 className="font-serif text-lg text-[#000000] font-semibold leading-tight">
                Understory Admin Center
              </h1>
              <p className="text-xs text-[#665340]">จัดการข้อมูลลูกค้า และระบบ Tracking / Analytics</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "leads" && (
              <a
                href="/api/leads/export"
                className="bg-[#FFFFFF] border border-[#9C8B72]/50 hover:bg-[#F1F0EB] text-[#4A4742] text-xs font-medium px-4 py-2 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                download
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export Excel (CSV)
              </a>
            )}
            <Link
              href="/"
              className="bg-[#000000] hover:bg-[#665340] text-[#F1F0EB] text-xs font-semibold px-4 py-2 rounded-md shadow-sm transition-colors"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto mt-4 flex gap-2 border-t border-[#9C8B72]/20 pt-3">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-4 py-2 rounded-md text-xs font-semibold tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "leads"
                ? "bg-[#665340] text-white shadow-xs"
                : "bg-white/60 text-[#4A4742] hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">person_search</span>
            จัดการรายชื่อลูกค้า (Leads)
            <span className="ml-1 bg-black/20 text-white px-1.5 py-0.5 rounded-full text-[10px]">
              {leads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tracking")}
            className={`px-4 py-2 rounded-md text-xs font-semibold tracking-wider flex items-center gap-2 cursor-pointer transition-all ${
              activeTab === "tracking"
                ? "bg-[#665340] text-white shadow-xs"
                : "bg-white/60 text-[#4A4742] hover:bg-white"
            }`}
          >
            <span className="material-symbols-outlined text-base">analytics</span>
            การตลาด &amp; Tracking (GA4, GTM, Pixel)
            {(settings.enableGA4 || settings.enableGTM || settings.enableFBPixel || settings.enableTikTokPixel) && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ================= TAB 1: LEADS MANAGEMENT ================= */}
        {activeTab === "leads" && (
          <div>
            {/* KPI Metrics Summary Cards */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-xl border border-[#9C8B72]/20 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-[#665340] uppercase tracking-wider">
                  Total Inquiries
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-serif font-bold text-[#000000]">{metrics.total}</span>
                  <span className="text-xs text-[#9C8B72]">รายชื่อทั้งหมด</span>
                </div>
              </div>

              <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  New Leads
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-serif font-bold text-amber-950">{metrics.newLeads}</span>
                  <span className="text-xs text-amber-800">รอการติดต่อ</span>
                </div>
              </div>

              <div className="bg-purple-50/70 p-5 rounded-xl border border-purple-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider">
                  Visits Scheduled
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-serif font-bold text-purple-950">{metrics.visits}</span>
                  <span className="text-xs text-purple-800">นัดชมสถานที่</span>
                </div>
              </div>

              <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-200/60 shadow-xs flex flex-col justify-between">
                <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                  Confirmed (Won)
                </span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-3xl font-serif font-bold text-emerald-950">{metrics.won}</span>
                  <span className="text-xs text-emerald-800">จองแพ็กเกจ</span>
                </div>
              </div>
            </section>

            {/* Filters & Search Toolbar */}
            <section className="bg-white p-4 rounded-xl border border-[#9C8B72]/20 shadow-xs mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
              {/* Search Box */}
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8B72] text-sm">
                  search
                </span>
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, เบอร์โทร, หมายเหตุ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#9C8B72]/40 focus:outline-none focus:border-[#665340] bg-[#FAF9F5]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9C8B72] hover:text-[#000000]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Dropdowns */}
              <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#665340] font-medium">สถานะ:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg px-3 py-2 focus:outline-none focus:border-[#665340]"
                  >
                    <option value="ALL">ทั้งหมด ({leads.length})</option>
                    {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                      <option key={key} value={key}>
                        {val.label} ({leads.filter((l) => l.status === key).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Month Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#665340] font-medium">เดือนจัดงาน:</span>
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="text-xs bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg px-3 py-2 focus:outline-none focus:border-[#665340]"
                  >
                    <option value="ALL">ทุกช่วงเดือน</option>
                    {availableMonths.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                {(statusFilter !== "ALL" || monthFilter !== "ALL" || searchQuery) && (
                  <button
                    onClick={() => {
                      setStatusFilter("ALL");
                      setMonthFilter("ALL");
                      setSearchQuery("");
                    }}
                    className="text-xs text-[#665340] hover:underline"
                  >
                    ล้างตัวกรอง
                  </button>
                )}
              </div>
            </section>

            {/* Leads Table View */}
            <section className="bg-white rounded-xl border border-[#9C8B72]/20 shadow-sm overflow-hidden">
              {loadingLeads ? (
                <div className="py-20 text-center text-[#665340] text-sm flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#665340] border-t-transparent rounded-full animate-spin"></div>
                  กำลังโหลดข้อมูล Lead...
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="py-20 text-center text-[#9C8B72]">
                  <span className="material-symbols-outlined text-4xl mb-2 text-[#9C8B72]/60">
                    inbox
                  </span>
                  <p className="text-sm font-medium">ไม่พบข้อมูลตามตัวกรองที่เลือก</p>
                  <button
                    onClick={() => {
                      setStatusFilter("ALL");
                      setMonthFilter("ALL");
                      setSearchQuery("");
                    }}
                    className="mt-3 text-xs text-[#665340] underline"
                  >
                    รีเซ็ตตัวกรองทั้งหมด
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF9F5] border-b border-[#9C8B72]/20 text-[11px] font-semibold text-[#665340] uppercase tracking-wider">
                        <th className="py-3.5 px-4">ลูกค้า (Customer)</th>
                        <th className="py-3.5 px-4">เบอร์โทรศัพท์</th>
                        <th className="py-3.5 px-4">ช่วงเดือนที่จัดงาน</th>
                        <th className="py-3.5 px-4">สถานะการติดตาม</th>
                        <th className="py-3.5 px-4">บันทึกเพิ่มเติม (Notes)</th>
                        <th className="py-3.5 px-4">วันที่ลงทะเบียน</th>
                        <th className="py-3.5 px-4 text-center">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#9C8B72]/15 text-xs text-[#2D2A26]">
                      {filteredLeads.map((lead) => {
                        const statusObj = STATUS_CONFIG[lead.status] || STATUS_CONFIG.NEW;
                        return (
                          <tr
                            key={lead.id}
                            className="hover:bg-[#FAF9F5]/70 transition-colors group"
                          >
                            {/* Name */}
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-[#000000]">
                                {lead.firstName} {lead.lastName}
                              </div>
                              <span className="text-[10px] text-[#9C8B72]">ID: {lead.id}</span>
                            </td>

                            {/* Phone & Quick Actions */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">{lead.phone}</span>
                                <button
                                  onClick={() => copyToClipboard(lead.phone, lead.id)}
                                  className="text-[#9C8B72] hover:text-[#000000] p-1 rounded-sm cursor-pointer"
                                  title="Copy Phone"
                                >
                                  <span className="material-symbols-outlined text-xs">
                                    {copiedId === lead.id ? "check" : "content_copy"}
                                  </span>
                                </button>
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 p-1 rounded-sm"
                                  title="โทรด่วน"
                                >
                                  <span className="material-symbols-outlined text-xs">call</span>
                                </a>
                              </div>
                            </td>

                            {/* Event Month */}
                            <td className="py-3.5 px-4">
                              <span className="bg-[#FAF9F5] border border-[#9C8B72]/30 px-2.5 py-1 rounded-md text-[11px] font-medium text-[#4A4742]">
                                {lead.eventMonth}
                              </span>
                            </td>

                            {/* Status Select */}
                            <td className="py-3.5 px-4">
                              <select
                                value={lead.status}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border focus:outline-none cursor-pointer ${statusObj.bg}`}
                              >
                                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                                  <option key={k} value={k}>
                                    {v.label}
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* Notes Inline Edit */}
                            <td className="py-3.5 px-4 max-w-xs">
                              <input
                                type="text"
                                defaultValue={lead.notes || ""}
                                onBlur={(e) => {
                                  if (e.target.value !== lead.notes) {
                                    handleUpdateNotes(lead.id, e.target.value);
                                  }
                                }}
                                placeholder="คลิกเพื่อพิมพ์บันทึก..."
                                className="w-full bg-transparent hover:bg-[#FAF9F5] focus:bg-white border border-transparent hover:border-[#9C8B72]/30 focus:border-[#665340] px-2 py-1 rounded-md text-xs transition-colors focus:outline-none"
                              />
                            </td>

                            {/* Created Date */}
                            <td className="py-3.5 px-4 text-[#9C8B72] text-[11px]">
                              {new Date(lead.createdAt).toLocaleDateString("th-TH", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => handleDelete(lead.id)}
                                className="text-[#9C8B72] hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                                title="ลบ Lead"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {/* ================= TAB 2: TRACKING & ANALYTICS SETTINGS ================= */}
        {activeTab === "tracking" && (
          <div className="max-w-4xl mx-auto">
            {/* Feedback Alert Message */}
            {settingsMessage && (
              <div
                className={`p-4 rounded-xl mb-6 text-xs font-semibold flex items-center justify-between shadow-xs ${
                  settingsMessage.type === "success"
                    ? "bg-emerald-100 border border-emerald-300 text-emerald-900"
                    : "bg-red-100 border border-red-300 text-red-900"
                }`}
              >
                <span>{settingsMessage.text}</span>
                <button
                  onClick={() => setSettingsMessage(null)}
                  className="text-xs underline cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* Card 1: Google Tag Manager (GTM) */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#9C8B72]/25 shadow-xs">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold">
                      GTM
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#000000]">
                        Google Tag Manager (GTM)
                      </h3>
                      <p className="text-xs text-[#665340]">
                        จัดการแท็กการตลาดและ Conversion Tracking ทั้งหมดผ่าน GTM Container เดียว
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableGTM}
                      onChange={(e) => setSettings({ ...settings, enableGTM: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#665340]"></div>
                  </label>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="block text-xs font-semibold text-[#4A4742]">
                    GTM Container ID (รหัสคอนเทนเนอร์)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น GTM-XXXXXXX"
                    value={settings.gtmId}
                    onChange={(e) => setSettings({ ...settings, gtmId: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg px-4 py-2.5 text-xs font-mono text-[#000000] focus:outline-none focus:border-[#665340]"
                  />
                  <span className="text-[11px] text-[#9C8B72]">
                    ระบบจะติดตั้งทั้ง `&lt;script&gt;` ใน Header และ `&lt;noscript&gt;` ใน Body ให้อัตโนมัติ
                  </span>
                </div>
              </div>

              {/* Card 2: Google Analytics 4 (GA4) */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#9C8B72]/25 shadow-xs">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold">
                      GA4
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#000000]">
                        Google Analytics 4 (GA4)
                      </h3>
                      <p className="text-xs text-[#665340]">
                        ติดตามสถิติผู้เข้าชมเว็บไซต์ การดูหน้า Hall และพฤติกรรมบนเว็บ (Pageview, Scroll)
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableGA4}
                      onChange={(e) => setSettings({ ...settings, enableGA4: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#665340]"></div>
                  </label>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="block text-xs font-semibold text-[#4A4742]">
                    GA4 Measurement ID (รหัสการวัด)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น G-XXXXXXXXXX"
                    value={settings.ga4Id}
                    onChange={(e) => setSettings({ ...settings, ga4Id: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg px-4 py-2.5 text-xs font-mono text-[#000000] focus:outline-none focus:border-[#665340]"
                  />
                  <span className="text-[11px] text-[#9C8B72]">
                    ระบบจะโหลด `gtag.js` และเริ่มนับสถิติ Pageview ทันที
                  </span>
                </div>
              </div>

              {/* Card 3: Meta / Facebook Pixel */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#9C8B72]/25 shadow-xs">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                      FB
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#000000]">
                        Meta / Facebook Pixel
                      </h3>
                      <p className="text-xs text-[#665340]">
                        สำหรับยิงแอด Facebook / Instagram Ads และทำ Retargeting ลูกค้าที่เข้ามาดูสถานที่
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableFBPixel}
                      onChange={(e) => setSettings({ ...settings, enableFBPixel: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#665340]"></div>
                  </label>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="block text-xs font-semibold text-[#4A4742]">
                    Facebook Pixel ID (ตัวเลข 15-16 หลัก)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 1234567890123456"
                    value={settings.fbPixelId}
                    onChange={(e) => setSettings({ ...settings, fbPixelId: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg px-4 py-2.5 text-xs font-mono text-[#000000] focus:outline-none focus:border-[#665340]"
                  />
                </div>
              </div>

              {/* Card 4: TikTok Pixel */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#9C8B72]/25 shadow-xs">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-300 flex items-center justify-center text-black font-bold">
                      TT
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#000000]">
                        TikTok Pixel
                      </h3>
                      <p className="text-xs text-[#665340]">
                        สำหรับวัดผลแคมเปญโฆษณา TikTok Ads
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableTikTokPixel}
                      onChange={(e) => setSettings({ ...settings, enableTikTokPixel: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#665340]"></div>
                  </label>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="block text-xs font-semibold text-[#4A4742]">
                    TikTok Pixel ID
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น CXXXXXXXXXXXXXXX"
                    value={settings.tiktokPixelId}
                    onChange={(e) => setSettings({ ...settings, tiktokPixelId: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg px-4 py-2.5 text-xs font-mono text-[#000000] focus:outline-none focus:border-[#665340]"
                  />
                </div>
              </div>

              {/* Card 5: Custom Head Script */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#9C8B72]/25 shadow-xs">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold">
                    &lt;/&gt;
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#000000]">
                      Custom Tracking Scripts (แท็กสคริปต์กำหนดเอง)
                    </h3>
                    <p className="text-xs text-[#665340]">
                      แทรกโค้ด JavaScript หรือ HTML เสริม เช่น LINE Tag, Hotjar, Microsoft Clarity ฯลฯ
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="block text-xs font-semibold text-[#4A4742]">
                    Custom Header Script (แทรกในส่วน &lt;head&gt;)
                  </label>
                  <textarea
                    rows="4"
                    placeholder="<!-- วางโค้ดสคริปต์ที่นี่ เช่น Line Tag, Clarity -->"
                    value={settings.customHeadScript}
                    onChange={(e) => setSettings({ ...settings, customHeadScript: e.target.value })}
                    className="w-full bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg p-3 text-xs font-mono text-[#000000] focus:outline-none focus:border-[#665340]"
                  ></textarea>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="bg-[#000000] hover:bg-[#665340] text-white px-8 py-3 rounded-lg font-semibold text-xs tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {savingSettings ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      กำลังบันทึกการตั้งค่า...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      บันทึกการตั้งค่า Tracking ทั้งหมด
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
