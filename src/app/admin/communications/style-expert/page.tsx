"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  User,
  Home,
  IndianRupee,
  Timer,
  Palette,
  Building2,
  MessageSquare,
  UserPlus,
  TrendingUp,
  DollarSign,
  Filter,
  Search,
} from "lucide-react";
import {
  getConsultationRequests,
  updateConsultationRequest,
  deleteConsultationRequest,
  type ConsultationRequest,
} from "@/lib/actions/communications";
import {
  BUDGET_RANGES,
  TIMELINES,
  PRIORITY_LEVELS,
  PROJECT_TYPES,
  PROPERTY_TYPES,
  ROOM_TYPES,
  STYLE_PREFERENCES,
} from "@/lib/constants/consultation";

export default function StyleExpertPage() {
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<ConsultationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    status: ConsultationRequest["status"],
  ) => {
    const result = await updateConsultationRequest(id, { status });
    if (result.success) {
      fetchRequests();
    }
  };

  const handlePriorityChange = async (
    id: string,
    priority: ConsultationRequest["priority"],
  ) => {
    const result = await updateConsultationRequest(id, { priority });
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
      "custom-design": "Custom Design Solutions",
    };
    return serviceTypes[serviceType] || serviceType;
  };

  const getBudgetDisplay = (budgetId?: string) => {
    if (!budgetId) return "-";
    return BUDGET_RANGES.find((b) => b.id === budgetId)?.value || budgetId;
  };

  const getTimelineDisplay = (timelineId?: string) => {
    if (!timelineId) return "-";
    return TIMELINES.find((t) => t.id === timelineId)?.label || timelineId;
  };

  const filteredRequests = requests
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .filter((r) =>
      priorityFilter === "all" ? true : r.priority === priorityFilter,
    )
    .filter((r) =>
      searchQuery
        ? r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.phone.includes(searchQuery)
        : true,
    );

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    confirmed: requests.filter((r) => r.status === "confirmed").length,
    completed: requests.filter((r) => r.status === "completed").length,
    highPriority: requests.filter(
      (r) => r.priority === "high" || r.priority === "urgent",
    ).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <div className="h-6 w-48 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-64" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200 sm:w-96" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-lg bg-gray-200 sm:h-24"
            />
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-9 w-20 shrink-0 animate-pulse rounded-lg bg-gray-200 sm:h-10 sm:w-24"
            />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-gray-200 sm:h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
          Style Expert Consultations
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage style expert consultation requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">High Priority</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {stats.highPriority}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            {["all", "pending", "confirmed", "completed", "cancelled"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    filter === status
                      ? "bg-[#2F2582] text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ),
            )}
          </div>
          <div className="flex gap-2">
            {["all", "urgent", "high", "medium", "low"].map((priority) => (
              <button
                key={priority}
                onClick={() => setPriorityFilter(priority)}
                className={`rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  priorityFilter === priority
                    ? "bg-[#2F2582] text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="mr-1 inline h-4 w-4" />
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm transition-all focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none dark:border-gray-800 dark:bg-gray-900"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Service Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      No consultation requests found
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2F2582]/10">
                          <User className="h-5 w-5 text-[#2F2582]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {request.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getServiceTypeDisplay(request.service_type || "")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Mail className="h-3 w-3" />
                          {request.email}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Phone className="h-3 w-3" />
                          {request.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={request.priority || "medium"}
                        onValueChange={(value) =>
                          handlePriorityChange(
                            request.id,
                            value as ConsultationRequest["priority"],
                          )
                        }
                      >
                        <SelectTrigger
                          className={`h-8 w-[110px] rounded-full border px-3 text-xs font-medium ${getPriorityColor(
                            request.priority,
                          )}`}
                        >
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={request.status}
                        onValueChange={(value) =>
                          handleStatusChange(
                            request.id,
                            value as ConsultationRequest["status"],
                          )
                        }
                      >
                        <SelectTrigger
                          className={`h-8 w-[120px] rounded-full border px-3 text-xs font-medium ${getStatusColor(
                            request.status,
                          )}`}
                        >
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(request)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Consultation Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Request ID: {selectedRequest.id.slice(0, 8)}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  <User className="h-4 w-4" />
                  Customer Information
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Name
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedRequest.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Email
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedRequest.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Phone
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {selectedRequest.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Service Type
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {getServiceTypeDisplay(
                        selectedRequest.service_type || "",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  <Building2 className="h-4 w-4" />
                  Project Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {selectedRequest.project_type && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        Project Type
                      </label>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {PROJECT_TYPES.find(
                          (p) => p.id === selectedRequest.project_type,
                        )?.label || selectedRequest.project_type}
                      </p>
                    </div>
                  )}
                  {selectedRequest.property_type && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        Property Type
                      </label>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {PROPERTY_TYPES.find(
                          (p) => p.id === selectedRequest.property_type,
                        )?.label || selectedRequest.property_type}
                      </p>
                    </div>
                  )}
                  {selectedRequest.room_types && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        Room Types
                      </label>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {Array.isArray(selectedRequest.room_types)
                          ? selectedRequest.room_types
                              .map(
                                (rt) =>
                                  ROOM_TYPES.find((r) => r.id === rt)?.label ||
                                  rt,
                              )
                              .join(", ")
                          : selectedRequest.room_types}
                      </p>
                    </div>
                  )}
                  {selectedRequest.style_preferences && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        Style Preferences
                      </label>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {Array.isArray(selectedRequest.style_preferences)
                          ? selectedRequest.style_preferences
                              .map(
                                (sp) =>
                                  STYLE_PREFERENCES.find((s) => s.id === sp)
                                    ?.label || sp,
                              )
                              .join(", ")
                          : selectedRequest.style_preferences}
                      </p>
                    </div>
                  )}
                  {selectedRequest.budget_range && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        Budget Range
                      </label>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {getBudgetDisplay(selectedRequest.budget_range)}
                      </p>
                    </div>
                  )}
                  {selectedRequest.timeline && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">
                        Timeline
                      </label>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        {getTimelineDisplay(selectedRequest.timeline)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              {selectedRequest.message && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </h3>
                  <p className="text-sm whitespace-pre-wrap text-gray-700">
                    {selectedRequest.message}
                  </p>
                </div>
              )}

              {/* Status & Priority */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <label className="text-xs font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                        selectedRequest.status,
                      )}`}
                    >
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status.charAt(0).toUpperCase() +
                        selectedRequest.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <label className="text-xs font-medium text-gray-500">
                    Priority
                  </label>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${getPriorityColor(
                        selectedRequest.priority,
                      )}`}
                    >
                      {selectedRequest.priority?.charAt(0).toUpperCase() +
                        (selectedRequest.priority?.slice(1) || "Medium")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-wide text-gray-700 uppercase">
                  <Clock className="h-4 w-4" />
                  Timeline
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Created
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {new Date(selectedRequest.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">
                      Last Updated
                    </label>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {new Date(selectedRequest.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
