import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

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
    const inputBuffer = Buffer.from(bytes);

    if (inputBuffer.length === 0) {
      return NextResponse.json(
        { success: false, message: "Uploaded file is empty" },
        { status: 400 }
      );
    }

    // 1. Auto-convert image to WebP with Sharp
    // - Auto rotate using EXIF metadata
    // - Resize max width/height to 2048px (high-res for 4K/retina while keeping size small)
    // - WebP quality 82 (optimal balance of clarity and small file size)
    let webpBuffer;
    try {
      webpBuffer = await sharp(inputBuffer)
        .rotate()
        .resize({
          width: 2048,
          height: 2048,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({
          quality: 82,
          effort: 4,
        })
        .toBuffer();
    } catch (conversionErr) {
      console.warn("Sharp WebP conversion warning:", conversionErr);
      webpBuffer = inputBuffer;
    }

    // 2. Generate sanitized unique filename with .webp extension
    const originalName = file.name || "image.jpg";
    const ext = path.extname(originalName);
    const baseName =
      path
        .basename(originalName, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 35) || "image";
    const uniqueFileName = `${Date.now()}_${baseName}.webp`;

    // 3. Try upload to Supabase Storage Bucket ('blog-assets')
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from("blog-assets")
          .upload(uniqueFileName, webpBuffer, {
            contentType: "image/webp",
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
              format: "webp",
              storage: "supabase",
            });
          }
        } else if (error) {
          console.warn("Supabase storage upload failed:", error.message || error);
        }
      } catch (storageErr) {
        console.warn("Supabase storage upload error:", storageErr.message || storageErr);
      }
    }

    // 4. Safe Fallback Handling
    // Vercel serverless has a read-only filesystem (/var/task). Calling mkdirSync throws ENOENT/EROFS.
    const isServerlessReadOnly =
      Boolean(process.env.VERCEL) ||
      process.env.NODE_ENV === "production" ||
      process.env.AWS_LAMBDA_FUNCTION_NAME;

    if (!isServerlessReadOnly) {
      // Local development: save to public/uploads
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, uniqueFileName);
        fs.writeFileSync(filePath, webpBuffer);

        return NextResponse.json({
          success: true,
          url: `/uploads/${uniqueFileName}`,
          fileName: uniqueFileName,
          format: "webp",
          storage: "local",
        });
      } catch (localWriteErr) {
        console.warn("Local filesystem write failed, using data URL fallback:", localWriteErr);
      }
    }

    // Production / Vercel fallback: WebP Base64 Data URL so upload NEVER crashes
    const base64Data = webpBuffer.toString("base64");
    const dataUrl = `data:image/webp;base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: uniqueFileName,
      format: "webp",
      storage: "inline-webp",
      warning:
        "Supabase bucket 'blog-assets' is not active yet. Converted to WebP and saved inline.",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed: " + error.message },
      { status: 500 }
    );
  }
}
