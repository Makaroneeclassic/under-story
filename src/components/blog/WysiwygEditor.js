"use client";

import { useState, useRef, useEffect } from "react";

export default function WysiwygEditor({ value = "", onChange, placeholder = "เริ่มเขียนเนื้อหาบทความที่นี่..." }) {
  const editorRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTab, setImageTab] = useState("upload"); // "upload" | "url"
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value);

  // Sync external value with editor
  useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || "";
      }
    }
    setHtmlContent(value || "");
  }, [value, isHtmlMode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      if (onChange) onChange(html);
    }
  };

  const executeCommand = (command, val = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, val);
      handleInput();
    }
  };

  const handleInsertLink = () => {
    const url = prompt("กรอก URL ลิงก์ (เช่น https://example.com):");
    if (url) {
      executeCommand("createLink", url);
    }
  };

  const handleUploadImageFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setImageUrl(data.url);
      } else {
        alert("อัปโหลดรูปภาพไม่สำเร็จ: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleConfirmInsertImage = () => {
    if (!imageUrl) return;
    const imgHtml = `<figure class="my-6"><img src="${imageUrl}" alt="${imageAlt || ""}" class="rounded-lg w-full max-h-[500px] object-cover shadow-sm" />${imageAlt ? `<figcaption class="text-center text-xs text-stone-500 mt-2">${imageAlt}</figcaption>` : ""}</figure><p><br></p>`;
    
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand("insertHTML", false, imgHtml);
      handleInput();
    }
    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
  };

  // Stats
  const rawText = htmlContent.replace(/<[^>]*>/g, " ").trim();
  const wordCount = rawText ? rawText.split(/\s+/).length : 0;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="border border-[#9C8B72]/30 rounded-xl overflow-hidden bg-white shadow-xs">
      {/* Editor Toolbar */}
      <div className="bg-[#FAF9F5] border-b border-[#9C8B72]/20 p-2 flex flex-wrap items-center gap-1 text-xs select-none">
        {/* Headings */}
        <select
          onChange={(e) => {
            executeCommand("formatBlock", e.target.value);
            e.target.value = "";
          }}
          defaultValue=""
          className="bg-white border border-[#9C8B72]/30 rounded px-2 py-1 text-xs text-[#2D2A26] focus:outline-none cursor-pointer"
          title="ระดับหัวข้อ"
        >
          <option value="" disabled>ข้อความ / หัวข้อ</option>
          <option value="<p>">ย่อหน้าปกติ (Paragraph)</option>
          <option value="<h2>">หัวข้อหลัก H2 (Heading 2)</option>
          <option value="<h3>">หัวข้อย่อย H3 (Heading 3)</option>
          <option value="<h4>">หัวข้อย่อย H4 (Heading 4)</option>
        </select>

        <div className="w-[1px] h-5 bg-[#9C8B72]/30 mx-1"></div>

        {/* Formatting buttons */}
        <button
          type="button"
          onClick={() => executeCommand("bold")}
          className="p-1.5 hover:bg-stone-200 rounded font-bold text-stone-800 transition-colors w-7 h-7 flex items-center justify-center cursor-pointer"
          title="ตัวหนา (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => executeCommand("italic")}
          className="p-1.5 hover:bg-stone-200 rounded italic text-stone-800 transition-colors w-7 h-7 flex items-center justify-center cursor-pointer"
          title="ตัวเอียง (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => executeCommand("underline")}
          className="p-1.5 hover:bg-stone-200 rounded underline text-stone-800 transition-colors w-7 h-7 flex items-center justify-center cursor-pointer"
          title="ขีดเส้นใต้ (Ctrl+U)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => executeCommand("strikeThrough")}
          className="p-1.5 hover:bg-stone-200 rounded line-through text-stone-800 transition-colors w-7 h-7 flex items-center justify-center cursor-pointer"
          title="ขีดฆ่า"
        >
          S
        </button>

        <div className="w-[1px] h-5 bg-[#9C8B72]/30 mx-1"></div>

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => executeCommand("insertUnorderedList")}
          className="p-1.5 hover:bg-stone-200 rounded text-stone-800 transition-colors flex items-center justify-center w-7 h-7 cursor-pointer"
          title="รายการแบบจุด (Bullet List)"
        >
          <span className="material-symbols-outlined text-base">format_list_bulleted</span>
        </button>
        <button
          type="button"
          onClick={() => executeCommand("insertOrderedList")}
          className="p-1.5 hover:bg-stone-200 rounded text-stone-800 transition-colors flex items-center justify-center w-7 h-7 cursor-pointer"
          title="รายการแบบตัวเลข (Numbered List)"
        >
          <span className="material-symbols-outlined text-base">format_list_numbered</span>
        </button>
        <button
          type="button"
          onClick={() => executeCommand("formatBlock", "<blockquote>")}
          className="p-1.5 hover:bg-stone-200 rounded text-stone-800 transition-colors flex items-center justify-center w-7 h-7 cursor-pointer"
          title="คำพูดเน้น / Blockquote"
        >
          <span className="material-symbols-outlined text-base">format_quote</span>
        </button>

        <div className="w-[1px] h-5 bg-[#9C8B72]/30 mx-1"></div>

        {/* Alignments */}
        <button
          type="button"
          onClick={() => executeCommand("justifyLeft")}
          className="p-1.5 hover:bg-stone-200 rounded text-stone-800 transition-colors flex items-center justify-center w-7 h-7 cursor-pointer"
          title="ชิดซ้าย"
        >
          <span className="material-symbols-outlined text-base">format_align_left</span>
        </button>
        <button
          type="button"
          onClick={() => executeCommand("justifyCenter")}
          className="p-1.5 hover:bg-stone-200 rounded text-stone-800 transition-colors flex items-center justify-center w-7 h-7 cursor-pointer"
          title="กึ่งกลาง"
        >
          <span className="material-symbols-outlined text-base">format_align_center</span>
        </button>

        <div className="w-[1px] h-5 bg-[#9C8B72]/30 mx-1"></div>

        {/* Links & Images */}
        <button
          type="button"
          onClick={handleInsertLink}
          className="p-1.5 hover:bg-stone-200 rounded text-stone-800 transition-colors flex items-center justify-center w-7 h-7 cursor-pointer"
          title="แทรกลิงก์ (Link)"
        >
          <span className="material-symbols-outlined text-base">link</span>
        </button>
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          className="px-2 py-1 bg-white hover:bg-stone-100 border border-[#9C8B72]/40 rounded text-stone-800 transition-colors flex items-center gap-1 cursor-pointer font-medium"
          title="แทรกรูปภาพในบทความ"
        >
          <span className="material-symbols-outlined text-base text-[#665340]">image</span>
          <span>ใส่รูปภาพ</span>
        </button>
        <button
          type="button"
          onClick={() => executeCommand("insertHorizontalRule")}
          className="p-1.5 hover:bg-stone-200 rounded text-stone-800 transition-colors flex items-center justify-center w-7 h-7 cursor-pointer"
          title="เส้นคั่น (Horizontal Line)"
        >
          <span className="material-symbols-outlined text-base">horizontal_rule</span>
        </button>
        <button
          type="button"
          onClick={() => executeCommand("removeFormat")}
          className="p-1.5 hover:bg-stone-200 rounded text-stone-600 transition-colors flex items-center justify-center w-7 h-7 cursor-pointer"
          title="ล้างการจัดรูปแบบ"
        >
          <span className="material-symbols-outlined text-base">format_clear</span>
        </button>

        {/* Source HTML Switch */}
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-colors cursor-pointer ${
              isHtmlMode ? "bg-[#665340] text-white" : "bg-stone-200 text-stone-700 hover:bg-stone-300"
            }`}
          >
            {isHtmlMode ? "Visual View" : "</> HTML Code"}
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      {isHtmlMode ? (
        <textarea
          value={htmlContent}
          onChange={(e) => {
            setHtmlContent(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          className="w-full h-96 p-4 font-mono text-xs bg-[#1E1E1E] text-[#D4D4D4] focus:outline-none resize-y"
          placeholder="<div>เขียนโค้ด HTML ที่นี่...</div>"
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className="min-h-[360px] max-h-[600px] overflow-y-auto p-5 focus:outline-none prose prose-stone max-w-none text-[#2D2A26] leading-relaxed font-sans text-sm selection:bg-[#665340]/20"
          style={{ whiteSpace: "pre-wrap" }}
        />
      )}

      {/* Editor Footer Status Bar */}
      <div className="bg-[#FAF9F5] border-t border-[#9C8B72]/20 px-4 py-2 flex justify-between items-center text-[11px] text-[#665340]">
        <div className="flex items-center gap-4">
          <span>จำนวนคำ: <strong>{wordCount}</strong> คำ</span>
          <span>เวลาอ่านโดยประมาณ: <strong>~{readingTimeMin}</strong> นาที</span>
        </div>
        <div className="text-[10px] text-stone-400">
          💡 เคล็ดลับ: ใช้หัวข้อ H2 และ H3 เพื่อช่วยให้ Google และผู้อ่านจับประเด็นได้ง่าย
        </div>
      </div>

      {/* Insert Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-stone-200 overflow-hidden">
            <div className="bg-[#FAF9F5] px-5 py-3 border-b border-stone-200 flex justify-between items-center">
              <h4 className="font-semibold text-sm text-[#000000] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg text-[#665340]">add_photo_alternate</span>
                แทรกรูปภาพในบทความ
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Tabs: Upload vs URL */}
              <div className="flex border-b border-stone-200">
                <button
                  type="button"
                  onClick={() => setImageTab("upload")}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                    imageTab === "upload"
                      ? "border-[#665340] text-[#665340]"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  📁 อัปโหลดไฟล์รูปภาพ
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab("url")}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
                    imageTab === "url"
                      ? "border-[#665340] text-[#665340]"
                      : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  🔗 ใส่ Image URL
                </button>
              </div>

              {imageTab === "upload" ? (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center hover:border-[#665340] transition-colors bg-stone-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImageFile}
                      id="wysiwyg-image-file"
                      className="hidden"
                    />
                    <label htmlFor="wysiwyg-image-file" className="cursor-pointer block">
                      <span className="material-symbols-outlined text-3xl text-[#665340] mb-1">
                        cloud_upload
                      </span>
                      <p className="text-xs text-stone-700 font-medium">คลิกเพื่อเลือกไฟล์รูปภาพจากเครื่อง</p>
                      <p className="text-[10px] text-stone-400 mt-1">รองรับ JPG, PNG, WebP (แนะนำขนาดไม่เกิน 3MB)</p>
                    </label>
                  </div>

                  {uploadingImage && (
                    <div className="text-xs text-amber-700 flex items-center justify-center gap-2 py-1">
                      <div className="w-3.5 h-3.5 border-2 border-amber-700 border-t-transparent rounded-full animate-spin"></div>
                      กำลังอัปโหลดรูปภาพ...
                    </div>
                  )}

                  {imageUrl && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-emerald-600">check_circle</span>
                      อัปโหลดสำเร็จแล้ว! พร้อมแทรก
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-stone-700">Image URL:</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full text-xs p-2.5 border border-stone-300 rounded focus:outline-none focus:border-[#665340]"
                  />
                </div>
              )}

              {/* Alt Text input */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-medium text-stone-700">
                  คำอธิบายรูปภาพ (Alt Text / SEO Caption):
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="เช่น บรรยากาศ The Grand Hall แสงธรรมชาติ"
                  className="w-full text-xs p-2.5 border border-stone-300 rounded focus:outline-none focus:border-[#665340]"
                />
                <span className="text-[10px] text-stone-400 block">
                  สำคัญต่อคะแนน SEO และ Google Image Search
                </span>
              </div>
            </div>

            <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-4 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={!imageUrl || uploadingImage}
                onClick={handleConfirmInsertImage}
                className="px-5 py-1.5 bg-[#665340] hover:bg-[#524233] disabled:opacity-50 text-white text-xs font-semibold rounded shadow-xs cursor-pointer transition-colors"
              >
                แทรกลงในบทความ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
