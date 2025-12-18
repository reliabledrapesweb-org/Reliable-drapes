"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAdmin } from "@/lib/hooks/useAdmin";
import {
  getAllCatalogues,
  createCatalogue,
  updateCatalogue,
  deleteCatalogue,
  type Catalogue,
  type CreateCatalogueInput,
} from "@/lib/actions/catalogues";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/ui/AdminPageSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  BookOpen, 
  Download, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  X,
  FileText,
  Tag
} from "lucide-react";
import { FileUpload } from "@/components/admin/FileUpload";

export default function CataloguesPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCatalogue, setEditingCatalogue] = useState<Catalogue | null>(null);
  const [actionLoading, setActionLoading] = useState<{[key: string]: string | null}>({});
  const { toasts, addToast, removeToast } = useToast();

  // Form state
  const [formData, setFormData] = useState<CreateCatalogueInput>({
    title: "",
    description: "",
    category: "",
    file_url: "",
    thumbnail_url: "",
    badge: null,
    discount_value: "",
  });

  useEffect(() => {
    if (isAdmin) {
      fetchCatalogues();
    }
  }, [isAdmin]);

  const fetchCatalogues = async () => {
    setIsLoading(true);
    const result = await getAllCatalogues();
    if (result.success && result.data) {
      setCatalogues(result.data);
    } else {
      addToast(result.error || "Failed to fetch catalogues", "error");
    }
    setIsLoading(false);
  };

  const handleOpenModal = (catalogue?: Catalogue) => {
    if (catalogue) {
      setEditingCatalogue(catalogue);
      setFormData({
        title: catalogue.title,
        description: catalogue.description || catalogue.subtitle || "",
        category: catalogue.category,
        file_url: catalogue.file_url || catalogue.pdf_url || "",
        thumbnail_url: catalogue.thumbnail_url || catalogue.image_url || "",
        badge: catalogue.badge,
        discount_value: catalogue.discount_value || "",

      });
    } else {
      setEditingCatalogue(null);
      setFormData({
        title: "",
        description: "",
        category: "",
        file_url: "",
        thumbnail_url: "",
        badge: null,
        discount_value: "",

      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCatalogue(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionKey = editingCatalogue ? "update" : "create";
    setActionLoading(prev => ({ ...prev, [actionKey]: actionKey }));

    try {
      if (editingCatalogue) {
        const result = await updateCatalogue({
          id: editingCatalogue.id,
          ...formData,
        });
        if (result.success) {
          addToast("Catalogue updated successfully", "success");
          fetchCatalogues();
          handleCloseModal();
        } else {
          addToast(result.error || "Failed to update catalogue", "error");
        }
      } else {
        const result = await createCatalogue(formData);
        if (result.success) {
          addToast("Catalogue created successfully", "success");
          fetchCatalogues();
          handleCloseModal();
        } else {
          addToast(result.error || "Failed to create catalogue", "error");
        }
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: null }));
    }
  };

  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "toggle" | null;
    catalogueId?: string;
    catalogueName?: string;
    isActive?: boolean;
  }>({ type: null });

  const handleDelete = (id: string, title: string) => {
    setConfirmAction({
      type: "delete",
      catalogueId: id,
      catalogueName: title,
    });
  };

  const executeDelete = async () => {
    if (!confirmAction.catalogueId) return;
    setActionLoading(prev => ({ ...prev, [`delete-${confirmAction.catalogueId}`]: "delete" }));

    try {
      const result = await deleteCatalogue(confirmAction.catalogueId);
      if (result.success) {
        addToast("Catalogue deleted successfully", "success");
        fetchCatalogues();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to delete catalogue", "error");
        setConfirmAction({ type: null });
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${confirmAction.catalogueId}`]: null }));
    }
  };

  const handleToggleActive = (catalogue: Catalogue) => {
    setConfirmAction({
      type: "toggle",
      catalogueId: catalogue.id,
      catalogueName: catalogue.title,
      isActive: !catalogue.is_active,
    });
  };

  const executeToggle = async () => {
    if (!confirmAction.catalogueId || confirmAction.isActive === undefined) return;
    setActionLoading(prev => ({ ...prev, [`toggle-${confirmAction.catalogueId}`]: "toggle" }));

    try {
      const result = await updateCatalogue({
        id: confirmAction.catalogueId,
        is_active: confirmAction.isActive,
      });
      if (result.success) {
        addToast(
          `Catalogue ${confirmAction.isActive ? "activated" : "deactivated"}`,
          "success"
        );
        fetchCatalogues();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to update catalogue", "error");
        setConfirmAction({ type: null });
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [`toggle-${confirmAction.catalogueId}`]: null }));
    }
  };

  if (adminLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Catalogues</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product catalogues and downloads
          </p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-[#2F2582] hover:bg-[#251e66] sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Catalogue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Total Catalogues</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{catalogues.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {catalogues.filter((c) => c.is_active).length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Total Downloads</p>
          <p className="mt-1 text-2xl font-bold text-[#2F2582]">
            {catalogues.reduce((sum, c) => sum + c.download_count, 0)}
          </p>
        </div>
      </div>

      {/* Catalogues Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Catalogues ({catalogues.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Catalogue</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden sm:table-cell">Downloads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalogues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No catalogues yet</h3>
                      <p className="mt-2 text-sm text-gray-500">Get started by creating your first catalogue.</p>
                      <Button 
                        onClick={() => handleOpenModal()}
                        className="mt-4 bg-[#2F2582] hover:bg-[#251e66]"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Catalogue
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                catalogues.map((catalogue) => (
                  <TableRow key={catalogue.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="shrink-0">
                          {(catalogue.thumbnail_url || catalogue.image_url) ? (
                            <img
                              src={catalogue.thumbnail_url || catalogue.image_url || ""}
                              alt={catalogue.title}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                              <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {catalogue.title}
                            </p>
                            {catalogue.badge && (
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                catalogue.badge === "new" 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-orange-100 text-orange-800"
                              }`}>
                                {catalogue.badge === "new" ? "New" : catalogue.discount_value}
                              </span>
                            )}
                          </div>
                          {(catalogue.description || catalogue.subtitle) && (
                            <p className="truncate text-xs text-gray-500">
                              {catalogue.description || catalogue.subtitle}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        <Tag className="mr-1 h-3 w-3" />
                        {catalogue.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Download className="h-3 w-3" />
                        {catalogue.download_count}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(catalogue)}
                        disabled={!!actionLoading[`toggle-${catalogue.id}`]}
                        className={`h-8 px-3 disabled:opacity-50 cursor-pointer ${
                          catalogue.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {actionLoading[`toggle-${catalogue.id}`] ? (
                          <>
                            <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            Updating...
                          </>
                        ) : catalogue.is_active ? (
                          <>
                            <Eye className="mr-1 h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-1 h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenModal(catalogue)}
                          disabled={Object.values(actionLoading).some(loading => loading !== null)}
                          className="h-8 w-8 text-gray-600 hover:text-blue-600 disabled:opacity-50 cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(catalogue.id, catalogue.title)}
                          disabled={!!actionLoading[`delete-${catalogue.id}`]}
                          className="h-8 w-8 text-gray-600 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                        >
                          {actionLoading[`delete-${catalogue.id}`] ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingCatalogue ? "Edit Catalogue" : "Add New Catalogue"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {editingCatalogue 
                      ? "Update catalogue information and files" 
                      : "Upload a new catalogue with thumbnail"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCloseModal}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="rounded-lg border-2 border-gray-200 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                          placeholder="Enter catalogue title"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Category *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({ ...formData, category: e.target.value })
                          }
                          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                          placeholder="e.g., Curtains, Blinds"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        rows={3}
                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="Brief description of the catalogue"
                      />
                    </div>
                  </div>
                </div>

                {/* Files Section */}
                <div className="rounded-lg border-2 border-gray-200 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Files & Media</h3>
                  
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Catalogue File */}
                    <div className="space-y-3">
                      <FileUpload
                        label="Catalogue File (PDF) *"
                        accept=".pdf,application/pdf"
                        bucket="catalogues"
                        folder="files"
                        currentUrl={formData.file_url}
                        onUploadComplete={(url) => setFormData({ ...formData, file_url: url })}
                        onRemove={() => setFormData({ ...formData, file_url: "" })}
                        maxSizeMB={50}
                        allowedTypes={["application/pdf"]}
                        previewType="file"
                      />
                      
                      {/* Manual URL input as alternative */}
                      {!formData.file_url && (
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-600">
                            Or enter File URL manually
                          </label>
                          <input
                            type="url"
                            value={formData.file_url}
                            onChange={(e) =>
                              setFormData({ ...formData, file_url: e.target.value })
                            }
                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                            placeholder="https://example.com/catalogue.pdf"
                          />
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Image */}
                    <div className="space-y-3">
                      <FileUpload
                        label="Thumbnail Image"
                        accept="image/*"
                        bucket="catalogues"
                        folder="thumbnails"
                        currentUrl={formData.thumbnail_url}
                        onUploadComplete={(url) => setFormData({ ...formData, thumbnail_url: url })}
                        onRemove={() => setFormData({ ...formData, thumbnail_url: "" })}
                        maxSizeMB={5}
                        allowedTypes={["image/jpeg", "image/png", "image/webp", "image/jpg"]}
                        previewType="image"
                      />
                      
                      {/* Manual URL input as alternative */}
                      {!formData.thumbnail_url && (
                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-600">
                            Or enter Thumbnail URL manually
                          </label>
                          <input
                            type="url"
                            value={formData.thumbnail_url}
                            onChange={(e) =>
                              setFormData({ ...formData, thumbnail_url: e.target.value })
                            }
                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                            placeholder="https://example.com/thumbnail.jpg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Display Options Section */}
                <div className="rounded-lg border-2 border-gray-200 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">Display Options</h3>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Badge
                      </label>
                      <Select
                        value={formData.badge || "none"}
                        onValueChange={(value) =>
                          setFormData({
                            ...formData,
                            badge: value === "none" ? null : (value as "new" | "discount"),
                          })
                        }
                      >
                        <SelectTrigger className="border-2">
                          <SelectValue placeholder="Select badge" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="discount">Discount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Discount Value
                      </label>
                      <input
                        type="text"
                        value={formData.discount_value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            discount_value: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="-30%"
                        disabled={formData.badge !== "discount"}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Only shown when badge is set to "Discount"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 border-t border-gray-200 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={!!actionLoading.create || !!actionLoading.update}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!!actionLoading.create || !!actionLoading.update || !formData.file_url}
                    className="flex-1 bg-[#2F2582] hover:bg-[#251e66] disabled:opacity-50"
                  >
                    {(actionLoading.create || actionLoading.update) ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {editingCatalogue ? "Updating..." : "Creating..."}
                      </div>
                    ) : (
                      <>
                        {editingCatalogue ? "Update Catalogue" : "Create Catalogue"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmAction.type === "delete"}
        title="Delete Catalogue"
        message={`Are you sure you want to delete "${confirmAction.catalogueName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmAction({ type: null })}
      />

      <ConfirmationModal
        isOpen={confirmAction.type === "toggle"}
        title={confirmAction.isActive ? "Activate Catalogue" : "Deactivate Catalogue"}
        message={`${confirmAction.isActive ? "Activate" : "Deactivate"} "${confirmAction.catalogueName}"? ${confirmAction.isActive ? "It will be visible to users." : "It will be hidden from users."}`}
        confirmText={confirmAction.isActive ? "Activate" : "Deactivate"}
        cancelText="Cancel"
        variant="warning"
        onConfirm={executeToggle}
        onCancel={() => setConfirmAction({ type: null })}
      />
    </div>
  );
}
