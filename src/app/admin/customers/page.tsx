"use client";

import { useEffect, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Filter
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AdminPageLayout, AdminModal, FormField, TextInput, SelectInput as FormSelectInput } from "@/components/admin";

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
    <>
      <AdminPageLayout
      title="Customer Management"
      description="Manage users, roles, and permissions"
      stats={[
        { title: "Total Users", value: stats.total, icon: Users, iconColor: "text-blue-600" },
        { title: "Customers", value: stats.customers, icon: UserCheck, iconColor: "text-green-600" },
        { title: "Admins", value: stats.admins, icon: Crown, iconColor: "text-purple-600" },
      ]}
      searchPlaceholder="Search by name or email..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      filters={
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
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
        </AdminPageLayout>

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
