import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const originalName = file.name || "image.jpg";
    const extension = path.extname(originalName) || ".jpg";
    const baseName = path
      .basename(originalName, extension)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .substring(0, 30);
    const uniqueFileName = `${Date.now()}_${baseName}${extension}`;

    // 1. Try upload to Supabase Storage Bucket ('blog-assets' or 'public')
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from("blog-assets")
          .upload(uniqueFileName, buffer, {
            contentType: file.type || "image/jpeg",
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabase.storage
            .from("blog-assets")
            .getPublicUrl(uniqueFileName);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: publicUrlData.publicUrl,
              fileName: uniqueFileName,
            });
          }
        }
      } catch (storageErr) {
        console.warn("Supabase storage upload failed, saving to local public/uploads:", storageErr);
      }
    }

    // 2. Fallback to public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, uniqueFileName);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueFileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed: " + error.message },
      { status: 500 }
    );
  }
}
