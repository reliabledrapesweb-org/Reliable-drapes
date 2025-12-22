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
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
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
    status: ConsultationRequest["status"]
  ) => {
    const result = await updateConsultationRequest(id, { status });
    if (result.success) {
      fetchRequests();
    }
  };

  const handlePriorityChange = async (
    id: string,
    priority: ConsultationRequest["priority"]
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
      "custom-design": "Custom Design Solutions"
    };
    return serviceTypes[serviceType] || serviceType;
  };

  const getBudgetDisplay = (budgetId?: string) => {
    if (!budgetId) return "-";
    return BUDGET_RANGES.find(b => b.id === budgetId)?.value || budgetId;
  };

  const getTimelineDisplay = (timelineId?: string) => {
    if (!timelineId) return "-";
    return TIMELINES.find(t => t.id === timelineId)?.label || timelineId;
  };

  const filteredRequests = requests
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .filter((r) => (priorityFilter === "all" ? true : r.priority === priorityFilter))
    .filter((r) =>
      searchQuery
        ? r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.phone.includes(searchQuery)
        : true
    );

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    confirmed: requests.filter((r) => r.status === "confirmed").length,
    completed: requests.filter((r) => r.status === "completed").length,
    highPriority: requests.filter((r) => r.priority === "high" || r.priority === "urgent").length,
  };