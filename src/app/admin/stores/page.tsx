"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Phone, Mail, Clock, Edit, Trash2, Power, PowerOff } from "lucide-react";
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
import { useAuthStore } from "@/lib/store";
import {
  getAllStoresAdmin,
  deleteStore,
  toggleStoreStatus,
  type Store,
} from "@/lib/actions/stores";

export default function StoresAdminPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "toggle" | null;
    storeId?: string;
    storeName?: string;
    isActive?: boolean;
  }>({ type: null });

  // Fetch stores on mount
  useEffect(() => {
    fetchStores();
  }, []);

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

  const executeDelete = async () => {
    if (!confirmAction.storeId) return;
    
    const result = await deleteStore(confirmAction.storeId);
    if (result.success) {
      addToast("Store deleted successfully!", "success");
      fetchStores();
      setConfirmAction({ type: null });
    } else {
      addToast(result.error || "Failed to delete store", "error");
    }
  };

  const executeToggleStatus = async () => {
    if (!confirmAction.storeId || confirmAction.isActive === undefined) return;
    
    const result = await toggleStoreStatus(
      confirmAction.storeId,
      confirmAction.isActive
    );
    if (result.success) {
      addToast(
        `Store ${confirmAction.isActive ? "activated" : "deactivated"} successfully!`,
        "success"
      );
      fetchStores();
      setConfirmAction({ type: null });
    } else {
      addToast(result.error || "Failed to update store status", "error");
    }
  };

  const addToast = (message: string, type: "success" | "error") => {
    // Using browser toast for now - replace with your toast system
    if (type === "success") {
      alert(message);
    } else {
      alert(`Error: ${message}`);
    }
  };

  // Calculate stats
  const stats = {
    total: stores.length,
    active: stores.filter((s) => s.is_active).length,
    inactive: stores.filter((s) => !s.is_active).length,
  };

  if (isLoading) {
    return <AdminPageSkeleton rows={5} columns={7} statsCount={3} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your physical store locations
          </p>
        </div>
        <Button
          onClick={() => router.push("/admin/stores/create")}
          className="bg-[#2f2581] hover:bg-[#221a5f] text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Store
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stores</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Stores</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Power className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Stores</p>
                <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <PowerOff className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stores Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Stores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No stores found. Add your first store to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  stores.map((store) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">{store.name}</TableCell>
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
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            store.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {store.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(store.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(store)}
                            className={
                              store.is_active
                                ? "text-gray-600 hover:text-gray-900"
                                : "text-green-600 hover:text-green-700"
                            }
                          >
                            {store.is_active ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/admin/stores/edit/${store.id}`)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(store.id, store.name)}
                            className="text-red-600 hover:text-red-700"
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
          </div>
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
    </div>
  );
}
