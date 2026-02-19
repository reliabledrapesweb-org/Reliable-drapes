"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Search,
  X,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/ui/AdminPageSkeleton";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { useAdmin } from "@/lib/hooks/useAdmin";
import { FileUpload } from "@/components/admin/FileUpload";
import {
  getAllExhibitionsAdmin,
  createExhibition,
  updateExhibition,
  deleteExhibition,
  toggleExhibitionStatus,
  type Exhibition,
  type ExhibitionFormData,
} from "@/lib/actions/exhibitions";

const emptyForm: ExhibitionFormData = {
  title: "",
  image_url: "",
  is_active: true,
};

export default function ExhibitionsAdminPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toasts, addToast, removeToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Exhibition | null>(null);
  const [formData, setFormData] = useState<ExhibitionFormData>(emptyForm);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "toggle" | null;
    exhibitionId?: string;
    exhibitionTitle?: string;
    nextActive?: boolean;
  }>({ type: null });

  const fetchExhibitions = useCallback(async () => {
    setIsLoading(true);
    const result = await getAllExhibitionsAdmin();
    if (result.success && result.exhibitions) {
      setExhibitions(result.exhibitions);
    } else {
      addToast(result.error || "Failed to load exhibition photos", "error");
    }
    setIsLoading(false);
  }, [addToast]);

  useEffect(() => {
    if (isAdmin) {
      void fetchExhibitions();
    }
  }, [isAdmin, fetchExhibitions]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return exhibitions;
    return exhibitions.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.image_url || "").toLowerCase().includes(q),
    );
  }, [exhibitions, searchQuery]);

  function openModal(item?: Exhibition) {
    if (item) {
      setEditing(item);
      setFormData({
        title: item.title || "",
        image_url: item.image_url || "",
        is_active: item.is_active,
      });
    } else {
      setEditing(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const key = editing ? "update" : "create";
    setActionLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const imageUrl = formData.image_url?.trim();
      if (!imageUrl) {
        addToast("Please upload an image or provide an image URL", "error");
        return;
      }

      const payload: ExhibitionFormData = {
        image_url: imageUrl,
        is_active: formData.is_active ?? true,
      };
      if (formData.title?.trim()) {
        payload.title = formData.title.trim();
      }

      const result = editing
        ? await updateExhibition(editing.id, payload)
        : await createExhibition(payload);

      if (!result.success) {
        addToast(result.error || "Failed to save exhibition photo", "error");
        return;
      }

      addToast(
        editing
          ? "Exhibition photo updated successfully"
          : "Exhibition photo added successfully",
        "success",
      );
      setShowModal(false);
      await fetchExhibitions();
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function executeDelete() {
    if (!confirmAction.exhibitionId) return;
    const key = `delete-${confirmAction.exhibitionId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await deleteExhibition(confirmAction.exhibitionId);
      if (!result.success) {
        addToast(result.error || "Failed to delete exhibition photo", "error");
      } else {
        addToast("Exhibition photo deleted successfully", "success");
        await fetchExhibitions();
      }
    } finally {
      setConfirmAction({ type: null });
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function executeToggle() {
    if (!confirmAction.exhibitionId || confirmAction.nextActive === undefined) {
      return;
    }
    const key = `toggle-${confirmAction.exhibitionId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await toggleExhibitionStatus(
        confirmAction.exhibitionId,
        confirmAction.nextActive,
      );
      if (!result.success) {
        addToast(result.error || "Failed to update photo visibility", "error");
      } else {
        addToast(
          `Photo ${confirmAction.nextActive ? "published" : "hidden"} successfully`,
          "success",
        );
        await fetchExhibitions();
      }
    } finally {
      setConfirmAction({ type: null });
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  if (adminLoading || isLoading) {
    return <AdminPageSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Exhibitions & Moments Gallery
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Add and manage exhibition photos shown on the public gallery page.
          </p>
        </div>
        <Button
          onClick={() => openModal()}
          className="w-full bg-[#2F2582] hover:bg-[#251e66] sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Photo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by label or image URL..."
          className="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gallery Photos ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center text-sm text-gray-500">
              No exhibition photos found.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <div className="relative aspect-[4/5] bg-gray-100">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title || "Exhibition photo"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-3">
                    <div className="space-y-1">
                      <p className="line-clamp-1 text-sm font-medium text-gray-900">
                        {item.title || "Untitled photo"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Added{" "}
                        {new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: "toggle",
                            exhibitionId: item.id,
                            exhibitionTitle: item.title,
                            nextActive: !item.is_active,
                          })
                        }
                        disabled={actionLoading[`toggle-${item.id}`]}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                          item.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.is_active ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}
                        {item.is_active ? "Live" : "Hidden"}
                      </button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openModal(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setConfirmAction({
                              type: "delete",
                              exhibitionId: item.id,
                              exhibitionTitle: item.title,
                            })
                          }
                          disabled={actionLoading[`delete-${item.id}`]}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editing ? "Edit Gallery Photo" : "Add Gallery Photo"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Exhibition Image *
                  </label>
                  <FileUpload
                    label=""
                    accept="image/*"
                    bucket="products"
                    folder="exhibitions"
                    currentUrl={formData.image_url}
                    onUploadComplete={(url) =>
                      setFormData((prev) => ({ ...prev, image_url: url }))
                    }
                    onRemove={() =>
                      setFormData((prev) => ({ ...prev, image_url: "" }))
                    }
                    maxSizeMB={8}
                    allowedTypes={[
                      "image/jpeg",
                      "image/png",
                      "image/webp",
                      "image/jpg",
                    ]}
                    previewType="image"
                    registerWithMediaLibrary={true}
                    mediaLibraryTags={["exhibitions", "gallery"]}
                  />

                  {!formData.image_url && (
                    <div>
                      <label className="mb-2 block text-xs font-medium text-gray-600">
                        Or enter Image URL manually
                      </label>
                      <input
                        type="url"
                        value={formData.image_url || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            image_url: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                        placeholder="https://example.com/event-photo.jpg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Photo Label (optional)
                  </label>
                  <input
                    value={formData.title || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    placeholder="e.g. Heimtextil 2026 Booth"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={!!formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Publish this photo on the website
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading.create || actionLoading.update}
                    className="w-full bg-[#2F2582] hover:bg-[#251e66] sm:flex-1"
                  >
                    {actionLoading.create || actionLoading.update
                      ? "Saving..."
                      : editing
                        ? "Update Photo"
                        : "Add Photo"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmAction.type === "delete"}
        title="Delete Photo"
        message={`Are you sure you want to delete "${confirmAction.exhibitionTitle || "this photo"}"?`}
        confirmText="Delete"
        variant="danger"
        onCancel={() => setConfirmAction({ type: null })}
        onConfirm={executeDelete}
      />
      <ConfirmationModal
        isOpen={confirmAction.type === "toggle"}
        title={confirmAction.nextActive ? "Publish Photo" : "Hide Photo"}
        message={`Are you sure you want to ${confirmAction.nextActive ? "publish" : "hide"} "${confirmAction.exhibitionTitle || "this photo"}"?`}
        confirmText={confirmAction.nextActive ? "Publish" : "Hide"}
        variant={confirmAction.nextActive ? "default" : "warning"}
        onCancel={() => setConfirmAction({ type: null })}
        onConfirm={executeToggle}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
