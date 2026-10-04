import { NextResponse } from "next/server";
import { getAllPosts, createPost } from "@/lib/postsStore";

// GET: Fetch all posts with filters
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "ALL";
    const category = searchParams.get("category") || "ALL";
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const posts = await getAllPosts({ status, category, search, limit, offset });
    return NextResponse.json({ success: true, posts, total: posts.length });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch posts", error: error.message },
      { status: 500 }
    );
  }
}

// POST: Create a new post
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, content } = body || {};

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: "กรุณาระบุหัวข้อบทความ (Title)" },
        { status: 400 }
      );
    }

    const newPost = await createPost(body);
    return NextResponse.json(
      {
        success: true,
        message: "บันทึกบทความเรียบร้อยแล้ว",
        post: newPost,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "เกิดข้อผิดพลาดในการบันทึกบทความ", error: error.message },
      { status: 500 }
    );
  }
}
