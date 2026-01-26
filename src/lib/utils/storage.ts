/**
 * Supabase Storage utilities for file uploads
 */

import { supabaseClient } from "@/lib/supabase/client";

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

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file
    const { data, error } = await client.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
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
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
}
