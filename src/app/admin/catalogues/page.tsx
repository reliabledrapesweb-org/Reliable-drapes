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
import {
  getAllCatalogueCategories,
  createCatalogueCategory,
  updateCatalogueCategory,
  deleteCatalogueCategory,
  type CatalogueCategory,
  type CreateCatalogueCategoryInput,
} from "@/lib/actions/catalogue-categories";
import type { CatalogueCategoryId } from "@/lib/types/category.types";
import {
  buildCategoryTree,
  flattenCategoryTree,
} from "@/lib/utils/catalogue-category.utils";
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
  Search,
  Plus,
  BookOpen,
  Download,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  X,
  FileText,
  Tag,
  Image as ImageIcon,
  FolderOpen,
  GripVertical,
  ChevronRight,
  ChevronDown,
  Folder,
} from "lucide-react";
import { FileUpload } from "@/components/admin/FileUpload";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { type MediaItem } from "@/lib/actions/media";

type Tab = "catalogues" | "categories";

export default function CataloguesPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState<Tab>("catalogues");

  // Catalogues state
  const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
  const [categories, setCategories] = useState<CatalogueCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    "pdf" | "thumbnail"
  >("thumbnail");
  const [editingCatalogue, setEditingCatalogue] = useState<Catalogue | null>(
    null,
  );
  const [editingCategory, setEditingCategory] =
    useState<CatalogueCategory | null>(null);
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: string | null;
  }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const { toasts, addToast, removeToast } = useToast();

  // Form state for catalogues
  const [formData, setFormData] = useState<CreateCatalogueInput>({
    title: "",
    description: "",
    category_id: "",
    file_url: "",
    thumbnail_url: "",
    badge: null,
    discount_value: "",
  });

  // Form state for categories
  const [categoryFormData, setCategoryFormData] =
    useState<CreateCatalogueCategoryInput>({
      name: "",
      description: "",
      sort_order: 0,
      is_active: true,
      parent_id: null,
    });

  // Tree expansion state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    setIsLoading(true);
    await Promise.all([fetchCatalogues(), fetchCategories()]);
    setIsLoading(false);
  };

  const fetchCatalogues = async () => {
    const result = await getAllCatalogues();
    if (result.success && result.data) {
      setCatalogues(result.data);
    } else {
      addToast(result.error || "Failed to fetch catalogues", "error");
    }
  };

  const fetchCategories = async () => {
    const result = await getAllCatalogueCategories();
    if (result.success && result.data) {
      setCategories(result.data);
      // Auto-expand categories that have children
      const tree = buildCategoryTree(result.data);
      const hasChildren = new Set<string>();
      const checkChildren = (cats: CatalogueCategory[]) => {
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
  };

  // Catalogue Modal Handlers
  const handleOpenModal = (catalogue?: Catalogue) => {
    if (catalogue) {
      setEditingCatalogue(catalogue);
      setFormData({
        title: catalogue.title,
        description: catalogue.description || catalogue.subtitle || "",
        category_id: catalogue.category_id || "",
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
        category_id: "",
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

  // Category Modal Handlers
  const handleOpenCategoryModal = (category?: CatalogueCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({
        name: category.name,
        description: category.description || "",
        sort_order: category.sort_order,
        is_active: category.is_active ?? true,
        parent_id: category.parent_id,
      });
    } else {
      setEditingCategory(null);
      setCategoryFormData({
        name: "",
        description: "",
        sort_order: 0,
        is_active: true,
        parent_id: null,
      });
    }
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleMediaSelect = (media: MediaItem[]) => {
    if (media.length === 0) return;

    if (mediaPickerTarget === "pdf") {
      setFormData({ ...formData, file_url: media[0].file_url });
    } else {
      setFormData({ ...formData, thumbnail_url: media[0].file_url });
    }
  };

  // Catalogue Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionKey = editingCatalogue ? "update" : "create";
    setActionLoading((prev) => ({ ...prev, [actionKey]: actionKey }));

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
      setActionLoading((prev) => ({ ...prev, [actionKey]: null }));
    }
  };

  // Category Submit Handler
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionKey = editingCategory ? "updateCategory" : "createCategory";
    setActionLoading((prev) => ({ ...prev, [actionKey]: actionKey }));

    try {
      if (editingCategory) {
        const result = await updateCatalogueCategory({
          id: editingCategory.id,
          ...categoryFormData,
        });
        if (result.success) {
          addToast("Category updated successfully", "success");
          fetchCategories();
          handleCloseCategoryModal();
        } else {
          addToast(result.error || "Failed to update category", "error");
        }
      } else {
        const result = await createCatalogueCategory(categoryFormData);
        if (result.success) {
          addToast("Category created successfully", "success");
          fetchCategories();
          handleCloseCategoryModal();
        } else {
          addToast(result.error || "Failed to create category", "error");
        }
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: null }));
    }
  };

  const filteredCatalogues = catalogues.filter((catalogue) => {
    const searchLower = searchQuery.toLowerCase();
    const categoryName =
      categories.find((c) => c.id === catalogue.category_id)?.name || "";
    return (
      catalogue.title.toLowerCase().includes(searchLower) ||
      categoryName.toLowerCase().includes(searchLower) ||
      (catalogue.description &&
        catalogue.description.toLowerCase().includes(searchLower)) ||
      (catalogue.subtitle &&
        catalogue.subtitle.toLowerCase().includes(searchLower))
    );
  });

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
      (category.description &&
        category.description
          .toLowerCase()
          .includes(categorySearchQuery.toLowerCase())),
  );

  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "toggle" | "deleteCategory" | null;
    catalogueId?: string;
    categoryId?: string;
    catalogueName?: string;
    categoryName?: string;
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
    setActionLoading((prev) => ({
      ...prev,
      [`delete-${confirmAction.catalogueId}`]: "delete",
    }));

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
      setActionLoading((prev) => ({
        ...prev,
        [`delete-${confirmAction.catalogueId}`]: null,
      }));
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
    if (!confirmAction.catalogueId || confirmAction.isActive === undefined)
      return;
    setActionLoading((prev) => ({
      ...prev,
      [`toggle-${confirmAction.catalogueId}`]: "toggle",
    }));

    try {
      const result = await updateCatalogue({
        id: confirmAction.catalogueId,
        is_active: confirmAction.isActive,
      });
      if (result.success) {
        addToast(
          `Catalogue ${confirmAction.isActive ? "activated" : "deactivated"}`,
          "success",
        );
        fetchCatalogues();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to update catalogue", "error");
        setConfirmAction({ type: null });
      }
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`toggle-${confirmAction.catalogueId}`]: null,
      }));
    }
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setConfirmAction({
      type: "deleteCategory",
      categoryId: id,
      categoryName: name,
    });
  };

  const toggleCategoryExpanded = (categoryId: string) => {
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
  const categoryTree = buildCategoryTree(categories);

  // Recursive component for rendering category tree
  const renderCategoryTree = (
    cats: CatalogueCategory[],
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
            key={category.id}
            className="divide-y divide-gray-100 sm:hidden"
            style={{ marginLeft: level > 0 ? `${level * 16}px` : undefined }}
          >
            <div className="space-y-3 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                  <Folder className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      {category.name}
                    </h3>
                    {!category.is_active && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {category.catalogue_count || 0} catalogues
                    {hasChildren && (
                      <span className="ml-2 text-blue-600">
                        {category.children?.length} subcategories
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCategoryExpanded(category.id)}
                    className="h-8 px-3"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronDown className="mr-1 h-4 w-4" />
                        Hide
                      </>
                    ) : (
                      <>
                        <ChevronRight className="mr-1 h-4 w-4" />
                        Show
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenCategoryModal(category)}
                  className="h-8 px-3"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDeleteCategory(category.id, category.name)
                  }
                  disabled={
                    !!actionLoading[`deleteCategory-${category.id}`] ||
                    (category.catalogue_count || 0) > 0 ||
                    hasChildren
                  }
                  className="h-8 border-red-200 px-3 text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <>
            <tr key={category.id} className="hover:bg-gray-50">
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
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100"
                    style={{ marginLeft: paddingLeft }}
                  >
                    <Folder className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {category.name}
                    </p>
                    <p className="text-xs text-gray-500">{category.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="max-w-xs truncate text-sm text-gray-600">
                  {category.description || "-"}
                </p>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {category.catalogue_count || 0} catalogues
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    category.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {category.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenCategoryModal(category)}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDeleteCategory(category.id, category.name)
                    }
                    disabled={
                      !!actionLoading[`deleteCategory-${category.id}`] ||
                      (category.catalogue_count || 0) > 0 ||
                      hasChildren
                    }
                    className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 disabled:opacity-50"
                  >
                    {actionLoading[`deleteCategory-${category.id}`] ? (
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

  const executeDeleteCategory = async () => {
    if (!confirmAction.categoryId) return;
    setActionLoading((prev) => ({
      ...prev,
      [`deleteCategory-${confirmAction.categoryId}`]: "deleteCategory",
    }));

    try {
      const result = await deleteCatalogueCategory(confirmAction.categoryId);
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
        [`deleteCategory-${confirmAction.categoryId}`]: null,
      }));
    }
  };

  if (adminLoading || isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-48" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200 sm:w-96" />
          </div>
          <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 sm:w-32" />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[...Array(3)].map((_, i) => (
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
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
            Catalogues
          </h1>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            Manage your product catalogues and categories
          </p>
        </div>
        <Button
          onClick={() =>
            activeTab === "catalogues"
              ? handleOpenModal()
              : handleOpenCategoryModal()
          }
          className="w-full bg-[#2F2582] hover:bg-[#251e66] sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          {activeTab === "catalogues" ? "Add Catalogue" : "Add Category"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("catalogues")}
            className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "catalogues"
                ? "border-[#2F2582] text-[#2F2582]"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Catalogues
              <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {catalogues.length}
              </span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`border-b-2 px-1 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === "categories"
                ? "border-[#2F2582] text-[#2F2582]"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Categories
              <span className="ml-2 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {categories.length}
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      {activeTab === "catalogues" ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 sm:text-sm">
              Total
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl">
              {catalogues.length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 sm:text-sm">
              Active
            </p>
            <p className="mt-1 text-lg font-bold text-green-600 sm:text-2xl">
              {catalogues.filter((c) => c.is_active).length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 sm:text-sm">
              Downloads
            </p>
            <p className="mt-1 text-lg font-bold text-[#2F2582] sm:text-2xl">
              {catalogues.reduce((sum, c) => sum + c.download_count, 0)}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 sm:text-sm">
              Total
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl">
              {categories.length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 sm:text-sm">
              Active
            </p>
            <p className="mt-1 text-lg font-bold text-green-600 sm:text-2xl">
              {categories.filter((c) => c.is_active).length}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
            <p className="text-xs font-medium text-gray-600 sm:text-sm">
              With Catalogues
            </p>
            <p className="mt-1 text-lg font-bold text-[#2F2582] sm:text-2xl">
              {categories.filter((c) => (c.catalogue_count || 0) > 0).length}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === "catalogues"
                ? "Search catalogues by title or category..."
                : "Search categories by name..."
            }
            value={
              activeTab === "catalogues" ? searchQuery : categorySearchQuery
            }
            onChange={(e) =>
              activeTab === "catalogues"
                ? setSearchQuery(e.target.value)
                : setCategorySearchQuery(e.target.value)
            }
            className="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm transition-all focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none dark:border-gray-800 dark:bg-gray-900"
          />
        </div>
      </div>

      {/* Content */}
      {activeTab === "catalogues" ? (
        /* Catalogues List */
        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-base font-semibold sm:text-lg">
              Catalogues ({filteredCatalogues.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCatalogues.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                {searchQuery ? (
                  <>
                    <Search className="h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-base font-medium text-gray-900 sm:text-lg">
                      No matching catalogues
                    </h3>
                    <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                      No catalogues found for &quot;{searchQuery}&quot;
                    </p>
                  </>
                ) : (
                  <>
                    <BookOpen className="h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-base font-medium text-gray-900 sm:text-lg">
                      No catalogues yet
                    </h3>
                    <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                      Get started by creating your first catalogue.
                    </p>
                  </>
                )}
                {!searchQuery && (
                  <Button
                    onClick={() => handleOpenModal()}
                    className="mt-4 bg-[#2F2582] hover:bg-[#251e66]"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Catalogue
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="divide-y divide-gray-100 sm:hidden">
                  {filteredCatalogues.map((catalogue) => {
                    const categoryName =
                      categories.find((c) => c.id === catalogue.category_id)
                        ?.name || "Uncategorized";
                    return (
                      <div key={catalogue.id} className="space-y-3 p-4">
                        <div className="flex items-start gap-3">
                          <div className="shrink-0">
                            {catalogue.thumbnail_url || catalogue.image_url ? (
                              <img
                                src={
                                  catalogue.thumbnail_url ||
                                  catalogue.image_url ||
                                  ""
                                }
                                alt={catalogue.title}
                                className="h-14 w-14 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100">
                                <FileText className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-medium text-gray-900">
                                {catalogue.title}
                              </h3>
                              {catalogue.badge && (
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                    catalogue.badge === "new"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-orange-100 text-orange-800"
                                  }`}
                                >
                                  {catalogue.badge === "new"
                                    ? "New"
                                    : catalogue.discount_value}
                                </span>
                              )}
                            </div>
                            <span className="mt-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              <Tag className="mr-1 h-3 w-3" />
                              {categoryName}
                            </span>
                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Download className="h-3 w-3" />
                                {catalogue.download_count}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(catalogue)}
                            disabled={!!actionLoading[`toggle-${catalogue.id}`]}
                            className={`h-8 px-3 ${
                              catalogue.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {catalogue.is_active ? (
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
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenModal(catalogue)}
                              className="h-8 px-3"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDelete(catalogue.id, catalogue.title)
                              }
                              disabled={
                                !!actionLoading[`delete-${catalogue.id}`]
                              }
                              className="h-8 border-red-200 px-3 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden overflow-x-auto sm:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Catalogue
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Category
                        </th>
                        <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase lg:table-cell">
                          Downloads
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
                      {filteredCatalogues.map((catalogue) => {
                        const categoryName =
                          categories.find((c) => c.id === catalogue.category_id)
                            ?.name || "Uncategorized";
                        return (
                          <tr key={catalogue.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-3">
                                <div className="shrink-0">
                                  {catalogue.thumbnail_url ||
                                  catalogue.image_url ? (
                                    <img
                                      src={
                                        catalogue.thumbnail_url ||
                                        catalogue.image_url ||
                                        ""
                                      }
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
                                      <span
                                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                          catalogue.badge === "new"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-orange-100 text-orange-800"
                                        }`}
                                      >
                                        {catalogue.badge === "new"
                                          ? "New"
                                          : catalogue.discount_value}
                                      </span>
                                    )}
                                  </div>
                                  {(catalogue.description ||
                                    catalogue.subtitle) && (
                                    <p className="truncate text-xs text-gray-500">
                                      {catalogue.description ||
                                        catalogue.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                <Tag className="mr-1 h-3 w-3" />
                                {categoryName}
                              </span>
                            </td>
                            <td className="hidden px-4 py-3 lg:table-cell">
                              <div className="flex items-center gap-1 text-sm text-gray-900">
                                <Download className="h-3 w-3" />
                                {catalogue.download_count}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleActive(catalogue)}
                                disabled={
                                  !!actionLoading[`toggle-${catalogue.id}`]
                                }
                                className={`h-8 cursor-pointer px-3 disabled:opacity-50 ${
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
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenModal(catalogue)}
                                  className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDelete(catalogue.id, catalogue.title)
                                  }
                                  disabled={
                                    !!actionLoading[`delete-${catalogue.id}`]
                                  }
                                  className="h-8 w-8 p-0 text-gray-600 hover:text-red-600"
                                >
                                  {actionLoading[`delete-${catalogue.id}`] ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Categories List */
        <Card>
          <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
            <CardTitle className="text-base font-semibold sm:text-lg">
              Categories ({filteredCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                {categorySearchQuery ? (
                  <>
                    <Search className="h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-base font-medium text-gray-900 sm:text-lg">
                      No matching categories
                    </h3>
                    <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                      No categories found for &quot;{categorySearchQuery}&quot;
                    </p>
                  </>
                ) : (
                  <>
                    <FolderOpen className="h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 text-base font-medium text-gray-900 sm:text-lg">
                      No categories yet
                    </h3>
                    <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                      Get started by creating your first category.
                    </p>
                  </>
                )}
                {!categorySearchQuery && (
                  <Button
                    onClick={() => handleOpenCategoryModal()}
                    className="mt-4 bg-[#2F2582] hover:bg-[#251e66]"
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
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Catalogues
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
      )}

      {/* Catalogue Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-4xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {editingCatalogue ? "Edit Catalogue" : "Add New Catalogue"}
                </h2>
                <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                  {editingCatalogue
                    ? "Update catalogue information and files"
                    : "Upload a new catalogue with thumbnail"}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                {/* Basic Information Section */}
                <div className="rounded-lg border-2 border-gray-200 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Basic Information
                  </h3>

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
                          className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                          placeholder="Enter catalogue title"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Category *
                        </label>
                        <Select
                          value={formData.category_id || "none"}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              category_id: value === "none" ? "" : value,
                            })
                          }
                        >
                          <SelectTrigger className="border-2">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              Select a category
                            </SelectItem>
                            {flattenCategoryTree(categoryTree)
                              .filter((c) => {
                                const cat = categories.find(
                                  (cat) => cat.id === c.id,
                                );
                                return cat?.is_active !== false;
                              })
                              .map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {"\u00A0".repeat(category.level * 2) +
                                    category.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {categories.length === 0 && (
                          <p className="mt-1 text-xs text-red-500">
                            No categories available.{" "}
                            <button
                              type="button"
                              onClick={() => {
                                handleCloseModal();
                                setActiveTab("categories");
                                handleOpenCategoryModal();
                              }}
                              className="text-[#2F2582] underline"
                            >
                              Create one first
                            </button>
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                        placeholder="Brief description of the catalogue"
                      />
                    </div>
                  </div>
                </div>

                {/* Files Section */}
                <div className="rounded-lg border-2 border-gray-200 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Files & Media
                  </h3>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Catalogue File */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">
                          Catalogue File (PDF){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMediaPickerTarget("pdf");
                            setShowMediaPicker(true);
                          }}
                          className="h-8 border-[#2F2582] text-xs text-[#2F2582] hover:bg-[#2F2582]/10"
                        >
                          <FileText className="mr-1.5 h-3 w-3" />
                          Choose from Library
                        </Button>
                      </div>
                      <FileUpload
                        label=""
                        accept=".pdf,application/pdf"
                        bucket="catalogues"
                        folder="files"
                        currentUrl={formData.file_url}
                        onUploadComplete={(url) =>
                          setFormData({ ...formData, file_url: url })
                        }
                        onRemove={() =>
                          setFormData({ ...formData, file_url: "" })
                        }
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
                              setFormData({
                                ...formData,
                                file_url: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                            placeholder="https://example.com/catalogue.pdf"
                          />
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Image */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">
                          Thumbnail Image
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setMediaPickerTarget("thumbnail");
                            setShowMediaPicker(true);
                          }}
                          className="h-8 border-[#2F2582] text-xs text-[#2F2582] hover:bg-[#2F2582]/10"
                        >
                          <ImageIcon className="mr-1.5 h-3 w-3" />
                          Choose from Library
                        </Button>
                      </div>
                      <FileUpload
                        label=""
                        accept="image/*"
                        bucket="catalogues"
                        folder="thumbnails"
                        currentUrl={formData.thumbnail_url}
                        onUploadComplete={(url) =>
                          setFormData({ ...formData, thumbnail_url: url })
                        }
                        onRemove={() =>
                          setFormData({ ...formData, thumbnail_url: "" })
                        }
                        maxSizeMB={5}
                        allowedTypes={[
                          "image/jpeg",
                          "image/png",
                          "image/webp",
                          "image/jpg",
                        ]}
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
                              setFormData({
                                ...formData,
                                thumbnail_url: e.target.value,
                              })
                            }
                            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                            placeholder="https://example.com/thumbnail.jpg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Display Options Section */}
                <div className="rounded-lg border-2 border-gray-200 p-4">
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">
                    Display Options
                  </h3>

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
                            badge:
                              value === "none"
                                ? null
                                : (value as "new" | "discount"),
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
                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                        placeholder="-30%"
                        disabled={formData.badge !== "discount"}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Only shown when badge is set to &quot;Discount&quot;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={!!actionLoading.create || !!actionLoading.update}
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !!actionLoading.create ||
                      !!actionLoading.update ||
                      !formData.file_url ||
                      !formData.category_id
                    }
                    className="w-full bg-[#2F2582] hover:bg-[#251e66] disabled:opacity-50 sm:flex-1"
                  >
                    {actionLoading.create || actionLoading.update ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {editingCatalogue ? "Updating..." : "Creating..."}
                      </div>
                    ) : (
                      <>
                        {editingCatalogue
                          ? "Update Catalogue"
                          : "Create Catalogue"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h2>
                <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
                  {editingCategory
                    ? "Update category information"
                    : "Create a new catalogue category"}
                </p>
              </div>
              <button
                onClick={handleCloseCategoryModal}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleCategorySubmit} className="p-4 sm:p-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryFormData.name}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        description: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    placeholder="Brief description of the category"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Parent Category
                  </label>
                  <Select
                    value={categoryFormData.parent_id || "none"}
                    onValueChange={(value) =>
                      setCategoryFormData({
                        ...categoryFormData,
                        parent_id:
                          value === "none"
                            ? null
                            : (value as CatalogueCategoryId),
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={categoryFormData.sort_order}
                      onChange={(e) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          sort_order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Status
                    </label>
                    <Select
                      value={categoryFormData.is_active ? "active" : "inactive"}
                      onValueChange={(value) =>
                        setCategoryFormData({
                          ...categoryFormData,
                          is_active: value === "active",
                        })
                      }
                    >
                      <SelectTrigger className="border-2">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseCategoryModal}
                    disabled={
                      !!actionLoading.createCategory ||
                      !!actionLoading.updateCategory
                    }
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !!actionLoading.createCategory ||
                      !!actionLoading.updateCategory ||
                      !categoryFormData.name
                    }
                    className="w-full bg-[#2F2582] hover:bg-[#251e66] disabled:opacity-50 sm:flex-1"
                  >
                    {actionLoading.createCategory ||
                    actionLoading.updateCategory ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {editingCategory ? "Updating..." : "Creating..."}
                      </div>
                    ) : (
                      <>
                        {editingCategory
                          ? "Update Category"
                          : "Create Category"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleMediaSelect}
        allowMultiple={false}
        allowedTypes={
          mediaPickerTarget === "pdf"
            ? ["application/pdf"]
            : ["image/jpeg", "image/png", "image/webp", "image/gif"]
        }
        title={
          mediaPickerTarget === "pdf"
            ? "Select Catalogue PDF"
            : "Select Thumbnail Image"
        }
      />
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
        title={
          confirmAction.isActive ? "Activate Catalogue" : "Deactivate Catalogue"
        }
        message={`${confirmAction.isActive ? "Activate" : "Deactivate"} "${confirmAction.catalogueName}"? ${confirmAction.isActive ? "It will be visible to users." : "It will be hidden from users."}`}
        confirmText={confirmAction.isActive ? "Activate" : "Deactivate"}
        cancelText="Cancel"
        variant="warning"
        onConfirm={executeToggle}
        onCancel={() => setConfirmAction({ type: null })}
      />

      <ConfirmationModal
        isOpen={confirmAction.type === "deleteCategory"}
        title="Delete Category"
        message={`Are you sure you want to delete "${confirmAction.categoryName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={executeDeleteCategory}
        onCancel={() => setConfirmAction({ type: null })}
      />
    </div>
  );
}
