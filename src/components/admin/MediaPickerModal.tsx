"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Upload,
  Image as ImageIcon,
  FileText,
  Loader2,
  Check,
  FolderKanban,
} from "lucide-react";
import Image from "next/image";
import {
  getMediaItems,
  uploadMediaItem,
  getFolders,
  type MediaItem,
} from "@/lib/actions/media";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/utils/storage";
import { useToast } from "@/components/ui/Toast";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: MediaItem[]) => void;
  allowMultiple?: boolean;
  allowedTypes?: string[]; // MIME types
  title?: string;
}

const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

const MAX_SIZE_MB = 10;

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  allowMultiple = false,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  title = "Select Media",
}: MediaPickerModalProps) {
  const { addToast } = useToast();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial fetch
  useEffect(() => {
    if (isOpen) {
      fetchMediaItems();
      fetchFolders();
      setSelectedItems(new Set()); // Reset selection on open
    }
  }, [isOpen]);

  // Search debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (isOpen) {
        fetchMediaItems();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedFolder, isOpen]);

  const fetchMediaItems = async () => {
    setIsLoading(true);
    const result = await getMediaItems({
      search: searchQuery || undefined,
      folder: selectedFolder === "all" ? undefined : selectedFolder,
    });

    if (result.success && result.data) {
      setMediaItems(result.data);
    }
    setIsLoading(false);
  };

  const fetchFolders = async () => {
    const result = await getFolders();
    if (result.success && result.data) {
      setFolders(result.data);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);

    for (const file of files) {
      // Validate
      const validation = validateFile(file, allowedTypes, MAX_SIZE_MB);
      if (!validation.valid) {
        addToast(
          `Skipped ${file.name}: ${validation.error || "Invalid file"}`,
          "error",
        );
        continue;
      }

      const result = await uploadMediaItem(file, {
        bucket: "media",
        folder: selectedFolder === "all" ? "general" : selectedFolder,
      });

      if (result.success) {
        addToast(`Uploaded ${file.name}`, "success");
        // Auto-select uploaded file
        if (result.data && !allowMultiple) {
          setSelectedItems(new Set([result.data.id]));
        }
      } else {
        addToast(`Failed to upload ${file.name}`, "error");
      }
    }

    setIsUploading(false);
    fetchMediaItems();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleSelection = (item: MediaItem) => {
    const newSelected = new Set(allowMultiple ? selectedItems : []);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else {
      newSelected.add(item.id);
    }
    setSelectedItems(newSelected);
  };

  const handleConfirm = () => {
    const selectedMedia = mediaItems.filter((item) =>
      selectedItems.has(item.id),
    );
    onSelect(selectedMedia);
    onClose();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/"))
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (mimeType.includes("pdf"))
      return <FileText className="h-8 w-8 text-red-600" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex h-[80vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4 border-b border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2 pr-4 pl-10 text-sm focus:border-[#2F2582] focus:ring-1 focus:ring-[#2F2582] focus:outline-none"
                />
              </div>

              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none"
              >
                <option value="all">All Folders</option>
                <option value="general">General</option>
                <option value="products">Products</option>
                <option value="catalogues">Catalogues</option>
                {folders
                  .filter(
                    (f) => !["general", "products", "catalogues"].includes(f),
                  )
                  .map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
              </select>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={allowMultiple}
                  accept={allowedTypes.join(",")}
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-[#2F2582] text-white hover:bg-[#2F2582]/90"
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload New
                </Button>
              </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#2F2582]" />
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-500">
                  <FolderKanban className="mb-4 h-12 w-12 text-gray-300" />
                  <p>No media found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {mediaItems.map((item) => {
                    const isSelected = selectedItems.has(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelection(item)}
                        className={cn(
                          "group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:border-[#2F2582]/50",
                          isSelected
                            ? "border-[#2F2582] ring-2 ring-[#2F2582]/20"
                            : "border-gray-100",
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#2F2582] text-white shadow-sm">
                            <Check className="h-3 w-3" />
                          </div>
                        )}

                        {item.mime_type.startsWith("image/") ? (
                          <Image
                            src={item.file_url}
                            alt={item.alt_text || item.file_name}
                            fill
                            className="object-cover"
                            sizes="200px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gray-50">
                            {getFileIcon(item.mime_type)}
                          </div>
                        )}

                        <div className="absolute right-0 bottom-0 left-0 bg-black/60 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="truncate text-xs font-medium text-white">
                            {item.original_name}
                          </p>
                          <p className="text-[10px] text-gray-300">
                            {formatBytes(item.file_size)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <div className="text-sm text-gray-500">
                {selectedItems.size} item{selectedItems.size !== 1 && "s"}{" "}
                selected
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={selectedItems.size === 0}
                  className="bg-[#2F2582] text-white hover:bg-[#2F2582]/90"
                >
                  Insert Selected
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
