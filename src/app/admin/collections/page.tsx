"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, FolderHeart, Eye, EyeOff } from "lucide-react";
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
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Collections Management</h1>
        <p className="mt-2 text-gray-600">Manage product collections and featured sets</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Collections</CardTitle>
            <FolderHeart className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalCollections}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
            <Eye className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{activeCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Collections Table Card */}
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
                placeholder="Search collections..."
                className="w-full rounded-lg border-2 border-gray-200 py-2 pl-10 pr-4 text-sm transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
              />
            </div>

            {/* Add Collection Button */}
            <Button onClick={() => handleOpenModal()} className="bg-[#2F2582] hover:bg-[#241c66]">
              <Plus className="mr-2 h-4 w-4" />
              Add Collection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCollections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    {searchQuery ? "No collections found" : "No collections yet. Add your first collection!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCollections.map((collection) => (
                  <TableRow key={collection.id}>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                        {collection.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{collection.product_count || 0}</span>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(collection)}
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(collection.id, collection.name)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={actionLoading[`delete-${collection.id}`] === "delete"}
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

      {/* Add/Edit Collection Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                {editingCollection ? "Edit Collection" : "Add New Collection"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
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
