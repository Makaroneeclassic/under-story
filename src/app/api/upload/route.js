import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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
    let buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, message: "Uploaded file is empty" },
        { status: 400 }
      );
    }

    // 1. Sanitize file name & ensure .webp extension
    const originalName = file.name || "image.webp";
    const ext = path.extname(originalName);
    const baseName =
      path
        .basename(originalName, ext)
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .substring(0, 35) || "image";
    const uniqueFileName = `${Date.now()}_${baseName}.webp`;

    // 2. Try server-side Sharp conversion/optimization if sharp native module is available
    // Wrapped in dynamic try/catch so native binary missing on Linux/Vercel never crashes
    try {
      const sharpModule = await import("sharp");
      const sharp = sharpModule.default || sharpModule;
      if (typeof sharp === "function") {
        buffer = await sharp(buffer)
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
      }
    } catch (sharpErr) {
      // If sharp is unavailable in serverless environment, the client-side canvas
      // already converted the image to WebP, so we can safely continue with buffer!
      console.warn("Server Sharp processing skipped:", sharpErr.message);
    }

    // 3. Try upload to Supabase Storage Bucket ('blog-assets')
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.storage
          .from("blog-assets")
          .upload(uniqueFileName, buffer, {
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
          console.warn("Supabase storage bucket upload notice:", error.message || error);
        }
      } catch (storageErr) {
        console.warn("Supabase storage upload notice:", storageErr.message || storageErr);
      }
    }

    // 4. Safe Fallback Handling
    // On Vercel / serverless runtime, filesystem (/var/task) is strictly read-only.
    const isServerlessReadOnly =
      Boolean(process.env.VERCEL) ||
      process.env.NODE_ENV === "production" ||
      Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

    if (!isServerlessReadOnly) {
      // Local development: save to public/uploads
      try {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, uniqueFileName);
        fs.writeFileSync(filePath, buffer);

        return NextResponse.json({
          success: true,
          url: `/uploads/${uniqueFileName}`,
          fileName: uniqueFileName,
          format: "webp",
          storage: "local",
        });
      } catch (localWriteErr) {
        console.warn("Local filesystem write failed, using fallback:", localWriteErr.message);
      }
    }

    // Production / Vercel fallback: WebP Base64 Data URL (safe & light ~100-250KB)
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:image/webp;base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      fileName: uniqueFileName,
      format: "webp",
      storage: "inline-webp",
    });
  } catch (error) {
    console.error("Upload handler caught error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
