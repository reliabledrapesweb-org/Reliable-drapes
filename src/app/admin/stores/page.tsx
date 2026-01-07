"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Phone, Mail, Edit, Trash2, Eye, EyeOff, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/ui/AdminPageSkeleton";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { useAdmin } from "@/lib/hooks/useAdmin";
import {
  getAllStoresAdmin,
  createStore,
  updateStore,
  deleteStore,
  toggleStoreStatus,
  type Store,
  type StoreFormData,
} from "@/lib/actions/stores";

export default function StoresAdminPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [actionLoading, setActionLoading] = useState<{[key: string]: string | null}>({});
  const { toasts, addToast, removeToast } = useToast();
  
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "toggle" | null;
    storeId?: string;
    storeName?: string;
    isActive?: boolean;
  }>({ type: null });

  const [formData, setFormData] = useState<StoreFormData>({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postal_code: "",
    phone: "",
    email: "",
    hours: undefined,
    latitude: undefined,
    longitude: undefined,
    is_active: true,
  });

  useEffect(() => {
    if (isAdmin) {
      fetchStores();
    }
  }, [isAdmin]);

  const fetchStores = async () => {
    setIsLoading(true);
    const result = await getAllStoresAdmin();
    if (result.success && result.stores) {
      setStores(result.stores);
    }
    setIsLoading(false);
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmAction({ type: "delete", storeId: id, storeName: name });
  };

  const handleToggleStatus = (store: Store) => {
    setConfirmAction({
      type: "toggle",
      storeId: store.id,
      storeName: store.name,
      isActive: !store.is_active,
    });
  };

  const handleOpenModal = (store?: Store) => {
    if (store) {
      setEditingStore(store);
      setFormData({
        name: store.name,
        address: store.address,
        city: store.city,
        state: store.state || "",
        country: store.country,
        postal_code: store.postal_code || "",
        phone: store.phone || "",
        email: store.email || "",
        hours: store.hours || undefined,
        latitude: store.latitude || undefined,
        longitude: store.longitude || undefined,
        is_active: store.is_active,
      });
    } else {
      setEditingStore(null);
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
        phone: "",
        email: "",
        hours: undefined,
        latitude: undefined,
        longitude: undefined,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStore(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionKey = editingStore ? "update" : "create";
    setActionLoading(prev => ({ ...prev, [actionKey]: actionKey }));

    try {
      if (editingStore) {
        const result = await updateStore(editingStore.id, formData);
        if (result.success) {
          addToast("Store updated successfully", "success");
          fetchStores();
          handleCloseModal();
        } else {
          addToast(result.error || "Failed to update store", "error");
        }
      } else {
        const result = await createStore(formData);
        if (result.success) {
          addToast("Store created successfully", "success");
          fetchStores();
          handleCloseModal();
        } else {
          addToast(result.error || "Failed to create store", "error");
        }
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [actionKey]: null }));
    }
  };

  const executeDelete = async () => {
    if (!confirmAction.storeId) return;
    setActionLoading(prev => ({ ...prev, [`delete-${confirmAction.storeId}`]: "delete" }));

    try {
      const result = await deleteStore(confirmAction.storeId);
      if (result.success) {
        addToast("Store deleted successfully", "success");
        fetchStores();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to delete store", "error");
        setConfirmAction({ type: null });
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${confirmAction.storeId}`]: null }));
    }
  };

  const executeToggleStatus = async () => {
    if (!confirmAction.storeId || confirmAction.isActive === undefined) return;
    setActionLoading(prev => ({ ...prev, [`toggle-${confirmAction.storeId}`]: "toggle" }));

    try {
      const result = await toggleStoreStatus(confirmAction.storeId, confirmAction.isActive);
      if (result.success) {
        addToast(`Store ${confirmAction.isActive ? "activated" : "deactivated"} successfully`, "success");
        fetchStores();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to update store status", "error");
        setConfirmAction({ type: null });
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [`toggle-${confirmAction.storeId}`]: null }));
    }
  };

  const stats = {
    total: stores.length,
    active: stores.filter((s) => s.is_active).length,
    inactive: stores.filter((s) => !s.is_active).length,
  };

  if (adminLoading || isLoading) {
    return <AdminPageSkeleton />;
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
            Store Management
          </h1>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            Manage your physical store locations
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="w-full bg-[#2F2582] hover:bg-[#251e66] sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Store
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Total</p>
          <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Active</p>
          <p className="mt-1 text-lg font-bold text-green-600 sm:text-2xl">{stats.active}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Inactive</p>
          <p className="mt-1 text-lg font-bold text-gray-600 sm:text-2xl">{stats.inactive}</p>
        </div>
      </div>

      {/* Stores List */}
      <Card>
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <CardTitle className="text-base font-semibold sm:text-lg">
            Stores ({stores.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {stores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <MapPin className="h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-base font-medium text-gray-900 sm:text-lg">No stores yet</h3>
              <p className="mt-2 text-xs text-gray-500 sm:text-sm">Get started by creating your first store.</p>
              <Button
                onClick={() => handleOpenModal()}
                className="mt-4 bg-[#2F2582] hover:bg-[#251e66]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Store
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="divide-y divide-gray-100 sm:hidden">
                {stores.map((store) => (
                  <div key={store.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F2582] text-white">
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{store.name}</h3>
                          <p className="text-xs text-gray-500 truncate">{store.address}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleToggleStatus(store)}
                        disabled={!!actionLoading[`toggle-${store.id}`]}
                        className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
                          store.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {store.is_active ? "Active" : "Inactive"}
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>{store.city}, {store.state && `${store.state}, `}{store.country}</p>
                      {store.phone && (
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {store.phone}
                        </p>
                      )}
                      {store.email && (
                        <p className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {store.email}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(store)}
                        className="flex-1 h-9"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(store.id, store.name)}
                        disabled={!!actionLoading[`delete-${store.id}`]}
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
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Store</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Location</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600 hidden lg:table-cell">Contact</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stores.map((store) => (
                      <tr key={store.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F2582] text-white">
                              <MapPin className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{store.name}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[200px]">{store.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <p className="font-medium">{store.city}</p>
                            <p className="text-gray-500 text-xs">
                              {store.state && `${store.state}, `}{store.country}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="text-xs space-y-1">
                            {store.phone && (
                              <p className="flex items-center gap-1 text-gray-600">
                                <Phone className="h-3 w-3" /> {store.phone}
                              </p>
                            )}
                            {store.email && (
                              <p className="flex items-center gap-1 text-gray-600">
                                <Mail className="h-3 w-3" /> {store.email}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleToggleStatus(store)}
                            disabled={!!actionLoading[`toggle-${store.id}`]}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                              store.is_active
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {actionLoading[`toggle-${store.id}`] ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : store.is_active ? (
                              <Eye className="h-3 w-3" />
                            ) : (
                              <EyeOff className="h-3 w-3" />
                            )}
                            {store.is_active ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenModal(store)}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(store.id, store.name)}
                              disabled={!!actionLoading[`delete-${store.id}`]}
                              className="h-8 w-8 p-0 text-gray-600 hover:text-red-600"
                            >
                              {actionLoading[`delete-${store.id}`] ? (
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmAction.type === "delete"}
        onCancel={() => setConfirmAction({ type: null })}
        onConfirm={executeDelete}
        title="Delete Store"
        message={`Are you sure you want to delete "${confirmAction.storeName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      <ConfirmationModal
        isOpen={confirmAction.type === "toggle"}
        onCancel={() => setConfirmAction({ type: null })}
        onConfirm={executeToggleStatus}
        title={confirmAction.isActive ? "Activate Store" : "Deactivate Store"}
        message={`Are you sure you want to ${confirmAction.isActive ? "activate" : "deactivate"} "${confirmAction.storeName}"?`}
        confirmText={confirmAction.isActive ? "Activate" : "Deactivate"}
        variant={confirmAction.isActive ? "default" : "warning"}
      />

      {/* Add/Edit Store Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="w-full max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
                <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                  {editingStore ? "Edit Store" : "Add New Store"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="Enter store name"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="e.g., Lagos"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="e.g., Lagos State"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="e.g., Nigeria"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="100001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="+234 XXX XXX XXXX"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="store@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude || ""}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="6.5244"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude || ""}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="3.3792"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!!actionLoading.create || !!actionLoading.update}
                    className="w-full bg-[#2F2582] hover:bg-[#251e66] sm:flex-1"
                  >
                    {(actionLoading.create || actionLoading.update) ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {editingStore ? "Updating..." : "Creating..."}
                      </div>
                    ) : (
                      editingStore ? "Update Store" : "Create Store"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
