"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import {
  getMediaItems,
  uploadMediaItem,
  deleteMediaItem,
  updateMediaItem,
  getStorageStats,
  getFolders,
  type MediaItem,
} from "@/lib/actions/media";
import { useAdmin } from "@/lib/hooks/useAdmin";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { Button } from "@/components/ui/button";
import { MediaLibrarySkeleton } from "@/components/ui/AdminSkeletons";
import { ConfirmationModal } from "@/components/shared";
import { cn } from "@/lib/utils";
import { syncExistingFiles, getStorageBucketsInfo } from "@/lib/actions/media";

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

  const [editingTags, setEditingTags] = useState("");
  const [editingAltText, setEditingAltText] = useState("");

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
  }, [searchQuery, selectedFolder, isAdmin]);

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

      const result = await uploadMediaItem(file, {
        bucket: "media", // Use dedicated media bucket for general uploads
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

      const result = await uploadMediaItem(file, {
        bucket: "media", // Use dedicated media bucket for general uploads
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

  const getIconForMimeType = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5" />;
    }
    return <FileText className="h-5 w-5" />;
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
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            Total Files
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl">
            {storageStats?.totalItems || 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            Storage Used
          </p>
          <p className="mt-1 text-lg font-bold text-[#2F2582] sm:text-2xl">
            {storageStats?.totalSizeFormatted || "0 Bytes"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            Folders
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl">
            {folders.length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
          >
            <option value="all">All Folders</option>
            {folders.map((folder) => (
              <option key={folder} value={folder}>
                {folder}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4"
        >
          <p className="text-sm font-medium text-blue-900">
            {selectedItems.size} item(s) selected
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedItems(new Set())}
            >
              Clear Selection
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        </motion.div>
      )}

      {/* Media Grid */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Grid Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={
                selectedItems.size === filteredItems.length &&
                filteredItems.length > 0
              }
              onChange={handleSelectAll}
              disabled={filteredItems.length === 0}
              className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
            />
            <p className="text-sm font-medium text-gray-900">
              {filteredItems.length} item(s)
            </p>
          </div>
        </div>

        {/* Grid Content */}
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <FolderKanban className="h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-base font-medium text-gray-900 sm:text-lg">
              {searchQuery || selectedFolder !== "all"
                ? "No media found"
                : "No media files yet"}
            </h3>
            <p className="mt-2 text-xs text-gray-500 sm:text-sm">
              {searchQuery || selectedFolder !== "all"
                ? "Try adjusting your search or filters"
                : "Upload your first media file to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:p-6 xl:grid-cols-5">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg border-2 transition-all",
                  selectedItems.has(item.id)
                    ? "border-[#2F2582] ring-2 ring-[#2F2582]/20"
                    : "border-gray-200 hover:border-gray-300",
                )}
              >
                {/* Checkbox */}
                <div className="absolute top-2 left-2 z-10">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                  />
                </div>

                {/* Media Preview */}
                {item.mime_type.startsWith("image/") ? (
                  <Image
                    src={item.file_url}
                    alt={item.alt_text || item.original_name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    {getFileIcon(item.mime_type)}
                  </div>
                )}

                {/* Hover Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 p-2 opacity-0 transition-opacity"
                >
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedMedia(item);
                        setShowPreviewModal(true);
                      }}
                      className="rounded-full bg-white p-2 text-gray-800 hover:bg-gray-100"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopyUrl(item.file_url)}
                      className="rounded-full bg-white p-2 text-gray-800 hover:bg-gray-100"
                      title="Copy URL"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMedia(item);
                        setShowDeleteModal(true);
                      }}
                      className="rounded-full bg-white p-2 text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-2 truncate text-center text-xs text-white">
                    {item.original_name}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatFileSize(item.file_size)}
                  </p>
                </motion.div>
              </motion.div>
            ))}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-5xl"
            >
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setSelectedMedia(null);
                }}
                className="absolute -top-12 right-0 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </button>

              {selectedMedia.mime_type.startsWith("image/") ? (
                <Image
                  src={selectedMedia.file_url}
                  alt={selectedMedia.alt_text || selectedMedia.original_name}
                  width={1200}
                  height={800}
                  className="max-h-[80vh] w-auto rounded-lg"
                />
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg bg-white">
                  <FileText className="h-12 w-12 text-gray-400" />
                </div>
              )}

              <div className="mt-4 rounded-lg bg-white/10 p-4 backdrop-blur">
                <h3 className="text-lg font-semibold text-white">
                  {selectedMedia.original_name}
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-300">
                  <div>
                    <span className="font-medium">Size:</span>{" "}
                    {formatFileSize(selectedMedia.file_size)}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>{" "}
                    {selectedMedia.mime_type}
                  </div>
                  <div>
                    <span className="font-medium">Folder:</span>{" "}
                    {selectedMedia.folder}
                  </div>
                  <div>
                    <span className="font-medium">Uploaded:</span>{" "}
                    {format(new Date(selectedMedia.created_at), "MMM d, yyyy")}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-300">
                      Alt Text
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingAltText}
                        onChange={(e) => setEditingAltText(e.target.value)}
                        placeholder="Add alt text..."
                        className="flex-1 rounded border border-gray-600 bg-white/10 px-3 py-2 text-sm text-white placeholder-gray-400 focus:border-[#2F2582] focus:outline-none"
                      />
                      <Button
                        onClick={() => {
                          handleUpdateMedia(selectedMedia.id, {
                            alt_text: editingAltText || undefined,
                          });
                        }}
                        size="sm"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleCopyUrl(selectedMedia.file_url)}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL
                    </Button>
                    <a
                      href={selectedMedia.file_url}
                      download
                      className="inline-flex items-center rounded-md border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
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
                      aren't already in the media library.
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
