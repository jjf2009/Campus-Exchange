import { LISTING_IMAGE_BUCKET, MAX_IMAGE_SIZE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(LISTING_IMAGE_BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Image upload failed:", error.message);
    if (
      error.message.toLowerCase().includes("bucket") ||
      error.message.toLowerCase().includes("not found")
    ) {
      return {
        error:
          'Storage bucket "listing-images" is missing. Create a public bucket named listing-images in Supabase Storage.',
      };
    }
    return { error: "Failed to upload image. Please try again." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(LISTING_IMAGE_BUCKET).getPublicUrl(path);

  return { url: publicUrl };
}
