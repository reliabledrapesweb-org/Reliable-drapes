"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  Upload,
  Download,
  X,
  GripVertical,
  Star,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import * as XLSX from "xlsx";
import { FileUpload } from "@/components/admin/FileUpload";
import { uploadFile } from "@/lib/utils/storage";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getProductCategoryMappings,
  assignProductToCategory,
  removeProductFromCategory,
  getProductImages,
  addProductImage,
  updateProductImage,
  deleteProductImage,
  reorderProductImages,
  type Product,
  type Category,
  type ProductImage,
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCategories, setProductCategories] = useState<
    Record<string, string[]>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<{
    [key: string]: string | null;
  }>({});
  const [isImporting, setIsImporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [skippedRows, setSkippedRows] = useState<
    Array<{ row: number; reason: string; data: any }>
  >([]);
  const [importProgress, setImportProgress] = useState({
    current: 0,
    total: 0,
  });
  const [importSummary, setImportSummary] = useState<{
    success: number;
    failed: number;
    details: string[];
  } | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | null;
    productId?: string;
    productName?: string;
  }>({ type: null });

  const [productsMissingImages, setProductsMissingImages] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [showMassUploadModal, setShowMassUploadModal] = useState(false);
  const [massUploadFiles, setMassUploadFiles] = useState<File[]>([]);
  const [massUploadMatches, setMassUploadMatches] = useState<
    Record<string, File[]>
  >({});
  const [isMassUploading, setIsMassUploading] = useState(false);
  const [massUploadProgress, setMassUploadProgress] = useState({
    current: 0,
    total: 0,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    price: 0,
    categoryIds: [] as string[],
  });

  // Product images state
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [newImages, setNewImages] = useState<
    Array<{ url: string; alt_text: string; is_primary: boolean }>
  >([]);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(
    null,
  );

  // Fetch products and categories on admin access
  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchCategories();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    setIsLoading(true);
    const result = await getProducts();
    if (result.success && result.data) {
      setProducts(result.data);
      // Fetch product-category associations
      await fetchProductCategories(result.data.map((p) => p.id));
    } else {
      addToast(result.error || "Failed to fetch products", "error");
    }
    setIsLoading(false);
  };

  const fetchCategories = async () => {
    const result = await getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    }
  };

  const fetchProductCategories = async (productIds: string[]) => {
    const result = await getProductCategoryMappings(productIds);
    if (result.success && result.data) {
      setProductCategories(result.data);
    }
  };

  // Open modal for adding/editing
  const handleOpenModal = async (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        image_url: product.image_url || "",
        price: product.price,
        categoryIds: productCategories[product.id] || [],
      });

      // Fetch existing product images
      const imagesResult = await getProductImages(product.id);
      if (imagesResult.success && imagesResult.data) {
        setProductImages(imagesResult.data);
      } else {
        setProductImages([]);
      }
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        image_url: "",
        price: 0,
        categoryIds: [],
      });
      setProductImages([]);
    }
    setNewImages([]);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionKey = editingProduct ? "update" : "create";
    setActionLoading((prev) => ({ ...prev, [actionKey]: actionKey }));

    try {
      if (editingProduct) {
        const result = await updateProduct(editingProduct.id, {
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url,
          price: formData.price,
        });
        if (result.success) {
          // Update category associations
          await updateProductCategories(
            editingProduct.id,
            formData.categoryIds,
          );

          // Handle product images updates
          await handleProductImagesUpdate(editingProduct.id);

          addToast("Product updated successfully", "success");
          fetchProducts();
          setShowModal(false);
        } else {
          addToast(result.error || "Failed to update product", "error");
        }
      } else {
        const result = await createProduct({
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url,
          price: formData.price,
        });
        if (result.success && result.data) {
          // Add category associations for new product
          for (const categoryId of formData.categoryIds) {
            await assignProductToCategory(
              result.data.id,
              categoryId,
              formData.categoryIds[0] === categoryId,
            );
          }

          // Add new product images
          await handleProductImagesUpdate(result.data.id);

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
      setActionLoading((prev) => ({ ...prev, [actionKey]: null }));
    }
  };

  // Handle product images update
  const handleProductImagesUpdate = async (productId: string) => {
    // Add new images
    for (let i = 0; i < newImages.length; i++) {
      const img = newImages[i];
      await addProductImage({
        product_id: productId,
        image_url: img.url,
        alt_text: img.alt_text,
        is_primary: img.is_primary,
        sort_order: productImages.length + i,
      });
    }
  };

  // Update product categories
  const updateProductCategories = async (
    productId: string,
    newCategoryIds: string[],
  ) => {
    const currentCategoryIds = productCategories[productId] || [];

    // Remove categories that are no longer selected
    for (const categoryId of currentCategoryIds) {
      if (!newCategoryIds.includes(categoryId)) {
        await removeProductFromCategory(productId, categoryId);
      }
    }

    // Add new categories
    for (const categoryId of newCategoryIds) {
      if (!currentCategoryIds.includes(categoryId)) {
        await assignProductToCategory(
          productId,
          categoryId,
          newCategoryIds[0] === categoryId,
        );
      }
    }
  };

  // Add new image to the list
  const handleAddNewImage = (url: string) => {
    setNewImages([...newImages, { url, alt_text: "", is_primary: false }]);
  };

  // Remove new image from the list
  const handleRemoveNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  // Update new image alt text
  const handleUpdateNewImageAlt = (index: number, alt_text: string) => {
    const updated = [...newImages];
    updated[index].alt_text = alt_text;
    setNewImages(updated);
  };

  // Set new image as primary
  const handleSetNewImagePrimary = (index: number) => {
    const updated = newImages.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    setNewImages(updated);
  };

  // Delete existing product image
  const handleDeleteProductImage = async (imageId: string) => {
    const result = await deleteProductImage(imageId);
    if (result.success) {
      setProductImages(productImages.filter((img) => img.id !== imageId));
      addToast("Image deleted successfully", "success");
    } else {
      addToast(result.error || "Failed to delete image", "error");
    }
  };

  // Set existing image as primary
  const handleSetExistingImagePrimary = async (imageId: string) => {
    const result = await updateProductImage(imageId, { is_primary: true });
    if (result.success) {
      setProductImages(
        productImages.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        })),
      );
      addToast("Primary image updated", "success");
    } else {
      addToast(result.error || "Failed to update image", "error");
    }
  };

  // Update existing image alt text
  const handleUpdateExistingImageAlt = async (
    imageId: string,
    alt_text: string,
  ) => {
    const result = await updateProductImage(imageId, { alt_text });
    if (result.success) {
      setProductImages(
        productImages.map((img) =>
          img.id === imageId ? { ...img, alt_text } : img,
        ),
      );
    }
  };

  // Handle drag and drop for reordering
  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;

    const reordered = [...productImages];
    const draggedItem = reordered[draggedImageIndex];
    reordered.splice(draggedImageIndex, 1);
    reordered.splice(index, 0, draggedItem);

    setProductImages(reordered);
    setDraggedImageIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedImageIndex === null) return;

    // Update sort orders in database
    const imageOrders = productImages.map((img, index) => ({
      id: img.id,
      sort_order: index,
    }));

    await reorderProductImages(imageOrders);
    setDraggedImageIndex(null);
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
    setActionLoading((prev) => ({
      ...prev,
      [`delete-${confirmAction.productId}`]: "delete",
    }));

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
      setActionLoading((prev) => ({
        ...prev,
        [`delete-${confirmAction.productId}`]: null,
      }));
    }
  };

  // Handle file upload for import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setSkippedRows([]);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const skipped: Array<{ row: number; reason: string; data: any }> = [];

        // Validate and transform data
        const validatedData = jsonData
          .map((row: any, index: number) => {
            const name = row.name || row.Name || row.product_name || "";
            const price = parseFloat(row.price || row.Price || 0);
            const description = row.description || row.Description || "";
            const image_url = row.image_url || row.Image_URL || row.image || "";
            const categoriesStr =
              row.categories || row.Categories || row.category || "";

            // Check for validation issues
            if (!name.trim()) {
              skipped.push({
                row: index + 2,
                reason: "Missing product name",
                data: row,
              });
              return null;
            }
            if (isNaN(price) || price <= 0) {
              skipped.push({
                row: index + 2,
                reason: "Invalid or missing price",
                data: row,
              });
              return null;
            }

            // Image URL is now optional for bulk import
            // We will allow products without images and prompt for mass upload later

            // Parse and validate categories
            const categoryNames = categoriesStr
              ? categoriesStr
                  .split(",")
                  .map((c: string) => c.trim().toLowerCase())
              : [];

            const matchedCategories = categoryNames.map((catName: string) => {
              const match = categories.find(
                (c) => c.name.toLowerCase() === catName || c.slug === catName,
              );
              return match
                ? { id: match.id, name: match.name, matched: true }
                : { name: catName, matched: false };
            });

            return {
              name,
              description,
              image_url,
              price,
              categories: categoriesStr,
              parsedCategories: matchedCategories,
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null);

        setSkippedRows(skipped);

        if (validatedData.length === 0) {
          addToast(
            "No valid products found in file. Check the skipped rows for details.",
            "error",
          );
          setIsParsing(false);
          if (skipped.length > 0) {
            setImportPreview([]);
            setShowImportModal(true);
          }
          return;
        }

        setImportPreview(validatedData);
        setShowImportModal(true);
      } catch (error) {
        console.error("Error parsing file:", error);
        addToast("Failed to parse file. Please check the format.", "error");
      } finally {
        setIsParsing(false);
      }
    };
    reader.readAsBinaryString(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove item from import preview
  const handleRemoveFromPreview = (index: number) => {
    setImportPreview((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle bulk import
  const handleBulkImport = async () => {
    setIsImporting(true);
    setActionLoading((prev) => ({ ...prev, import: "import" }));
    setImportProgress({ current: 0, total: importPreview.length });

    const details: string[] = [];
    const missingImages: Array<{ id: string; name: string }> = [];

    try {
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < importPreview.length; i++) {
        const productData = importPreview[i];
        setImportProgress({ current: i + 1, total: importPreview.length });

        const result = await createProduct({
          name: productData.name,
          description: productData.description,
          image_url: productData.image_url,
          price: productData.price,
        });
        if (result.success && result.data) {
          // Track if product is missing image
          if (!productData.image_url) {
            missingImages.push({
              id: result.data.id,
              name: productData.name,
            });
          }

          // Assign categories if provided
          if (productData.categories) {
            const categoryNames = productData.categories
              .split(",")
              .map((c: string) => c.trim().toLowerCase());
            for (const catName of categoryNames) {
              const matchedCategory = categories.find(
                (c) => c.name.toLowerCase() === catName || c.slug === catName,
              );
              if (matchedCategory) {
                await assignProductToCategory(
                  result.data.id,
                  matchedCategory.id,
                );
              }
            }
          }
          successCount++;
          details.push(`✓ ${productData.name}`);
        } else {
          failCount++;
          details.push(
            `✗ ${productData.name}: ${result.error || "Unknown error"}`,
          );
        }
      }

      setImportSummary({ success: successCount, failed: failCount, details });

      if (successCount > 0) {
        addToast(`Successfully imported ${successCount} product(s)`, "success");
        fetchProducts();
      }
      if (failCount > 0) {
        addToast(`Failed to import ${failCount} product(s)`, "error");
      }

      // Don't close modal - show summary instead
      setImportPreview([]);

      // If products are missing images, show prompt for mass upload
      if (missingImages.length > 0) {
        setProductsMissingImages(missingImages);
        // Delay slightly to let the toast show
        setTimeout(() => {
          handleCloseImportModal();
          setShowMassUploadModal(true);
        }, 2000);
      }
    } catch (error) {
      console.error("Bulk import error:", error);
      addToast("Failed to import products", "error");
    } finally {
      setIsImporting(false);
      setActionLoading((prev) => ({ ...prev, import: null }));
    }
  };

  // Close import modal and reset state
  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportPreview([]);
    setSkippedRows([]);
    setImportSummary(null);
    setImportProgress({ current: 0, total: 0 });
  };

  // Handle mass image upload
  const handleMassImageFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setMassUploadFiles(files);
    matchFilesToProducts(files);
  };

  const matchFilesToProducts = (files: File[]) => {
    const matches: Record<string, File[]> = {};

    productsMissingImages.forEach((product) => {
      // Find files that start with the product name (case insensitive)
      // Normalizing names to handle special chars and spacing
      const normalizedProductName = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");

      const productMatches = files.filter((file) => {
        const normalizedFileName = file.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        return normalizedFileName.startsWith(normalizedProductName);
      });

      if (productMatches.length > 0) {
        matches[product.id] = productMatches;
      }
    });

    setMassUploadMatches(matches);
  };

  const executeMassUpload = async () => {
    setIsMassUploading(true);
    let totalImages = 0;
    Object.values(massUploadMatches).forEach((files) => {
      totalImages += files.length;
    });
    setMassUploadProgress({ current: 0, total: totalImages });

    let processedCount = 0;
    let successCount = 0;

    try {
      for (const [productId, files] of Object.entries(massUploadMatches)) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const uploadResult = await uploadFile(file, "products", "images");

          if (uploadResult.success && uploadResult.url) {
            // If it's the first image, set as primary product image
            if (i === 0) {
              await updateProduct(productId, {
                image_url: uploadResult.url,
              });
            }

            // Add to product gallery
            await addProductImage({
              product_id: productId,
              image_url: uploadResult.url,
              alt_text:
                productImages.length > 0
                  ? `${files[0].name} - ${i + 1}`
                  : file.name.split(".")[0],
              is_primary: i === 0,
              sort_order: i,
            });
            successCount++;
          }
          processedCount++;
          setMassUploadProgress((prev) => ({
            ...prev,
            current: processedCount,
          }));
        }
      }

      addToast(
        `Successfully uploaded ${successCount} images for ${
          Object.keys(massUploadMatches).length
        } products`,
        "success",
      );
      setShowMassUploadModal(false);
      setProductsMissingImages([]);
      setMassUploadFiles([]);
      setMassUploadMatches({});
      fetchProducts();
    } catch (error) {
      console.error("Mass upload error:", error);
      addToast("Failed to complete mass upload", "error");
    } finally {
      setIsMassUploading(false);
    }
  };

  // Export products to Excel
  const handleExportToExcel = () => {
    const exportData = products.map((p) => {
      // Get category names for this product
      const productCatIds = productCategories[p.id] || [];
      const categoryNames = productCatIds
        .map((catId) => categories.find((c) => c.id === catId)?.name)
        .filter(Boolean)
        .join(", ");

      return {
        name: p.name,
        description: p.description || "",
        image_url: p.image_url || "",
        price: p.price,
        categories: categoryNames,
        created_at: new Date(p.created_at).toLocaleDateString(),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(
      workbook,
      `products_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    addToast("Products exported successfully", "success");
  };

  // Download template
  const handleDownloadTemplate = () => {
    // Get available category names for the template
    const availableCategories = categories.map((c) => c.name).join(", ");

    const templateData = [
      {
        name: "Sample Product 1",
        description: "Sample product description",
        image_url: "https://example.com/image.jpg",
        price: 1299,
        categories: "Curtains, Sheers",
      },
      {
        name: "Sample Product 2",
        description: "Another sample description",
        image_url: "https://example.com/image2.jpg",
        price: 2499,
        categories: "Upholstery",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Add a note about available categories
    XLSX.utils.sheet_add_aoa(
      worksheet,
      [[`Available categories: ${availableCategories || "None"}`]],
      { origin: "A5" },
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products_import_template.xlsx");
    addToast("Template downloaded successfully", "success");
  };

  // Filter products by search query
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const fallbackImage =
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop&crop=center";

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
            Products Management
          </h1>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isParsing}
          />
          <Button
            onClick={handleDownloadTemplate}
            variant="outline"
            className="flex-1 sm:flex-none"
            title="Download import template"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Template
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isParsing}
            className="flex-1 border-[#2F2582] text-[#2F2582] hover:bg-[#2F2582]/10 sm:flex-none"
          >
            {isParsing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-[#2F2582] border-t-transparent" />
                Parsing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </>
            )}
          </Button>
          <Button
            onClick={handleExportToExcel}
            variant="outline"
            disabled={products.length === 0}
            className="flex-1 sm:flex-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => handleOpenModal()}
            className="w-full bg-[#2F2582] hover:bg-[#241c66] sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            Total Products
          </p>
          <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl">
            {totalProducts}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            Total Value
          </p>
          <p className="mt-1 text-lg font-bold text-green-600 sm:text-2xl">
            {formatPrice(totalValue)}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">
            Avg Price
          </p>
          <p className="mt-1 text-lg font-bold text-[#2F2582] sm:text-2xl">
            {formatPrice(averagePrice)}
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
          placeholder="Search products..."
          className="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
        />
      </div>

      {/* Products List */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-base font-semibold sm:text-lg">
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <Package className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-base font-medium text-gray-900 sm:text-lg">
                {searchQuery ? "No products found" : "No products yet"}
              </h3>
              <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                {searchQuery
                  ? "Try a different search term"
                  : "Get started by creating your first product."}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => handleOpenModal()}
                  className="mt-4 bg-[#2F2582] hover:bg-[#251e66]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="divide-y divide-gray-100 sm:hidden">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="space-y-3 p-4">
                    <div className="flex items-start gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={product.image_url || fallbackImage}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <p className="mt-0.5 text-sm font-semibold text-[#2F2582]">
                          {formatPrice(product.price)}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {productCategories[product.id]?.length > 0 ? (
                            productCategories[product.id]
                              .slice(0, 2)
                              .map((catId) => {
                                const cat = categories.find(
                                  (c) => c.id === catId,
                                );
                                return cat ? (
                                  <span
                                    key={catId}
                                    className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800"
                                  >
                                    {cat.name}
                                  </span>
                                ) : null;
                              })
                          ) : (
                            <span className="text-xs text-gray-400">
                              No category
                            </span>
                          )}
                          {productCategories[product.id]?.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{productCategories[product.id].length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {product.description && (
                      <p className="line-clamp-2 text-xs text-gray-500">
                        {product.description}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(product)}
                        className="h-9 flex-1"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={
                          actionLoading[`delete-${product.id}`] === "delete"
                        }
                        className="h-9 flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Category
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase lg:table-cell">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        Price
                      </th>
                      <th className="hidden px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase lg:table-cell">
                        Created
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              <Image
                                src={product.image_url || fallbackImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                            <div className="max-w-[150px] truncate font-medium text-gray-900">
                              {product.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {productCategories[product.id]?.length > 0 ? (
                              productCategories[product.id].map((catId) => {
                                const cat = categories.find(
                                  (c) => c.id === catId,
                                );
                                return cat ? (
                                  <span
                                    key={catId}
                                    className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800"
                                  >
                                    {cat.name}
                                  </span>
                                ) : null;
                              })
                            ) : (
                              <span className="text-xs text-gray-400">
                                No category
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 lg:table-cell">
                          <div className="max-w-xs truncate text-sm text-gray-500">
                            {product.description || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatPrice(product.price)}
                          </div>
                        </td>
                        <td className="hidden px-4 py-3 text-sm text-gray-500 lg:table-cell">
                          {new Date(product.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenModal(product)}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDelete(product.id, product.name)
                              }
                              disabled={
                                actionLoading[`delete-${product.id}`] ===
                                "delete"
                              }
                              className="h-8 w-8 p-0 text-gray-600 hover:text-red-600"
                            >
                              {actionLoading[`delete-${product.id}`] ===
                              "delete" ? (
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

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                    {editingProduct
                      ? "Update the product details below"
                      : "Fill in the details to create a new product"}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                {/* Two Column Layout */}
                <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
                  {/* Left Column - Main Info */}
                  <div className="space-y-5 lg:col-span-2">
                    {/* Product Name */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                        placeholder="Enter product name"
                      />
                    </div>

                    {/* Description */}
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
                        rows={4}
                        className="w-full resize-none rounded-lg border-2 border-gray-200 px-4 py-2.5 transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                        placeholder="Enter product description"
                      />
                    </div>

                    {/* Price and Image URL Row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                          Price (₹ INR) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute top-1/2 left-4 -translate-y-1/2 font-medium text-gray-500">
                            ₹
                          </span>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full rounded-lg border-2 border-gray-200 py-2.5 pr-4 pl-8 transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                            placeholder="0.00"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <FileUpload
                          label="Product Image"
                          accept="image/*"
                          bucket="products"
                          folder="images"
                          currentUrl={formData.image_url}
                          onUploadComplete={(url) =>
                            setFormData({ ...formData, image_url: url })
                          }
                          onRemove={() =>
                            setFormData({ ...formData, image_url: "" })
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
                        {!formData.image_url && (
                          <div>
                            <label className="mb-2 block text-xs font-medium text-gray-600">
                              Or enter Image URL manually
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
                              className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm transition-colors focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-gray-700">
                        Categories
                      </label>
                      <div className="rounded-lg border-2 border-gray-200 p-4">
                        {categories.length === 0 ? (
                          <p className="py-2 text-center text-sm text-gray-500">
                            No categories available
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {categories.map((category) => {
                              const isSelected = formData.categoryIds.includes(
                                category.id,
                              );
                              return (
                                <label
                                  key={category.id}
                                  className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 transition-all ${
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
                                          categoryIds: [
                                            ...formData.categoryIds,
                                            category.id,
                                          ],
                                        });
                                      } else {
                                        setFormData({
                                          ...formData,
                                          categoryIds:
                                            formData.categoryIds.filter(
                                              (id) => id !== category.id,
                                            ),
                                        });
                                      }
                                    }}
                                    className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                                  />
                                  <span
                                    className={`text-sm ${isSelected ? "font-medium text-[#2F2582]" : "text-gray-700"}`}
                                  >
                                    {category.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                        {formData.categoryIds.length > 0 && (
                          <p className="mt-3 text-xs font-medium text-[#2F2582]">
                            {formData.categoryIds.length} category(ies) selected
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Product Images Gallery */}
                    <div className="border-t border-gray-200 pt-5">
                      <div className="mb-3 flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">
                          Product Images Gallery
                        </label>
                        <span className="text-xs text-gray-500">
                          {productImages.length + newImages.length} image(s)
                        </span>
                      </div>

                      {/* Existing Images */}
                      {productImages.length > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 text-xs font-medium text-gray-600">
                            Existing Images
                          </p>
                          <div className="space-y-3">
                            {productImages.map((img, index) => (
                              <div
                                key={img.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className="flex cursor-move items-start gap-3 rounded-lg border-2 border-gray-200 bg-white p-3 transition-colors hover:border-[#2F2582]"
                              >
                                <GripVertical className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                  <Image
                                    src={img.image_url}
                                    alt={img.alt_text || "Product image"}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={img.alt_text || ""}
                                    onChange={(e) =>
                                      handleUpdateExistingImageAlt(
                                        img.id,
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Alt text (optional)"
                                    className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#2F2582] focus:outline-none"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSetExistingImagePrimary(img.id)
                                      }
                                      className={`flex items-center gap-1 text-xs ${
                                        img.is_primary
                                          ? "font-semibold text-yellow-600"
                                          : "text-gray-500 hover:text-yellow-600"
                                      }`}
                                    >
                                      <Star
                                        className={`h-3 w-3 ${img.is_primary ? "fill-yellow-600" : ""}`}
                                      />
                                      {img.is_primary
                                        ? "Primary"
                                        : "Set as primary"}
                                    </button>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteProductImage(img.id)
                                  }
                                  className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Images */}
                      {newImages.length > 0 && (
                        <div className="mb-4">
                          <p className="mb-2 text-xs font-medium text-gray-600">
                            New Images (will be added on save)
                          </p>
                          <div className="space-y-3">
                            {newImages.map((img, index) => (
                              <div
                                key={index}
                                className="flex items-start gap-3 rounded-lg border-2 border-green-200 bg-green-50 p-3"
                              >
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                  <Image
                                    src={img.url}
                                    alt={img.alt_text || "New product image"}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={img.alt_text}
                                    onChange={(e) =>
                                      handleUpdateNewImageAlt(
                                        index,
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Alt text (optional)"
                                    className="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#2F2582] focus:outline-none"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSetNewImagePrimary(index)
                                      }
                                      className={`flex items-center gap-1 text-xs ${
                                        img.is_primary
                                          ? "font-semibold text-yellow-600"
                                          : "text-gray-500 hover:text-yellow-600"
                                      }`}
                                    >
                                      <Star
                                        className={`h-3 w-3 ${img.is_primary ? "fill-yellow-600" : ""}`}
                                      />
                                      {img.is_primary
                                        ? "Primary"
                                        : "Set as primary"}
                                    </button>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveNewImage(index)}
                                  className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add New Image */}
                      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4">
                        <FileUpload
                          label="Add Product Image"
                          accept="image/*"
                          bucket="products"
                          folder="gallery"
                          currentUrl=""
                          onUploadComplete={handleAddNewImage}
                          maxSizeMB={5}
                          allowedTypes={[
                            "image/jpeg",
                            "image/png",
                            "image/webp",
                            "image/jpg",
                          ]}
                          previewType="image"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Upload multiple images to create a gallery. Drag to
                          reorder existing images.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Image Preview */}
                  <div className="lg:col-span-1">
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Image Preview
                    </label>
                    <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4">
                      {formData.image_url ? (
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-gray-200 bg-white">
                          <Image
                            src={formData.image_url}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-square w-full flex-col items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                          <Package className="mb-2 h-12 w-12" />
                          <span className="text-sm">No image</span>
                        </div>
                      )}
                      <p className="mt-3 text-center text-xs text-gray-500">
                        Enter an image URL to see preview
                      </p>
                    </div>

                    {/* Quick Stats for Edit Mode */}
                    {editingProduct && (
                      <div className="mt-4 rounded-lg bg-gray-50 p-4">
                        <h4 className="mb-2 text-sm font-semibold text-gray-700">
                          Product Info
                        </h4>
                        <div className="space-y-2 text-xs text-gray-500">
                          <p>
                            Created:{" "}
                            {new Date(
                              editingProduct.created_at,
                            ).toLocaleDateString()}
                          </p>
                          <p>ID: {editingProduct.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:mt-6 sm:flex-row sm:pt-6">
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

      {/* Mass Image Upload Modal */}
      <AnimatePresence>
        {showMassUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Upload Product Images
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Found {productsMissingImages.length} products without images
                  </p>
                </div>
                <button
                  onClick={() => setShowMassUploadModal(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                  <p className="font-medium">How this works:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    <li>Select multiple images at once</li>
                    <li>
                      Images will be matched if filename starts with product
                      name
                    </li>
                    <li>
                      Example: &quot;Royal Curtain.jpg&quot; matches product
                      &quot;Royal Curtain&quot;
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-10">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="mt-4 flex text-sm leading-6 text-gray-600">
                        <label
                          htmlFor="mass-file-upload"
                          className="relative cursor-pointer rounded-md bg-white font-semibold text-[#2F2582] focus-within:ring-2 focus-within:ring-[#2F2582] focus-within:ring-offset-2 focus-within:outline-none hover:text-[#241c66]"
                        >
                          <span>Upload files</span>
                          <input
                            id="mass-file-upload"
                            name="mass-file-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            className="sr-only"
                            onChange={handleMassImageFiles}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs leading-5 text-gray-600">
                        PNG, JPG, WEBP up to 10MB
                      </p>
                    </div>
                  </div>

                  {massUploadFiles.length > 0 && (
                    <div className="rounded-lg border border-gray-200">
                      <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          Matched Products (
                          {Object.keys(massUploadMatches).length})
                        </h3>
                      </div>
                      <div className="max-h-60 divide-y divide-gray-200 overflow-y-auto">
                        {Object.entries(massUploadMatches).map(
                          ([productId, files]) => {
                            const product = productsMissingImages.find(
                              (p) => p.id === productId,
                            );
                            return (
                              <div
                                key={productId}
                                className="flex items-center justify-between px-4 py-3"
                              >
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {product?.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {files.length} image(s) matched
                                  </p>
                                </div>
                                <div className="flex -space-x-2">
                                  {files.slice(0, 3).map((file, i) => (
                                    <div
                                      key={i}
                                      className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[10px] ring-2 ring-white"
                                      title={file.name}
                                    >
                                      📷
                                    </div>
                                  ))}
                                  {files.length > 3 && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-[10px] ring-2 ring-white">
                                      +{files.length - 3}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          },
                        )}
                        {Object.keys(massUploadMatches).length === 0 && (
                          <div className="px-4 py-8 text-center text-sm text-gray-500">
                            No matches found. Check your filenames.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowMassUploadModal(false)}
                    disabled={isMassUploading}
                  >
                    Skip & Close
                  </Button>
                  <Button
                    onClick={executeMassUpload}
                    disabled={
                      isMassUploading ||
                      Object.keys(massUploadMatches).length === 0
                    }
                    className="bg-[#2F2582] hover:bg-[#241c66]"
                  >
                    {isMassUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading ({massUploadProgress.current}/
                        {massUploadProgress.total})
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Start Upload
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!confirmAction.type}
        title="Delete Product"
        message={`Are you sure you want to delete "${confirmAction.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={executeDelete}
        onCancel={() => setConfirmAction({ type: null })}
        isLoading={!!actionLoading[`delete-${confirmAction.productId}`]}
        variant="danger"
      />

      {/* Import Preview Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4 dark:bg-black/70">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border-2 border-gray-100 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {importSummary ? "Import Complete" : "Import Preview"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {importSummary
                      ? `${importSummary.success} succeeded, ${importSummary.failed} failed`
                      : `Review ${importPreview.length} product(s) before importing`}
                  </p>
                </div>
                <button
                  onClick={handleCloseImportModal}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  disabled={isImporting}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6">
                {/* Import Summary View */}
                {importSummary ? (
                  <div className="space-y-4">
                    {/* Summary Stats */}
                    <div className="flex gap-4">
                      <div className="flex-1 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <span className="text-sm font-medium text-green-800 dark:text-green-300">
                            {importSummary.success} Imported
                          </span>
                        </div>
                      </div>
                      {importSummary.failed > 0 && (
                        <div className="flex-1 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            <span className="text-sm font-medium text-red-800 dark:text-red-300">
                              {importSummary.failed} Failed
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="max-h-60 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
                      <p className="mb-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                        Import Details:
                      </p>
                      <div className="space-y-1 font-mono text-xs">
                        {importSummary.details.map((detail, i) => (
                          <div
                            key={i}
                            className={
                              detail.startsWith("✓")
                                ? "text-green-700 dark:text-green-400"
                                : "text-red-700 dark:text-red-400"
                            }
                          >
                            {detail}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Progress Bar (during import) */}
                    {isImporting && importProgress.total > 0 && (
                      <div className="mb-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Importing products...
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {importProgress.current} / {importProgress.total}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-[#2F2582] transition-all duration-300"
                            style={{
                              width: `${(importProgress.current / importProgress.total) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Skipped Rows Warning */}
                    {skippedRows.length > 0 && (
                      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                          <div className="flex-1">
                            <p className="font-semibold text-amber-800 dark:text-amber-300">
                              {skippedRows.length} row(s) skipped
                            </p>
                            <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-400">
                              {skippedRows.slice(0, 5).map((skip, i) => (
                                <li key={i}>
                                  Row {skip.row}: {skip.reason}
                                </li>
                              ))}
                              {skippedRows.length > 5 && (
                                <li className="text-amber-600 dark:text-amber-500">
                                  ... and {skippedRows.length - 5} more
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preview Table */}
                    {importPreview.length > 0 ? (
                      <div className="mb-4 overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-600">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Name
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Categories
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Price (₹)
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-400">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-600 dark:bg-gray-800">
                            {importPreview.map((item, index) => (
                              <tr
                                key={index}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                  <div>{item.name}</div>
                                  {item.description && (
                                    <div className="max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                                      {item.description}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                  {item.parsedCategories &&
                                  item.parsedCategories.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {item.parsedCategories.map(
                                        (cat: any, i: number) => (
                                          <span
                                            key={i}
                                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                              cat.matched
                                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                            }`}
                                            title={
                                              cat.matched
                                                ? "Will be assigned"
                                                : "Category not found - will be skipped"
                                            }
                                          >
                                            {cat.matched ? (
                                              <CheckCircle className="mr-1 h-3 w-3" />
                                            ) : (
                                              <AlertCircle className="mr-1 h-3 w-3" />
                                            )}
                                            {cat.name}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-500">
                                      —
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">
                                  {formatPrice(item.price)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <button
                                    onClick={() =>
                                      handleRemoveFromPreview(index)
                                    }
                                    disabled={isImporting}
                                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                    title="Remove from import"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="mb-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 py-12 dark:border-gray-600">
                        <Package className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          No valid products to import
                        </p>
                      </div>
                    )}

                    {/* Help Text */}
                    <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                      <div className="flex items-start gap-3">
                        <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
                        <div className="text-sm text-blue-800 dark:text-blue-300">
                          <p className="mb-1 font-semibold">Import Tips:</p>
                          <ul className="list-inside list-disc space-y-1 text-blue-700 dark:text-blue-400">
                            <li>
                              <span className="inline-flex items-center gap-1">
                                <CheckCircle className="inline h-3 w-3 text-green-600" />{" "}
                                = category will be assigned
                              </span>
                            </li>
                            <li>
                              <span className="inline-flex items-center gap-1">
                                <AlertCircle className="inline h-3 w-3 text-red-600" />{" "}
                                = category not found (skipped)
                              </span>
                            </li>
                            <li>
                              Click the trash icon to remove individual products
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 border-t border-gray-100 px-6 py-4 dark:border-gray-700">
                {importSummary ? (
                  <Button
                    onClick={handleCloseImportModal}
                    className="flex-1 bg-[#2F2582] hover:bg-[#241c66]"
                  >
                    Done
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleCloseImportModal}
                      variant="outline"
                      disabled={isImporting}
                      className="flex-1 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
                          Importing {importProgress.current}/
                          {importProgress.total}...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import {importPreview.length} Product(s)
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
