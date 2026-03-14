"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Image as ImageIcon,
  Calendar,
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/ui/AdminPageSkeleton";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { useAdmin } from "@/lib/hooks/useAdmin";
import {
  getAdminExhibitionYears,
  getAdminExhibitionItems,
  createExhibitionYear,
  updateExhibitionYear,
  deleteExhibitionYear,
  createExhibitionItem,
  updateExhibitionItem,
  deleteExhibitionItem,
  toggleExhibitionItemStatus,
} from "@/lib/actions/exhibitions";
import type { ExhibitionYear, ExhibitionItem } from "@/lib/actions/exhibitions";

type ItemType = "exhibition" | "moment" | "news";

type ItemFormData = {
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  source_name: string;
  article_url: string;
};

type ConfirmState =
  | { type: null }
  | { type: "delete-year"; yearId: string; yearLabel: string }
  | {
      type: "toggle-year";
      yearId: string;
      yearLabel: string;
      nextActive: boolean;
    }
  | { type: "delete-item"; itemId: string; itemTitle: string }
  | {
      type: "toggle-item";
      itemId: string;
      itemTitle: string;
      nextActive: boolean;
    };

const emptyItemForm: ItemFormData = {
  title: "",
  description: "",
  image_url: "",
  display_order: 0,
  is_active: true,
  source_name: "",
  article_url: "",
};

export default function ExhibitionsAdminPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toasts, addToast, removeToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [years, setYears] = useState<ExhibitionYear[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ItemType>("exhibition");
  const [items, setItems] = useState<ExhibitionItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [newYearValue, setNewYearValue] = useState("");
  const [yearSaving, setYearSaving] = useState(false);

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ExhibitionItem | null>(null);
  const [itemForm, setItemForm] = useState<ItemFormData>(emptyItemForm);
  const [itemSaving, setItemSaving] = useState(false);

  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    type: null,
  });

  const fetchYears = useCallback(async () => {
    setIsLoading(true);
    const result = await getAdminExhibitionYears();
    if (result.success && result.data) {
      setYears(result.data);
      if (result.data.length > 0 && !selectedYearId) {
        setSelectedYearId(result.data[0].id);
      }
    } else {
      addToast(result.error ?? "Failed to load exhibition years", "error");
    }
    setIsLoading(false);
  }, [addToast, selectedYearId]);

  const fetchItems = useCallback(async () => {
    if (!selectedYearId) return;
    setItemsLoading(true);
    const result = await getAdminExhibitionItems(selectedYearId, activeTab);
    if (result.success && result.data) {
      setItems(result.data);
    } else {
      addToast(result.error ?? "Failed to load items", "error");
    }
    setItemsLoading(false);
  }, [selectedYearId, activeTab, addToast]);

  useEffect(() => {
    if (isAdmin) {
      void fetchYears();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (selectedYearId) {
      void fetchItems();
    }
  }, [selectedYearId, activeTab]);

  async function handleAddYear(e: React.FormEvent) {
    e.preventDefault();
    const year = parseInt(newYearValue, 10);
    if (!year || year < 1900 || year > 2100) {
      addToast("Enter a valid year between 1900 and 2100", "error");
      return;
    }
    setYearSaving(true);
    try {
      const result = await createExhibitionYear(year);
      if (!result.success) {
        addToast(result.error ?? "Failed to create year", "error");
        return;
      }
      addToast(`Year ${year} added successfully`, "success");
      setShowAddYearModal(false);
      setNewYearValue("");
      const updated = await getAdminExhibitionYears();
      if (updated.success && updated.data) {
        setYears(updated.data);
        setSelectedYearId(result.data!.id);
      }
    } finally {
      setYearSaving(false);
    }
  }

  async function executeToggleYear() {
    if (confirmState.type !== "toggle-year") return;
    const { yearId, nextActive } = confirmState;
    const key = `toggle-year-${yearId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await updateExhibitionYear(yearId, {
        is_active: nextActive,
      });
      if (!result.success) {
        addToast(result.error ?? "Failed to update year", "error");
      } else {
        addToast(
          `Year ${nextActive ? "activated" : "deactivated"} successfully`,
          "success",
        );
        setYears((prev) =>
          prev.map((y) =>
            y.id === yearId ? { ...y, is_active: nextActive } : y,
          ),
        );
      }
    } finally {
      setConfirmState({ type: null });
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function executeDeleteYear() {
    if (confirmState.type !== "delete-year") return;
    const { yearId } = confirmState;
    const key = `delete-year-${yearId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await deleteExhibitionYear(yearId);
      if (!result.success) {
        addToast(result.error ?? "Failed to delete year", "error");
      } else {
        addToast("Year deleted successfully", "success");
        const remaining = years.filter((y) => y.id !== yearId);
        setYears(remaining);
        if (selectedYearId === yearId) {
          setSelectedYearId(remaining.length > 0 ? remaining[0].id : null);
        }
      }
    } finally {
      setConfirmState({ type: null });
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  function openItemModal(item?: ExhibitionItem) {
    if (item) {
      setEditingItem(item);
      setItemForm({
        title: item.title,
        description: item.description ?? "",
        image_url: item.image_url ?? "",
        display_order: item.display_order,
        is_active: item.is_active,
        source_name: item.source_name ?? "",
        article_url: item.article_url ?? "",
      });
    } else {
      setEditingItem(null);
      setItemForm(emptyItemForm);
    }
    setShowItemModal(true);
  }

  async function handleItemSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedYearId) return;
    if (!itemForm.title.trim()) {
      addToast("Title is required", "error");
      return;
    }
    setItemSaving(true);
    try {
      const payload = {
        year_id: selectedYearId,
        type: activeTab,
        title: itemForm.title.trim(),
        description: itemForm.description.trim() || null,
        image_url: itemForm.image_url.trim() || null,
        display_order: itemForm.display_order,
        is_active: itemForm.is_active,
        source_name:
          activeTab === "news" ? itemForm.source_name.trim() || null : null,
        article_url:
          activeTab === "news" ? itemForm.article_url.trim() || null : null,
      };

      const result = editingItem
        ? await updateExhibitionItem(editingItem.id, payload)
        : await createExhibitionItem(payload);

      if (!result.success) {
        addToast(result.error ?? "Failed to save item", "error");
        return;
      }

      addToast(
        editingItem ? "Item updated successfully" : "Item created successfully",
        "success",
      );
      setShowItemModal(false);
      await fetchItems();
    } finally {
      setItemSaving(false);
    }
  }

  async function executeToggleItem() {
    if (confirmState.type !== "toggle-item") return;
    const { itemId, nextActive } = confirmState;
    const key = `toggle-item-${itemId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await toggleExhibitionItemStatus(itemId, nextActive);
      if (!result.success) {
        addToast(result.error ?? "Failed to update item status", "error");
      } else {
        addToast(
          `Item ${nextActive ? "published" : "hidden"} successfully`,
          "success",
        );
        await fetchItems();
      }
    } finally {
      setConfirmState({ type: null });
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function executeDeleteItem() {
    if (confirmState.type !== "delete-item") return;
    const { itemId } = confirmState;
    const key = `delete-item-${itemId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await deleteExhibitionItem(itemId);
      if (!result.success) {
        addToast(result.error ?? "Failed to delete item", "error");
      } else {
        addToast("Item deleted successfully", "success");
        await fetchItems();
      }
    } finally {
      setConfirmState({ type: null });
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  if (adminLoading || isLoading) {
    return <AdminPageSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  const selectedYear = years.find((y) => y.id === selectedYearId);

  const tabs: { label: string; value: ItemType }[] = [
    { label: "Exhibitions", value: "exhibition" },
    { label: "Moments", value: "moment" },
    { label: "News", value: "news" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Exhibitions & Events
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage exhibition years, moments, and news entries.
          </p>
        </div>
        <Button
          onClick={() => setShowAddYearModal(true)}
          className="w-full bg-[#2F2582] hover:bg-[#251e66] sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Year
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#2F2582]" />
            Exhibition Years ({years.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {years.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
              No years added yet. Click "Add Year" to get started.
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {years.map((year) => (
                <div
                  key={year.id}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 transition-colors ${
                    selectedYearId === year.id
                      ? "border-[#2F2582] bg-[#2F2582]/5"
                      : "border-gray-200 bg-white hover:border-[#2F2582]/40"
                  }`}
                >
                  <button
                    onClick={() => setSelectedYearId(year.id)}
                    className="text-sm font-semibold text-gray-800"
                  >
                    {year.year}
                  </button>
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${
                      year.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {year.is_active ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                  </span>
                  <button
                    onClick={() =>
                      setConfirmState({
                        type: "toggle-year",
                        yearId: year.id,
                        yearLabel: String(year.year),
                        nextActive: !year.is_active,
                      })
                    }
                    disabled={actionLoading[`toggle-year-${year.id}`]}
                    title={year.is_active ? "Deactivate year" : "Activate year"}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    {year.is_active ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setConfirmState({
                        type: "delete-year",
                        yearId: year.id,
                        yearLabel: String(year.year),
                      })
                    }
                    disabled={actionLoading[`delete-year-${year.id}`]}
                    title="Delete year"
                    className="text-red-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedYear && (
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>{selectedYear.year} — Items</CardTitle>
              <Button
                onClick={() => openItemModal()}
                size="sm"
                className="bg-[#2F2582] hover:bg-[#251e66]"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add{" "}
                {activeTab === "exhibition"
                  ? "Exhibition"
                  : activeTab === "moment"
                    ? "Moment"
                    : "News"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === tab.value
                      ? "bg-white text-[#2F2582] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {itemsLoading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-xl bg-gray-200"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                No {activeTab} items for {selectedYear.year}. Add one to get
                started.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                  >
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-300">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3 p-3">
                      <div className="space-y-1">
                        <p className="line-clamp-1 text-sm font-medium text-gray-900">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="line-clamp-2 text-xs text-gray-500">
                            {item.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          Order: {item.display_order}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() =>
                            setConfirmState({
                              type: "toggle-item",
                              itemId: item.id,
                              itemTitle: item.title,
                              nextActive: !item.is_active,
                            })
                          }
                          disabled={actionLoading[`toggle-item-${item.id}`]}
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
                            onClick={() => openItemModal(item)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setConfirmState({
                                type: "delete-item",
                                itemId: item.id,
                                itemTitle: item.title,
                              })
                            }
                            disabled={actionLoading[`delete-item-${item.id}`]}
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
      )}

      <AnimatePresence>
        {showAddYearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Add Year
                </h2>
                <button
                  onClick={() => {
                    setShowAddYearModal(false);
                    setNewYearValue("");
                  }}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddYear} className="space-y-4 p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Year *
                  </label>
                  <input
                    type="number"
                    value={newYearValue}
                    onChange={(e) => setNewYearValue(e.target.value)}
                    min={1900}
                    max={2100}
                    required
                    autoFocus
                    placeholder="e.g. 2026"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddYearModal(false);
                      setNewYearValue("");
                    }}
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={yearSaving}
                    className="w-full bg-[#2F2582] hover:bg-[#251e66] sm:flex-1"
                  >
                    {yearSaving ? "Adding..." : "Add Year"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showItemModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingItem
                    ? `Edit ${activeTab === "exhibition" ? "Exhibition" : activeTab === "moment" ? "Moment" : "News"}`
                    : `Add ${activeTab === "exhibition" ? "Exhibition" : activeTab === "moment" ? "Moment" : "News"}`}
                </h2>
                <button
                  onClick={() => setShowItemModal(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form
                onSubmit={handleItemSubmit}
                className="space-y-4 p-4 sm:p-6"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.title}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    placeholder="Enter title"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    placeholder="Optional description"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={itemForm.image_url}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        image_url: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    placeholder="https://example.com/image.jpg"
                  />
                  {itemForm.image_url && (
                    <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-lg border">
                      <Image
                        src={itemForm.image_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={itemForm.display_order}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        display_order: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                  />
                </div>

                {activeTab === "news" && (
                  <>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Source Name
                      </label>
                      <input
                        type="text"
                        value={itemForm.source_name}
                        onChange={(e) =>
                          setItemForm((prev) => ({
                            ...prev,
                            source_name: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                        placeholder="e.g. The Hindu"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Article URL
                      </label>
                      <input
                        type="url"
                        value={itemForm.article_url}
                        onChange={(e) =>
                          setItemForm((prev) => ({
                            ...prev,
                            article_url: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                        placeholder="https://example.com/article"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2">
                  <input
                    id="item_is_active"
                    type="checkbox"
                    checked={itemForm.is_active}
                    onChange={(e) =>
                      setItemForm((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                  />
                  <label
                    htmlFor="item_is_active"
                    className="text-sm text-gray-700"
                  >
                    Publish this item on the website
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowItemModal(false)}
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={itemSaving}
                    className="w-full bg-[#2F2582] hover:bg-[#251e66] sm:flex-1"
                  >
                    {itemSaving
                      ? "Saving..."
                      : editingItem
                        ? "Update Item"
                        : "Add Item"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmState.type === "toggle-year"}
        title={
          confirmState.type === "toggle-year" && confirmState.nextActive
            ? "Activate Year"
            : "Deactivate Year"
        }
        message={
          confirmState.type === "toggle-year"
            ? `Are you sure you want to ${confirmState.nextActive ? "activate" : "deactivate"} year "${confirmState.yearLabel}"?`
            : ""
        }
        confirmText={
          confirmState.type === "toggle-year" && confirmState.nextActive
            ? "Activate"
            : "Deactivate"
        }
        variant={
          confirmState.type === "toggle-year" && confirmState.nextActive
            ? "default"
            : "warning"
        }
        onCancel={() => setConfirmState({ type: null })}
        onConfirm={executeToggleYear}
      />
      <ConfirmationModal
        isOpen={confirmState.type === "delete-year"}
        title="Delete Year"
        message={
          confirmState.type === "delete-year"
            ? `Are you sure you want to delete year "${confirmState.yearLabel}"? All items in this year will also be deleted.`
            : ""
        }
        confirmText="Delete"
        variant="danger"
        onCancel={() => setConfirmState({ type: null })}
        onConfirm={executeDeleteYear}
      />
      <ConfirmationModal
        isOpen={confirmState.type === "toggle-item"}
        title={
          confirmState.type === "toggle-item" && confirmState.nextActive
            ? "Publish Item"
            : "Hide Item"
        }
        message={
          confirmState.type === "toggle-item"
            ? `Are you sure you want to ${confirmState.nextActive ? "publish" : "hide"} "${confirmState.itemTitle}"?`
            : ""
        }
        confirmText={
          confirmState.type === "toggle-item" && confirmState.nextActive
            ? "Publish"
            : "Hide"
        }
        variant={
          confirmState.type === "toggle-item" && confirmState.nextActive
            ? "default"
            : "warning"
        }
        onCancel={() => setConfirmState({ type: null })}
        onConfirm={executeToggleItem}
      />
      <ConfirmationModal
        isOpen={confirmState.type === "delete-item"}
        title="Delete Item"
        message={
          confirmState.type === "delete-item"
            ? `Are you sure you want to delete "${confirmState.itemTitle}"?`
            : ""
        }
        confirmText="Delete"
        variant="danger"
        onCancel={() => setConfirmState({ type: null })}
        onConfirm={executeDeleteItem}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
