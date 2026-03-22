"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FolderTree,
  Eye,
  EyeOff,
  Star,
  X,
  LayoutGrid,
  ChevronRight,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CategoryFull,
} from "@/lib/actions/products";
import type { CategoryId } from "@/lib/types/category.types";
import {
  buildCategoryTree,
  flattenCategoryTree,
} from "@/lib/utils/category.utils";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/ui/AdminPageSkeleton";
import { FileUpload } from "@/components/admin/FileUpload";
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
import { useAdmin } from "@/lib/hooks/useAdmin";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/constants/app";

export default function AdminCategoriesPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toasts, addToast, removeToast } = useToast();

  const [categories, setCategories] = useState<CategoryFull[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryFull | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: string | null;
  }>({});
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
    parent_id: null as CategoryId | null,
    is_featured: false,
    published: true,
    sort_order: 0,
    show_in_footer: false,
  });

  // Tree expansion state
  const [expandedCategories, setExpandedCategories] = useState<Set<CategoryId>>(
    new Set(),
  );

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
      // Auto-expand categories that have children
      const tree = buildCategoryTree(result.data);
      const hasChildren = new Set<CategoryId>();
      const checkChildren = (cats: CategoryFull[]) => {
        for (const cat of cats) {
          if (cat.children && cat.children.length > 0) {
            hasChildren.add(cat.id);
            checkChildren(cat.children);
          }
        }
      };
      checkChildren(tree);
      setExpandedCategories(hasChildren);
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
        parent_id: category.parent_id,
        is_featured: category.is_featured,
        published: category.published,
        sort_order: category.sort_order,
        show_in_footer: category.show_in_footer,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        image_url: "",
        parent_id: null,
        is_featured: false,
        published: true,
        sort_order: 0,
        show_in_footer: false,
      });
    }
    setShowModal(true);
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
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
    } catch {
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
    setActionLoading((prev) => ({
      ...prev,
      [`delete-${confirmAction.categoryId}`]: "delete",
    }));

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
      setActionLoading((prev) => ({
        ...prev,
        [`delete-${confirmAction.categoryId}`]: null,
      }));
    }
  };

  // Toggle featured status
  const toggleFeatured = async (category: CategoryFull) => {
    const result = await updateCategory(category.id, {
      is_featured: !category.is_featured,
    });
    if (result.success) {
      addToast(
        `Category ${!category.is_featured ? "featured" : "unfeatured"}`,
        "success",
      );
      fetchCategories();
    } else {
      addToast("Failed to update category", "error");
    }
  };

  // Toggle published status
  const togglePublished = async (category: CategoryFull) => {
    const result = await updateCategory(category.id, {
      published: !category.published,
    });
    if (result.success) {
      addToast(
        `Category ${!category.published ? "published" : "unpublished"}`,
        "success",
      );
      fetchCategories();
    } else {
      addToast("Failed to update category", "error");
    }
  };

  // Toggle show in footer status
  const toggleShowInFooter = async (category: CategoryFull) => {
    const newValue = !category.show_in_footer;

    // Check if we're trying to add more than 4 categories to footer
    if (newValue) {
      const currentFooterCount = categories.filter(
        (c) => c.show_in_footer,
      ).length;
      if (currentFooterCount >= 4) {
        addToast(
          "Maximum 4 categories can be shown in footer. Please remove one first.",
          "error",
        );
        return;
      }
    }

    const result = await updateCategory(category.id, {
      show_in_footer: newValue,
    });
    if (result.success) {
      addToast(
        `Category ${newValue ? "added to" : "removed from"} footer`,
        "success",
      );
      fetchCategories();
    } else {
      addToast("Failed to update category", "error");
    }
  };

  // Filter categories by search query
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleCategoryExpanded = (categoryId: CategoryId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Build category tree for display
  const categoryTree = buildCategoryTree(filteredCategories);

  // Recursive component for rendering category tree
  const renderCategoryTree = (
    cats: CategoryFull[],
    level = 0,
  ): JSX.Element[] => {
    return cats.map((category) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories.has(category.id);
      const paddingLeft = level * 24;

      return (
        <>
          {/* Mobile Card View */}
          <div
            key={`mobile-${category.id}`}
            className="divide-y divide-gray-100 sm:hidden"
            style={{ marginLeft: level > 0 ? `${level * 16}px` : undefined }}
          >
            <div className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={category.image_url || fallbackImage}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-gray-900">
                    {category.name}
                  </h3>
                  <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                    {category.slug}
                  </code>
                  {category.description && (
                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">
                    {category.product_count || 0} products
                  </span>
                  {hasChildren && (
                    <span className="text-xs text-blue-600">
                      {category.children?.length} subcategories
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {hasChildren && (
                    <button
                      onClick={() => toggleCategoryExpanded(category.id)}
                      className="rounded-full p-1.5 transition-colors hover:bg-gray-100"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => toggleFeatured(category)}
                    className={`rounded-full p-1.5 transition-colors ${
                      category.is_featured
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Star
                      className="h-3.5 w-3.5"
                      fill={category.is_featured ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    onClick={() => togglePublished(category)}
                    className={`rounded-full p-1.5 transition-colors ${
                      category.published
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {category.published ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenModal(category)}
                  className="h-8 px-3"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(category.id, category.name)}
                  disabled={
                    actionLoading[`delete-${category.id}`] === "delete" ||
                    hasChildren
                  }
                  className="h-8 border-red-200 px-3 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
            {isExpanded &&
              hasChildren &&
              renderCategoryTree(category.children || [], level + 1)}
          </div>

          {/* Desktop Table View */}
          <>
            <tr key={`desktop-${category.id}`} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {hasChildren && (
                    <button
                      onClick={() => toggleCategoryExpanded(category.id)}
                      className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-200"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  )}
                  {!hasChildren && <div className="w-6" />}
                  <div
                    className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100"
                    style={{ marginLeft: paddingLeft }}
                  >
                    <Image
                      src={category.image_url || fallbackImage}
                      alt={category.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {category.name}
                    </div>
                    {category.description && (
                      <div className="max-w-xs truncate text-xs text-gray-500">
                        {category.description}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {category.slug}
                </code>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-gray-600">
                  {category.product_count || 0}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFeatured(category)}
                    className={`rounded-full p-1 transition-colors ${
                      category.is_featured
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-gray-100 text-gray-400 hover:bg-yellow-50"
                    }`}
                    title={
                      category.is_featured
                        ? "Remove from featured"
                        : "Add to featured"
                    }
                  >
                    <Star
                      className="h-4 w-4"
                      fill={category.is_featured ? "currentColor" : "none"}
                    />
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
                    {category.published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => toggleShowInFooter(category)}
                    className={`rounded-full p-1 transition-colors ${
                      category.show_in_footer
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400 hover:bg-blue-50"
                    }`}
                    title={
                      category.show_in_footer
                        ? "Remove from footer"
                        : "Add to footer"
                    }
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal(category)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category.id, category.name)}
                    disabled={
                      actionLoading[`delete-${category.id}`] === "delete" ||
                      hasChildren
                    }
                    className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 disabled:opacity-50"
                  >
                    {actionLoading[`delete-${category.id}`] === "delete" ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </td>
            </tr>
            {isExpanded &&
              hasChildren &&
              renderCategoryTree(category.children || [], level + 1)}
          </>
        </>
      );
    });
  };

  const fallbackImage = DEFAULT_PRODUCT_IMAGE;

  // Stats
  const totalCategories = categories.length;
  const featuredCount = categories.filter((c) => c.is_featured).length;
  const publishedCount = categories.filter((c) => c.published).length;
  const footerCount = categories.filter((c) => c.show_in_footer).length;

  if (adminLoading || isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-6 w-48 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-64" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200 sm:w-96" />
          </div>
          <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 sm:w-32" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-gray-200 sm:h-24"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-gray-200 sm:h-96" />
      </div>
    );
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
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
            Categories Management
          </h1>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            Organize your products with categories
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="w-full bg-[#2F2582] hover:bg-[#241c66] sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Total</p>
          <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl">
            {totalCategories}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            Featured
          </p>
          <p className="mt-1 text-lg font-bold text-yellow-600 sm:text-2xl">
            {featuredCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            Published
          </p>
          <p className="mt-1 text-lg font-bold text-green-600 sm:text-2xl">
            {publishedCount}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            In Footer
          </p>
          <p
            className={`mt-1 text-lg font-bold sm:text-2xl ${footerCount >= 4 ? "text-orange-600" : "text-blue-600"}`}
          >
            {footerCount}
            <span className="text-sm text-gray-400">/4</span>
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
        />
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-base font-semibold sm:text-lg">
            Categories ({filteredCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <FolderTree className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-base font-medium text-gray-900 sm:text-lg">
                {searchQuery ? "No categories found" : "No categories yet"}
              </h3>
              <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Get started by creating your first category."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => handleOpenModal()}
                  className="mt-4 bg-[#2F2582] hover:bg-[#241c66]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="divide-y divide-gray-100 sm:hidden">
                {renderCategoryTree(categoryTree)}
              </div>

              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Category
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Slug
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Products
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {renderCategoryTree(categoryTree)}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Category Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
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
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                      placeholder="Enter category name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Slug
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                      placeholder="auto-generated-from-name"
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
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    placeholder="Enter category description"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-gray-500" />
                    <label className="block text-sm font-semibold text-gray-700">
                      Category Image
                    </label>
                  </div>

                  <FileUpload
                    label=""
                    accept="image/*"
                    bucket="products"
                    folder="categories"
                    currentUrl={formData.image_url}
                    onUploadComplete={(url) =>
                      setFormData({ ...formData, image_url: url })
                    }
                    onRemove={() => setFormData({ ...formData, image_url: "" })}
                    maxSizeMB={5}
                    allowedTypes={[
                      "image/jpeg",
                      "image/png",
                      "image/webp",
                      "image/jpg",
                    ]}
                    previewType="image"
                    registerWithMediaLibrary
                    mediaLibraryTags={["category", "product-category"]}
                  />

                  {!formData.image_url && (
                    <div className="mt-3">
                      <label className="mb-2 block text-xs font-medium text-gray-600">
                        Or enter image URL manually
                      </label>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            image_url: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Parent Category
                  </label>
                  <Select
                    value={formData.parent_id || "none"}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        parent_id:
                          value === "none" ? null : (value as CategoryId),
                      })
                    }
                  >
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Select parent category (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Root Category)</SelectItem>
                      {flattenCategoryTree(
                        categoryTree,
                        editingCategory?.id,
                      ).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {"\u00A0".repeat(cat.level * 2) + cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select a parent to create a subcategory (max 2 levels deep)
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sort_order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_featured: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                    />
                    <label
                      htmlFor="is_featured"
                      className="text-sm font-medium text-gray-700"
                    >
                      Featured on Homepage
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      id="published"
                      checked={formData.published}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          published: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                    />
                    <label
                      htmlFor="published"
                      className="text-sm font-medium text-gray-700"
                    >
                      Published
                    </label>
                  </div>

                  <div className="flex items-center gap-3 pt-8">
                    <input
                      type="checkbox"
                      id="show_in_footer"
                      checked={formData.show_in_footer}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          show_in_footer: e.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                    />
                    <label
                      htmlFor="show_in_footer"
                      className="text-sm font-medium text-gray-700"
                    >
                      Show in Footer
                    </label>
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    disabled={
                      actionLoading.update === "update" ||
                      actionLoading.create === "create"
                    }
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      actionLoading.update === "update" ||
                      actionLoading.create === "create"
                    }
                    className="w-full bg-[#2F2582] hover:bg-[#241c66] sm:flex-1"
                  >
                    {actionLoading.update === "update" ||
                    actionLoading.create === "create"
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
        isLoading={
          actionLoading[`delete-${confirmAction.categoryId}`] === "delete"
        }
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
