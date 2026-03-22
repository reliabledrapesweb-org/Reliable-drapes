"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Tag,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/ui/AdminPageSkeleton";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { useAdmin } from "@/lib/hooks/useAdmin";
import {
  getAllCouponsAdmin,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  type Coupon,
  type CouponFormData,
} from "@/lib/actions/coupons";

const emptyForm: CouponFormData = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_value: 0,
  max_uses: undefined,
  valid_from: "",
  valid_until: "",
  is_active: true,
};

export default function CouponsAdminPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const { toasts, addToast, removeToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>(emptyForm);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "toggle" | null;
    couponId?: string;
    couponCode?: string;
    nextActive?: boolean;
  }>({ type: null });

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    const result = await getAllCouponsAdmin();
    if (result.success && result.coupons) {
      setCoupons(result.coupons);
    } else {
      addToast(result.error || "Failed to load coupons", "error");
    }
    setIsLoading(false);
  }, [addToast]);

  useEffect(() => {
    if (isAdmin) {
      void fetchCoupons();
    }
  }, [isAdmin, fetchCoupons]);

  const filtered = coupons.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.code.toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q)
    );
  });

  function openModal(item?: Coupon) {
    if (item) {
      setEditing(item);
      setFormData({
        code: item.code,
        description: item.description || "",
        discount_type: item.discount_type || "percentage",
        discount_value: item.discount_value,
        min_order_value: item.min_order_value,
        max_uses: item.max_uses || undefined,
        valid_from: item.valid_from || "",
        valid_until: item.valid_until || "",
        is_active: item.is_active,
      });
    } else {
      setEditing(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const key = editing ? "update" : "create";
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const payload: CouponFormData = {
        ...formData,
        code: formData.code.trim().toUpperCase(),
        description: formData.description?.trim() || undefined,
        min_order_value: formData.min_order_value || 0,
        max_uses: formData.max_uses || undefined,
        valid_from: formData.valid_from || undefined,
        valid_until: formData.valid_until || undefined,
      };

      const result = editing
        ? await updateCoupon(editing.id, payload)
        : await createCoupon(payload);

      if (!result.success) {
        addToast(result.error || "Failed to save coupon", "error");
        return;
      }

      addToast(editing ? "Coupon updated successfully" : "Coupon created successfully", "success");
      setShowModal(false);
      await fetchCoupons();
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function executeDelete() {
    if (!confirmAction.couponId) return;
    const key = `delete-${confirmAction.couponId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await deleteCoupon(confirmAction.couponId);
      if (!result.success) {
        addToast(result.error || "Failed to delete coupon", "error");
      } else {
        addToast("Coupon deleted successfully", "success");
        await fetchCoupons();
      }
    } finally {
      setConfirmAction({ type: null });
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  async function executeToggle() {
    if (!confirmAction.couponId || confirmAction.nextActive === undefined) {
      return;
    }
    const key = `toggle-${confirmAction.couponId}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await toggleCouponStatus(
        confirmAction.couponId,
        confirmAction.nextActive,
      );
      if (!result.success) {
        addToast(result.error || "Failed to update coupon status", "error");
      } else {
        addToast(
          `Coupon ${confirmAction.nextActive ? "activated" : "deactivated"}`,
          "success",
        );
        await fetchCoupons();
      }
    } finally {
      setConfirmAction({ type: null });
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  }

  if (adminLoading || isLoading) {
    return <AdminPageSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Coupons & Offers
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Create and manage active offers for the shop page
          </p>
        </div>
        <Button
          onClick={() => openModal()}
          className="w-full bg-[#2F2582] hover:bg-[#251e66] sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Coupon
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by coupon code or description..."
          className="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coupons ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No coupons found.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filtered.map((item) => (
                <div key={item.id} className="space-y-3 p-4 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-[#2F2582]" />
                        <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                          {item.code}
                        </h3>
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600">{item.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600 sm:text-sm">
                        <span className="rounded-full bg-gray-100 px-2.5 py-1">
                          {item.discount_type === "percentage"
                            ? `${item.discount_value}% OFF`
                            : `INR ${item.discount_value} OFF`}
                        </span>
                        {item.min_order_value > 0 && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1">
                            Min order INR {item.min_order_value}
                          </span>
                        )}
                        {item.max_uses && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1">
                            Uses {item.current_uses}/{item.max_uses}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setConfirmAction({
                            type: "toggle",
                            couponId: item.id,
                            couponCode: item.code,
                            nextActive: !item.is_active,
                          })
                        }
                        disabled={actionLoading[`toggle-${item.id}`]}
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
                        {item.is_active ? "Active" : "Inactive"}
                      </button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openModal(item)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setConfirmAction({
                            type: "delete",
                            couponId: item.id,
                            couponCode: item.code,
                          })
                        }
                        disabled={actionLoading[`delete-${item.id}`]}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 80 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 80 }}
              className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editing ? "Edit Coupon" : "Add Coupon"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Coupon Code *
                  </label>
                  <input
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, code: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm uppercase focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    placeholder="SAVE10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    placeholder="Flat offer for first-time buyers"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Discount Type *
                    </label>
                    <select
                      value={formData.discount_type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discount_type: e.target.value as "percentage" | "fixed",
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      required
                      value={formData.discount_value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discount_value: Number(e.target.value || 0),
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Minimum Order Value
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.min_order_value || 0}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          min_order_value: Number(e.target.value || 0),
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Max Uses
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.max_uses || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          max_uses: e.target.value ? Number(e.target.value) : undefined,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Valid From
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.valid_from || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          valid_from: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Valid Until
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.valid_until || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          valid_until: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={!!formData.is_active}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_active: e.target.checked,
                      }))
                    }
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    Active (display in shop offers)
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={actionLoading.create || actionLoading.update}
                    className="w-full bg-[#2F2582] hover:bg-[#251e66] sm:flex-1"
                  >
                    {actionLoading.create || actionLoading.update
                      ? "Saving..."
                      : editing
                        ? "Update Coupon"
                        : "Create Coupon"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={confirmAction.type === "delete"}
        title="Delete Coupon"
        message={`Are you sure you want to delete "${confirmAction.couponCode}"?`}
        confirmText="Delete"
        variant="danger"
        onCancel={() => setConfirmAction({ type: null })}
        onConfirm={executeDelete}
      />
      <ConfirmationModal
        isOpen={confirmAction.type === "toggle"}
        title={confirmAction.nextActive ? "Activate Coupon" : "Deactivate Coupon"}
        message={`Are you sure you want to ${confirmAction.nextActive ? "activate" : "deactivate"} "${confirmAction.couponCode}"?`}
        confirmText={confirmAction.nextActive ? "Activate" : "Deactivate"}
        variant={confirmAction.nextActive ? "default" : "warning"}
        onCancel={() => setConfirmAction({ type: null })}
        onConfirm={executeToggle}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
