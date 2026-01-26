"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Search,
  Filter,
  X,
  Trash2,
  Copy,
  Eye,
  Download,
  FolderKanban,
  HardDrive,
  Image as ImageIcon,
  FileText,
  Loader2,
  CheckCircle,
  FileSpreadsheet,
  RefreshCw,
  Edit,
  Package,
  FileWarning,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  getMediaItems,
  uploadMediaItem,
  deleteMediaItem,
  updateMediaItem,
  getStorageStats,
  getFolders,
  getMediaUsage,
  type MediaItem,
} from "@/lib/actions/media";
import { useAdmin } from "@/lib/hooks/useAdmin";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { MediaLibrarySkeleton } from "@/components/ui/AdminSkeletons";
import { ConfirmationModal } from "@/components/shared";
import { cn } from "@/lib/utils";
import { syncExistingFiles, getStorageBucketsInfo } from "@/lib/actions/media";
import { validateFile } from "@/lib/utils/storage";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];
const MAX_SIZE_MB = 10;

export default function MediaLibraryPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toasts, addToast, removeToast } = useToast();

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [folders, setFolders] = useState<string[]>([]);
  const [storageStats, setStorageStats] = useState<{
    totalItems: number;
    totalSizeFormatted: string;
    byFolder: Record<string, number>;
  } | null>(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<{
    totalFiles: number;
    importedFiles: number;
    skippedFiles: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragAreaRef = useRef<HTMLDivElement>(null);

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showUnusedOnly, setShowUnusedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [editingTags, setEditingTags] = useState("");
  const [editingAltText, setEditingAltText] = useState("");
  const [mediaUsage, setMediaUsage] = useState<{
    products: Array<{ id: string; name: string }>;
    productImages: Array<{
      id: string;
      product_id: string;
      product_name: string;
    }>;
    catalogues: Array<{ id: string; name: string }>;
  } | null>(null);
  const [isUsageLoading, setIsUsageLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchMediaItems();
      fetchFolders();
      fetchStorageStats();
    }
  }, [isAdmin]);

  const fetchMediaItems = async () => {
    setIsLoading(true);
    const result = await getMediaItems({
      search: searchQuery || undefined,
      folder: selectedFolder === "all" ? undefined : selectedFolder,
      unused: showUnusedOnly ? true : undefined,
    });

    if (result.success && result.data) {
      setMediaItems(result.data);
    } else {
      addToast(result.error || "Failed to fetch media items", "error");
    }
    setIsLoading(false);
  };

  const fetchFolders = async () => {
    const result = await getFolders();
    if (result.success && result.data) {
      setFolders(result.data);
    }
  };

  const fetchStorageStats = async () => {
    const result = await getStorageStats();
    if (result.success && result.data) {
      setStorageStats({
        totalItems: result.data.totalItems,
        totalSizeFormatted: result.data.totalSizeFormatted,
        byFolder: result.data.byFolder,
      });
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (isAdmin) {
        fetchMediaItems();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedFolder, showUnusedOnly, isAdmin]);

  const filteredItems = mediaItems.filter((item) => {
    if (selectedFolder === "all") return true;
    return item.folder === selectedFolder;
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));

      // Validate file
      const validation = validateFile(file, ALLOWED_TYPES, MAX_SIZE_MB);
      if (!validation.valid) {
        addToast(
          `Skipped ${file.name}: ${validation.error || "Invalid file"}`,
          "error",
        );
        continue;
      }

      const result = await uploadMediaItem(file, {
        bucket: "products", // Use products bucket as default (safer)
        folder: selectedFolder === "all" ? "general" : selectedFolder,
      });

      if (result.success) {
        addToast(`Uploaded ${file.name}`, "success");
      } else {
        addToast(`Failed to upload ${file.name}: ${result.error}`, "error");
      }
    }

    setIsUploading(false);
    setShowUploadModal(false);
    fetchMediaItems();
    fetchStorageStats();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);

    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(Math.round(((i + 1) / files.length) * 100));

      // Validate file
      const validation = validateFile(file, ALLOWED_TYPES, MAX_SIZE_MB);
      if (!validation.valid) {
        addToast(
          `Skipped ${file.name}: ${validation.error || "Invalid file"}`,
          "error",
        );
        continue;
      }

      const result = await uploadMediaItem(file, {
        bucket: "products", // Use products bucket as default (safer)
        folder: selectedFolder === "all" ? "general" : selectedFolder,
      });

      if (result.success) {
        addToast(`Uploaded ${file.name}`, "success");
      } else {
        addToast(`Failed to upload ${file.name}: ${result.error}`, "error");
      }
    }

    setIsUploading(false);
    fetchMediaItems();
    fetchStorageStats();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDelete = async () => {
    if (!selectedMedia) return;

    setActionLoading((prev) => ({ ...prev, delete: true }));

    const result = await deleteMediaItem(selectedMedia.id);

    if (result.success) {
      addToast("Media item deleted successfully", "success");
      setSelectedItems(new Set());
      setShowDeleteModal(false);
      setSelectedMedia(null);
      fetchMediaItems();
      fetchStorageStats();
      fetchFolders();
    } else {
      addToast(result.error || "Failed to delete media item", "error");
    }

    setActionLoading((prev) => ({ ...prev, delete: false }));
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      addToast("URL copied to clipboard", "success");
    } catch (err) {
      addToast("Failed to copy URL", "error");
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map((item) => item.id)));
    }
  };

  const handleDeleteSelected = async () => {
    for (const id of selectedItems) {
      const result = await deleteMediaItem(id);
      if (!result.success) {
        addToast(`Failed to delete item: ${result.error}`, "error");
      }
    }
    setSelectedItems(new Set());
    fetchMediaItems();
    fetchStorageStats();
    fetchFolders();
    addToast(`Deleted ${selectedItems.size} item(s)`, "success");
  };

  const handleSyncExistingFiles = async () => {
    setIsSyncing(true);
    setSyncResults(null);

    try {
      const result = await syncExistingFiles();

      if (result.success && result.data) {
        setSyncResults(result.data);
        addToast(
          `Sync completed: ${result.data.importedFiles} imported, ${result.data.skippedFiles} skipped`,
          "success",
        );

        if (result.data.errors.length > 0) {
          addToast(
            `${result.data.errors.length} errors occurred during sync`,
            "error",
          );
        }

        // Refresh data
        fetchMediaItems();
        fetchStorageStats();
        fetchFolders();
      } else {
        addToast(result.error || "Failed to sync files", "error");
      }
    } catch (error) {
      addToast("An unexpected error occurred during sync", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateMedia = async (
    id: string,
    updates: {
      alt_text?: string;
      folder?: string;
      tags?: string[];
    },
  ) => {
    const result = await updateMediaItem(id, updates);
    if (result.success) {
      addToast("Media item updated", "success");
      fetchMediaItems();
    } else {
      addToast(result.error || "Failed to update media item", "error");
    }
  };

  const fetchUsage = async (url: string) => {
    setIsUsageLoading(true);
    const result = await getMediaUsage(url);
    if (result.success && result.data) {
      setMediaUsage(result.data);
    }
    setIsUsageLoading(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    } else if (mimeType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
      return <FileText className="h-5 w-5 text-green-600" />;
    } else if (mimeType.includes("document") || mimeType.includes("word")) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    } else if (mimeType.startsWith("text/")) {
      return <FileText className="h-5 w-5 text-gray-600" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getFileTypeCategory = (mimeType: string): string => {
    if (mimeType.startsWith("image/")) return "Image";
    if (mimeType.includes("pdf")) return "PDF";
    if (mimeType.includes("spreadsheet") || mimeType.includes("excel"))
      return "Spreadsheet";
    if (mimeType.includes("document") || mimeType.includes("word"))
      return "Document";
    if (mimeType.startsWith("text/")) return "Text";
    return "File";
  };

  if (adminLoading || isLoading) {
    return <MediaLibrarySkeleton />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Access denied</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
            Media Library
          </h1>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            Manage and organize all your media files
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowSyncModal(true)}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isSyncing ? "Syncing..." : "Sync Files"}
          </Button>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="w-full bg-[#2F2582] hover:bg-[#241c66] sm:w-auto"
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Media
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
            Total Files
          </p>
          <p className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl dark:text-white">
            {storageStats?.totalItems || 0}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
            Storage Used
          </p>
          <p className="mt-2 text-2xl font-black text-[#2F2582] sm:text-3xl dark:text-[#a099ff]">
            {storageStats?.totalSizeFormatted?.split(" ")[0] || "0"}{" "}
            <span className="text-sm font-bold text-gray-400">
              {storageStats?.totalSizeFormatted?.split(" ")[1] || "Bytes"}
            </span>
          </p>
        </div>
        <div className="col-span-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:col-span-1 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
            Folders
          </p>
          <p className="mt-2 text-2xl font-black text-gray-900 sm:text-3xl dark:text-white">
            {folders.length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search filenames, tags, or alt text..."
            className="w-full rounded-2xl border border-gray-100 py-3 pr-4 pl-12 text-sm shadow-sm transition-all focus:border-[#2F2582] focus:ring-4 focus:ring-[#2F2582]/5 focus:outline-none dark:border-gray-800 dark:bg-gray-900"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm sm:flex-none dark:border-gray-800 dark:bg-gray-900">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex-1 p-2.5 px-4 transition-colors sm:flex-none",
                viewMode === "grid"
                  ? "bg-gray-100 text-[#2F2582] dark:bg-gray-800 dark:text-[#a099ff]"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50",
              )}
            >
              <FolderKanban className="mx-auto h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex-1 border-l border-gray-100 p-2.5 px-4 transition-colors sm:flex-none dark:border-gray-800",
                viewMode === "list"
                  ? "bg-gray-100 text-[#2F2582] dark:bg-gray-800 dark:text-[#a099ff]"
                  : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50",
              )}
            >
              <FileText className="mx-auto h-4 w-4" />
            </button>
          </div>

          <Select value={selectedFolder} onValueChange={setSelectedFolder}>
            <SelectTrigger className="flex-1 rounded-xl border border-gray-100 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-[#2F2582] focus:outline-none sm:flex-none dark:border-gray-800 dark:bg-gray-900">
              <SelectValue placeholder="All Folders" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Folders</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={showUnusedOnly ? "default" : "outline"}
            onClick={() => setShowUnusedOnly(!showUnusedOnly)}
            className={cn(
              "flex-1 rounded-xl shadow-sm sm:flex-none",
              showUnusedOnly
                ? "bg-[#2F2582] text-white hover:bg-[#241c66]"
                : "border-gray-100 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900",
            )}
          >
            {showUnusedOnly ? "Unused Only" : "Show Unused"}
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      <AnimatePresence>
        {selectedItems.size > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="flex flex-col gap-4 rounded-3xl border-2 border-[#2F2582] bg-[#2F2582]/5 p-6 sm:flex-row sm:items-center sm:justify-between dark:bg-[#a099ff]/5"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2F2582] text-white shadow-lg">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 dark:text-white">
                  {selectedItems.size}{" "}
                  <span className="text-gray-500">Items Selected</span>
                </p>
                <p className="text-xs font-medium text-gray-500">
                  You can now perform bulk actions on these files
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => setSelectedItems(new Set())}
                className="flex-1 rounded-xl font-bold text-[#2F2582] hover:bg-[#2F2582]/10 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSelected}
                className="flex-1 rounded-xl bg-red-600 font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 sm:flex-none dark:shadow-none"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Permanently
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Content Area */}
      <div className="overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-gray-200/50 dark:border-gray-800 dark:bg-gray-900 dark:shadow-none">
        {/* Grid Header */}
        <div className="flex items-center justify-between border-b border-gray-50 p-6 sm:px-8 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                checked={
                  selectedItems.size === filteredItems.length &&
                  filteredItems.length > 0
                }
                onChange={handleSelectAll}
                disabled={filteredItems.length === 0}
                className="h-5 w-5 rounded-md border-2 border-gray-200 text-[#2F2582] transition-all checked:border-[#2F2582] focus:ring-[#2F2582]/20"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                All Files
              </p>
              <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                {filteredItems.length} Total items
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-24 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
              <FolderKanban className="h-12 w-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              No media items found
            </h3>
            <p className="mt-2 max-w-xs text-sm font-medium text-gray-500">
              Try adjusting your search or filters to find what you&apos;re
              looking for.
            </p>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="mt-8 rounded-2xl bg-[#2F2582] px-8 hover:bg-[#241c66]"
            >
              Upload First File
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 lg:p-8 xl:grid-cols-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-[2rem] border-2 transition-all duration-500",
                  selectedItems.has(item.id)
                    ? "border-[#2F2582] ring-8 ring-[#2F2582]/5"
                    : "border-transparent bg-gray-50 dark:bg-gray-800",
                )}
              >
                {/* Checkbox Overlay */}
                <div
                  className={cn(
                    "absolute top-4 left-4 z-20 transition-all duration-300",
                    selectedItems.has(item.id)
                      ? "scale-110 opacity-100"
                      : "scale-50 opacity-0 group-hover:scale-100 group-hover:opacity-100",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="h-6 w-6 cursor-pointer rounded-lg border-2 border-white/50 bg-white/20 text-[#2F2582] backdrop-blur-md transition-all checked:border-white focus:ring-0"
                  />
                </div>

                {/* Media Content */}
                {item.mime_type.startsWith("image/") ? (
                  <Image
                    src={item.file_url}
                    alt={item.alt_text || item.original_name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-8">
                    <div className="flex flex-col items-center gap-2">
                      {getFileIcon(item.mime_type)}
                      <span className="text-[10px] font-black text-gray-400 uppercase">
                        {item.mime_type.split("/")[1]}
                      </span>
                    </div>
                  </div>
                )}

                {/* Hover UI */}
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#2F2582]/40 opacity-0 backdrop-blur-[2px] transition-all duration-500 group-hover:opacity-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMedia(item);
                        setEditingAltText(item.alt_text || "");
                        setEditingTags(item.tags?.join(", ") || "");
                        setMediaUsage(null);
                        fetchUsage(item.file_url);
                        setShowPreviewModal(true);
                      }}
                      className="flex h-12 w-12 translate-y-4 items-center justify-center rounded-2xl bg-white text-[#2F2582] shadow-xl transition-all duration-500 group-hover:translate-y-0 hover:scale-110"
                      title="View Details"
                    >
                      <Eye className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(item.file_url)}
                      className="flex h-12 w-12 translate-y-4 items-center justify-center rounded-2xl bg-white text-gray-700 shadow-xl transition-all delay-75 duration-500 group-hover:translate-y-0 hover:scale-110"
                      title="Copy URL"
                    >
                      <Copy className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMedia(item);
                        setShowDeleteModal(true);
                      }}
                      className="flex h-12 w-12 translate-y-4 items-center justify-center rounded-2xl bg-white text-red-600 shadow-xl transition-all delay-100 duration-500 group-hover:translate-y-0 hover:scale-110"
                      title="Delete"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Info Overlay (Always visible on mobile, hover on desktop) */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0 lg:group-hover:opacity-100">
                  <p className="truncate text-xs font-bold text-white">
                    {item.original_name}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-white/60">
                    {formatFileSize(item.file_size)}
                  </p>
                </div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[8px] font-black tracking-widest text-white uppercase shadow-sm backdrop-blur-md",
                      item.usage_count > 0
                        ? "bg-green-500/80"
                        : "bg-amber-500/80",
                    )}
                  >
                    {item.usage_count > 0 ? "In Use" : "Unused"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="group transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4">
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                        {item.mime_type.startsWith("image/") ? (
                          <Image
                            src={item.file_url}
                            alt=""
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            {getFileIcon(item.mime_type)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="line-clamp-1 text-sm font-semibold text-gray-900">
                        {item.original_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Added {format(new Date(item.created_at), "MMM d, yyyy")}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                      {item.mime_type.split("/")[1]}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {formatFileSize(item.file_size)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => {
                            setSelectedMedia(item);
                            setEditingAltText(item.alt_text || "");
                            setEditingTags(item.tags?.join(", ") || "");
                            setMediaUsage(null);
                            fetchUsage(item.file_url);
                            setShowPreviewModal(true);
                          }}
                          className="rounded-full p-2 text-gray-400 shadow-sm hover:bg-white hover:text-[#2F2582]"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCopyUrl(item.file_url)}
                          className="rounded-full p-2 text-gray-400 shadow-sm hover:bg-white hover:text-gray-900"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMedia(item);
                            setShowDeleteModal(true);
                          }}
                          className="rounded-full p-2 text-gray-400 shadow-sm hover:bg-white hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                    Upload Media
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                    Drag and drop or click to browse files
                  </p>
                </div>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                <div
                  ref={dragAreaRef}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-[#2F2582]"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-12 w-12 animate-spin text-[#2F2582]" />
                      <p className="mt-4 font-medium text-gray-900">
                        Uploading... {uploadProgress}%
                      </p>
                      <div className="mt-2 h-2 w-64 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-[#2F2582] transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <HardDrive className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-4 text-sm font-medium text-gray-900">
                        Drag and drop files here
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        or click to browse from your computer
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="*/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Files
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && selectedMedia && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161616]/95 p-0 backdrop-blur-md sm:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 100 }}
              className="relative flex h-full w-full flex-col overflow-hidden bg-white shadow-2xl sm:max-h-[900px] sm:max-w-7xl sm:rounded-[3rem] lg:flex-row dark:bg-gray-900"
            >
              {/* Close Button Mobile */}
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedMedia(null);
                }}
                className="absolute top-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/40 lg:hidden"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Left: Media Preview Area */}
              <div className="relative flex min-h-[40vh] flex-1 flex-col overflow-hidden bg-gray-50 lg:min-h-0 dark:bg-gray-950">
                <div className="flex h-full items-center justify-center p-8 lg:p-20">
                  {selectedMedia.mime_type.startsWith("image/") ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={selectedMedia.file_url}
                        alt={
                          selectedMedia.alt_text || selectedMedia.original_name
                        }
                        fill
                        className="object-contain drop-shadow-2xl"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-6">
                      <div className="rounded-[2.5rem] bg-white p-12 shadow-xl dark:bg-gray-800">
                        {getFileIcon(selectedMedia.mime_type)}
                      </div>
                      <p className="text-sm font-black tracking-[0.2em] text-gray-400 uppercase">
                        {getFileTypeCategory(selectedMedia.mime_type)} File
                      </p>
                    </div>
                  )}
                </div>

                {/* Floating Actions Overlay */}
                <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3 rounded-2xl bg-white/10 p-2 shadow-2xl backdrop-blur-xl dark:bg-black/20">
                  <Button
                    variant="ghost"
                    onClick={() => handleCopyUrl(selectedMedia.file_url)}
                    className="h-12 rounded-xl border-none bg-white px-6 font-bold text-gray-900 shadow-sm transition-all hover:scale-105"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy URL
                  </Button>
                  <a
                    href={selectedMedia.file_url}
                    download
                    className="flex h-12 items-center justify-center rounded-xl bg-[#2F2582] px-6 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#241c66]"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </a>
                </div>
              </div>

              {/* Right: Info Sidebar */}
              <div className="flex w-full flex-col border-l border-gray-50 bg-white lg:w-[450px] dark:border-gray-800 dark:bg-gray-900">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between border-b border-gray-50 p-8 dark:border-gray-800">
                  <div className="min-w-0">
                    <h3
                      className="truncate text-xl font-black text-gray-900 dark:text-white"
                      title={selectedMedia.original_name}
                    >
                      {selectedMedia.original_name}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] font-bold text-gray-400">
                      ID: {selectedMedia.id}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPreviewModal(false);
                      setSelectedMedia(null);
                    }}
                    className="hidden h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-900 lg:flex dark:bg-gray-800 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="scrollbar-thin flex-1 overflow-y-auto p-8">
                  {/* Metadata Grid */}
                  <div className="mb-10 grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Size",
                        value: formatFileSize(selectedMedia.file_size),
                      },
                      {
                        label: "Type",
                        value: selectedMedia.mime_type
                          .split("/")[1]
                          .toUpperCase(),
                      },
                      { label: "Folder", value: selectedMedia.folder },
                      {
                        label: "Added",
                        value: format(
                          new Date(selectedMedia.created_at),
                          "MMM d, yyyy",
                        ),
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/50"
                      >
                        <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                          {item.label}
                        </p>
                        <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Usage Section */}
                  <div className="mb-10">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#2F2582] dark:bg-[#a099ff]" />
                      <h4 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Used in
                      </h4>
                    </div>
                    {isUsageLoading ? (
                      <div className="flex items-center gap-3 py-4 text-sm font-medium text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Scanning database...
                      </div>
                    ) : mediaUsage &&
                      (mediaUsage.products.length > 0 ||
                        mediaUsage.productImages.length > 0 ||
                        mediaUsage.catalogues.length > 0) ? (
                      <div className="grid gap-2">
                        {mediaUsage.products.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between rounded-xl bg-blue-50/50 p-3 text-xs dark:bg-blue-900/10"
                          >
                            <span className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400">
                              <Package className="h-3 w-3" />
                              Main: {p.name}
                            </span>
                            <Link
                              href="/admin/products"
                              className="rounded-lg bg-white px-3 py-1 font-black text-blue-700 shadow-sm transition-all hover:scale-105 dark:bg-gray-800"
                            >
                              EDIT
                            </Link>
                          </div>
                        ))}
                        {mediaUsage.productImages.map((gi) => (
                          <div
                            key={gi.id}
                            className="flex items-center justify-between rounded-xl bg-purple-50/50 p-3 text-xs dark:bg-purple-900/10"
                          >
                            <span className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-400">
                              <ImageIcon className="h-3 w-3" />
                              Gallery: {gi.product_name}
                            </span>
                            <Link
                              href="/admin/products"
                              className="rounded-lg bg-white px-3 py-1 font-black text-purple-700 shadow-sm transition-all hover:scale-105 dark:bg-gray-800"
                            >
                              EDIT
                            </Link>
                          </div>
                        ))}
                        {mediaUsage.catalogues.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between rounded-xl bg-green-50/50 p-3 text-xs dark:bg-green-900/10"
                          >
                            <span className="flex items-center gap-2 font-bold text-green-700 dark:text-green-400">
                              <FileText className="h-3 w-3" />
                              Catalog: {c.name}
                            </span>
                            <Link
                              href="/admin/catalogues"
                              className="rounded-lg bg-white px-3 py-1 font-black text-green-700 shadow-sm transition-all hover:scale-105 dark:bg-gray-800"
                            >
                              EDIT
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed border-gray-100 p-6 text-center">
                        <p className="text-xs font-medium text-gray-400 italic">
                          This file is currently not being used anywhere in your
                          store.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Edit Form */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#2F2582] dark:bg-[#a099ff]" />
                      <h4 className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                        Edit Metadata
                      </h4>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">
                          Alt Text (SEO)
                        </label>
                        <input
                          type="text"
                          value={editingAltText}
                          onChange={(e) => setEditingAltText(e.target.value)}
                          placeholder="Describe this image..."
                          className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-[#2F2582] focus:ring-4 focus:ring-[#2F2582]/5 focus:outline-none dark:border-gray-800 dark:bg-gray-800/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">
                          Tags (Comma separated)
                        </label>
                        <input
                          type="text"
                          value={editingTags}
                          onChange={(e) => setEditingTags(e.target.value)}
                          placeholder="blue, velvet, living-room..."
                          className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-[#2F2582] focus:ring-4 focus:ring-[#2F2582]/5 focus:outline-none dark:border-gray-800 dark:bg-gray-800/50"
                        />
                      </div>

                      <Button
                        onClick={() => {
                          const tags = editingTags
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean);

                          handleUpdateMedia(selectedMedia.id, {
                            alt_text: editingAltText || undefined,
                            tags: tags.length > 0 ? tags : undefined,
                          });
                        }}
                        className="w-full rounded-xl bg-[#2F2582] py-6 font-bold hover:bg-[#241c66]"
                      >
                        Update File Info
                      </Button>

                      <div className="pt-4">
                        <button
                          onClick={() => {
                            setSelectedMedia(selectedMedia);
                            setShowDeleteModal(true);
                          }}
                          className="flex w-full items-center justify-center gap-2 rounded-xl p-4 text-xs font-bold text-red-500 transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete File Permanently
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Media"
        message={`Are you sure you want to delete "${selectedMedia?.original_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedMedia(null);
        }}
        isLoading={actionLoading.delete}
        variant="danger"
      />

      {/* Sync Modal */}
      <AnimatePresence>
        {showSyncModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                    Sync Existing Files
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                    Import existing Supabase storage files into the media
                    library
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowSyncModal(false);
                    setSyncResults(null);
                  }}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6">
                {!syncResults ? (
                  <div className="text-center">
                    <RefreshCw className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-4 text-base font-medium text-gray-900">
                      Import Existing Files
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      This will scan all Supabase storage buckets (products,
                      catalogues, media) and import any existing files that
                      aren&apos;t already in the media library.
                    </p>
                    <div className="mt-6 flex justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowSyncModal(false);
                          setSyncResults(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSyncExistingFiles}
                        disabled={isSyncing}
                        className="bg-[#2F2582] hover:bg-[#241c66]"
                      >
                        {isSyncing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Syncing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Start Sync
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="rounded-lg bg-gray-50 p-4">
                      <h4 className="font-medium text-gray-900">
                        Sync Results
                      </h4>
                      <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {syncResults.totalFiles}
                          </div>
                          <div className="text-gray-600">Total Files</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {syncResults.importedFiles}
                          </div>
                          <div className="text-gray-600">Imported</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {syncResults.skippedFiles}
                          </div>
                          <div className="text-gray-600">Skipped</div>
                        </div>
                      </div>
                    </div>

                    {syncResults.errors.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-red-900">Errors</h4>
                        <div className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3">
                          <ul className="text-sm text-red-800">
                            {syncResults.errors.map((error, index) => (
                              <li key={index} className="mb-1">
                                • {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="mt-6 flex justify-end">
                      <Button
                        onClick={() => {
                          setShowSyncModal(false);
                          setSyncResults(null);
                        }}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
