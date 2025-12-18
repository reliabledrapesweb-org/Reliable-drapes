"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAdmin } from "@/lib/hooks/useAdmin";
import {
  getAllUsers,
  getUserStats,
  updateUser,
  deleteUser,
  type UserProfile,
  type UpdateUserInput,
} from "@/lib/actions/users";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/ui/AdminPageSkeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Trash2, 
  Edit, 
  Users, 
  UserCheck, 
  Crown,
  Mail,
  Calendar,
  Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AdminModal, FormField, TextInput } from "@/components/admin";

export default function CustomersPage() {
  const { isAdmin, isLoading: adminLoading } = useAdmin();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [actionLoading, setActionLoading] = useState<{[key: string]: string | null}>({});
  const { toasts, addToast, removeToast } = useToast();

  const [stats, setStats] = useState({
    total: 0,
    customers: 0,
    admins: 0,
  });

  // Confirmation modal state
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "update" | null;
    userId?: string;
    userName?: string;
    data?: any;
  }>({ type: null });

  // Form state
  const [formData, setFormData] = useState<UpdateUserInput>({
    id: "",
    full_name: "",
    role: "customer",
  });

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const result = await getAllUsers();
    if (result.success && result.data) {
      setUsers(result.data);
    } else {
      addToast(result.error || "Failed to fetch users", "error");
    }
    setIsLoading(false);
  };

  const fetchStats = async () => {
    const result = await getUserStats();
    if (result.success && result.data) {
      setStats(result.data);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      full_name: user.full_name || "",
      role: user.role,
    });
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Show confirmation modal before updating
    setConfirmAction({
      type: "update",
      userId: formData.id,
      userName: editingUser?.full_name || editingUser?.email || "this user",
      data: formData,
    });
  };

  const executeUpdate = async () => {
    if (!confirmAction.data) return;
    setActionLoading(prev => ({ ...prev, update: "update" }));

    try {
      console.log("Attempting to update user with data:", confirmAction.data);
      const result = await updateUser(confirmAction.data);
      console.log("Update result:", result);
      
      if (result.success) {
        addToast("User updated successfully", "success");
        fetchUsers();
        fetchStats();
        handleCloseModal();
        setConfirmAction({ type: null });
      } else {
        console.error("Update failed:", result.error);
        addToast(result.error || "Failed to update user", "error");
        setConfirmAction({ type: null });
      }
    } catch (error) {
      console.error("Update error:", error);
      addToast("An unexpected error occurred", "error");
      setConfirmAction({ type: null });
    } finally {
      setActionLoading(prev => ({ ...prev, update: null }));
    }
  };

  const handleDelete = (userId: string, userName: string) => {
    setConfirmAction({
      type: "delete",
      userId,
      userName,
    });
  };

  const executeDelete = async () => {
    if (!confirmAction.userId) return;
    setActionLoading(prev => ({ ...prev, [`delete-${confirmAction.userId}`]: "delete" }));

    try {
      const result = await deleteUser(confirmAction.userId);
      if (result.success) {
        addToast("User deleted successfully", "success");
        fetchUsers();
        fetchStats();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to delete user", "error");
        setConfirmAction({ type: null });
      }
    } finally {
      setActionLoading(prev => ({ ...prev, [`delete-${confirmAction.userId}`]: null }));
    }
  };



  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (adminLoading || isLoading) {
    return <AdminPageSkeleton />;
  }

  if (!isAdmin) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
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

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            Customer Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage users, roles, and permissions
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Total Users</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Customers</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{stats.customers}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-600">Admins</p>
            <p className="mt-1 text-2xl font-bold text-purple-600">{stats.admins}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#2F2582] focus:outline-none"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Users List */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-lg font-medium text-gray-900">No users found</p>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2F2582] text-white">
                        <span className="text-sm font-medium">
                          {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {user.full_name || "No name"}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                          >
                            {user.role === "admin" && <Crown className="h-3 w-3" />}
                            {user.role}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(user.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        disabled={Object.values(actionLoading).some(loading => loading !== null)}
                        className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id, user.full_name || user.email || "")}
                        disabled={!!actionLoading[`delete-${user.id}`]}
                        className="rounded-lg border border-red-200 bg-white p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                        title="Delete user"
                      >
                        {actionLoading[`delete-${user.id}`] ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <AdminModal
        isOpen={showEditModal}
        onClose={handleCloseModal}
        title="Edit User"
        subtitle={editingUser ? `Update information for ${editingUser.full_name || editingUser.email}` : undefined}
        onSubmit={handleSubmit}
        submitLabel="Update User"
        isSubmitting={!!actionLoading.update}
        maxWidth="md"
      >
        <FormField label="Full Name">
          <TextInput
            value={formData.full_name}
            onChange={(value) => setFormData({ ...formData, full_name: value })}
            placeholder="Enter full name"
          />
        </FormField>

        <FormField label="Email (Read-only)">
          <TextInput
            value={editingUser?.email || ""}
            onChange={() => {}}
            disabled
          />
        </FormField>

        <FormField label="Role" required>
          <Select
            value={formData.role}
            onValueChange={(value: "customer" | "admin") =>
              setFormData({ ...formData, role: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </AdminModal>

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmAction.type === "delete"}
        title="Delete User"
        message={`Are you sure you want to delete ${confirmAction.userName}? This action cannot be undone and will permanently remove all user data.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmAction({ type: null })}
      />

      <ConfirmationModal
        isOpen={confirmAction.type === "update"}
        title="Update User"
        message={`Update user information for ${confirmAction.userName}? This will change their profile details.`}
        confirmText="Update"
        cancelText="Cancel"
        onConfirm={executeUpdate}
        onCancel={() => setConfirmAction({ type: null })}
      />
    </>
  );
}
