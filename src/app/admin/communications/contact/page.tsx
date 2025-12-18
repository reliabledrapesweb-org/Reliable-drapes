"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  Calendar,
  Trash2,
  Eye,
  Check,
  Clock,
  Archive,
} from "lucide-react";
import {
  getContactSubmissions,
  updateContactSubmission,
  deleteContactSubmission,
  type ContactSubmission,
} from "@/lib/actions/communications";
import { AdminModal } from "@/components/admin/AdminModal";

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContactSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchSubmissions = async () => {
    setIsLoading(true);
    const result = await getContactSubmissions();
    if (result.success && result.data) {
      setSubmissions(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: ContactSubmission["status"]
  ) => {
    const result = await updateContactSubmission(id, { status });
    if (result.success) {
      fetchSubmissions();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this submission?")) {
      const result = await deleteContactSubmission(id);
      if (result.success) {
        fetchSubmissions();
      }
    }
  };

  const handleView = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-yellow-100 text-yellow-700";
      case "resolved":
        return "bg-green-100 text-green-700";
      case "archived":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <Mail className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <Check className="h-4 w-4" />;
      case "archived":
        return <Archive className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const filteredSubmissions =
    filter === "all"
      ? submissions
      : submissions.filter((s) => s.status === filter);

  const stats = {
    total: submissions.length,
    new: submissions.filter((s) => s.status === "new").length,
    in_progress: submissions.filter((s) => s.status === "in_progress").length,
    resolved: submissions.filter((s) => s.status === "resolved").length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
          Contact Submissions
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage customer inquiries and messages
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">New</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">{stats.new}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">In Progress</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">
            {stats.in_progress}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Resolved</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {stats.resolved}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {["all", "new", "in_progress", "resolved", "archived"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === status
                ? "bg-[#2F2582] text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F2582] border-t-transparent" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">
              No submissions found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Contact submissions will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredSubmissions.map((submission, index) => (
              <motion.div
                key={submission.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {submission.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(submission.status)}`}
                      >
                        {getStatusIcon(submission.status)}
                        {submission.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {submission.subject}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {submission.message}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {submission.email}
                      </span>
                      {submission.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {submission.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(submission.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(submission)}
                      className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <select
                      value={submission.status}
                      onChange={(e) =>
                        handleStatusChange(
                          submission.id,
                          e.target.value as ContactSubmission["status"]
                        )
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                    <button
                      onClick={() => handleDelete(submission.id)}
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

      {/* View Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSubmission(null);
        }}
        title="Contact Submission Details"
        onSubmit={(e) => {
          e.preventDefault();
          setIsModalOpen(false);
          setSelectedSubmission(null);
        }}
        submitLabel="Close"
        cancelLabel="Close"
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">{selectedSubmission.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{selectedSubmission.email}</p>
            </div>
            {selectedSubmission.phone && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="mt-1 text-gray-900">{selectedSubmission.phone}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Subject
              </label>
              <p className="mt-1 text-gray-900">{selectedSubmission.subject}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Message
              </label>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                {selectedSubmission.message}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedSubmission.status)}`}
                >
                  {getStatusIcon(selectedSubmission.status)}
                  {selectedSubmission.status.replace("_", " ")}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Submitted
              </label>
              <p className="mt-1 text-gray-900">
                {new Date(selectedSubmission.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
