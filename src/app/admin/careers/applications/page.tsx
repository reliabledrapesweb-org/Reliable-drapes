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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
          Job Applications
        </h1>
        <p className="mt-1 text-xs text-gray-600 sm:text-sm">
          Review and manage job applications from candidates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Total</p>
          <p className="mt-1 text-lg font-bold text-gray-900 sm:text-2xl">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Pending</p>
          <p className="mt-1 text-lg font-bold text-yellow-600 sm:text-2xl">{stats.pending}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Reviewed</p>
          <p className="mt-1 text-lg font-bold text-blue-600 sm:text-2xl">{stats.reviewed}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Shortlisted</p>
          <p className="mt-1 text-lg font-bold text-green-600 sm:text-2xl">{stats.shortlisted}</p>
        </div>
        <div className="col-span-2 sm:col-span-1 rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
          <p className="text-xs font-medium text-gray-600 sm:text-sm">Rejected</p>
          <p className="mt-1 text-lg font-bold text-red-600 sm:text-2xl">{stats.rejected}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {["all", "pending", "reviewed", "shortlisted", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm ${
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
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <FileText className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-base font-medium text-gray-900 sm:text-lg">No applications found</p>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
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
                className="p-3 hover:bg-gray-50 transition-colors sm:p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {application.full_name}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(application.status)}`}
                      >
                        {application.status}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#2F2582] mb-2 sm:text-sm">
                      {application.job_title}
                      <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {application.job_type}
                      </span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[150px] sm:max-w-none">{application.email}</span>
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
                  <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                    <Select
                      value={application.status}
                      onValueChange={(value) => handleStatusChange(application.id, value)}
                    >
                      <SelectTrigger className="w-full sm:w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
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
