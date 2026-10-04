/**
 * Client-side Image to WebP Converter & Resizer
 * Converts any image (JPEG, PNG, HEIC, WebP, etc.) to an optimized WebP Blob/File
 * directly in the browser using HTML5 Canvas.
 *
 * Benefits:
 * - Reduces upload size from 5-15MB to 80-250KB before upload
 * - Eliminates Vercel 4.5MB request/response payload limits
 * - Ultra-fast upload on mobile and desktop
 */
export async function convertImageToWebP(
  file,
  maxWidth = 1920,
  maxHeight = 1920,
  quality = 0.82
) {
  if (!file || typeof window === "undefined") return file;

  // If not an image (e.g. svg, pdf), return as is
  if (!file.type || !file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        try {
          let { width, height } = img;

          // Resize maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width / height > maxWidth / maxHeight) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file);
            return;
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Convert canvas to WebP blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              // Build clean filename with .webp extension
              const rawName = file.name || "image";
              const lastDot = rawName.lastIndexOf(".");
              const baseName =
                lastDot > 0 ? rawName.substring(0, lastDot) : rawName;
              const cleanBaseName = baseName
                .replace(/[^a-zA-Z0-9_-]/g, "_")
                .substring(0, 35) || "image";

              const webpFile = new File(
                [blob],
                `${cleanBaseName}.webp`,
                { type: "image/webp" }
              );

              resolve(webpFile);
            },
            "image/webp",
            quality
          );
        } catch (err) {
          console.warn("Canvas WebP conversion error, using original file:", err);
          resolve(file);
        }
      };

      img.onerror = () => {
        console.warn("Image load error during WebP conversion, using original file");
        resolve(file);
      };

      img.src = e.target.result;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
