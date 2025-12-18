"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Briefcase, X } from "lucide-react";
import { motion } from "framer-motion";
import { AdminPageSkeleton } from "@/components/ui/AdminPageSkeleton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmationModal } from "@/components/shared";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import {
  getAllJobs,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
  type Job,
} from "@/lib/actions/jobs";

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    experience: "",
    location: "",
    type: "Store" as "Store" | "Corporate" | "Design" | "Warehouse",
    description: "",
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "toggle" | null;
    jobId?: string;
    jobTitle?: string;
    isActive?: boolean;
  }>({ type: null });
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const result = await getAllJobs();
      if (result.success && result.data) {
        setJobs(result.data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingJob) {
        const result = await updateJob(editingJob.id, formData);
        if (result.success) {
          addToast("Job updated successfully!", "success");
          handleCloseModal();
          fetchJobs();
        } else {
          addToast(result.error || "Failed to update job", "error");
        }
      } else {
        const result = await createJob(formData);
        if (result.success) {
          addToast("Job created successfully!", "success");
          handleCloseModal();
          fetchJobs();
        } else {
          addToast(result.error || "Failed to create job", "error");
        }
      }
    } catch (error) {
      console.error("Error saving job:", error);
      addToast("Failed to save job", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      experience: job.experience,
      location: job.location,
      type: job.type,
      description: job.description,
      is_active: job.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    setConfirmAction({
      type: "delete",
      jobId: id,
      jobTitle: title,
    });
  };

  const executeDelete = async () => {
    if (!confirmAction.jobId) return;

    try {
      const result = await deleteJob(confirmAction.jobId);
      if (result.success) {
        addToast("Job deleted successfully!", "success");
        fetchJobs();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to delete job", "error");
        setConfirmAction({ type: null });
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      addToast("Failed to delete job", "error");
      setConfirmAction({ type: null });
    }
  };

  const handleToggleStatus = (job: Job) => {
    setConfirmAction({
      type: "toggle",
      jobId: job.id,
      jobTitle: job.title,
      isActive: !job.is_active,
    });
  };

  const executeToggle = async () => {
    if (!confirmAction.jobId || confirmAction.isActive === undefined) return;

    try {
      const result = await toggleJobStatus(confirmAction.jobId, confirmAction.isActive);
      if (result.success) {
        addToast(
          `Job ${confirmAction.isActive ? "activated" : "deactivated"} successfully!`,
          "success"
        );
        fetchJobs();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to update job status", "error");
        setConfirmAction({ type: null });
      }
    } catch (error) {
      console.error("Error toggling job status:", error);
      addToast("Failed to update job status", "error");
      setConfirmAction({ type: null });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingJob(null);
    setFormData({
      title: "",
      experience: "",
      location: "",
      type: "Store",
      description: "",
      is_active: true,
    });
  };

  const handleOpenNewJobModal = () => {
    setEditingJob(null);
    setFormData({
      title: "",
      experience: "",
      location: "",
      type: "Store",
      description: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Job Listings</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Manage job openings and career opportunities
          </p>
        </div>
        <Button
          onClick={handleOpenNewJobModal}
          className="bg-[#2F2582] hover:bg-[#251e66] sm:w-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Total Jobs</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{jobs.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Active Jobs</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {jobs.filter((j) => j.is_active).length}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Inactive Jobs</p>
          <p className="mt-1 text-2xl font-bold text-gray-600">
            {jobs.filter((j) => !j.is_active).length}
          </p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No job listings yet</p>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first job listing
            </p>
            <Button
              onClick={handleOpenNewJobModal}
              className="mt-4 bg-[#2F2582] hover:bg-[#251e66] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add New Job
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {jobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {job.type}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          job.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {job.is_active ? (
                          <>
                            <Eye className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3" />
                            Inactive
                          </>
                        )}
                      </span>
                    </div>
                    {job.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {job.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {job.experience}
                      </span>
                      <span>{job.location}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(job)}
                      className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50"
                      title="Edit job"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(job)}
                      className={`rounded-lg border p-2 transition-colors ${
                        job.is_active
                          ? "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          : "border-green-200 bg-white text-green-600 hover:bg-green-50"
                      }`}
                      title={job.is_active ? "Deactivate" : "Activate"}
                    >
                      {job.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(job.id, job.title)}
                      className="rounded-lg border border-red-200 bg-white p-2 text-red-600 transition-colors hover:bg-red-50"
                      title="Delete job"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Job Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">
                    {editingJob ? "Edit Job Listing" : "Add New Job Listing"}
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
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      placeholder="Enter job title"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Type *
                      </label>
                      <Select
                        required
                        value={formData.type}
                        onValueChange={(value: typeof formData.type) =>
                          setFormData({ ...formData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Store">Store</SelectItem>
                          <SelectItem value="Corporate">Corporate</SelectItem>
                          <SelectItem value="Design">Design</SelectItem>
                          <SelectItem value="Warehouse">Warehouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Experience *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.experience}
                        onChange={(e) =>
                          setFormData({ ...formData, experience: e.target.value })
                        }
                        placeholder="e.g., 2 - 4 yrs"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Mumbai, Delhi"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={4}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20 resize-none"
                      placeholder="Enter job description"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({ ...formData, is_active: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active (visible to job seekers)
                    </label>
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
                      disabled={isSubmitting}
                      className="flex-1 bg-[#2F2582] hover:bg-[#251e66] disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {editingJob ? "Updating..." : "Creating..."}
                        </div>
                      ) : (
                        editingJob ? "Update" : "Create"
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
        title="Delete Job"
        message={`Are you sure you want to delete "${confirmAction.jobTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmAction({ type: null })}
      />

      <ConfirmationModal
        isOpen={confirmAction.type === "toggle"}
        title={confirmAction.isActive ? "Activate Job" : "Deactivate Job"}
        message={`${confirmAction.isActive ? "Activate" : "Deactivate"} "${confirmAction.jobTitle}"? ${confirmAction.isActive ? "It will be visible to job seekers." : "It will be hidden from job seekers."}`}
        confirmText={confirmAction.isActive ? "Activate" : "Deactivate"}
        cancelText="Cancel"
        variant="warning"
        onConfirm={executeToggle}
        onCancel={() => setConfirmAction({ type: null })}
      />
    </div>
  );
}
