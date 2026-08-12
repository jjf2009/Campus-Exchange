/**
 * Listing images are now served from static files in /public based on category.
 * This module is kept only if remote storage is needed again later.
 *
 * See `getCategoryImage` in `@/lib/constants`.
 */

export async function uploadListingImage(
  _file: File,
  _userId: string
): Promise<{ url: string } | { error: string }> {
  return {
    error:
      "Image uploads are disabled. Listings use a fixed photo based on category.",
  };
}
