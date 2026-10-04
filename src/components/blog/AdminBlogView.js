"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import PostFormModal from "./PostFormModal";

export default function AdminBlogView() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categories, setCategories] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);

  // Load Posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load Categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/posts/categories");
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        setCategories(data.categories);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchSearch =
        !search ||
        `${p.title} ${p.slug} ${p.excerpt} ${p.focus_keyword || ""}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchCat = categoryFilter === "ALL" || p.category === categoryFilter;
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [posts, search, categoryFilter, statusFilter]);

  // Metrics
  const metrics = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === "published").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    const totalViews = posts.reduce((acc, p) => acc + (p.views_count || 0), 0);
    return { total, published, drafts, totalViews };
  }, [posts]);

  // Toggle Publish
  const handleToggleStatus = async (post) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, status: newStatus } : p))
        );
        setActionMessage({
          type: "success",
          text: `เปลี่ยนสถานะเป็น ${newStatus === "published" ? "เผยแพร่แล้ว" : "แบบร่าง"} เรียบร้อยแล้ว`,
        });
      }
    } catch (err) {
      alert("Error updating status");
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  // Delete Post
  const handleDeletePost = async (id, title) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบทความ "${title}"?`)) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setActionMessage({ type: "success", text: "ลบบทความเรียบร้อยแล้ว" });
      }
    } catch (e) {
      alert("Error deleting post");
    } finally {
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleOpenCreate = () => {
    setEditingPost(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handlePostSaved = () => {
    fetchPosts();
    fetchCategories();
    setActionMessage({ type: "success", text: "บันทึกบทความและข้อมูล SEO เรียบร้อยแล้ว!" });
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            actionMessage.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-[#06C755]">check_circle</span>
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-stone-400 hover:text-stone-700 text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#9C8B72]/20 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#665340] uppercase tracking-wider">
            บทความทั้งหมด (Total)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-serif font-bold text-[#000000]">{metrics.total}</span>
            <span className="text-xs text-stone-400">เรื่อง</span>
          </div>
        </div>

        <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-200/60 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
            เผยแพร่แล้ว (Published)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-serif font-bold text-emerald-950">{metrics.published}</span>
            <span className="text-xs text-emerald-700">ออนไลน์</span>
          </div>
        </div>

        <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200/60 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
            แบบร่าง (Drafts)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-serif font-bold text-amber-950">{metrics.drafts}</span>
            <span className="text-xs text-amber-700">รอเผยแพร่</span>
          </div>
        </div>

        <div className="bg-blue-50/70 p-5 rounded-xl border border-blue-200/60 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            ยอดเข้าชมรวม (Total Views)
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-serif font-bold text-blue-950">{metrics.totalViews.toLocaleString()}</span>
            <span className="text-xs text-blue-700">ครั้ง</span>
          </div>
        </div>
      </section>

      {/* Toolbar: Search, Filters & Add Button */}
      <section className="bg-white p-4 rounded-xl border border-[#9C8B72]/20 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9C8B72] text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="ค้นหาชื่อบทความ, Slug, Focus Keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[#9C8B72]/40 focus:outline-none focus:border-[#665340] bg-[#FAF9F5]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9C8B72] hover:text-[#000000]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-between md:justify-end">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">ทุกหมวดหมู่ ({posts.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c} ({posts.filter((p) => p.category === c).length})
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#FAF9F5] border border-[#9C8B72]/40 rounded-lg px-3 py-2 focus:outline-none cursor-pointer"
          >
            <option value="ALL">ทุกสถานะ</option>
            <option value="published">เผยแพร่แล้ว ({metrics.published})</option>
            <option value="draft">แบบร่าง ({metrics.drafts})</option>
          </select>

          {/* Add Post Button */}
          <button
            onClick={handleOpenCreate}
            className="bg-[#000000] hover:bg-[#665340] text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-sm">post_add</span>
            + เขียนบทความใหม่
          </button>
        </div>
      </section>

      {/* Posts Table */}
      <div className="bg-white rounded-xl border border-[#9C8B72]/20 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-xs text-[#665340] flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#665340] border-t-transparent rounded-full animate-spin"></div>
            กำลังโหลดข้อมูลบทความ...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-20 text-center">
            <span className="material-symbols-outlined text-4xl text-[#9C8B72]/60 mb-2">article</span>
            <p className="text-sm font-semibold text-stone-700">ไม่พบบทความที่ตรงกับเงื่อนไข</p>
            <p className="text-xs text-stone-400 mt-1">กดปุ่ม "+ เขียนบทความใหม่" ด้านบนเพื่อเริ่มเขียนบทความแรก</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#9C8B72]/30 text-[#665340] uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-16">รูปปก</th>
                  <th className="py-3 px-4">หัวข้อบทความ & Slug</th>
                  <th className="py-3 px-4">หมวดหมู่</th>
                  <th className="py-3 px-4">Focus Keyword</th>
                  <th className="py-3 px-4">สถานะ</th>
                  <th className="py-3 px-4 text-center">ยอดอ่าน</th>
                  <th className="py-3 px-4">วันที่</th>
                  <th className="py-3 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9C8B72]/15">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    {/* Thumbnail */}
                    <td className="py-3.5 px-4">
                      {post.featured_image ? (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-12 h-10 object-cover rounded-md border border-stone-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-10 bg-stone-100 rounded-md border border-stone-200 flex items-center justify-center text-stone-400">
                          <span className="material-symbols-outlined text-sm">image</span>
                        </div>
                      )}
                    </td>

                    {/* Title & Slug */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-[#000000] line-clamp-1 hover:text-[#665340]">
                        {post.title}
                      </div>
                      <div className="text-[11px] text-stone-400 font-mono flex items-center gap-1 mt-0.5 truncate">
                        <span>/blog/{post.slug}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span className="bg-[#FAF9F5] border border-[#9C8B72]/30 px-2 py-0.5 rounded text-[11px] font-medium text-[#4A4742]">
                        {post.category}
                      </span>
                    </td>

                    {/* Focus Keyword */}
                    <td className="py-3.5 px-4">
                      {post.focus_keyword ? (
                        <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 w-fit">
                          🎯 {post.focus_keyword}
                        </span>
                      ) : (
                        <span className="text-stone-300 text-[11px]">-</span>
                      )}
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                          post.status === "published"
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
                            : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                        }`}
                        title="คลิกเพื่อสลับสถานะ"
                      >
                        {post.status === "published" ? "✓ เผยแพร่แล้ว" : "✎ แบบร่าง"}
                      </button>
                    </td>

                    {/* Views Count */}
                    <td className="py-3.5 px-4 text-center font-mono text-stone-600 text-xs">
                      {(post.views_count || 0).toLocaleString()}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-[11px] text-stone-500 whitespace-nowrap">
                      {new Date(post.created_at).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Live Link */}
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-stone-500 hover:text-stone-800 p-1.5 rounded hover:bg-stone-100 transition-colors"
                          title="เปิดดูหน้าเว็บจริง"
                        >
                          <span className="material-symbols-outlined text-sm">open_in_new</span>
                        </Link>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="text-[#665340] hover:text-[#000000] p-1.5 rounded hover:bg-[#665340]/10 transition-colors cursor-pointer"
                          title="แก้ไขบทความ & SEO"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeletePost(post.id, post.title)}
                          className="text-stone-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="ลบบทความ"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post Modal Form */}
      <PostFormModal
        isOpen={isModalOpen}
        post={editingPost}
        onClose={() => setIsModalOpen(false)}
        onSaved={handlePostSaved}
      />
    </div>
  );
}
