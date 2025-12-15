"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Search, Package, Upload, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import * as XLSX from "xlsx";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
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

export default function AdminProductsPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toasts, addToast, removeToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<{[key: string]: string | null}>({});
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | null;
    productId?: string;
    productName?: string;
  }>({ type: null });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    price: 0,
  });

  // Fetch products on admin access
  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    setIsLoading(true);
    const result = await getProducts();
    if (result.success && result.data) {
      setProducts(result.data);
    } else {
      addToast(result.error || "Failed to fetch products", "error");
    }
    setIsLoading(false);
  };

  // Open modal for adding/editing
  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        image_url: product.image_url || "",
        price: product.price,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        image_url: "",
        price: 0,
      });
    }
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionKey = editingProduct ? "update" : "create";
    setActionLoading(prev => ({ ...prev, [actionKey]: actionKey }));

    try {
      if (editingProduct) {
        const result = await updateProduct(editingProduct.id, formData);
        if (result.success) {
          addToast("Product updated successfully", "success");
          fetchProducts();
          setShowModal(false);
        } else {
          addToast(result.error || "Failed to update product", "error");
        }
      } else {
        const result = await createProduct(formData);
        if (result.success) {
          addToast("Product created successfully", "success");
          fetchProducts();
          setShowModal(false);
        } else {
          addToast(result.error || "Failed to create product", "error");
        }
      }
    } catch (error) {
      console.error("Submit error:", error);
      addToast("An unexpected error occurred", "error");
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: null }));
    }
  };

  // Handle delete
  const handleDelete = (id: string, name: string) => {
    setConfirmAction({
      type: "delete",
      productId: id,
      productName: name,
    });
  };

  const executeDelete = async () => {
    if (!confirmAction.productId) return;
    setActionLoading(prev => ({ ...prev, [`delete-${confirmAction.productId}`]: "delete" }));

    try {
      const result = await deleteProduct(confirmAction.productId);
      if (result.success) {
        addToast("Product deleted successfully", "success");
        fetchProducts();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to delete product", "error");
        setConfirmAction({ type: null });
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${confirmAction.productId}`]: null }));
    }
  };

  // Handle file upload for import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate and transform data
        const validatedData = jsonData.map((row: any) => ({
          name: row.name || row.Name || row.product_name || "",
          description: row.description || row.Description || "",
          image_url: row.image_url || row.Image_URL || row.image || "",
          price: parseFloat(row.price || row.Price || 0),
        })).filter(item => item.name && item.price > 0);

        if (validatedData.length === 0) {
          addToast("No valid products found in file", "error");
          return;
        }

        setImportPreview(validatedData);
        setShowImportModal(true);
      } catch (error) {
        console.error("Error parsing file:", error);
        addToast("Failed to parse file. Please check the format.", "error");
      }
    };
    reader.readAsBinaryString(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle bulk import
  const handleBulkImport = async () => {
    setIsImporting(true);
    setActionLoading(prev => ({ ...prev, import: "import" }));

    try {
      let successCount = 0;
      let failCount = 0;

      for (const productData of importPreview) {
        const result = await createProduct(productData);
        if (result.success) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        addToast(`Successfully imported ${successCount} product(s)`, "success");
        fetchProducts();
      }
      if (failCount > 0) {
        addToast(`Failed to import ${failCount} product(s)`, "error");
      }

      setShowImportModal(false);
      setImportPreview([]);
    } catch (error) {
      console.error("Bulk import error:", error);
      addToast("Failed to import products", "error");
    } finally {
      setIsImporting(false);
      setActionLoading(prev => ({ ...prev, import: null }));
    }
  };

  // Export products to Excel
  const handleExportToExcel = () => {
    const exportData = products.map(p => ({
      name: p.name,
      description: p.description || "",
      image_url: p.image_url || "",
      price: p.price,
      created_at: new Date(p.created_at).toLocaleDateString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, `products_${new Date().toISOString().split('T')[0]}.xlsx`);
    addToast("Products exported successfully", "success");
  };

  // Download template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        name: "Sample Product 1",
        description: "Sample product description",
        image_url: "https://example.com/image.jpg",
        price: 1299,
      },
      {
        name: "Sample Product 2",
        description: "Another sample description",
        image_url: "https://example.com/image2.jpg",
        price: 2499,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products_import_template.xlsx");
    addToast("Template downloaded successfully", "success");
  };

  // Filter products by search query
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const fallbackImage = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop&crop=center";

  // Stats calculations
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const averagePrice = totalProducts > 0 ? totalValue / totalProducts : 0;

  // Loading check
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
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
          Products Management
        </h1>
        <p className="mt-2 text-gray-600">
          Manage your product catalog and inventory
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Products
            </CardTitle>
            <Package className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Value
            </CardTitle>
            <div className="flex h-5 w-5 items-center justify-center">
              <span className="text-lg font-bold text-green-600">₹</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(totalValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Price
            </CardTitle>
            <div className="flex h-5 w-5 items-center justify-center">
              <span className="text-sm font-bold text-purple-600">AVG</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(averagePrice)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table Card */}
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
                placeholder="Search products..."
                className="w-full rounded-lg border-2 border-gray-200 py-2 pl-10 pr-4 text-sm transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              {/* Import Button */}
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="border-[#2F2582] text-[#2F2582] hover:bg-[#2F2582]/10"
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>

              {/* Export Button */}
              <Button
                onClick={handleExportToExcel}
                variant="outline"
                disabled={products.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>

              {/* Add Product Button */}
              <Button
                onClick={() => handleOpenModal()}
                className="bg-[#2F2582] hover:bg-[#241c66]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F2582] border-t-transparent"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-gray-500">
                    {searchQuery ? "No products found" : "No products yet. Add your first product!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={product.image_url || fallbackImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate text-sm text-gray-500">
                        {product.description || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(product.price)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(product)}
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={actionLoading[`delete-${product.id}`] === "delete"}
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

      {/* Add/Edit Product Modal */}
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
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    placeholder="Enter product name"
                  />
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
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    placeholder="Enter product description"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) =>
                      setFormData({ ...formData, image_url: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image_url && (
                    <div className="mt-3 relative h-32 w-32 overflow-hidden rounded-lg border-2 border-gray-200">
                      <Image
                        src={formData.image_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    placeholder="0.00"
                  />
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
                      : editingProduct
                      ? "Update Product"
                      : "Create Product"}
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
        title="Delete Product?"
        message={`Are you sure you want to delete "${confirmAction.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={actionLoading[`delete-${confirmAction.productId}`] === "delete"}
      />

      {/* Import Preview Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Import Preview
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Review {importPreview.length} product(s) before importing
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportPreview([]);
                  }}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  disabled={isImporting}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Preview Table */}
              <div className="flex-1 overflow-auto rounded-lg border-2 border-gray-200 mb-4">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Price (₹)
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Image URL
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {importPreview.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <div className="max-w-xs truncate">{item.description}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <div className="max-w-xs truncate">{item.image_url || "—"}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Help Text */}
              <div className="mb-4 rounded-lg bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Upload className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Import Instructions:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Products with missing names or invalid prices will be skipped</li>
                      <li>Click "Download Template" to get the correct format</li>
                      <li>Supported formats: Excel (.xlsx, .xls) and CSV (.csv)</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadTemplate}
                  variant="outline"
                  disabled={isImporting}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
                <Button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportPreview([]);
                  }}
                  variant="outline"
                  disabled={isImporting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkImport}
                  disabled={isImporting || importPreview.length === 0}
                  className="flex-1 bg-[#2F2582] hover:bg-[#241c66]"
                >
                  {isImporting ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import {importPreview.length} Product(s)
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
