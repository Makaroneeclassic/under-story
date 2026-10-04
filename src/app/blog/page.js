import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/postsStore";

export const metadata = {
  title: "Understory Journal | บทความ ไอเดีย และสาระน่ารู้สำหรับงานแต่งงาน",
  description:
    "รวบรวมไอเดียการจัดงานแต่งงาน เทรนด์งานแต่งงานยุคใหม่ การเลือกสถานที่จัดงาน ตลอดจนศาสตร์แห่งอาหารจัดเลี้ยง ณ Understory Architectural Wedding Venue",
  keywords: ["สถานที่แต่งงาน", "ไอเดียงานแต่ง", "จัดงานแต่งงาน", "Understory Venue", "Wedding Venue Bangkok"],
  alternates: {
    canonical: "https://understoryvenue.com/blog",
  },
  openGraph: {
    title: "Understory Journal | บทความ & ไอเดียงานแต่งงาน",
    description: "พื้นที่แบ่งปันแรงบันดาลใจและคำแนะนำสำหรับการเนรมิตวันสำคัญของคุณ ณ Understory Venue",
    url: "https://understoryvenue.com/blog",
    siteName: "Understory Venue",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Understory Venue Journal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Understory Journal | บทความ & ไอเดียงานแต่งงาน",
    description: "พื้นที่แบ่งปันแรงบันดาลใจและคำแนะนำสำหรับการเนรมิตวันสำคัญของคุณ ณ Understory Venue",
  },
};

export default async function BlogPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const currentCategory = resolvedSearchParams?.category || "ALL";
  const searchQuery = resolvedSearchParams?.q || "";

  // Fetch only published posts
  const posts = await getAllPosts({
    status: "published",
    category: currentCategory,
    search: searchQuery,
  });

  const categories = [
    { label: "ทั้งหมด", value: "ALL" },
    { label: "Wedding Inspiration", value: "Wedding Inspiration" },
    { label: "Venue & Spaces", value: "Venue & Spaces" },
    { label: "Catering & Banquets", value: "Catering & Banquets" },
    { label: "Promotion", value: "Promotion" },
  ];

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const regularPosts = posts.length > 1 ? posts.slice(1) : [];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2D2A26] font-sans selection:bg-[#665340]/20 antialiased">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#9C8B72]/20 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo_understory_authentic.webp"
              alt="Understory Venue Logo"
              width={140}
              height={60}
              className="h-8 md:h-10 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-[#4A4742]">
            <Link href="/" className="hover:text-[#000000] transition-colors">
              หน้าแรก
            </Link>
            <Link href="/gallery" className="hover:text-[#000000] transition-colors">
              แกลเลอรี
            </Link>
            <Link href="/blog" className="text-[#000000] font-bold border-b border-[#000000] pb-0.5">
              บทความ (Journal)
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/#contact-form"
              className="bg-[#1C1917] hover:bg-[#665340] text-[#FAF9F5] text-xs font-semibold px-5 py-2.5 rounded-full tracking-wider transition-all shadow-xs"
            >
              นัดเข้าชมสถานที่
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-6 border-b border-[#9C8B72]/20 bg-linear-to-b from-[#ECEAE3]/50 to-[#FAF9F5]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#665340] block font-medium">
            UNDERSTORY JOURNAL & INSPIRATION
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#1C1917] font-semibold leading-tight">
            เรื่องราว แรงบันดาลใจ <br className="hidden sm:block" />
            และมนต์เสน่ห์แห่งการเฉลิมฉลอง
          </h1>
          <p className="text-sm md:text-base text-[#665340] max-w-2xl mx-auto font-light leading-relaxed pt-2">
            บันทึกการเดินทาง สาระน่ารู้ และแนวคิดการออกแบบงานแต่งงานอย่างประณีต
            ภายใต้ร่มเงาไม้และสถาปัตยกรรมหินธรรมชาติ ณ Understory
          </p>

          {/* Search Box */}
          <div className="pt-6 max-w-md mx-auto">
            <form action="/blog" method="GET" className="relative">
              {currentCategory !== "ALL" && (
                <input type="hidden" name="category" value={currentCategory} />
              )}
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="ค้นหาบทความ, เทรนด์งานแต่ง, ไอเดียสถานที่..."
                className="w-full bg-white border border-[#9C8B72]/40 rounded-full pl-11 pr-5 py-3 text-xs text-[#1C1917] focus:outline-none focus:border-[#665340] shadow-xs"
              />
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm">
                search
              </span>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Category Pills Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#9C8B72]/20 pb-6">
          {categories.map((cat) => {
            const isActive = currentCategory === cat.value;
            const queryParams = new URLSearchParams();
            if (cat.value !== "ALL") queryParams.set("category", cat.value);
            if (searchQuery) queryParams.set("q", searchQuery);
            const href = `/blog${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

            return (
              <Link
                key={cat.value}
                href={href}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider transition-all ${
                  isActive
                    ? "bg-[#1C1917] text-[#FAF9F5] shadow-xs"
                    : "bg-white border border-[#9C8B72]/30 text-[#665340] hover:border-[#1C1917] hover:text-[#1C1917]"
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>

        {/* Search status indicator */}
        {searchQuery && (
          <div className="flex justify-between items-center text-xs text-[#665340] bg-white p-3 rounded-lg border border-[#9C8B72]/20">
            <span>
              ผลการค้นหาสำหรับ: <strong>"{searchQuery}"</strong> ({posts.length} รายการ)
            </span>
            <Link href="/blog" className="text-[#1C1917] hover:underline font-semibold">
              ล้างการค้นหา ✕
            </Link>
          </div>
        )}

        {/* If no posts */}
        {posts.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <span className="material-symbols-outlined text-5xl text-[#9C8B72]/50">menu_book</span>
            <h3 className="font-serif text-xl text-[#1C1917]">ไม่พบบทความในหมวดหมู่นี้</h3>
            <p className="text-xs text-[#665340]">กรุณาลองเลือกหมวดหมู่อื่น หรือค้นหาด้วยคำสำคัญใหม่</p>
            <Link
              href="/blog"
              className="inline-block mt-3 px-5 py-2 bg-[#1C1917] text-white text-xs font-semibold rounded-full"
            >
              ดูบทความทั้งหมด
            </Link>
          </div>
        )}

        {/* Featured Post (Only on ALL category & no search) */}
        {featuredPost && currentCategory === "ALL" && !searchQuery && (
          <section className="bg-white rounded-2xl border border-[#9C8B72]/30 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto min-h-[320px] overflow-hidden">
                <img
                  src={
                    featuredPost.featured_image ||
                    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={featuredPost.featured_image_alt || featuredPost.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#1C1917]/90 text-[#FAF9F5] text-[10px] uppercase font-mono tracking-widest px-3 py-1.5 rounded-full backdrop-blur-xs font-semibold">
                    ⭐ บทความแนะนำ (Featured)
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[11px] text-[#665340]">
                    <span className="bg-[#FAF9F5] border border-[#9C8B72]/30 px-2.5 py-0.5 rounded-full font-medium">
                      {featuredPost.category}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(featuredPost.published_at || featuredPost.created_at).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <Link href={`/blog/${featuredPost.slug}`}>
                    <h2 className="font-serif text-2xl sm:text-3xl text-[#1C1917] font-semibold hover:text-[#665340] transition-colors leading-snug">
                      {featuredPost.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-[#4A4742] line-clamp-3 leading-relaxed font-light">
                    {featuredPost.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1C1917] hover:text-[#665340] group transition-colors"
                  >
                    <span>อ่านบทความฉบับเต็ม</span>
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </Link>
                  <span className="text-[11px] text-stone-400">
                    👁️ {(featuredPost.views_count || 0).toLocaleString()} ครั้ง
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Regular Posts Grid */}
        {((currentCategory === "ALL" && !searchQuery ? regularPosts : posts).length > 0) && (
          <section className="space-y-6">
            {currentCategory === "ALL" && !searchQuery && (
              <h3 className="font-serif text-xl text-[#1C1917] font-semibold border-b border-[#9C8B72]/20 pb-3">
                บทความล่าสุดทั้งหมด
              </h3>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(currentCategory === "ALL" && !searchQuery ? regularPosts : posts).map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl border border-[#9C8B72]/25 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Thumbnail Image */}
                  <Link
                    href={`/blog/${post.slug}`}
                    className="block relative h-52 overflow-hidden bg-stone-100"
                  >
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.featured_image_alt || post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <span className="material-symbols-outlined text-4xl">image</span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-[#FAF9F5]/95 text-[#665340] text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs border border-[#9C8B72]/20 shadow-xs">
                      {post.category}
                    </span>
                  </Link>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[11px] text-[#9C8B72] block">
                        {new Date(post.published_at || post.created_at).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>

                      <Link href={`/blog/${post.slug}`}>
                        <h4 className="font-serif text-lg font-semibold text-[#1C1917] group-hover:text-[#665340] transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                      </Link>

                      <p className="text-xs text-[#665340] line-clamp-3 leading-relaxed font-light">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-semibold text-[#1C1917] hover:text-[#665340] flex items-center gap-1 group/link"
                      >
                        <span>อ่านต่อ</span>
                        <span className="material-symbols-outlined text-xs group-hover/link:translate-x-1 transition-transform">
                          arrow_forward
                        </span>
                      </Link>
                      <span className="text-[10px] text-stone-400">
                        👁️ {(post.views_count || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA Card */}
        <section className="bg-[#1C1917] text-[#FAF9F5] rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden my-16 shadow-lg">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FAF9F5_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#D3CCC0]">
              EXPERIENCE THE ARCHITECTURE
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-semibold leading-snug">
              เริ่มต้นเขียนบทใหม่ของความรัก ณ Understory
            </h3>
            <p className="text-xs sm:text-sm text-[#D3CCC0] font-light leading-relaxed">
              นัดหมายเข้าชม The Grand Hall, Glasshouse Gallery และพื้นที่จริง
              พร้อมรับคำปรึกษาแพ็กเกจจัดงานแต่งงานสุดพิเศษจากทีมงานผู้เชี่ยวชาญ
            </p>
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/#contact-form"
                className="bg-[#FAF9F5] hover:bg-white text-[#1C1917] px-8 py-3 rounded-full text-xs font-semibold tracking-wider transition-all shadow-md"
              >
                ลงทะเบียนนัดเข้าชมสถานที่
              </Link>
              <a
                href="https://line.me/ti/p/~@understory"
                target="_blank"
                rel="noreferrer"
                className="bg-[#06C755] hover:bg-[#05b34c] text-white px-6 py-3 rounded-full text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                สอบถามผ่าน LINE Official
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#ECEAE3] border-t border-[#9C8B72]/30 py-8 px-6 text-center text-xs text-[#665340]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Understory Venue. All rights reserved.</p>
          <div className="flex gap-6 text-[11px] font-medium">
            <Link href="/" className="hover:text-black">
              หน้าแรก
            </Link>
            <Link href="/gallery" className="hover:text-black">
              แกลเลอรี
            </Link>
            <Link href="/blog" className="hover:text-black">
              บทความ
            </Link>
            <Link href="/admin" className="hover:text-black">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
