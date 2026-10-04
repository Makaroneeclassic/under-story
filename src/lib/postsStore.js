import fs from "fs";
import path from "path";
import { supabase, isSupabaseConfigured } from "./supabase.js";

const dataDir = path.join(process.cwd(), "data");
const postsFilePath = path.join(dataDir, "posts.json");
const categoriesFilePath = path.join(dataDir, "categories.json");

export const DEFAULT_CATEGORIES = [
  "Wedding Inspiration",
  "Venue & Spaces",
  "Catering & Banquets",
  "Promotion",
];

const INITIAL_POSTS = [
  {
    id: "post_understory_vision_2026",
    title: "สถาปัตยกรรมธรรมชาติใจกลางเมือง: นิยามใหม่ของพื้นที่แต่งงาน Understory",
    slug: "understory-architectural-wedding-venue-concept",
    excerpt: "เปิดแนวคิดการออกแบบ Understory Venue พื้นที่จัดงานแต่งงานที่ผสานแรงบันดาลใจจากความสงบของผืนป่าและความหนักแน่นของหินธรรมชาติ เพื่อให้ทุกเรื่องราวความรักถูกจารึกอย่างงดงาม",
    content: `<h2>Under the Witness Tree: ที่ซึ่งเรื่องราวของคุณเริ่มต้น</h2>
<p>Understory ถูกสร้างขึ้นบนแนวคิดที่ว่า พื้นที่จัดงานแต่งงานควรเป็นมากกว่าแค่ห้องจัดเลี้ยงทั่วไป แต่คือ <strong>Architectural Journey</strong> ที่สะท้อนตัวตนของคู่บ่าวสาวผ่านเส้นสายธรรมชาติและแสงเงาที่เปลี่ยนแปลงตลอดทั้งวัน</p>

<h3>1. การเชื่อมโยงธรรมชาติกับความโมเดิร์น</h3>
<p>เราเลือกใช้วัสดุหินธรรมชาติ (Limestone) ผสานกับระแนงไม้และช่องแสงธรรมชาติ เพื่อสร้างบรรยากาศที่ทั้งอบอุ่น สงบ และสง่างามในคราวเดียว โดยมี <em>The Grand Hall</em> ที่รองรับแขกได้ถึง 350 ท่าน พร้อมเพดานสูงโปร่งไร้เสากลาง</p>

<blockquote>"ความงามที่แท้จริงของการจัดงานแต่งงาน คือช่วงเวลาที่ธรรมชาติ แสง และสายตาของผู้คนรวมกันเป็นหนึ่งเดียว"</blockquote>

<h3>2. ลำดับของพื้นที่ (Sequential Spaces)</h3>
<p>พื้นที่ของ Understory แบ่งออกเป็นหลายโซนอย่างประณีต ตั้งแต่ <strong>Arrival Courtyard</strong> ต้อนรับแขกด้วยเสียงน้ำและต้นไม้ใหญ่, <strong>Glasshouse Gallery</strong> สำหรับพิธีการเช้าหรืองานหมั้นที่ต้องการแสงละมุน, และ <strong>Main Sanctuary</strong> สำหรับงานเลี้ยงฉลองที่น่าประทับใจ</p>

<h3>3. ตอบโจทย์คู่แต่งงานยุคใหม่</h3>
<p>ไม่ว่าคุณจะมองหางานแต่งงานสไตล์ Minimalist, Botanical Luxury, หรือ Warm Contemporary ทีมงาน Understory พร้อมร่วมมือกับทีม Stylist และ Planner ชั้นนำเพื่อเนรมิตภาพในฝันให้เป็นจริง</p>`,
    featured_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
    featured_image_alt: "Understory Architectural Wedding Venue Hall Atmosphere",
    category: "Venue & Spaces",
    tags: ["Understory", "สถานที่แต่งงาน", "Architectural Venue", "Wedding Hall"],
    status: "published",
    published_at: "2026-09-01T08:00:00.000Z",
    
    // SEO Fields (WordPress / Rank Math style)
    meta_title: "สถานที่แต่งงานสถาปัตยกรรมธรรมชาติใจกลางเมือง | Understory Venue",
    meta_description: "สัมผัสประสบการณ์จัดงานแต่งงานท่ามกลางสถาปัตยกรรมหินธรรมชาติและผืนป่า Grand Hall ไร้เสากลาง รองรับแขก 350 ท่าน พร้อมแสงธรรมชาติงดงาม ณ Understory",
    focus_keyword: "สถานที่แต่งงาน",
    canonical_url: "https://understoryvenue.com/blog/understory-architectural-wedding-venue-concept",
    no_index: false,
    no_follow: false,
    og_title: "สถาปัตยกรรมธรรมชาติใจกลางเมือง: นิยามใหม่ของพื้นที่แต่งงาน Understory",
    og_description: "พื้นที่จัดงานแต่งงานสไตล์ Quiet Luxury ที่ผสานหินธรรมชาติและต้นไม้ใหญ่ จองคิวนัดเข้าชมสถานที่วันนี้",
    og_image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
    schema_type: "BlogPosting",
    
    views_count: 245,
    created_at: "2026-09-01T08:00:00.000Z",
    updated_at: "2026-09-15T10:00:00.000Z",
  },
  {
    id: "post_wedding_trends_2026",
    title: "5 เทรนด์งานแต่งงานปี 2026-2027: ความเรียบหรูที่เน้นความหมายและการใส่ใจแขก",
    slug: "wedding-trends-luxury-minimalist-experience",
    excerpt: "เจาะลึกเทรนด์งานแต่งงานยุคใหม่ ที่เน้น Intimate Luxury, Micro Weddings คุณภาพสูง, และการออกแบบแสงแบบ Cinematography ให้วันสำคัญของคุณโดดเด่นไม่ซ้ำใคร",
    content: `<h2>นิยามใหม่ของความหรูหรา: Intimate & Meaningful</h2>
<p>เทรนด์งานแต่งงานในปี 2026-2027 ชี้ชัดว่าคู่รักรุ่นใหม่ให้ความสำคัญกับ <strong>Guest Experience</strong> มากกว่าความอลังการที่จับต้องไม่ได้ โดยเน้นให้แขกทุกคนรู้สึกได้รับการต้อนรับอย่างอบอุ่นและใกล้ชิด</p>

<h3>1. Micro-Luxury: แขกน้อยลง แต่ใส่ใจรายละเอียดสูงสุด</h3>
<p>งานขนาด 100-200 ท่านกำลังเป็นที่นิยมสูงสุด คู่แต่งงานเลือกที่จะลงทุนในงานอาหาร Fine Dining, เครื่องดื่ม Signature Cocktails ที่คัสตอมตามเรื่องราวของคู่รัก, และดนตรีสดที่สร้างบรรยากาศเฉพาะตัว</p>

<h3>2. Earthy & Muted Color Palettes</h3>
<p>โทนสีที่มาแรงคือสีธรรมชาติ เช่น Warm Limestone, Sage Olive, Oat Beige, และ Terracotta Accents ซึ่งเข้ากันได้อย่างสมบูรณ์แบบกับดีไซน์ของ Understory</p>

<h3>3. Lighting Design ที่ให้ความรู้สึกดุจภาพยนตร์</h3>
<p>การใช้แสง Candlelight ร่วมกับ Architectural Uplighting และการจัดแสงตามจังหวะดนตรี ช่วยให้ภาพถ่ายและวิดีโอแต่งงานออกมาทรงพลังและเหนือกาลเวลา</p>`,
    featured_image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80",
    featured_image_alt: "Intimate Luxury Wedding Table Setting & Warm Lighting",
    category: "Wedding Inspiration",
    tags: ["เทรนด์งานแต่งงาน", "Wedding Trends", "Intimate Wedding", "ไอเดียงานแต่ง"],
    status: "published",
    published_at: "2026-09-10T09:30:00.000Z",
    
    meta_title: "5 เทรนด์งานแต่งงาน 2026-2027: เรียบหรู ใส่ใจแขก และเหนือกาลเวลา | Understory",
    meta_description: "อัปเดต 5 เทรนด์งานแต่งงานปี 2026 จากผู้เชี่ยวชาญ เจาะลึก Micro-Luxury, โทนสี Earthy, แสงธรรมชาติ และการออกแบบ Guest Experience ที่น่าประทับใจ",
    focus_keyword: "เทรนด์งานแต่งงาน",
    canonical_url: "https://understoryvenue.com/blog/wedding-trends-luxury-minimalist-experience",
    no_index: false,
    no_follow: false,
    og_title: "5 เทรนด์งานแต่งงานปี 2026-2027 ที่คู่รักไม่ควรพลาด",
    og_description: "อ่านไอเดียและแนวทางการจัดงานแต่งงานยุคใหม่ ที่เน้นคุณภาพและสร้างความทรงจำที่ลึกซึ้ง",
    og_image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80",
    schema_type: "Article",
    
    views_count: 182,
    created_at: "2026-09-10T09:30:00.000Z",
    updated_at: "2026-09-20T12:00:00.000Z",
  },
  {
    id: "post_banquet_experience_understory",
    title: "ศาสตร์แห่งการจัดเลี้ยงงานแต่ง: รสชาติที่สร้างบทสนทนาอันน่าประทับใจ",
    slug: "wedding-banquet-catering-culinary-experience",
    excerpt: "สำรวจเมนูอาหารจัดเลี้ยงและเครื่องดื่มที่คิดค้นขึ้นเป็นพิเศษ สำหรับคู่แต่งงานที่ต้องการมอบประสบการณ์การรับประทานอาหารระดับพรีเมียมแก่แขกคนสำคัญ",
    content: `<h2>อาหารจัดเลี้ยงที่ไม่ใช่แค่อาหาร แต่คือความทรงจำ</h2>
<p>หนึ่งในสิ่งที่แขกจะจดจำและพูดถึงมากที่สุดหลังจบงานแต่งงาน คือ <strong>"อาหาร"</strong> และความพิถีพิถันในการเสิร์ฟ Understory ร่วมมือกับทีมเชฟมืออาชีพ ออกแบบรูปแบบการจัดเลี้ยงที่หลากหลาย ทั้ง Western Course, Asian Fusion, และ Cocktail Buffet สุดหรู</p>

<h3>1. Custom Tasting Menu</h3>
<p>เราเปิดโอกาสให้คู่บ่าวสาวได้เข้าชิมอาหาร (Food Tasting) ก่อนวันงานจริง พร้อมปรับรสชาติและการจัดจานให้สอดคล้องกับธีมของงาน</p>

<h3>2. Pairing Bar & Signature Drinks</h3>
<p>โซนบาร์เครื่องดื่มที่คราฟต์เมนูพิเศษ สะท้อนเรื่องราวการเดินทางหรือเครื่องดื่มแก้วโปรดของคู่บ่าวสาว มอบความสดชื่นและความประทับใจตลอดค่ำคืน</p>`,
    featured_image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1600&q=80",
    featured_image_alt: "Luxury Wedding Catering Dishes & Banquet Table",
    category: "Catering & Banquets",
    tags: ["อาหารงานแต่ง", "Catering", "Banquet", "จัดเลี้ยงแต่งงาน"],
    status: "published",
    published_at: "2026-09-18T11:00:00.000Z",
    
    meta_title: "ศาสตร์แห่งอาหารจัดเลี้ยงงานแต่ง: พรีเมียมและน่าประทับใจ | Understory Venue",
    meta_description: "ยกระดับงานแต่งงานด้วยบริการจัดเลี้ยงอาหารและเครื่องดื่มระดับไฟน์ไดน์นิ่ง คัสตอมเมนูพิเศษเพื่อสร้างความประทับใจแก่แขกคนสำคัญ ณ Understory",
    focus_keyword: "อาหารงานแต่ง",
    canonical_url: "https://understoryvenue.com/blog/wedding-banquet-catering-culinary-experience",
    no_index: false,
    no_follow: false,
    og_title: "ศาสตร์แห่งอาหารจัดเลี้ยงงานแต่ง: รสชาติที่สร้างบทสนทนาอันน่าประทับใจ",
    og_description: "ออกแบบประสบการณ์จัดเลี้ยงสุดพิเศษที่แขกทุกคนจะประทับใจไม่รู้ลืม",
    og_image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80",
    schema_type: "BlogPosting",
    
    views_count: 119,
    created_at: "2026-09-18T11:00:00.000Z",
    updated_at: "2026-09-18T11:00:00.000Z",
  }
];

function ensureLocalFiles() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(postsFilePath)) {
    fs.writeFileSync(postsFilePath, JSON.stringify(INITIAL_POSTS, null, 2), "utf-8");
  }

  if (!fs.existsSync(categoriesFilePath)) {
    fs.writeFileSync(categoriesFilePath, JSON.stringify(DEFAULT_CATEGORIES, null, 2), "utf-8");
  }
}

function getLocalPosts() {
  try {
    ensureLocalFiles();
    const data = fs.readFileSync(postsFilePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Local posts read error:", error);
    return INITIAL_POSTS;
  }
}

function saveLocalPosts(posts) {
  try {
    ensureLocalFiles();
    fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), "utf-8");
  } catch (error) {
    console.error("Local posts write error:", error);
  }
}

export function getLocalCategories() {
  try {
    ensureLocalFiles();
    const data = fs.readFileSync(categoriesFilePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Local categories read error:", error);
    return DEFAULT_CATEGORIES;
  }
}

export function saveLocalCategories(categories) {
  try {
    ensureLocalFiles();
    fs.writeFileSync(categoriesFilePath, JSON.stringify(categories, null, 2), "utf-8");
  } catch (error) {
    console.error("Local categories write error:", error);
  }
}

// 1. GET ALL POSTS
export async function getAllPosts({ status = "ALL", category = "ALL", search = "", limit = 100, offset = 0 } = {}) {
  let posts = [];

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from("posts").select("*", { count: "exact" });

      if (status !== "ALL") {
        query = query.eq("status", status);
      }
      if (category !== "ALL") {
        query = query.eq("category", category);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
      }

      query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        posts = data.map(formatPostFromDb);
        return posts;
      }
    } catch (err) {
      console.warn("Supabase getAllPosts error, falling back to local:", err.message);
    }
  }

  // Fallback to local JSON
  posts = getLocalPosts();
  return posts.filter((p) => {
    const matchStatus = status === "ALL" || p.status === status;
    const matchCategory = category === "ALL" || p.category === category;
    const matchSearch =
      !search ||
      `${p.title} ${p.excerpt} ${p.content} ${p.focus_keyword || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
    return matchStatus && matchCategory && matchSearch;
  });
}

// 2. GET POST BY SLUG
export async function getPostBySlug(slug) {
  if (!slug) return null;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      if (data) return formatPostFromDb(data);
    } catch (err) {
      console.warn("Supabase getPostBySlug error, falling back to local:", err.message);
    }
  }

  const posts = getLocalPosts();
  return posts.find((p) => p.slug === slug) || null;
}

// 3. GET POST BY ID
export async function getPostById(id) {
  if (!id) return null;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (data) return formatPostFromDb(data);
    } catch (err) {
      console.warn("Supabase getPostById error, falling back to local:", err.message);
    }
  }

  const posts = getLocalPosts();
  return posts.find((p) => p.id === id) || null;
}

// 4. CREATE POST
export async function createPost(postData) {
  const newId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Clean slug
  let cleanSlug = (postData.slug || postData.title || newId)
    .toLowerCase()
    .trim()
    .replace(/[^\w\u0E00-\u0E7Fa-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!cleanSlug) cleanSlug = newId;

  const formattedPost = {
    id: newId,
    title: (postData.title || "Untitled Post").trim(),
    slug: cleanSlug,
    excerpt: postData.excerpt || "",
    content: postData.content || "",
    featured_image: postData.featured_image || "",
    featured_image_alt: postData.featured_image_alt || postData.title || "",
    category: postData.category || "General",
    tags: Array.isArray(postData.tags) ? postData.tags : [],
    status: postData.status || "draft",
    published_at: postData.status === "published" ? (postData.published_at || now) : null,
    
    // SEO Fields
    meta_title: postData.meta_title || postData.title || "",
    meta_description: postData.meta_description || postData.excerpt || "",
    focus_keyword: postData.focus_keyword || "",
    canonical_url: postData.canonical_url || "",
    no_index: Boolean(postData.no_index),
    no_follow: Boolean(postData.no_follow),
    og_title: postData.og_title || postData.meta_title || postData.title || "",
    og_description: postData.og_description || postData.meta_description || postData.excerpt || "",
    og_image: postData.og_image || postData.featured_image || "",
    schema_type: postData.schema_type || "BlogPosting",

    views_count: 0,
    created_at: now,
    updated_at: now,
  };

  // 1. Save to Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = formatPostToDb(formattedPost);
      const { data, error } = await supabase.from("posts").insert(dbPayload).select();
      if (error) throw error;
      if (data && data[0]) {
        formattedPost.id = data[0].id;
      }
    } catch (err) {
      console.warn("Supabase createPost error, saving to local backup:", err.message);
    }
  }

  // 2. Save to Local Backup
  const localPosts = getLocalPosts();
  localPosts.unshift(formattedPost);
  saveLocalPosts(localPosts);

  return formattedPost;
}

// 5. UPDATE POST
export async function updatePost(id, updates) {
  const now = new Date().toISOString();
  const currentPost = await getPostById(id);
  if (!currentPost) return null;

  const merged = {
    ...currentPost,
    ...updates,
    updated_at: now,
  };

  if (updates.status === "published" && !merged.published_at) {
    merged.published_at = now;
  }

  // 1. Update Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const dbPayload = formatPostToDb(merged);
      delete dbPayload.id;
      const { error } = await supabase.from("posts").update(dbPayload).eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase updatePost error, updating local backup:", err.message);
    }
  }

  // 2. Update Local Backup
  const localPosts = getLocalPosts();
  const index = localPosts.findIndex((p) => p.id === id);
  if (index !== -1) {
    localPosts[index] = merged;
    saveLocalPosts(localPosts);
  }

  return merged;
}

// 6. DELETE POST
export async function deletePostById(id) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    } catch (err) {
      console.warn("Supabase deletePost error, falling back to local:", err.message);
    }
  }

  const localPosts = getLocalPosts();
  const filtered = localPosts.filter((p) => p.id !== id);
  saveLocalPosts(filtered);
  return true;
}

// 7. INCREMENT VIEWS
export async function incrementPostViews(slug) {
  if (!slug) return;
  
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.rpc("increment_post_views", { target_slug: slug }).catch(async () => {
        // Fallback: regular update
        const { data } = await supabase.from("posts").select("id, views_count").eq("slug", slug).maybeSingle();
        if (data) {
          await supabase.from("posts").update({ views_count: (data.views_count || 0) + 1 }).eq("id", data.id);
        }
      });
    } catch (e) {
      // Ignore background counter errors
    }
  }

  try {
    const localPosts = getLocalPosts();
    const post = localPosts.find((p) => p.slug === slug);
    if (post) {
      post.views_count = (post.views_count || 0) + 1;
      saveLocalPosts(localPosts);
    }
  } catch (e) {}
}

// --- Data Mapping Helpers ---
function formatPostFromDb(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt || "",
    content: row.content || "",
    featured_image: row.featured_image || "",
    featured_image_alt: row.featured_image_alt || "",
    category: row.category || "General",
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status || "draft",
    published_at: row.published_at,
    
    // SEO Fields
    meta_title: row.meta_title || row.title,
    meta_description: row.meta_description || row.excerpt,
    focus_keyword: row.focus_keyword || "",
    canonical_url: row.canonical_url || "",
    no_index: Boolean(row.no_index),
    no_follow: Boolean(row.no_follow),
    og_title: row.og_title || row.meta_title || row.title,
    og_description: row.og_description || row.meta_description || row.excerpt,
    og_image: row.og_image || row.featured_image,
    schema_type: row.schema_type || "BlogPosting",

    views_count: row.views_count || 0,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function formatPostToDb(post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    featured_image: post.featured_image,
    featured_image_alt: post.featured_image_alt,
    category: post.category,
    tags: post.tags,
    status: post.status,
    published_at: post.published_at,
    
    meta_title: post.meta_title,
    meta_description: post.meta_description,
    focus_keyword: post.focus_keyword,
    canonical_url: post.canonical_url,
    no_index: post.no_index,
    no_follow: post.no_follow,
    og_title: post.og_title,
    og_description: post.og_description,
    og_image: post.og_image,
    schema_type: post.schema_type,

    views_count: post.views_count || 0,
    created_at: post.created_at,
    updated_at: post.updated_at,
  };
}
