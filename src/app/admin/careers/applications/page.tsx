"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Trash2, Download, FileText, Mail, Phone, Calendar, Briefcase } from "lucide-react";
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
  getAllJobApplications,
  updateApplicationStatus,
  deleteJobApplication,
  getApplicationStats,
  type JobApplicationWithJob,
} from "@/lib/actions/job-applications";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<JobApplicationWithJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
  });
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | null;
    applicationId?: string;
    candidateName?: string;
  }>({ type: null });
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const result = await getAllJobApplications();
      if (result.success && result.data) {
        setApplications(result.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    const result = await getApplicationStats();
    if (result.success && result.data) {
      setStats(result.data);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const result = await updateApplicationStatus(
        id,
        status as "pending" | "reviewed" | "shortlisted" | "rejected"
      );
      if (result.success) {
        addToast(`Application status updated to ${status}`, "success");
        fetchApplications();
        fetchStats();
      } else {
        addToast(result.error || "Failed to update status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      addToast("Failed to update status", "error");
    }
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmAction({
      type: "delete",
      applicationId: id,
      candidateName: name,
    });
  };

  const executeDelete = async () => {
    if (!confirmAction.applicationId) return;

    try {
      const result = await deleteJobApplication(confirmAction.applicationId);
      if (result.success) {
        addToast("Application deleted successfully!", "success");
        fetchApplications();
        fetchStats();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to delete application", "error");
        setConfirmAction({ type: null });
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      addToast("Failed to delete application", "error");
      setConfirmAction({ type: null });
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filterStatus === "all") return true;
    return app.status === filterStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-blue-100 text-blue-800";
      case "shortlisted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
          Job Applications
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Review and manage job applications from candidates
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Pending</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Reviewed</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats.reviewed}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Shortlisted</p>
          <p className="mt-1 text-2xl font-bold text-green-600">{stats.shortlisted}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Rejected</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {["all", "pending", "reviewed", "shortlisted", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filterStatus === status
                ? "bg-[#2F2582] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {filteredApplications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">No applications found</p>
            <p className="mt-1 text-sm text-gray-500">
              {filterStatus !== "all"
                ? "Try adjusting your filter"
                : "Applications will appear here once candidates apply"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {application.full_name}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(application.status)}`}
                      >
                        {application.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#2F2582] mb-2">
                      {application.job_title}
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {application.job_type}
                      </span>
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {application.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {application.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(application.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={application.status}
                      onValueChange={(value) => handleStatusChange(application.id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <a
                      href={application.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50"
                      title="View Resume"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href={application.resume_url}
                      download
                      className="rounded-lg border border-green-200 bg-white p-2 text-green-600 transition-colors hover:bg-green-50"
                      title="Download Resume"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(application.id, application.full_name)}
                      className="rounded-lg border border-red-200 bg-white p-2 text-red-600 transition-colors hover:bg-red-50"
                      title="Delete"
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
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmAction.type === "delete"}
        title="Delete Application"
        message={`Are you sure you want to delete the application from ${confirmAction.candidateName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={executeDelete}
        onCancel={() => setConfirmAction({ type: null })}
      />
    </div>
  );
}
