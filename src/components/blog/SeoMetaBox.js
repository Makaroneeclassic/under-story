"use client";

import { useState } from "react";
import { convertImageToWebP } from "@/lib/imageOptimizer";

export default function SeoMetaBox({ postData = {}, onChange, content = "", featuredImage = "" }) {
  const [activeTab, setActiveTab] = useState("general"); // "general" | "social" | "advanced"
  const [previewMode, setPreviewMode] = useState("mobile"); // "mobile" | "desktop"
  const [uploadingOgImage, setUploadingOgImage] = useState(false);

  const focusKeyword = (postData.focus_keyword || "").trim();
  const metaTitle = postData.meta_title || postData.title || "";
  const metaDesc = postData.meta_description || postData.excerpt || "";
  const slug = postData.slug || "";
  const ogTitle = postData.og_title || metaTitle;
  const ogDesc = postData.og_description || metaDesc;
  const ogImage = postData.og_image || featuredImage || "";
  const canonicalUrl = postData.canonical_url || "";
  const noIndex = Boolean(postData.no_index);
  const noFollow = Boolean(postData.no_follow);
  const schemaType = postData.schema_type || "BlogPosting";

  const updateField = (field, value) => {
    if (onChange) {
      onChange({ ...postData, [field]: value });
    }
  };

  // --- Real-time SEO Analysis (Rank Math / Yoast style) ---
  const rawText = content.replace(/<[^>]*>/g, " ").toLowerCase();
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
  const kw = focusKeyword.toLowerCase();

  const checks = [
    {
      label: "มี Focus Keyword ในหัวข้อ SEO Title",
      passed: Boolean(kw && metaTitle.toLowerCase().includes(kw)),
      weight: 20,
    },
    {
      label: "มี Focus Keyword ใน Meta Description",
      passed: Boolean(kw && metaDesc.toLowerCase().includes(kw)),
      weight: 15,
    },
    {
      label: "มี Focus Keyword ใน URL Slug",
      passed: Boolean(kw && slug.toLowerCase().includes(kw.replace(/\s+/g, "-"))),
      weight: 15,
    },
    {
      label: "มี Focus Keyword ในช่วง 10% แรกของเนื้อหา",
      passed: Boolean(kw && rawText.substring(0, 500).includes(kw)),
      weight: 15,
    },
    {
      label: "ความยาว SEO Title เหมาะสม (40 - 65 ตัวอักษร)",
      passed: metaTitle.length >= 40 && metaTitle.length <= 65,
      weight: 15,
    },
    {
      label: "ความยาว Meta Description เหมาะสม (120 - 165 ตัวอักษร)",
      passed: metaDesc.length >= 120 && metaDesc.length <= 165,
      weight: 10,
    },
    {
      label: "เนื้อหาบทความมีความยาวพอเหมาะ (>= 300 คำ)",
      passed: wordCount >= 300,
      weight: 10,
    },
  ];

  const totalScore = kw
    ? checks.reduce((acc, c) => acc + (c.passed ? c.weight : 0), 0)
    : Math.min(
        50,
        (metaTitle.length >= 40 ? 25 : 10) +
          (metaDesc.length >= 120 ? 25 : 10)
      );

  const getScoreBadge = (score) => {
    if (score >= 80) return { bg: "bg-emerald-100 text-emerald-800 border-emerald-300", label: "ดีเยี่ยม (Good)" };
    if (score >= 50) return { bg: "bg-amber-100 text-amber-800 border-amber-300", label: "ปานกลาง (Fair)" };
    return { bg: "bg-red-100 text-red-800 border-red-300", label: "ควรปรับปรุง (Needs Work)" };
  };

  const badge = getScoreBadge(totalScore);

  // Character Length Bar Helpers
  const getLengthColor = (len, min, max) => {
    if (len === 0) return "bg-stone-200";
    if (len >= min && len <= max) return "bg-emerald-500";
    if (len > max) return "bg-red-500";
    return "bg-amber-500";
  };

  const handleUploadOgImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOgImage(true);
    try {
      // Auto convert to WebP in browser before upload
      const webpFile = await convertImageToWebP(file);

      const formData = new FormData();
      formData.append("file", webpFile);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง (${res.status})`);
      }

      if (data.success && data.url) {
        updateField("og_image", data.url);
      } else {
        alert("Upload error: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingOgImage(false);
    }
  };

  return (
    <div className="bg-white border border-[#9C8B72]/30 rounded-xl overflow-hidden shadow-xs">
      {/* Header with SEO Score */}
      <div className="bg-[#FAF9F5] border-b border-[#9C8B72]/20 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#665340] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
            SEO
          </div>
          <div>
            <h3 className="font-serif font-bold text-[#000000] text-base leading-tight">
              การตั้งค่า SEO & Social Meta (WordPress Style)
            </h3>
            <p className="text-[11px] text-[#665340]">
              ปรับแต่งการแสดงผลบน Google Search, Facebook, และ LINE
            </p>
          </div>
        </div>

        {/* Live SEO Score Badge */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-stone-500 block">SEO Score:</span>
            <span className="font-bold text-xs text-[#000000]">{totalScore} / 100</span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#9C8B72]/20 bg-[#FAF9F5]/50 px-6 pt-2 gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`pb-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === "general"
              ? "border-[#665340] text-[#665340]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <span className="material-symbols-outlined text-base">travel_explore</span>
          Google Search (SERP)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`pb-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === "social"
              ? "border-[#665340] text-[#665340]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <span className="material-symbols-outlined text-base">share</span>
          Social & LINE (Open Graph)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("advanced")}
          className={`pb-2.5 border-b-2 cursor-pointer transition-all flex items-center gap-1.5 ${
            activeTab === "advanced"
              ? "border-[#665340] text-[#665340]"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <span className="material-symbols-outlined text-base">tune</span>
          Advanced (Robots & Schema)
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 space-y-6">
        {/* TAB 1: GENERAL / GOOGLE SEARCH */}
        {activeTab === "general" && (
          <div className="space-y-6">
            {/* 1. Google SERP Snippet Preview Box */}
            <div className="bg-[#FAF9F5] border border-stone-200 rounded-xl p-4 sm:p-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-blue-600">visibility</span>
                  Google Search Snippet Preview (ตัวอย่างการแสดงผลบน Google)
                </span>
                <div className="flex bg-stone-200 rounded-lg p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      previewMode === "mobile" ? "bg-white text-black font-semibold shadow-xs" : "text-stone-600"
                    }`}
                  >
                    📱 Mobile
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      previewMode === "desktop" ? "bg-white text-black font-semibold shadow-xs" : "text-stone-600"
                    }`}
                  >
                    💻 Desktop
                  </button>
                </div>
              </div>

              {/* Mockup Card */}
              <div
                className={`bg-white p-4 rounded-lg border border-stone-200 shadow-xs ${
                  previewMode === "mobile" ? "max-w-sm mx-auto" : "max-w-xl"
                }`}
              >
                {/* URL Breadcrumb */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-[9px] font-bold text-[#665340]">
                    U
                  </div>
                  <div className="text-[11px] text-stone-700 leading-tight">
                    <span className="font-semibold text-stone-900">Understory Venue</span>
                    <span className="text-stone-400 mx-1">›</span>
                    <span className="text-stone-500 font-mono text-[10px]">
                      understoryvenue.com/blog/{slug || "post-url-slug"}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-base text-[#1A0DAB] hover:underline cursor-pointer font-medium line-clamp-2 leading-snug">
                  {metaTitle || "หัวข้อบทความจะปรากฏที่นี่บนหน้าการค้นหาของ Google"}
                </h4>

                {/* Description Snippet */}
                <p className="text-xs text-[#4D5156] mt-1.5 line-clamp-2 leading-relaxed">
                  {metaDesc ||
                    "กรอก Meta Description ด้านล่างเพื่อให้ผู้ค้นหาเห็นข้อความสรุปที่น่าสนใจและเพิ่มอัตราการคลิกเข้าชมเว็บไซต์..."}
                </p>
              </div>
            </div>

            {/* 2. Focus Keyword */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-800 flex justify-between items-center">
                <span>🎯 Focus Keyword (คำค้นหาหลักที่ต้องการติดอันดับ):</span>
                <span className="text-[11px] text-stone-400 font-normal">
                  เช่น "สถานที่แต่งงาน", "จัดงานแต่ง", "Grand Hall"
                </span>
              </label>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => updateField("focus_keyword", e.target.value)}
                placeholder="พิมพ์ Focus Keyword ที่ต้องการ..."
                className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340]"
              />
            </div>

            {/* 3. SEO Title */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-stone-800">
                  🏷️ SEO Title (หัวข้อสำหรับ Google):
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span className="font-mono text-stone-600">{metaTitle.length} / 60 ตัวอักษร</span>
                </div>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => updateField("meta_title", e.target.value)}
                placeholder="เช่น สถานที่แต่งงานสถาปัตยกรรมธรรมชาติใจกลางเมือง | Understory Venue"
                className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340]"
              />
              {/* Length indicator bar */}
              <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getLengthColor(metaTitle.length, 40, 65)}`}
                  style={{ width: `${Math.min(100, (metaTitle.length / 65) * 100)}%` }}
                />
              </div>
            </div>

            {/* 4. Permalink / Slug */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-800">
                🔗 URL Slug (ลิงก์บทความ):
              </label>
              <div className="flex items-center gap-1 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg px-3 py-1.5">
                <span className="text-[11px] font-mono text-stone-400 select-none">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) =>
                    updateField(
                      "slug",
                      e.target.value.toLowerCase().replace(/\s+/g, "-")
                    )
                  }
                  placeholder="understory-wedding-venue"
                  className="w-full text-xs font-mono bg-transparent focus:outline-none text-stone-900"
                />
              </div>
            </div>

            {/* 5. Meta Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-stone-800">
                  📝 Meta Description (คำอธิบายสรุปสำหรับผลการค้นหา):
                </label>
                <span className="font-mono text-[11px] text-stone-600">{metaDesc.length} / 160 ตัวอักษร</span>
              </div>
              <textarea
                rows={3}
                value={metaDesc}
                onChange={(e) => updateField("meta_description", e.target.value)}
                placeholder="คำอธิบายสรุปสั้นๆ ที่มีคีย์เวิร์ด ดึงดูดให้ผู้ค้นหากดเข้ามาอ่านบทความ..."
                className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340]"
              />
              <div className="w-full bg-stone-200 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${getLengthColor(metaDesc.length, 120, 165)}`}
                  style={{ width: `${Math.min(100, (metaDesc.length / 165) * 100)}%` }}
                />
              </div>
            </div>

            {/* 6. Live SEO Checklist Items */}
            <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-2.5">
              <h5 className="font-semibold text-xs text-stone-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#665340]">fact_check</span>
                การตรวจสอบคุณภาพ SEO (SEO Checklist)
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 ${
                        c.passed ? "bg-emerald-500" : "bg-stone-300"
                      }`}
                    >
                      {c.passed ? "✓" : "–"}
                    </span>
                    <span className={c.passed ? "text-stone-800 font-medium" : "text-stone-500"}>
                      {c.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOCIAL / OPEN GRAPH (FACEBOOK & LINE) */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
              <h4 className="text-xs font-bold text-stone-800 mb-3 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-[#06C755]">chat</span>
                Social Share Preview (ตัวอย่างเมื่อแชร์ลง LINE / Facebook)
              </h4>

              {/* Social Card Mockup */}
              <div className="max-w-md mx-auto bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs">
                <div className="w-full h-44 bg-stone-100 relative overflow-hidden flex items-center justify-center">
                  {ogImage ? (
                    <img src={ogImage} alt="Social Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-4 text-stone-400">
                      <span className="material-symbols-outlined text-3xl">image</span>
                      <p className="text-[11px] mt-1">ยังไม่ได้กำหนดรูปภาพแชร์</p>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-stone-50 border-t border-stone-100">
                  <span className="text-[10px] uppercase font-mono text-stone-400 block tracking-wider">
                    understoryvenue.com
                  </span>
                  <h5 className="font-semibold text-xs text-stone-900 line-clamp-1 mt-0.5">
                    {ogTitle || "หัวข้อจะแสดงตรงนี้"}
                  </h5>
                  <p className="text-[11px] text-stone-500 line-clamp-2 mt-1">
                    {ogDesc || "คำอธิบายเมื่อแชร์ลง Social Media..."}
                  </p>
                </div>
              </div>
            </div>

            {/* OG Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-800">
                Facebook / LINE Title:
              </label>
              <input
                type="text"
                value={postData.og_title || ""}
                onChange={(e) => updateField("og_title", e.target.value)}
                placeholder="เว้นว่างไว้หากต้องการใช้หัวข้อเดียวกับ SEO Title"
                className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340]"
              />
            </div>

            {/* OG Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-800">
                Facebook / LINE Description:
              </label>
              <textarea
                rows={2}
                value={postData.og_description || ""}
                onChange={(e) => updateField("og_description", e.target.value)}
                placeholder="เว้นว่างไว้หากต้องการใช้ข้อความเดียวกับ Meta Description"
                className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340]"
              />
            </div>

            {/* OG Image Upload / URL */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-800">
                Social Image (รูปภาพเมื่อแชร์ลง LINE / FB - ขนาดแนะนำ 1200x630):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={postData.og_image || ""}
                  onChange={(e) => updateField("og_image", e.target.value)}
                  placeholder="URL รูปภาพ (เว้นว่างไว้จะใช้ Featured Image อัตโนมัติ)"
                  className="flex-1 text-xs p-2.5 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340]"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadOgImage}
                  id="og-image-upload"
                  className="hidden"
                />
                <label
                  htmlFor="og-image-upload"
                  className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">upload</span>
                  {uploadingOgImage ? "..." : "อัปโหลด"}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ADVANCED / ROBOTS & SCHEMA */}
        {activeTab === "advanced" && (
          <div className="space-y-5">
            {/* Canonical URL */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-800">
                Canonical URL (URL ฉบับหลัก):
              </label>
              <input
                type="url"
                value={canonicalUrl}
                onChange={(e) => updateField("canonical_url", e.target.value)}
                placeholder="https://understoryvenue.com/blog/your-slug (เว้นว่างไว้ระบบจะตั้งให้อัตโนมัติ)"
                className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340]"
              />
              <span className="text-[11px] text-stone-500 block">
                ใช้ระบุ URL ฉบับจริงเพื่อป้องกันปัญหา Duplicate Content บน Google
              </span>
            </div>

            {/* Schema Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-800">
                Schema Structured Data Type (ประเภทโครงสร้างข้อมูลสำหรับ Google):
              </label>
              <select
                value={schemaType}
                onChange={(e) => updateField("schema_type", e.target.value)}
                className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340] cursor-pointer"
              >
                <option value="BlogPosting">BlogPosting (บล็อกบทความทั่วไป - แนะนำ)</option>
                <option value="Article">Article (บทความเชิงลึก)</option>
                <option value="NewsArticle">NewsArticle (ข่าวสาร / ประชาสัมพันธ์)</option>
              </select>
            </div>

            {/* Robots Meta Checkboxes */}
            <div className="pt-2 border-t border-stone-200 space-y-3">
              <label className="text-xs font-semibold text-stone-800 block">
                Robots Meta Rules (คำสั่งสำหรับ Bot การค้นหา):
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="inline-flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noIndex}
                    onChange={(e) => updateField("no_index", e.target.checked)}
                    className="accent-[#665340] w-4 h-4 rounded"
                  />
                  <span>
                    <strong>noindex</strong> (ห้าม Google เก็บหน้านี้ไปแสดงผลในผลการค้นหา)
                  </span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noFollow}
                    onChange={(e) => updateField("no_follow", e.target.checked)}
                    className="accent-[#665340] w-4 h-4 rounded"
                  />
                  <span>
                    <strong>nofollow</strong> (ไม่ให้ Bot ไต่ตามลิงก์ในบทความนี้)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
