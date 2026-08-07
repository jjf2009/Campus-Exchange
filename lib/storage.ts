import sharp from "sharp";
import { LISTING_IMAGE_BUCKET, MAX_IMAGE_SIZE } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_DIMENSION = 1280;
const WEBP_QUALITY = 78;

async function compressListingImage(
  file: File
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const input = Buffer.from(await file.arrayBuffer());

  const compressed = await sharp(input)
    .rotate()
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return {
    buffer: compressed,
    contentType: "image/webp",
    ext: "webp",
  };
}

export async function uploadListingImage(
  file: File,
  userId: string
): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_IMAGE_SIZE) {
    return { error: "Image must be under 5 MB" };
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return { error: "Only JPEG, PNG, and WEBP images are allowed" };
  }

  try {
    let buffer: Buffer;
    let contentType: string;
    let ext: string;

    try {
      const compressed = await compressListingImage(file);
      buffer = compressed.buffer;
      contentType = compressed.contentType;
      ext = compressed.ext;
    } catch (compressError) {
      console.error("Image compress failed, uploading original:", compressError);
      buffer = Buffer.from(await file.arrayBuffer());
      contentType = file.type;
      ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    }

    const supabase = createAdminClient();
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from(LISTING_IMAGE_BUCKET)
      .upload(path, buffer, {
        contentType,
        upsert: false,
        cacheControl: "31536000",
      });

    if (error) {
      console.error("Image upload failed:", error.message);

      if (error.message.toLowerCase().includes("bucket")) {
        return {
          error:
            'Storage bucket "listing-images" is missing. Create a public bucket named listing-images in Supabase Storage.',
        };
      }

      if (error.message.toLowerCase().includes("row-level security")) {
        return {
          error:
            "Storage blocked by RLS. Set SUPABASE_SERVICE_ROLE_KEY in .env.local, or add Storage policies (see docs/SUPABASE_SETUP.md).",
        };
      }

      return { error: "Failed to upload image. Please try again." };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(LISTING_IMAGE_BUCKET).getPublicUrl(path);

    return { url: publicUrl };
  } catch (error) {
    console.error("Image upload unexpected error:", error);
    const message = error instanceof Error ? error.message : "";

    if (message.includes("SUPABASE_SERVICE_ROLE_KEY") || message.includes("placeholder")) {
      return {
        error:
          "Supabase service role key is missing. Add SUPABASE_SERVICE_ROLE_KEY to .env.local from Project Settings → API.",
      };
    }

    return { error: "Failed to upload image. Please try again." };
  }
}
