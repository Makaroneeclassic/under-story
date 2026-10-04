import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug, getAllPosts, incrementPostViews } from "@/lib/postsStore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Dynamic SEO Metadata (Next.js 16)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {}

  const post = await getPostBySlug(decodedSlug);

  if (!post || post.status !== "published") {
    return {
      title: "บทความไม่พบ | Understory Venue",
      robots: { index: false, follow: false },
    };
  }

  const siteUrl = "https://understoryvenue.com";
  const canonical = post.canonical_url || `${siteUrl}/blog/${post.slug}`;
  const ogImage = post.og_image || post.featured_image || `${siteUrl}/icon.png`;

  return {
    title: post.meta_title || `${post.title} | Understory Venue`,
    description: post.meta_description || post.excerpt || "",
    keywords: [post.focus_keyword, ...(post.tags || []), post.category, "Understory Venue"].filter(Boolean),
    alternates: {
      canonical: canonical,
    },
    robots: {
      index: !post.no_index,
      follow: !post.no_follow,
    },
    openGraph: {
      title: post.og_title || post.meta_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt,
      url: `${siteUrl}/blog/${post.slug}`,
      siteName: "Understory Venue",
      locale: "th_TH",
      type: "article",
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at || post.created_at,
      tags: post.tags || [],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.featured_image_alt || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.og_title || post.meta_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt,
      images: [ogImage],
    },
  };
}

// Helper to extract Table of Contents from HTML
function extractHeadings(htmlContent) {
  if (!htmlContent) return [];
  const regex = /<h([23])[^>]*>(.*?)<\/h\1>/gi;
  const headings = [];
  let match;
  while ((match = regex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1], 10);
    const rawText = match[2].replace(/<[^>]*>/g, "").trim();
    const id = rawText.toLowerCase().replace(/[^\w\u0E00-\u0E7Fa-z0-9-]+/g, "-");
    headings.push({ level, text: rawText, id });
  }
  return headings;
}

// Inject IDs into H2 and H3 for Table of Contents anchoring
function injectHeadingIds(htmlContent) {
  if (!htmlContent) return "";
  return htmlContent.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
    const cleanText = text.replace(/<[^>]*>/g, "").trim();
    const id = cleanText.toLowerCase().replace(/[^\w\u0E00-\u0E7Fa-z0-9-]+/g, "-");
    return `<h${level} id="${id}" ${attrs}>${text}</h${level}>`;
  });
}

export default async function BlogPostDetailPage({ params }) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch (e) {}

  const post = await getPostBySlug(decodedSlug);

  if (!post || post.status !== "published") {
    notFound();
  }

  // Increment view count in background
  incrementPostViews(decodedSlug);

  // Fetch related posts (same category, excluding current post)
  const allPosts = await getAllPosts({ status: "published" });
  const relatedPosts = allPosts
    .filter(
      (p) =>
        p.slug !== decodedSlug &&
        p.slug !== slug &&
        (p.category === post.category || allPosts.length <= 4)
    )
    .slice(0, 3);

  const headings = extractHeadings(post.content);
  const contentWithIds = injectHeadingIds(post.content);

  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const fullUrl = `https://understoryvenue.com/blog/${post.slug}`;

  // JSON-LD Schema (Article / BlogPosting + Breadcrumb)
  const schemaType = post.schema_type || "BlogPosting";
  const jsonLdArticle = {
    "@context": "https://schema.org",
    "@type": schemaType,
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.featured_image ? [post.featured_image] : ["https://understoryvenue.com/icon.png"],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.created_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": fullUrl,
    },
    author: {
      "@type": "Organization",
      name: "Understory Venue Editorial Team",
      url: "https://understoryvenue.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Understory Venue",
      logo: {
        "@type": "ImageObject",
        url: "https://understoryvenue.com/logo_understory_authentic.webp",
      },
    },
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "หน้าแรก",
        item: "https://understoryvenue.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "บทความ (Journal)",
        item: "https://understoryvenue.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.category,
        item: `https://understoryvenue.com/blog?category=${encodeURIComponent(post.category)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: post.title,
        item: fullUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#2D2A26] font-sans selection:bg-[#665340]/20 antialiased">
      {/* Inject JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />

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

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-10 md:py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#9C8B72] mb-6 flex-wrap font-medium">
          <Link href="/" className="hover:text-[#1C1917] transition-colors">
            หน้าแรก
          </Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#1C1917] transition-colors">
            บทความ
          </Link>
          <span>/</span>
          <Link
            href={`/blog?category=${encodeURIComponent(post.category)}`}
            className="hover:text-[#1C1917] transition-colors"
          >
            {post.category}
          </Link>
        </nav>

        {/* Article Header */}
        <header className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="bg-[#1C1917] text-[#FAF9F5] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              {post.category}
            </span>
            <span className="text-xs text-[#665340] font-mono">{formattedDate}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1C1917] font-semibold leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg text-[#665340] leading-relaxed font-light border-l-2 border-[#665340] pl-4 pt-1">
              {post.excerpt}
            </p>
          )}

          {/* Author & Social Share Row */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#9C8B72]/20 pb-6 text-xs text-[#665340]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1C1917] text-white flex items-center justify-center font-serif font-bold text-xs">
                U
              </div>
              <div>
                <span className="font-semibold text-[#1C1917] block">Understory Editorial Team</span>
                <span className="text-[11px] text-stone-400">Architectural Wedding Insights</span>
              </div>
            </div>

            {/* Social Share Buttons */}
            <div className="flex items-center gap-2">
              <span className="text-stone-400 text-[11px] mr-1">แชร์บทความ:</span>
              {/* LINE */}
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(fullUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#06C755] hover:bg-[#05b34c] text-white px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 transition-all"
                title="แชร์ลง LINE"
              >
                <span>LINE</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#1877F2] hover:bg-[#166fe5] text-white px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 transition-all"
                title="แชร์ลง Facebook"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <figure className="mb-10 rounded-2xl overflow-hidden shadow-sm border border-[#9C8B72]/20">
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              className="w-full max-h-[550px] object-cover"
            />
            {post.featured_image_alt && (
              <figcaption className="text-center text-xs text-stone-500 py-2.5 bg-white border-t border-stone-100">
                {post.featured_image_alt}
              </figcaption>
            )}
          </figure>
        )}

        {/* Table of Contents (ToC) if 2+ headings */}
        {headings.length >= 2 && (
          <div className="bg-[#FAF9F5] border border-[#9C8B72]/30 rounded-xl p-5 mb-10 shadow-xs">
            <div className="flex items-center gap-2 font-serif font-bold text-sm text-[#1C1917] mb-3">
              <span className="material-symbols-outlined text-base text-[#665340]">format_list_bulleted</span>
              สารบัญเนื้อหา (Table of Contents)
            </div>
            <ul className="space-y-1.5 text-xs text-[#665340]">
              {headings.map((h, idx) => (
                <li key={idx} style={{ paddingLeft: h.level === 3 ? "1.2rem" : "0" }}>
                  <a
                    href={`#${h.id}`}
                    className="hover:text-[#1C1917] hover:underline transition-colors block py-0.5"
                  >
                    • {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prose Article Body */}
        <article
          className="prose prose-stone lg:prose-lg max-w-none text-[#2D2A26] leading-relaxed font-sans text-sm sm:text-base selection:bg-[#665340]/20
            [&>h2]:font-serif [&>h2]:text-2xl sm:[&>h2]:text-3xl [&>h2]:font-bold [&>h2]:text-[#1C1917] [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:scroll-mt-24
            [&>h3]:font-serif [&>h3]:text-xl sm:[&>h3]:text-2xl [&>h3]:font-semibold [&>h3]:text-[#1C1917] [&>h3]:mt-8 [&>h3]:mb-3 [&>h3]:scroll-mt-24
            [&>p]:my-4 [&>p]:leading-relaxed [&>p]:text-[#3E3A35]
            [&>blockquote]:border-l-4 [&>blockquote]:border-[#665340] [&>blockquote]:bg-[#FAF9F5] [&>blockquote]:p-4 [&>blockquote]:italic [&>blockquote]:my-6 [&>blockquote]:rounded-r-lg
            [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:my-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:my-4
            [&>figure]:my-8 [&>figure>img]:rounded-xl [&>figure>img]:shadow-xs"
          dangerouslySetInnerHTML={{ __html: contentWithIds }}
        />

        {/* Tags Section */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-8 mt-12 border-t border-[#9C8B72]/20 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#665340] font-medium mr-1">แท็กที่เกี่ยวข้อง:</span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-white border border-[#9C8B72]/30 px-3 py-1 rounded-full text-xs text-[#4A4742] font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Author Bio Signature Box */}
        <section className="bg-white border border-[#9C8B72]/30 rounded-2xl p-6 sm:p-8 mt-12 shadow-xs flex flex-col sm:flex-row gap-6 items-center">
          <div className="w-16 h-16 rounded-full bg-[#1C1917] text-[#FAF9F5] flex items-center justify-center font-serif text-2xl font-bold shrink-0">
            U
          </div>
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 className="font-serif font-bold text-lg text-[#1C1917]">Understory Venue</h4>
            <p className="text-xs text-[#665340] leading-relaxed font-light">
              สถานที่จัดงานแต่งงานสถาปัตยกรรมธรรมชาติ ภายใต้ร่มเงาของต้นไม้ใหญ่และกำแพงหิน
              เปิดให้คู่บ่าวสาวนัดหมายเข้าชมพื้นที่จริงและปรึกษาทีมงานได้ทุกวัน
            </p>
            <div className="pt-2">
              <Link
                href="/#contact-form"
                className="inline-block text-xs font-semibold text-[#1C1917] underline hover:text-[#665340]"
              >
                นัดเข้าชม The Grand Hall & Glasshouse Gallery →
              </Link>
            </div>
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 pt-12 border-t border-[#9C8B72]/20 space-y-6">
            <h3 className="font-serif text-2xl text-[#1C1917] font-semibold">
              บทความที่คุณอาจสนใจ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="bg-white rounded-xl border border-[#9C8B72]/25 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col"
                >
                  <div className="h-40 overflow-hidden bg-stone-100">
                    {rel.featured_image ? (
                      <img
                        src={rel.featured_image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <span className="material-symbols-outlined text-3xl">image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <span className="text-[10px] text-[#9C8B72] font-semibold uppercase tracking-wider">
                      {rel.category}
                    </span>
                    <h5 className="font-serif font-semibold text-sm text-[#1C1917] group-hover:text-[#665340] transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h5>
                    <span className="text-[11px] text-[#665340] font-medium pt-2 block">
                      อ่านต่อ →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#ECEAE3] border-t border-[#9C8B72]/30 py-8 px-6 text-center text-xs text-[#665340] mt-16">
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
