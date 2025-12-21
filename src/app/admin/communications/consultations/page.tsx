"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Mail,
  Phone,
  Trash2,
  Eye,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import {
  getConsultationRequests,
  updateConsultationRequest,
  deleteConsultationRequest,
  type ConsultationRequest,
} from "@/lib/actions/communications";
import { AdminModal } from "@/components/admin/AdminModal";

export default function ConsultationsPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<ConsultationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchRequests = async () => {
    setIsLoading(true);
    const result = await getConsultationRequests();
    if (result.success && result.data) {
      setRequests(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: ConsultationRequest["status"]
  ) => {
    const result = await updateConsultationRequest(id, { status });
    if (result.success) {
      fetchRequests();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this consultation request?")) {
      const result = await deleteConsultationRequest(id);
      if (result.success) {
        fetchRequests();
      }
    }
  };

  const handleView = (request: ConsultationRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "confirmed":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <Check className="h-4 w-4" />;
      case "completed":
        return <Check className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getServiceTypeDisplay = (serviceType: string) => {
    const serviceTypes: Record<string, string> = {
      "interior-design": "Interior Design Consultation",
      "color-consultation": "Color & Style Consultation", 
      "space-planning": "Space Planning",
      "custom-design": "Custom Design Solutions"
    };
    return serviceTypes[serviceType] || serviceType;
  };

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    confirmed: requests.filter((r) => r.status === "confirmed").length,
    completed: requests.filter((r) => r.status === "completed").length,
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
          Consultation Requests
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage customer consultation bookings
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Pending</p>
          <p className="mt-1 text-2xl font-bold text-yellow-600">
            {stats.pending}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Confirmed</p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {stats.confirmed}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Completed</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {stats.completed}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto">
        {["all", "pending", "confirmed", "completed", "cancelled"].map(
          (status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-[#2F2582] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          )
        )}
      </div>

      {/* Requests List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F2582] border-t-transparent" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">
              No requests found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Consultation requests will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {request.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(request.status)}`}
                      >
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#2F2582] mb-2">
                      {getServiceTypeDisplay(request.service_type)}
                    </p>
                    {request.message && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {request.message}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {request.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {request.phone}
                      </span>
                      {request.preferred_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(request.preferred_date).toLocaleDateString()}
                        </span>
                      )}
                      {request.preferred_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {request.preferred_time}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleView(request)}
                      className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-50"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <select
                      value={request.status}
                      onChange={(e) =>
                        handleStatusChange(
                          request.id,
                          e.target.value as ConsultationRequest["status"]
                        )
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <button
                      onClick={() => handleDelete(request.id)}
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
          setSelectedRequest(null);
        }}
        title="Consultation Request Details"
        onSubmit={(e) => {
          e.preventDefault();
          // This is a view-only modal, no submission needed
        }}
        submitLabel="Close"
        cancelLabel="Close"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-gray-900">{selectedRequest.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-gray-900">{selectedRequest.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-gray-900">{selectedRequest.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Service Type
              </label>
              <p className="mt-1 text-gray-900">
                {getServiceTypeDisplay(selectedRequest.service_type)}
              </p>
            </div>
            {selectedRequest.preferred_date && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Preferred Date
                </label>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedRequest.preferred_date).toLocaleDateString()}
                </p>
              </div>
            )}
            {selectedRequest.preferred_time && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Preferred Time
                </label>
                <p className="mt-1 text-gray-900">
                  {selectedRequest.preferred_time}
                </p>
              </div>
            )}
            {selectedRequest.message && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Message
                </label>
                <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                  {selectedRequest.message}
                </p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedRequest.status)}`}
                >
                  {getStatusIcon(selectedRequest.status)}
                  {selectedRequest.status}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                Submitted
              </label>
              <p className="mt-1 text-gray-900">
                {new Date(selectedRequest.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
