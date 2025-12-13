"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Trash2, Download, FileText, ClipboardList, Clock, CheckCircle, UserCheck, XCircle, Filter } from "lucide-react";
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
    return <AdminPageSkeleton rows={8} columns={6} statsCount={5} hasFilter />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Job Applications</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            Review and manage job applications from candidates
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reviewed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.reviewed}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-green-600">{stats.shortlisted}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Applications ({filteredApplications.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Job Position</TableHead>
                <TableHead className="hidden sm:table-cell">Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Applied On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <FileText className="h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No applications found</h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {filterStatus !== "all" ? "Try adjusting your filter" : "Applications will appear here once candidates apply"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {application.full_name}
                        </p>
                        <p className="truncate text-xs text-gray-500">{application.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {application.job_title}
                        </p>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          {application.job_type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-sm text-gray-500">{application.phone}</span>
                    </TableCell>
                    <TableCell>
                      <select
                        value={application.status}
                        onChange={(e) => handleStatusChange(application.id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColor(
                          application.status
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-sm text-gray-500">
                        {new Date(application.created_at).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          asChild
                          className="h-8 w-8 text-gray-600 hover:text-blue-600 cursor-pointer"
                        >
                          <a
                            href={application.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Resume"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          asChild
                          className="h-8 w-8 text-gray-600 hover:text-green-600 cursor-pointer"
                        >
                          <a
                            href={application.resume_url}
                            download
                            title="Download Resume"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(application.id, application.full_name)}
                          className="h-8 w-8 text-gray-600 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
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
