/**
 * Supabase Storage utilities for file uploads
 */

import { supabaseClient } from "@/lib/supabase/client";

const MAX_IMAGE_DIMENSION = 2048;
const COMPRESS_QUALITY = 0.85;
const COMPRESS_THRESHOLD_BYTES = 1 * 1024 * 1024; // 1MB

/**
 * Compress an image file client-side before upload.
 * Resizes to max 2048px on longest side and re-encodes as JPEG/WebP.
 * Skips non-image files and images already under the threshold.
 */
export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
    return file;
  }
  if (file.size <= COMPRESS_THRESHOLD_BYTES) {
    return file;
  }

  return new Promise<File>((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (
        width <= MAX_IMAGE_DIMENSION &&
        height <= MAX_IMAGE_DIMENSION &&
        file.size <= COMPRESS_THRESHOLD_BYTES
      ) {
        resolve(file);
        return;
      }

      const scale = Math.min(
        MAX_IMAGE_DIMENSION / width,
        MAX_IMAGE_DIMENSION / height,
        1,
      );
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            resolve(file);
            return;
          }
          resolve(
            new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            }),
          );
        },
        outputType,
        COMPRESS_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name (e.g., 'catalogues', 'thumbnails')
 * @param folder - Optional folder path within the bucket
 * @param supabase - Optional custom Supabase client (e.g. for server-side use)
 * @returns Upload result with public URL or error
 */
export async function uploadFile(
  file: File,
  bucket: string,
  folder?: string,
  supabase?: any,
): Promise<UploadResult> {
  try {
    const client = supabase || supabaseClient;
    if (!client) {
      return {
        success: false,
        error: "Supabase client not available",
      };
    }

    // Compress image files before upload
    const processedFile = await compressImage(file);

    // Generate unique filename
    const fileExt = processedFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file
    const { data, error } = await client.storage
      .from(bucket)
      .upload(filePath, processedFile, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      return {
        success: false,
        error: error.message || `Failed to upload file to ${bucket}`,
      };
    }

    // Get public URL
    const { data: urlData } = client.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred during upload",
    };
  }
}

/**
 * Delete a file from Supabase Storage
 * @param url - The public URL of the file to delete
 * @param bucket - The storage bucket name
 * @param supabase - Optional custom Supabase client
 * @returns Success status
 */
export async function deleteFile(
  url: string,
  bucket: string,
  supabase?: any,
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = supabase || supabaseClient;
    if (!client) {
      return { success: false, error: "Supabase client not available" };
    }

    // Extract file path from URL
    const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
    if (urlParts.length < 2) {
      return { success: false, error: "Invalid file URL" };
    }

    const filePath = urlParts[1];

    const { error } = await client.storage.from(bucket).remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to delete file",
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred during deletion",
    };
  }
}

/**
 * Validate file type and size
 * @param file - The file to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param maxSizeMB - Maximum file size in MB
 * @returns Validation result
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMB: number,
): { valid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    const actualSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${actualSizeMB}MB) exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
}
