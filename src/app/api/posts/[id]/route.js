import { NextResponse } from "next/server";
import { getPostById, updatePost, deletePostById } from "@/lib/postsStore";

// GET: Fetch single post by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, post });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// PATCH: Update post
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updatePost(id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Post not found or update failed" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตบทความเรียบร้อยแล้ว",
      post: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update post", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Delete post
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const deleted = await deletePostById(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "ลบบทความเรียบร้อยแล้ว",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete post", error: error.message },
      { status: 500 }
    );
  }
}
