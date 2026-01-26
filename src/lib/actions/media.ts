/**
 * Server actions for media library management
 */

"use server";

import { getAdminSupabase } from "@/lib/supabase/admin";
import { getAnonSupabase } from "@/lib/supabase/anon";
import { uploadFile, deleteFile } from "@/lib/utils/storage";

export interface MediaItem {
  id: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  alt_text?: string;
  folder: string;
  bucket: string;
  tags?: string[];
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface MediaFilters {
  search?: string;
  folder?: string;
  bucket?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  unused?: boolean;
}

interface MediaResponse {
  success: boolean;
  data?: MediaItem[];
  total?: number;
  error?: string;
}

interface MediaItemResponse {
  success: boolean;
  data?: MediaItem;
  error?: string;
}

/**
 * Get all media items with optional filters
 */
export async function getMediaItems(
  filters?: MediaFilters,
): Promise<MediaResponse> {
  try {
    const supabase = getAdminSupabase();
    let query = supabase.from("media_library").select("*", { count: "exact" });

    if (filters?.search) {
      query = query.or(
        `original_name.ilike.%${filters.search}%,file_name.ilike.%${filters.search}%,alt_text.ilike.%${filters.search}%`,
      );
    }

    if (filters?.folder) {
      query = query.eq("folder", filters.folder);
    }

    if (filters?.bucket) {
      query = query.eq("bucket", filters.bucket);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.overlaps("tags", filters.tags);
    }

    if (filters?.unused) {
      query = query.eq("usage_count", 0);
    }

    query = query.order("created_at", { ascending: false });

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 20) - 1,
      );
    }

    const { data, error, count } = await query;

    if (error) {

      return {
        success: false,
        error: "Failed to fetch media items",
      };
    }

    return {
      success: true,
      data: data as MediaItem[],
      total: count || 0,
    };
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get a single media item by ID
 */
export async function getMediaItemById(id: string): Promise<MediaItemResponse> {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("media_library")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return {
        success: false,
        error: "Media item not found",
      };
    }

    return {
      success: true,
      data: data as MediaItem,
    };
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Upload a new media item
 */
export async function uploadMediaItem(
  file: File,
  options: {
    bucket?: string;
    folder?: string;
    altText?: string;
    tags?: string[];
  },
): Promise<MediaItemResponse> {
  try {
    const requestedBucket = options.bucket || "products";
    const folder = options.folder || "general";

    const supabase = getAdminSupabase();

    // 1. Ensure bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.id === requestedBucket);

      if (!bucketExists) {
        await supabase.storage.createBucket(requestedBucket, { public: true });
      }
    } catch (e) {

    }

    // 2. Perform the upload
    let uploadResult = await uploadFile(
      file,
      requestedBucket,
      folder,
      supabase,
    );

    // Fallback if bucket missing
    if (
      !uploadResult.success &&
      uploadResult.error?.toLowerCase().includes("not found")
    ) {
      uploadResult = await uploadFile(file, "products", folder, supabase);
    }

    if (!uploadResult.success || !uploadResult.url) {
      return {
        success: false,
        error: uploadResult.error || "Failed to upload file to storage.",
      };
    }

    const bucketUsed = uploadResult.url.includes("/public/products/")
      ? "products"
      : requestedBucket;
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase
      .from("media_library")
      .insert({
        file_name: fileName,
        original_name: file.name,
        file_path: folder ? `${folder}/${fileName}` : fileName,
        file_url: uploadResult.url,
        file_size: file.size,
        mime_type: file.type,
        alt_text: options.altText || null,
        folder,
        bucket: bucketUsed,
        tags: options.tags || [],
      })
      .select()
      .single();

    if (error) {

      return {
        success: false,
        error: "File uploaded but database registration failed.",
      };
    }

    return {
      success: true,
      data: data as MediaItem,
    };
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred during upload.",
    };
  }
}

/**
 * Upload multiple media items
 */
export async function uploadMultipleMediaItems(
  files: File[],
  options: {
    bucket?: string;
    folder?: string;
    tags?: string[];
  },
): Promise<{
  success: boolean;
  data?: MediaItem[];
  failed?: Array<{ fileName: string; error: string }>;
  error?: string;
}> {
  try {
    const results: MediaItem[] = [];
    const failed: Array<{ fileName: string; error: string }> = [];

    for (const file of files) {
      const result = await uploadMediaItem(file, options);

      if (result.success && result.data) {
        results.push(result.data);
      } else {
        failed.push({
          fileName: file.name,
          error: result.error || "Unknown error",
        });
      }
    }

    return {
      success: true,
      data: results,
      failed,
    };
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Update media item
 */
export async function updateMediaItem(
  id: string,
  updates: {
    alt_text?: string;
    folder?: string;
    tags?: string[];
  },
): Promise<MediaItemResponse> {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("media_library")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {

      return {
        success: false,
        error: "Failed to update media item",
      };
    }

    return {
      success: true,
      data: data as MediaItem,
    };
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Delete media item
 */
export async function deleteMediaItem(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();

    const { data: mediaItem, error: fetchError } = await supabase
      .from("media_library")
      .select("file_url, bucket")
      .eq("id", id)
      .single();

    if (fetchError || !mediaItem) {
      return {
        success: false,
        error: "Media item not found",
      };
    }

    const deleteResult = await deleteFile(
      mediaItem.file_url,
      mediaItem.bucket,
      supabase,
    );

    if (!deleteResult.success) {
      console.warn(
        "Failed to delete file from storage, but proceeding to remove record",
      );
    }

    const { error: deleteError } = await supabase
      .from("media_library")
      .delete()
      .eq("id", id);

    if (deleteError) {

      return {
        success: false,
        error: "Failed to delete media item",
      };
    }

    return {
      success: true,
    };
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get storage usage statistics
 */
export async function getStorageStats(): Promise<{
  success: boolean;
  data?: {
    totalItems: number;
    totalSize: number;
    totalSizeFormatted: string;
    byFolder: Record<string, number>;
    byBucket: Record<string, number>;
  };
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("media_library")
      .select("file_size, folder, bucket");

    if (error) {

      return {
        success: false,
        error: "Failed to fetch storage stats",
      };
    }

    const totalItems = data?.length || 0;
    const totalSize =
      data?.reduce((sum, item: any) => sum + item.file_size, 0) || 0;

    const byFolder: Record<string, number> = {};
    const byBucket: Record<string, number> = {};

    data?.forEach((item: any) => {
      byFolder[item.folder] = (byFolder[item.folder] || 0) + item.file_size;
      byBucket[item.bucket] = (byBucket[item.bucket] || 0) + item.file_size;
    });

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    return {
      success: true,
      data: {
        totalItems,
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
        byFolder,
        byBucket,
      },
    };
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get all folders
 */
export async function getFolders(): Promise<{
  success: boolean;
  data?: string[];
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("media_library")
      .select("folder");

    if (error) {

      return {
        success: false,
        error: "Failed to fetch folders",
      };
    }

    const folders = [
      ...new Set(data?.map((item: any) => item.folder) || []),
    ].sort() as string[];

    return {
      success: true,
      data: folders,
    };
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Sync existing Supabase storage files with media library
 * This function scans all storage buckets and imports existing files
 */
export async function syncExistingFiles(): Promise<{
  success: boolean;
  data?: {
    totalFiles: number;
    importedFiles: number;
    skippedFiles: number;
    errors: string[];
  };
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();
    const buckets = ["products", "catalogues", "media"];
    let totalFiles = 0;
    let importedFiles = 0;
    let skippedFiles = 0;
    const errors: string[] = [];

    for (const bucket of buckets) {
      try {
        // List all files in the bucket
        const { data: files, error: listError } = await supabase.storage
          .from(bucket)
          .list("", {
            limit: 1000,
            sortBy: { column: "created_at", order: "desc" },
          });

        if (listError) {
          if (listError.message.toLowerCase().includes("not found")) {
            console.warn(
              `Bucket ${bucket} not found, skipping sync for this bucket.`,
            );
            continue;
          }
          errors.push(
            `Failed to list files in ${bucket}: ${listError.message}`,
          );
          continue;
        }

        if (!files) continue;

        totalFiles += files.length;

        for (const file of files) {
          if (file.name.startsWith(".")) continue; // Skip hidden files

          // Get public URL first
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(file.name);

          if (!urlData.publicUrl) {
            errors.push(`Failed to get public URL for ${bucket}/${file.name}`);
            continue;
          }

          // Check if file already exists in media library by file_url
          const { data: existing } = await supabase
            .from("media_library")
            .select("id")
            .eq("file_url", urlData.publicUrl)
            .single();

          if (existing) {
            skippedFiles++;
            continue;
          }

          // Insert into media library
          const { error: insertError } = await supabase
            .from("media_library")
            .insert({
              file_name: file.name,
              original_name: file.name,
              file_path: file.name,
              file_url: urlData.publicUrl,
              file_size: file.metadata?.size || 0,
              mime_type: file.metadata?.mimetype || "application/octet-stream",
              bucket,
              folder: "imported",
            });

          if (insertError) {
            errors.push(
              `Failed to import ${bucket}/${file.name}: ${insertError.message}`,
            );
          } else {
            importedFiles++;
          }
        }
      } catch (bucketError) {
        errors.push(`Error processing bucket ${bucket}: ${bucketError}`);
      }
    }

    return {
      success: true,
      data: {
        totalFiles,
        importedFiles,
        skippedFiles,
        errors,
      },
    };
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get storage buckets and their file counts
 */
export async function getStorageBucketsInfo(): Promise<{
  success: boolean;
  data?: Array<{
    bucket: string;
    fileCount: number;
    totalSize: number;
    totalSizeFormatted: string;
  }>;
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("media_library")
      .select("bucket, file_size");

    if (error) {

      return {
        success: false,
        error: "Failed to fetch bucket info",
      };
    }

    const bucketStats: Record<string, { count: number; size: number }> = {};

    data?.forEach((item: any) => {
      if (!bucketStats[item.bucket]) {
        bucketStats[item.bucket] = { count: 0, size: 0 };
      }
      bucketStats[item.bucket].count++;
      bucketStats[item.bucket].size += item.file_size;
    });

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    };

    const result = Object.entries(bucketStats).map(([bucket, stats]) => ({
      bucket,
      fileCount: stats.count,
      totalSize: stats.size,
      totalSizeFormatted: formatBytes(stats.size),
    }));

    return {
      success: true,
      data: result,
    };
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Get usage information for a specific media item
 */
export async function getMediaUsage(fileUrl: string): Promise<{
  success: boolean;
  data?: {
    products: Array<{ id: string; name: string }>;
    productImages: Array<{
      id: string;
      product_id: string;
      product_name: string;
    }>;
    catalogues: Array<{ id: string; name: string }>;
  };
  error?: string;
}> {
  try {
    const supabase = getAdminSupabase();

    // 1. Check main product images
    const { data: products } = await supabase
      .from("products")
      .select("id, name")
      .eq("image_url", fileUrl);

    // 2. Check product gallery images
    // We need to join with products to get names
    const { data: galleryImages } = await supabase
      .from("product_images")
      .select("id, product_id, products(name)")
      .eq("image_url", fileUrl);

    // 3. Check catalogues
    const { data: catalogues } = await supabase
      .from("catalogues")
      .select("id, name")
      .or(`thumbnail_url.eq.${fileUrl},pdf_url.eq.${fileUrl}`);

    return {
      success: true,
      data: {
        products: products || [],
        productImages: (galleryImages || []).map((gi: any) => ({
          id: gi.id,
          product_id: gi.product_id,
          product_name: gi.products?.name || "Unknown Product",
        })),
        catalogues: catalogues || [],
      },
    };
  } catch (error) {

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
