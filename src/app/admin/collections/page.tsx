"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, FolderHeart, Eye, EyeOff, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  getAllCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  getProducts,
  getCollectionProductMappings,
  addProductToCollection,
  removeProductFromCollection,
  type Collection,
  type Product,
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

export default function AdminCollectionsPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toasts, addToast, removeToast } = useToast();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [collectionProducts, setCollectionProducts] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<{ [key: string]: string | null }>({});
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | null;
    collectionId?: string;
    collectionName?: string;
  }>({ type: null });

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    banner_url: "",
    is_active: true,
    sort_order: 0,
    start_date: "",
    end_date: "",
    productIds: [] as string[],
  });

  // Fetch collections and products on admin access
  useEffect(() => {
    if (isAdmin) {
      fetchCollections();
      fetchProducts();
    }
  }, [isAdmin]);

  const fetchCollections = async () => {
    setIsLoading(true);
    const result = await getAllCollections();
    if (result.success && result.data) {
      setCollections(result.data);
      // Fetch collection-product mappings
      await fetchCollectionProducts(result.data.map(c => c.id));
    } else {
      addToast(result.error || "Failed to fetch collections", "error");
    }
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    const result = await getProducts();
    if (result.success && result.data) {
      setProducts(result.data);
    }
  };

  const fetchCollectionProducts = async (collectionIds: string[]) => {
    const result = await getCollectionProductMappings(collectionIds);
    if (result.success && result.data) {
      setCollectionProducts(result.data);
    }
  };

  // Open modal for adding/editing
  const handleOpenModal = (collection?: Collection) => {
    if (collection) {
      setEditingCollection(collection);
      setFormData({
        name: collection.name,
        slug: collection.slug,
        description: collection.description || "",
        image_url: collection.image_url || "",
        banner_url: collection.banner_url || "",
        is_active: collection.is_active,
        sort_order: collection.sort_order,
        start_date: collection.start_date || "",
        end_date: collection.end_date || "",
        productIds: collectionProducts[collection.id] || [],
      });
    } else {
      setEditingCollection(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        image_url: "",
        banner_url: "",
        is_active: true,
        sort_order: 0,
        start_date: "",
        end_date: "",
        productIds: [],
      });
    }
    setProductSearchQuery("");
    setShowModal(true);
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionKey = editingCollection ? "update" : "create";
    setActionLoading((prev) => ({ ...prev, [actionKey]: actionKey }));

    try {
      const collectionData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description,
        image_url: formData.image_url,
        banner_url: formData.banner_url,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      };

      if (editingCollection) {
        const result = await updateCollection(editingCollection.id, collectionData);
        if (result.success) {
          // Update product associations
          await updateCollectionProducts(editingCollection.id, formData.productIds);
          addToast("Collection updated successfully", "success");
          fetchCollections();
          setShowModal(false);
        } else {
          addToast(result.error || "Failed to update collection", "error");
        }
      } else {
        const result = await createCollection(collectionData);
        if (result.success && result.data) {
          // Add product associations for new collection
          for (let i = 0; i < formData.productIds.length; i++) {
            await addProductToCollection(formData.productIds[i], result.data.id, i + 1);
          }
          addToast("Collection created successfully", "success");
          fetchCollections();
          setShowModal(false);
        } else {
          addToast(result.error || "Failed to create collection", "error");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      addToast("An unexpected error occurred", "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [actionKey]: null }));
    }
  };

  // Update collection products
  const updateCollectionProducts = async (collectionId: string, newProductIds: string[]) => {
    const currentProductIds = collectionProducts[collectionId] || [];
    
    // Remove products that are no longer selected
    for (const productId of currentProductIds) {
      if (!newProductIds.includes(productId)) {
        await removeProductFromCollection(productId, collectionId);
      }
    }
    
    // Add new products with featured order
    for (let i = 0; i < newProductIds.length; i++) {
      if (!currentProductIds.includes(newProductIds[i])) {
        await addProductToCollection(newProductIds[i], collectionId, i + 1);
      }
    }
  };

  // Handle delete
  const handleDelete = (id: string, name: string) => {
    setConfirmAction({
      type: "delete",
      collectionId: id,
      collectionName: name,
    });
  };

  const executeDelete = async () => {
    if (!confirmAction.collectionId) return;
    setActionLoading((prev) => ({ ...prev, [`delete-${confirmAction.collectionId}`]: "delete" }));

    try {
      const result = await deleteCollection(confirmAction.collectionId);
      if (result.success) {
        addToast("Collection deleted successfully", "success");
        fetchCollections();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to delete collection", "error");
        setConfirmAction({ type: null });
      }
    } finally {
      setActionLoading((prev) => ({ ...prev, [`delete-${confirmAction.collectionId}`]: null }));
    }
  };

  // Toggle active status
  const toggleActive = async (collection: Collection) => {
    const result = await updateCollection(collection.id, { is_active: !collection.is_active });
    if (result.success) {
      addToast(`Collection ${!collection.is_active ? "activated" : "deactivated"}`, "success");
      fetchCollections();
    } else {
      addToast("Failed to update collection", "error");
    }
  };

  // Filter collections by search query
  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fallbackImage = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop";

  // Stats
  const totalCollections = collections.length;
  const activeCount = collections.filter((c) => c.is_active).length;

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
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200 sm:h-24" />
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
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">Collections Management</h1>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">Manage product collections and featured sets</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full bg-[#2F2582] hover:bg-[#241c66] sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Collection
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Total Collections</p>
          <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl">{totalCollections}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Active</p>
          <p className="mt-1 text-lg font-bold text-green-600 sm:text-2xl">{activeCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search collections..."
          className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
        />
      </div>

      {/* Collections List */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-base font-semibold sm:text-lg">
            Collections ({filteredCollections.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredCollections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <FolderHeart className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-base font-medium text-gray-900 sm:text-lg">
                {searchQuery ? "No collections found" : "No collections yet"}
              </h3>
              <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                {searchQuery ? "Try a different search term" : "Get started by creating your first collection."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => handleOpenModal()}
                  className="mt-4 bg-[#2F2582] hover:bg-[#241c66]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Collection
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="divide-y divide-gray-100 sm:hidden">
                {filteredCollections.map((collection) => (
                  <div key={collection.id} className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={collection.image_url || fallbackImage}
                          alt={collection.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900 truncate">{collection.name}</h3>
                          <button
                            onClick={() => toggleActive(collection)}
                            className={`shrink-0 rounded-full p-1 transition-colors ${
                              collection.is_active
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {collection.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                          {collection.slug}
                        </code>
                        <p className="text-xs text-gray-500 mt-1">{collection.product_count || 0} products</p>
                      </div>
                    </div>
                    
                    {collection.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{collection.description}</p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(collection)}
                        className="flex-1 h-9"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(collection.id, collection.name)}
                        disabled={actionLoading[`delete-${collection.id}`] === "delete"}
                        className="flex-1 h-9 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Collection</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Products</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCollections.map((collection) => (
                      <tr key={collection.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              <Image
                                src={collection.image_url || fallbackImage}
                                alt={collection.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{collection.name}</div>
                              {collection.description && (
                                <div className="max-w-xs truncate text-xs text-gray-500">
                                  {collection.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                            {collection.slug}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{collection.product_count || 0}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActive(collection)}
                            className={`rounded-full p-1 transition-colors ${
                              collection.is_active
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-400 hover:bg-green-50"
                            }`}
                            title={collection.is_active ? "Deactivate" : "Activate"}
                          >
                            {collection.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenModal(collection)}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(collection.id, collection.name)}
                              disabled={actionLoading[`delete-${collection.id}`] === "delete"}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-red-600"
                            >
                              {actionLoading[`delete-${collection.id}`] === "delete" ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Collection Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {editingCollection ? "Edit Collection" : "Add New Collection"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Collection Name *
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
                      placeholder="Enter collection name"
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
                    placeholder="Enter collection description"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Banner URL</label>
                    <input
                      type="url"
                      value={formData.banner_url}
                      onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>
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

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    />
                  </div>
                </div>

                {/* Product Selection */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Products in Collection
                  </label>
                  
                  {/* Search Products */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full rounded-lg border-2 border-gray-200 py-2 pl-10 pr-4 text-sm transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    />
                  </div>

                  {/* Product List */}
                  <div className="max-h-60 overflow-y-auto rounded-lg border-2 border-gray-200 p-3">
                    {products.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-2">No products available</p>
                    ) : (
                      <div className="space-y-2">
                        {products
                          .filter((product) =>
                            product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
                          )
                          .map((product) => {
                            const isSelected = formData.productIds.includes(product.id);
                            return (
                              <label
                                key={product.id}
                                className={`flex items-center gap-3 cursor-pointer rounded-lg border-2 p-3 transition-all ${
                                  isSelected
                                    ? "border-[#2F2582] bg-[#2F2582]/5"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        productIds: [...formData.productIds, product.id],
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        productIds: formData.productIds.filter((id) => id !== product.id),
                                      });
                                    }
                                  }}
                                  className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                                />
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-gray-100">
                                  <Image
                                    src={product.image_url || "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop"}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-medium truncate ${isSelected ? "text-[#2F2582]" : "text-gray-900"}`}>
                                    {product.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    ₹{product.price.toLocaleString()}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                      </div>
                    )}
                  </div>
                  {formData.productIds.length > 0 && (
                    <p className="mt-2 text-xs text-[#2F2582] font-medium">
                      {formData.productIds.length} product(s) selected
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active (visible to customers)
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    disabled={actionLoading.update === "update" || actionLoading.create === "create"}
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading.update === "update" || actionLoading.create === "create"}
                    className="w-full bg-[#2F2582] hover:bg-[#241c66] sm:flex-1"
                  >
                    {actionLoading.update === "update" || actionLoading.create === "create"
                      ? "Saving..."
                      : editingCollection
                      ? "Update Collection"
                      : "Create Collection"}
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
        title="Delete Collection?"
        message={`Are you sure you want to delete "${confirmAction.collectionName}"? Products in this collection will be unassigned.`}
        confirmText="Delete"
        variant="danger"
        isLoading={actionLoading[`delete-${confirmAction.collectionId}`] === "delete"}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
