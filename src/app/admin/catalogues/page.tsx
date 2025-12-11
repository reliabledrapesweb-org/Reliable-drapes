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
  Plus, 
  BookOpen, 
  Download, 
  Eye, 
  EyeOff, 
  Edit, 
  Trash2, 
  X,
  FileText,
  Image as ImageIcon,
  Tag,
  MoreVertical
} from "lucide-react";

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
    return <AdminPageSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Catalogues</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Manage your product catalogues and downloads
          </p>
        </div>
        <Button 
          onClick={() => handleOpenModal()}
          className="bg-[#2F2582] hover:bg-[#251e66] sm:w-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Catalogue
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Catalogues</p>
                <p className="text-2xl font-bold text-gray-900">{catalogues.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {catalogues.filter((c) => c.is_active).length}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-[#2F2582]">
                  {catalogues.reduce((sum, c) => sum + c.download_count, 0)}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Download className="h-6 w-6 text-[#2F2582]" />
              </div>
            </div>
          </CardContent>
        </Card>
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
                <TableHead className="hidden md:table-cell">Downloads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalogues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No catalogues yet</h3>
                      <p className="mt-2 text-sm text-gray-500">Get started by creating your first catalogue.</p>
                      <Button 
                        onClick={() => handleOpenModal()}
                        className="mt-4 bg-[#2F2582] hover:bg-[#251e66] cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
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
                        <div className="flex-shrink-0">
                          {(catalogue.thumbnail_url || catalogue.image_url) ? (
                            <img
                              src={catalogue.thumbnail_url || catalogue.image_url}
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
                    <TableCell className="hidden md:table-cell">
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
            className="w-full max-w-2xl rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    {editingCatalogue ? "Edit Catalogue" : "Add New Catalogue"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCloseModal}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="Enter catalogue title"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Category *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="e.g., Curtains, Blinds"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="Brief description of the catalogue"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      File URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.file_url}
                      onChange={(e) =>
                        setFormData({ ...formData, file_url: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="https://example.com/catalogue.pdf"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Thumbnail URL
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnail_url}
                      onChange={(e) =>
                        setFormData({ ...formData, thumbnail_url: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Badge
                      </label>
                      <select
                        value={formData.badge || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            badge: e.target.value as "new" | "discount" | null,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      >
                        <option value="">None</option>
                        <option value="new">New</option>
                        <option value="discount">Discount</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
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
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="-30%"
                      />
                    </div>


                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!!actionLoading.create || !!actionLoading.update}
                      className="flex-1 bg-[#2F2582] hover:bg-[#251e66] disabled:opacity-50 cursor-pointer"
                    >
                      {(actionLoading.create || actionLoading.update) ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {editingCatalogue ? "Updating..." : "Creating..."}
                        </div>
                      ) : (
                        editingCatalogue ? "Update" : "Create"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
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
