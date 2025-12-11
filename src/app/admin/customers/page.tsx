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
import { 
  Search, 
  Trash2, 
  Edit, 
  X, 
  Users, 
  UserCheck, 
  Crown,
  Filter,
  Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Customer Management</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">Manage users, roles, and permissions</p>
        </div>
        <Button className="bg-[#2F2582] hover:bg-[#251e66] sm:w-auto cursor-pointer">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-blue-600">{stats.customers}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-[#2F2582]">{stats.admins}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Crown className="h-6 w-6 text-[#2F2582]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Users className="h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
                      <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F2582] text-white">
                          <span className="text-sm font-medium">
                            {(user.full_name || user.email || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {user.full_name || "No name"}
                          </p>
                          <p className="truncate text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                      >
                        {user.role === "admin" && <Crown className="mr-1 h-3 w-3" />}
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(user.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleOpenEditModal(user)}
                          disabled={Object.values(actionLoading).some(loading => loading !== null)}
                          className="h-8 w-8 text-gray-600 hover:text-blue-600 disabled:opacity-50 cursor-pointer"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(user.id, user.full_name || "")}
                          disabled={!!actionLoading[`delete-${user.id}`]}
                          className="h-8 w-8 text-gray-600 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                          title="Delete user"
                        >
                          {actionLoading[`delete-${user.id}`] ? (
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

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Edit User</CardTitle>
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
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="Enter full name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Email (Read-only)
                    </label>
                    <input
                      type="email"
                      value={editingUser.email || ""}
                      disabled
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          role: e.target.value as "customer" | "admin",
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
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
                      disabled={!!actionLoading.update}
                      className="flex-1 bg-[#2F2582] hover:bg-[#251e66] disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading.update ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Updating...
                        </div>
                      ) : (
                        "Update User"
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
    </div>
  );
}
