import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { getAllPosts } from "@/lib/postsStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

  const showFeatured = featuredPost && currentCategory === "ALL" && !searchQuery;
  const listPosts = showFeatured ? regularPosts : posts;

  return (
    <>
      <SiteHeader />

      <main className="bg-[#F1F0EB] text-[#000000] min-h-screen">
        {/* Title, categories, search */}
        <section className="px-margin-mobile md:px-margin-desktop pt-16 md:pt-24 pb-10 max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 pb-8 border-b border-[#9C8B72]/30">
            <div className="max-w-2xl">
              <h1 className="font-serif text-4xl md:text-6xl font-normal leading-tight">Journal</h1>
              <p className="font-body-md text-base text-[#4A4742] mt-4 leading-relaxed">
                เรื่องราว ไอเดีย และข้อมูลสำหรับการเตรียมงานแต่งงาน จากทีม Understory
              </p>
            </div>
            <form action="/blog" method="GET" className="w-full md:w-72">
              {currentCategory !== "ALL" && <input type="hidden" name="category" value={currentCategory} />}
              <label className="sr-only" htmlFor="blog-search">ค้นหาบทความ</label>
              <input
                id="blog-search"
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="ค้นหาบทความ"
                className="w-full bg-transparent border-0 border-b border-[#9C8B72]/60 px-0 py-2 text-sm text-[#000000] placeholder:text-[#9C8B72] focus:outline-none focus:border-[#000000]"
              />
            </form>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-3 pt-6">
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
                  className={`font-label-caps text-[11px] tracking-[0.18em] uppercase pb-1 border-b transition-colors ${
                    isActive ? "text-[#000000] border-[#665340]" : "text-[#9C8B72] border-transparent hover:text-[#000000]"
                  }`}
                >
                  {cat.label}
                </Link>
              );
            })}
          </nav>

          {searchQuery && (
            <p className="mt-6 text-sm text-[#4A4742]">
              ผลการค้นหา &ldquo;{searchQuery}&rdquo; · {posts.length} บทความ{" "}
              <Link href="/blog" className="underline underline-offset-4 hover:text-[#000000]">
                ล้างการค้นหา
              </Link>
            </p>
          )}
        </section>

        <div className="px-margin-mobile md:px-margin-desktop pb-24 max-w-[1280px] mx-auto">
          {posts.length === 0 && (
            <div className="py-24 text-center">
              <h2 className="font-serif text-2xl font-normal">ไม่พบบทความ</h2>
              <p className="text-sm text-[#4A4742] mt-3">ลองเลือกหมวดอื่น หรือค้นหาด้วยคำใหม่</p>
              <Link href="/blog" className="inline-block mt-6 text-sm underline underline-offset-4">
                ดูบทความทั้งหมด
              </Link>
            </div>
          )}

          {/* Featured post */}
          {showFeatured && (
            <article className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center pb-16 mb-16 border-b border-[#9C8B72]/30">
              <Link href={`/blog/${featuredPost.slug}`} className="lg:col-span-7 block overflow-hidden bg-[#E7E3DA]">
                <img
                  src={featuredPost.featured_image || "/pic/08.webp"}
                  alt={featuredPost.featured_image_alt || featuredPost.title}
                  className="w-full aspect-[1200/630] object-cover transition-transform duration-[1200ms] ease-out hover:scale-[1.02]"
                />
              </Link>
              <div className="lg:col-span-5">
                <p className="font-label-caps text-[11px] tracking-[0.18em] uppercase text-[#9C8B72]">
                  {featuredPost.category} · {formatDate(featuredPost, "long")}
                </p>
                <Link href={`/blog/${featuredPost.slug}`}>
                  <h2 className="font-serif text-3xl md:text-4xl font-normal leading-snug mt-4 hover:text-[#665340] transition-colors">
                    {featuredPost.title}
                  </h2>
                </Link>
                {featuredPost.excerpt && (
                  <p className="text-base text-[#4A4742] leading-relaxed mt-5 line-clamp-4">{featuredPost.excerpt}</p>
                )}
                <div className="flex items-center justify-between mt-8 text-sm">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="underline underline-offset-4 decoration-[#9C8B72] hover:decoration-[#000000]"
                  >
                    อ่านบทความ
                  </Link>
                  <span className="text-[#9C8B72] text-xs">อ่าน {(featuredPost.views_count || 0).toLocaleString()} ครั้ง</span>
                </div>
              </div>
            </article>
          )}

          {/* Post list */}
          {listPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
              {listPosts.map((post) => (
                <article key={post.id} className="group flex flex-col">
                  <Link href={`/blog/${post.slug}`} className="block overflow-hidden bg-[#E7E3DA]">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.featured_image_alt || post.title}
                        className="w-full aspect-[1200/630] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-[1200/630]" />
                    )}
                  </Link>
                  <p className="font-label-caps text-[11px] tracking-[0.18em] uppercase text-[#9C8B72] mt-5">
                    {post.category} · {formatDate(post, "short")}
                  </p>
                  <Link href={`/blog/${post.slug}`}>
                    <h3 className="font-serif text-xl font-normal leading-snug mt-3 group-hover:text-[#665340] transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  {post.excerpt && (
                    <p className="text-sm text-[#4A4742] leading-relaxed mt-3 line-clamp-3">{post.excerpt}</p>
                  )}
                  <span className="text-[#9C8B72] text-xs mt-4">อ่าน {(post.views_count || 0).toLocaleString()} ครั้ง</span>
                </article>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <section className="bg-[#1E1C1A] text-[#F1F0EB] py-20 md:py-24 px-margin-mobile md:px-margin-desktop text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl font-normal leading-snug">
              นัดเข้าชมสถานที่จริงที่ Understory
            </h2>
            <p className="text-sm md:text-base text-[#D3CCC0] leading-relaxed mt-5">
              เดินชม Mistle Hall, Linden Hall และ Willow Hall พร้อมปรึกษาทีมงานเรื่องรายละเอียดงานของคุณ
            </p>
            <Link
              href="/#contact"
              className="inline-block mt-10 bg-[#F1F0EB] text-[#000000] hover:bg-white py-3.5 px-8 rounded-md font-label-caps text-label-caps tracking-widest transition-colors"
            >
              BOOK A VISIT
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

function formatDate(post, month) {
  return new Date(post.published_at || post.created_at).toLocaleDateString("th-TH", {
    year: "numeric",
    month,
    day: "numeric",
  });
}
