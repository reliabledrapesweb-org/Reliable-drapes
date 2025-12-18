"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, MapPin, Phone, Mail, Clock, Edit, Trash2, Power, PowerOff, Eye, EyeOff, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { title } from "process";

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

  // Form state
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

  // Fetch stores on mount
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
    setConfirmAction({
      type: "delete",
      storeId: id,
      storeName: name,
    });
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
      const result = await toggleStoreStatus(
        confirmAction.storeId,
        confirmAction.isActive
      );
      if (result.success) {
        addToast(
          `Store ${confirmAction.isActive ? "activated" : "deactivated"} successfully`,
          "success"
        );
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



  // Calculate stats
  const stats = {
    total: stores.length,
    active: stores.filter((s) => s.is_active).length,
    inactive: stores.filter((s) => !s.is_active).length,
  };

  if (adminLoading || isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">Store Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your physical store locations
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#2F2582] hover:bg-[#251e66] sm:w-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Store
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Total Stores</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Active Stores</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Inactive Stores</p>
          <p className="mt-1 text-2xl font-bold text-gray-600">{stats.inactive}</p>
        </div>
      </div>

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Stores ({stores.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <MapPin className="h-12 w-12 text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No stores yet</h3>
                        <p className="mt-2 text-sm text-gray-500">Get started by creating your first store.</p>
                        <Button
                          onClick={() => handleOpenModal()}
                          className="mt-4 bg-[#2F2582] hover:bg-[#251e66] cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                          Add Store
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F2582] text-white">
                            <MapPin className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {store.name}
                            </p>
                            <p className="truncate text-xs text-gray-500">{store.address}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{store.city}</div>
                          <div className="text-gray-500">
                            {store.state && `${store.state}, `}
                            {store.country}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {store.phone && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Phone className="h-3 w-3" />
                              {store.phone}
                            </div>
                          )}
                          {store.email && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <Mail className="h-3 w-3" />
                              {store.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(store)}
                          disabled={!!actionLoading[`toggle-${store.id}`]}
                          className={`h-8 px-3 disabled:opacity-50 cursor-pointer ${
                            store.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {actionLoading[`toggle-${store.id}`] ? (
                            <>
                              <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Updating...
                            </>
                          ) : store.is_active ? (
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
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenModal(store)}
                            disabled={Object.values(actionLoading).some(loading => loading !== null)}
                            className="h-8 w-8 text-gray-600 hover:text-blue-600 disabled:opacity-50 cursor-pointer"
                            title="Edit store"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(store.id, store.name)}
                            disabled={!!actionLoading[`delete-${store.id}`]}
                            className="h-8 w-8 text-gray-600 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                            title="Delete store"
                          >
                            {actionLoading[`delete-${store.id}`] ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-600 border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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
        message={`Are you sure you want to ${
          confirmAction.isActive ? "activate" : "deactivate"
        } "${confirmAction.storeName}"?`}
        confirmText={confirmAction.isActive ? "Activate" : "Deactivate"}
        variant={confirmAction.isActive ? "default" : "warning"}
      />

      {/* Add/Edit Store Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    {editingStore ? "Edit Store" : "Add New Store"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCloseModal}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Store Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="Enter store name"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="e.g., Lagos"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="e.g., Lagos State"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Country *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.country}
                        onChange={(e) =>
                          setFormData({ ...formData, country: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="e.g., Nigeria"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.postal_code}
                        onChange={(e) =>
                          setFormData({ ...formData, postal_code: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="100001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="+234 XXX XXX XXXX"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="store@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Latitude (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude || ""}
                        onChange={(e) =>
                          setFormData({ 
                            ...formData, 
                            latitude: e.target.value ? parseFloat(e.target.value) : undefined 
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="6.5244"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Longitude (Optional)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude || ""}
                        onChange={(e) =>
                          setFormData({ 
                            ...formData, 
                            longitude: e.target.value ? parseFloat(e.target.value) : undefined 
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                        placeholder="3.3792"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseModal}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!!actionLoading.create || !!actionLoading.update}
                      className="flex-1 bg-[#2F2582] hover:bg-[#251e66] disabled:opacity-50 cursor-pointer"
                    >
                      {(actionLoading.create || actionLoading.update) ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {editingStore ? "Updating..." : "Creating..."}
                        </div>
                      ) : (
                        editingStore ? "Update" : "Create"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
