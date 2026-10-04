"use client";

import { useState, useEffect } from "react";
import WysiwygEditor from "./WysiwygEditor";
import SeoMetaBox from "./SeoMetaBox";

export default function PostFormModal({ post = null, isOpen, onClose, onSaved }) {
  const isEditing = Boolean(post?.id);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Wedding Inspiration",
    tags: [],
    excerpt: "",
    content: "",
    featured_image: "",
    featured_image_alt: "",
    status: "draft",
    meta_title: "",
    meta_description: "",
    focus_keyword: "",
    canonical_url: "",
    no_index: false,
    no_follow: false,
    og_title: "",
    og_description: "",
    og_image: "",
    schema_type: "BlogPosting",
  });

  const [categories, setCategories] = useState([
    "Wedding Inspiration",
    "Venue & Spaces",
    "Catering & Banquets",
    "Promotion",
  ]);
  const [newCatInput, setNewCatInput] = useState("");
  const [showAddCat, setShowAddCat] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load categories
  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch("/api/posts/categories");
        const data = await res.json();
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      } catch (e) {}
    }
    loadCats();
  }, []);

  // Populate post when editing
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        slug: post.slug || "",
        category: post.category || "Wedding Inspiration",
        tags: Array.isArray(post.tags) ? post.tags : [],
        excerpt: post.excerpt || "",
        content: post.content || "",
        featured_image: post.featured_image || "",
        featured_image_alt: post.featured_image_alt || "",
        status: post.status || "draft",
        meta_title: post.meta_title || post.title || "",
        meta_description: post.meta_description || post.excerpt || "",
        focus_keyword: post.focus_keyword || "",
        canonical_url: post.canonical_url || "",
        no_index: Boolean(post.no_index),
        no_follow: Boolean(post.no_follow),
        og_title: post.og_title || "",
        og_description: post.og_description || "",
        og_image: post.og_image || "",
        schema_type: post.schema_type || "BlogPosting",
      });
    } else {
      setFormData({
        title: "",
        slug: "",
        category: "Wedding Inspiration",
        tags: [],
        excerpt: "",
        content: "",
        featured_image: "",
        featured_image_alt: "",
        status: "draft",
        meta_title: "",
        meta_description: "",
        focus_keyword: "",
        canonical_url: "",
        no_index: false,
        no_follow: false,
        og_title: "",
        og_description: "",
        og_image: "",
        schema_type: "BlogPosting",
      });
    }
    setErrorMessage("");
  }, [post, isOpen]);

  if (!isOpen) return null;

  // Auto-generate slug and meta_title from title if empty
  const handleTitleChange = (val) => {
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\u0E00-\u0E7Fa-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug ? prev.slug : autoSlug,
      meta_title: prev.meta_title ? prev.meta_title : `${val} | Understory Venue`,
    }));
  };

  const handleAddCategory = async () => {
    const clean = newCatInput.trim();
    if (!clean) return;

    try {
      const res = await fetch("/api/posts/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
        setFormData((prev) => ({ ...prev, category: clean }));
        setNewCatInput("");
        setShowAddCat(false);
      }
    } catch (e) {
      alert("Error adding category");
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = tagInput.trim().replace(/^,|,$/g, "");
      if (val && !formData.tags.includes(val)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, val] }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleUploadFeaturedImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFeatured(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({
          ...prev,
          featured_image: data.url,
          og_image: prev.og_image ? prev.og_image : data.url,
        }));
      } else {
        alert("Upload error: " + data.message);
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploadingFeatured(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMessage("กรุณาระบุหัวข้อบทความ (Title)");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const url = isEditing ? `/api/posts/${post.id}` : "/api/posts";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        if (onSaved) onSaved(data.post);
        onClose();
      } else {
        setErrorMessage(data.message || "เกิดข้อผิดพลาดในการบันทึก");
      }
    } catch (err) {
      setErrorMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อบันทึกข้อมูลได้");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#FAF9F5] rounded-2xl shadow-2xl max-w-5xl w-full my-6 border border-[#9C8B72]/40 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#ECEAE3] px-6 py-4 border-b border-[#9C8B72]/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-xl text-[#665340]">edit_note</span>
            <h3 className="font-serif font-bold text-lg text-[#000000]">
              {isEditing ? "แก้ไขบทความ & SEO Meta" : "เขียนบทความใหม่ (New Article)"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-800 text-xl font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-[#2D2A26]">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              {errorMessage}
            </div>
          )}

          {/* Section 1: Main Article Info */}
          <div className="bg-white p-6 rounded-xl border border-[#9C8B72]/20 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#665340] border-b border-stone-100 pb-2">
              ข้อมูลบทความหลัก (General Info)
            </h4>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-800">
                หัวข้อบทความ (Article Title / H1) *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="เช่น 5 เทรนด์งานแต่งงาน 2026: ความเรียบหรูที่เน้นความหมาย"
                className="w-full text-sm font-semibold p-3 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340]"
              />
            </div>

            {/* Category & Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-stone-800">หมวดหมู่ (Category)</label>
                  <button
                    type="button"
                    onClick={() => setShowAddCat(!showAddCat)}
                    className="text-[11px] text-[#665340] hover:underline font-medium cursor-pointer"
                  >
                    + เพิ่มหมวดหมู่ใหม่
                  </button>
                </div>

                {!showAddCat ? (
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      placeholder="พิมพ์ชื่อหมวดหมู่ใหม่..."
                      className="flex-1 text-xs p-2 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      className="px-3 py-1.5 bg-[#665340] text-white text-xs rounded-lg font-semibold cursor-pointer"
                    >
                      บันทึก
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddCat(false)}
                      className="px-2 py-1.5 text-xs text-stone-500 cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-800">
                  สถานะการเผยแพร่ (Publish Status)
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`w-full text-xs p-2.5 border rounded-lg focus:outline-none font-semibold cursor-pointer ${
                    formData.status === "published"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                      : "bg-amber-50 text-amber-900 border-amber-300"
                  }`}
                >
                  <option value="draft">📝 แบบร่าง (Draft - ยังไม่แสดงบนหน้าเว็บ)</option>
                  <option value="published">🚀 เผยแพร่ทันที (Published - แสดงบนหน้าเว็บ)</option>
                </select>
              </div>
            </div>

            {/* Featured Image (Upload + URL dual support) */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-stone-800">
                🖼️ รูปภาพหน้าปกบทความ (Featured Image):
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={formData.featured_image}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      featured_image: e.target.value,
                      og_image: formData.og_image ? formData.og_image : e.target.value,
                    })
                  }
                  placeholder="วาง Image URL หรือกดปุ่มอัปโหลดรูปภาพทางขวา..."
                  className="flex-1 text-xs p-2.5 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340]"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFeaturedImage}
                  id="featured-image-file"
                  className="hidden"
                />
                <label
                  htmlFor="featured-image-file"
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 border border-[#9C8B72]/40 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-sm text-[#665340]">cloud_upload</span>
                  {uploadingFeatured ? "กำลังอัปโหลด..." : "อัปโหลดจากเครื่อง"}
                </label>
              </div>

              {formData.featured_image && (
                <div className="mt-2 flex items-center gap-3 p-2 bg-stone-50 border border-stone-200 rounded-lg">
                  <img
                    src={formData.featured_image}
                    alt="Featured Preview"
                    className="w-16 h-12 object-cover rounded shadow-xs shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] text-stone-600 truncate block">
                      {formData.featured_image}
                    </span>
                    <input
                      type="text"
                      value={formData.featured_image_alt}
                      onChange={(e) => setFormData({ ...formData, featured_image_alt: e.target.value })}
                      placeholder="Alt Text สำหรับรูปภาพหน้าปก (เช่น สถานที่แต่งงาน Understory)"
                      className="text-[11px] w-full mt-1 p-1 bg-white border border-stone-300 rounded focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, featured_image: "" })}
                    className="text-stone-400 hover:text-red-600 text-xs p-1"
                  >
                    ลบรูป
                  </button>
                </div>
              )}
            </div>

            {/* Excerpt / Summary */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-800">
                ข้อความเกริ่นนำสรุปย่อ (Excerpt):
              </label>
              <textarea
                rows={2}
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    excerpt: e.target.value,
                    meta_description: formData.meta_description ? formData.meta_description : e.target.value,
                  })
                }
                placeholder="สรุปประเด็นสำคัญของบทความ 1-2 ประโยค สำหรับแสดงในการ์ดหน้ารวมบล็อก..."
                className="w-full text-xs p-2.5 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg focus:outline-none focus:border-[#665340]"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-800">
                แท็ก (Tags - พิมพ์แล้วกด Enter เพื่อเพิ่ม):
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-[#665340]/10 text-[#665340] border border-[#665340]/30 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-700 text-stone-400 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="พิมพ์แท็ก..."
                  className="text-xs bg-transparent focus:outline-none min-w-[120px] p-0.5"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Visual Content Editor */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#665340]">
              เนื้อหาบทความ (WYSIWYG Visual Editor) *
            </label>
            <WysiwygEditor
              value={formData.content}
              onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
              placeholder="เริ่มเขียนเนื้อหาบทความที่นี่..."
            />
          </div>

          {/* Section 3: WordPress-Style SEO Meta Box */}
          <div className="space-y-2">
            <SeoMetaBox
              postData={formData}
              content={formData.content}
              featuredImage={formData.featured_image}
              onChange={(updatedSeo) => setFormData(updatedSeo)}
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#9C8B72]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-200 rounded-lg cursor-pointer transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 bg-[#000000] hover:bg-[#665340] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังบันทึกบทความ...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  {isEditing ? "อัปเดตบทความและ SEO" : "บันทึกและเผยแพร่บทความ"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
