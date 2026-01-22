/**
 * File Upload Component for Admin Pages
 */

import { useState, useRef } from "react";
import { Upload, X, Loader2, File, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadFile, validateFile } from "@/lib/utils/storage";
import { uploadMediaItem } from "@/lib/actions/media";

interface FileUploadProps {
  label: string;
  accept: string;
  bucket: string;
  folder?: string;
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
  maxSizeMB?: number;
  allowedTypes?: string[];
  previewType?: "image" | "file";
  disabled?: boolean;
  registerWithMediaLibrary?: boolean; // Whether to register uploads with the media library
  mediaLibraryTags?: string[]; // Tags to apply when registering with media library
}

export function FileUpload({
  label,
  accept,
  bucket,
  folder,
  currentUrl,
  onUploadComplete,
  onRemove,
  maxSizeMB = 10,
  allowedTypes = [],
  previewType = "file",
  disabled = false,
  registerWithMediaLibrary = false,
  mediaLibraryTags = [],
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    if (allowedTypes.length > 0) {
      const validation = validateFile(file, allowedTypes, maxSizeMB);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }
    }

    // Upload file
    setUploading(true);
    try {
      const result = await uploadFile(file, bucket, folder);
      if (result.success && result.url) {
        onUploadComplete(result.url);

        // Register with media library if requested
        if (registerWithMediaLibrary) {
          try {
            // Determine the media library bucket based on file type
            let mediaBucket = "media"; // Default bucket for general files
            if (bucket === "products" || bucket === "catalogues") {
              mediaBucket = bucket; // Use the same bucket for products/catalogues
            }

            await uploadMediaItem(file, {
              bucket: mediaBucket,
              folder: folder || "uploads",
              tags: mediaLibraryTags,
              altText: "", // Could be enhanced to accept alt text
            });
          } catch (mediaError) {
            console.warn("Failed to register with media library:", mediaError);
            // Don't fail the upload if media library registration fails
          }
        }

        setError(null);
      } else {
        setError(result.error || "Upload failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setError(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>

      {/* Current file preview */}
      {currentUrl && (
        <div className="relative rounded-lg border-2 border-gray-200 p-3">
          {previewType === "image" ? (
            <div className="flex items-center gap-3">
              <img
                src={currentUrl}
                alt="Preview"
                className="h-20 w-20 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-600">{currentUrl}</p>
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <File className="h-6 w-6 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-600">{currentUrl}</p>
              </div>
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload button */}
      {!currentUrl && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                {previewType === "image" ? (
                  <ImageIcon className="mr-2 h-4 w-4" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Choose File
              </>
            )}
          </Button>
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Max size: {maxSizeMB}MB. Accepted: {accept}
      </p>
    </div>
  );
}
