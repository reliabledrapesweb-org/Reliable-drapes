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

  const getBudgetDisplay = (budget?: string) => {
    const budgets: Record<string, string> = {
      "under_50k": "Under ₹50,000",
      "50k_1l": "₹50,000 - ₹1,00,000",
      "1l_2l": "₹1,00,000 - ₹2,00,000",
      "2l_5l": "₹2,00,000 - ₹5,00,000",
      "over_5l": "Over ₹5,00,000",
      "flexible": "Flexible"
    };
    return budget ? budgets[budget] || budget : "-";
  };

  const getTimelineDisplay = (timeline?: string) => {
    const timelines: Record<string, string> = {
      "asap": "ASAP",
      "1_3_months": "1-3 Months",
      "3_6_months": "3-6 Months",
      "6plus_months": "6+ Months",
      "exploring": "Just Exploring"
    };
    return timeline ? timelines[timeline] || timeline : "-";
  };

  const getProjectTypeDisplay = (projectType?: string) => {
    const types: Record<string, string> = {
      "new_home": "New Home",
      "renovation": "Renovation",
      "single_room": "Single Room",
      "multiple_rooms": "Multiple Rooms"
    };
    return projectType ? types[projectType] || projectType : "-";
  };

  const getPropertyTypeDisplay = (propertyType?: string) => {
    const types: Record<string, string> = {
      "house": "House",
      "apartment": "Apartment",
      "office": "Office",
      "commercial": "Commercial"
    };
    return propertyType ? types[propertyType] || propertyType : "-";
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "low":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
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
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900">
                        {request.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(request.status)}`}
                      >
                        {getStatusIcon(request.status)}
                        {request.status}
                      </span>
                      {request.priority && request.priority !== "medium" && (
                        <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      )}
                      {request.converted_to_sale && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                          <Check className="h-3 w-3" />
                          Converted
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#2F2582] mb-2">
                      {getServiceTypeDisplay(request.service_type)}
                      {request.project_type && ` • ${getProjectTypeDisplay(request.project_type)}`}
                    </p>
                    {request.budget_range && (
                      <p className="text-xs text-gray-600 mb-2">
                        Budget: {getBudgetDisplay(request.budget_range)}
                        {request.timeline && ` • Timeline: ${getTimelineDisplay(request.timeline)}`}
                      </p>
                    )}
                    {request.room_types && request.room_types.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {request.room_types.slice(0, 3).map((room, idx) => (
                          <span key={idx} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {room.replace(/_/g, " ")}
                          </span>
                        ))}
                        {request.room_types.length > 3 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            +{request.room_types.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
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
                      {request.assigned_to && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <span className="font-medium">Assigned:</span> {request.assigned_to}
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
          setIsModalOpen(false);
        }}
        submitLabel="Close"
        cancelLabel=""
        maxWidth="2xl"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Contact Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm font-medium text-gray-900">{selectedRequest.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.phone}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">Source</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedRequest.source || "Website"}</p>
                </div>
              </div>
            </div>

            {/* Service & Project Details */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Project Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Service Type</label>
                  <p className="mt-1 text-sm font-medium text-[#2F2582]">
                    {getServiceTypeDisplay(selectedRequest.service_type)}
                  </p>
                </div>
                {selectedRequest.project_type && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Project Type</label>
                    <p className="mt-1 text-sm text-gray-900">{getProjectTypeDisplay(selectedRequest.project_type)}</p>
                  </div>
                )}
                {selectedRequest.property_type && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Property Type</label>
                    <p className="mt-1 text-sm text-gray-900">{getPropertyTypeDisplay(selectedRequest.property_type)}</p>
                  </div>
                )}
                {selectedRequest.room_types && selectedRequest.room_types.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-gray-500">Room Types</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedRequest.room_types.map((room, idx) => (
                        <span key={idx} className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                          {room.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Budget & Timeline */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Budget & Timeline</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {selectedRequest.budget_range && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Budget Range</label>
                    <p className="mt-1 text-sm font-medium text-gray-900">{getBudgetDisplay(selectedRequest.budget_range)}</p>
                  </div>
                )}
                {selectedRequest.timeline && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Timeline</label>
                    <p className="mt-1 text-sm text-gray-900">{getTimelineDisplay(selectedRequest.timeline)}</p>
                  </div>
                )}
                {selectedRequest.estimated_value && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Estimated Value</label>
                    <p className="mt-1 text-sm font-medium text-green-600">
                      ₹{selectedRequest.estimated_value.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Style Preferences */}
            {selectedRequest.style_preferences && selectedRequest.style_preferences.length > 0 && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Style Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.style_preferences.map((style, idx) => (
                    <span key={idx} className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
                      {style.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Current Challenges */}
            {selectedRequest.current_challenges && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Current Challenges</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.current_challenges}</p>
              </div>
            )}

            {/* Additional Message */}
            {selectedRequest.message && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Additional Message</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedRequest.message}</p>
              </div>
            )}

            {/* Scheduling */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Scheduling</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {selectedRequest.preferred_date && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Preferred Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedRequest.preferred_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedRequest.preferred_time && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Preferred Time</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.preferred_time}</p>
                  </div>
                )}
                {selectedRequest.consultation_date && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Scheduled Consultation</label>
                    <p className="mt-1 text-sm font-medium text-green-600">
                      {new Date(selectedRequest.consultation_date).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedRequest.follow_up_date && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Follow-up Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedRequest.follow_up_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Status & Management */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">Status & Management</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-gray-500">Status</label>
                  <p className="mt-1">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status}
                    </span>
                  </p>
                </div>
                {selectedRequest.priority && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Priority</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority.toUpperCase()}
                      </span>
                    </p>
                  </div>
                )}
                {selectedRequest.assigned_to && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Assigned To</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.assigned_to}</p>
                  </div>
                )}
                {selectedRequest.converted_to_sale && (
                  <div>
                    <label className="text-xs font-medium text-gray-500">Converted to Sale</label>
                    <p className="mt-1 text-sm font-medium text-green-600">
                      Yes {selectedRequest.sale_amount && `- ₹${selectedRequest.sale_amount.toLocaleString()}`}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            {selectedRequest.admin_notes && (
              <div className="rounded-lg bg-yellow-50 p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-yellow-800">Admin Notes</h3>
                <p className="text-sm text-yellow-900 whitespace-pre-wrap">{selectedRequest.admin_notes}</p>
              </div>
            )}

            {/* Timestamps */}
            <div className="rounded-lg border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 gap-2 text-xs text-gray-500 md:grid-cols-2">
                <div>
                  <span className="font-medium">Submitted:</span> {new Date(selectedRequest.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Last Updated:</span> {new Date(selectedRequest.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
