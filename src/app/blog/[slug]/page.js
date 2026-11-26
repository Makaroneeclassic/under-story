import { notFound } from "next/navigation";
import { after } from "next/server";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
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

  // Increment view count after the response is sent (kept alive on Vercel via after())
  after(() => incrementPostViews(decodedSlug));

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdArticle) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />

      <SiteHeader />

      <main className="bg-[#F1F0EB] text-[#000000] min-h-screen">
        {/* Article header */}
        <header className="px-margin-mobile md:px-margin-desktop pt-12 md:pt-20 max-w-3xl mx-auto box-content">
          <nav className="flex flex-wrap items-center gap-2 font-label-caps text-[11px] tracking-[0.18em] uppercase text-[#9C8B72]">
            <Link href="/blog" className="hover:text-[#000000] transition-colors">Journal</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/blog?category=${encodeURIComponent(post.category)}`} className="hover:text-[#000000] transition-colors">
              {post.category}
            </Link>
            <span aria-hidden="true">·</span>
            <time dateTime={post.published_at || post.created_at}>{formattedDate}</time>
          </nav>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal leading-tight mt-6">{post.title}</h1>

          {post.excerpt && (
            <p className="text-lg md:text-xl text-[#4A4742] leading-relaxed mt-6">{post.excerpt}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pb-8 border-b border-[#9C8B72]/30 text-sm text-[#4A4742]">
            <span>โดยทีม Understory</span>
            <div className="flex items-center gap-4">
              <span className="text-[#9C8B72]">แชร์</span>
              <a
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(fullUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 decoration-[#9C8B72] hover:decoration-[#000000]"
              >
                LINE
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 decoration-[#9C8B72] hover:decoration-[#000000]"
              >
                Facebook
              </a>
            </div>
          </div>
        </header>

        {/* Featured image (wider than the text column) */}
        {post.featured_image && (
          <figure className="px-margin-mobile md:px-margin-desktop max-w-5xl mx-auto box-content mt-10 md:mt-14">
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              className="w-full aspect-[1200/630] object-cover bg-[#E7E3DA]"
            />
            {post.featured_image_alt && (
              <figcaption className="mt-3 text-xs text-[#9C8B72]">{post.featured_image_alt}</figcaption>
            )}
          </figure>
        )}

        <div className="px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto box-content pt-12 md:pt-16 pb-24">
          {/* Table of contents */}
          {headings.length >= 2 && (
            <nav className="mb-12 py-6 border-y border-[#9C8B72]/30">
              <p className="font-label-caps text-[11px] tracking-[0.18em] uppercase text-[#9C8B72] mb-4">สารบัญ</p>
              <ol className="space-y-2 text-sm text-[#4A4742]">
                {headings.map((h, idx) => (
                  <li key={idx} className={h.level === 3 ? "pl-5" : ""}>
                    <a href={`#${h.id}`} className="hover:text-[#000000] transition-colors">
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Article body */}
          <article
            className="text-base md:text-[17px] leading-[1.85] text-[#2D2A26]
              [&>h2]:font-serif [&>h2]:text-2xl md:[&>h2]:text-3xl [&>h2]:font-normal [&>h2]:text-[#000000] [&>h2]:leading-snug [&>h2]:mt-14 [&>h2]:mb-5 [&>h2]:scroll-mt-28
              [&>h3]:font-serif [&>h3]:text-xl md:[&>h3]:text-2xl [&>h3]:font-normal [&>h3]:text-[#000000] [&>h3]:leading-snug [&>h3]:mt-10 [&>h3]:mb-4 [&>h3]:scroll-mt-28
              [&>p]:my-5
              [&_a]:underline [&_a]:underline-offset-4 [&_a]:decoration-[#9C8B72] hover:[&_a]:decoration-[#000000]
              [&_strong]:font-semibold [&_strong]:text-[#000000]
              [&>blockquote]:font-serif [&>blockquote]:text-xl [&>blockquote]:leading-relaxed [&>blockquote]:text-[#000000] [&>blockquote]:border-l [&>blockquote]:border-[#665340] [&>blockquote]:pl-6 [&>blockquote]:my-10
              [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:my-5 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:my-5 [&_li]:my-2
              [&_img]:w-full [&_img]:h-auto [&_img]:my-10 [&>figure]:my-10 [&_figcaption]:text-xs [&_figcaption]:text-[#9C8B72] [&_figcaption]:mt-3"
            dangerouslySetInnerHTML={{ __html: contentWithIds }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <p className="mt-16 pt-8 border-t border-[#9C8B72]/30 text-sm text-[#9C8B72] flex flex-wrap gap-x-4 gap-y-2">
              {post.tags.map((tag) => (
                <span key={tag}>#{tag}</span>
              ))}
            </p>
          )}

          {/* Visit prompt */}
          <aside className="mt-12 py-8 border-y border-[#9C8B72]/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="font-serif text-xl">Understory Venue</p>
              <p className="text-sm text-[#4A4742] mt-2 leading-relaxed">
                สถานที่จัดงานแต่งงาน 3 ห้อง: Mistle Hall, Linden Hall และ Willow Hall
              </p>
            </div>
            <Link
              href="/#contact"
              className="shrink-0 inline-block bg-[#000000] text-[#F1F0EB] hover:bg-[#665340] py-3 px-6 rounded-md font-label-caps text-label-caps tracking-widest transition-colors text-center"
            >
              BOOK A VISIT
            </Link>
          </aside>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section className="px-margin-mobile md:px-margin-desktop max-w-[1280px] mx-auto box-content pb-24">
            <h2 className="font-serif text-2xl md:text-3xl font-normal pb-6 mb-10 border-b border-[#9C8B72]/30">
              บทความอื่น
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-14">
              {relatedPosts.map((rel) => (
                <Link key={rel.id} href={`/blog/${rel.slug}`} className="group flex flex-col">
                  <div className="overflow-hidden bg-[#E7E3DA]">
                    {rel.featured_image ? (
                      <img
                        src={rel.featured_image}
                        alt={rel.featured_image_alt || rel.title}
                        className="w-full aspect-[1200/630] object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full aspect-[1200/630]" />
                    )}
                  </div>
                  <p className="font-label-caps text-[11px] tracking-[0.18em] uppercase text-[#9C8B72] mt-5">{rel.category}</p>
                  <h3 className="font-serif text-lg font-normal leading-snug mt-3 group-hover:text-[#665340] transition-colors line-clamp-2">
                    {rel.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}
