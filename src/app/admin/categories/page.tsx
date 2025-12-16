"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, FolderTree, Eye, EyeOff, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryFull,
} from "@/lib/actions/products";
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
import { useAdmin } from "@/lib/hooks/useAdmin";

export default function AdminCategoriesPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toasts, addToast, removeToast } = useToast();

  const [categories, setCategories] = useState<CategoryFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryFull | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<{ [key: string]: string | null }>({});
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | null;
    categoryId?: string;
    categoryName?: string;
  }>({ type: null });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    is_featured: false,
    published: true,
    sort_order: 0,
  });


  // Fetch categories on admin access
  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
    }
  }, [isAdmin]);

  const fetchCategories = async () => {
    setIsLoading(true);
    const result = await getAllCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    } else {
      addToast(result.error || "Failed to fetch categories", "error");
    }
    setIsLoading(false);
  };

  // Open modal for adding/editing
  const handleOpenModal = (category?: CategoryFull) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image_url: category.image_url || "",
        is_featured: category.is_featured,
        published: category.published,
        sort_order: category.sort_order,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        image_url: "",
        is_featured: false,
        published: true,
        sort_order: 0,
      });
    }
    setShowModal(true);
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionKey = editingCategory ? "update" : "create";
    setActionLoading((prev) => ({ ...prev, [actionKey]: actionKey }));

    try {
      const categoryData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        parent_id: null,
      };

      if (editingCategory) {
        const result = await updateCategory(editingCategory.id, categoryData);
        if (result.success) {
          addToast("Category updated successfully", "success");
          fetchCategories();
          setShowModal(false);
        } else {
          addToast(result.error || "Failed to update category", "error");
        }
      } else {
        const result = await createCategory(categoryData);
        if (result.success) {
          addToast("Category created successfully", "success");
          fetchCategories();
          setShowModal(false);
        } else {
          addToast(result.error || "Failed to create category", "error");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      addToast("An unexpected error occurred", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: null }));
    }
  };

  // Handle delete
  const handleDelete = (id: string, name: string) => {
    setConfirmAction({
      type: "delete",
      categoryId: id,
      categoryName: name,
    });
  };

  const executeDelete = async () => {
    if (!confirmAction.categoryId) return;
    setActionLoading((prev) => ({ ...prev, [`delete-${confirmAction.categoryId}`]: "delete" }));

    try {
      const result = await deleteCategory(confirmAction.categoryId);
      if (result.success) {
        addToast("Category deleted successfully", "success");
        fetchCategories();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to delete category", "error");
        setConfirmAction({ type: null });
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${confirmAction.categoryId}`]: null }));
    }
  };

  // Toggle featured status
  const toggleFeatured = async (category: CategoryFull) => {
    const result = await updateCategory(category.id, { is_featured: !category.is_featured });
    if (result.success) {
      addToast(`Category ${!category.is_featured ? "featured" : "unfeatured"}`, "success");
      fetchCategories();
    } else {
      addToast("Failed to update category", "error");
    }
  };

  // Toggle published status
  const togglePublished = async (category: CategoryFull) => {
    const result = await updateCategory(category.id, { published: !category.published });
    if (result.success) {
      addToast(`Category ${!category.published ? "published" : "unpublished"}`, "success");
      fetchCategories();
    } else {
      addToast("Failed to update category", "error");
    }
  };

  // Filter categories by search query
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fallbackImage = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop";

  // Stats
  const totalCategories = categories.length;
  const featuredCount = categories.filter((c) => c.is_featured).length;
  const publishedCount = categories.filter((c) => c.published).length;

  if (adminLoading || isLoading) {
    return <AdminPageSkeleton />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Access denied</p>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Categories Management</h1>
        <p className="mt-2 text-gray-600">Organize your products with categories</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Categories</CardTitle>
            <FolderTree className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalCategories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Featured</CardTitle>
            <Star className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{featuredCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
            <Eye className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{publishedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Table Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-lg border-2 border-gray-200 py-2 pl-10 pr-4 text-sm transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
              />
            </div>

            {/* Add Category Button */}
            <Button onClick={() => handleOpenModal()} className="bg-[#2F2582] hover:bg-[#241c66]">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    {searchQuery ? "No categories found" : "No categories yet. Add your first category!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={category.image_url || fallbackImage}
                            alt={category.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{category.name}</div>
                          {category.description && (
                            <div className="max-w-xs truncate text-xs text-gray-500">
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{category.product_count || 0}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFeatured(category)}
                          className={`rounded-full p-1 transition-colors ${
                            category.is_featured
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-400 hover:bg-yellow-50"
                          }`}
                          title={category.is_featured ? "Remove from featured" : "Add to featured"}
                        >
                          <Star className="h-4 w-4" fill={category.is_featured ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={() => togglePublished(category)}
                          className={`rounded-full p-1 transition-colors ${
                            category.published
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-100 text-gray-400 hover:bg-green-50"
                          }`}
                          title={category.published ? "Unpublish" : "Publish"}
                        >
                          {category.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(category)}
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id, category.name)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={actionLoading[`delete-${category.id}`] === "delete"}
                        >
                          <Trash2 className="h-4 w-4" />
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


      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-2xl"
            >
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          name: e.target.value,
                          slug: formData.slug || generateSlug(e.target.value),
                        });
                      }}
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="Enter category name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Slug</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="auto-generated-from-name"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    placeholder="Enter category description"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image_url && (
                    <div className="relative mt-3 h-32 w-32 overflow-hidden rounded-lg border-2 border-gray-200">
                      <Image src={formData.image_url} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
                      }
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                    />
                    <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                      Featured on Homepage
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                    />
                    <label htmlFor="published" className="text-sm font-medium text-gray-700">
                      Published
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    disabled={actionLoading.update === "update" || actionLoading.create === "create"}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading.update === "update" || actionLoading.create === "create"}
                    className="flex-1 bg-[#2F2582] hover:bg-[#241c66]"
                  >
                    {actionLoading.update === "update" || actionLoading.create === "create"
                      ? "Saving..."
                      : editingCategory
                        ? "Update Category"
                        : "Create Category"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmAction.type === "delete"}
        onCancel={() => setConfirmAction({ type: null })}
        onConfirm={executeDelete}
        title="Delete Category?"
        message={`Are you sure you want to delete "${confirmAction.categoryName}"? Products in this category will be unassigned.`}
        confirmText="Delete"
        variant="danger"
        isLoading={actionLoading[`delete-${confirmAction.categoryId}`] === "delete"}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
