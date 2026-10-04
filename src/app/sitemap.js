import { getAllPosts } from "@/lib/postsStore";

export default async function sitemap() {
  const baseUrl = "https://understoryvenue.com";
  const now = new Date();

  // 1. Static Pages
  const staticPages = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // 2. Dynamic Blog Posts
  try {
    const posts = await getAllPosts({ status: "published" });
    const postUrls = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updated_at || post.published_at || now),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticPages, ...postUrls];
  } catch (err) {
    console.error("Sitemap generation error:", err);
    return staticPages;
  }
}
