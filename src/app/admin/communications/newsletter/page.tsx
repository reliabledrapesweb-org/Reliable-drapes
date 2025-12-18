"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Calendar,
  Trash2,
  Download,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  getNewsletterSubscribers,
  updateNewsletterSubscriber,
  deleteNewsletterSubscriber,
  type NewsletterSubscriber,
} from "@/lib/actions/communications";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSubscribers = async () => {
    setIsLoading(true);
    const result = await getNewsletterSubscribers();
    if (result.success && result.data) {
      setSubscribers(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: NewsletterSubscriber["status"]
  ) => {
    const result = await updateNewsletterSubscriber(id, { status });
    if (result.success) {
      fetchSubscribers();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscriber?")) {
      const result = await deleteNewsletterSubscriber(id);
      if (result.success) {
        fetchSubscribers();
      }
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Email", "Name", "Status", "Subscribed At", "Unsubscribed At"],
      ...filteredSubscribers.map((sub) => [
        sub.email,
        sub.name || "",
        sub.status,
        new Date(sub.subscribed_at).toLocaleDateString(),
        sub.unsubscribed_at
          ? new Date(sub.unsubscribed_at).toLocaleDateString()
          : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSubscribers = subscribers
    .filter((sub) => (filter === "all" ? true : sub.status === filter))
    .filter((sub) =>
      searchQuery
        ? sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.status === "active").length,
    unsubscribed: subscribers.filter((s) => s.status === "unsubscribed")
      .length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            Newsletter Subscribers
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your email newsletter subscribers
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-lg bg-[#2F2582] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#241c66]"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Active</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {stats.active}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-600">Unsubscribed</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {stats.unsubscribed}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-[#2F2582] focus:outline-none"
        />
        <div className="flex gap-2">
          {["all", "active", "unsubscribed"].map((status) => (
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
          ))}
        </div>
      </div>

      {/* Subscribers List */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2F2582] border-t-transparent" />
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Mail className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-lg font-medium text-gray-900">
              No subscribers found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Newsletter subscribers will appear here
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Subscribed
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubscribers.map((subscriber, index) => (
                  <motion.tr
                    key={subscriber.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">
                        {subscriber.name || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          subscriber.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {subscriber.status === "active" ? (
                          <UserCheck className="h-3 w-3" />
                        ) : (
                          <UserX className="h-3 w-3" />
                        )}
                        {subscriber.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(subscriber.subscribed_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(
                              subscriber.id,
                              subscriber.status === "active"
                                ? "unsubscribed"
                                : "active"
                            )
                          }
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            subscriber.status === "active"
                              ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                              : "border-green-200 bg-white text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {subscriber.status === "active"
                            ? "Unsubscribe"
                            : "Resubscribe"}
                        </button>
                        <button
                          onClick={() => handleDelete(subscriber.id)}
                          className="rounded-lg border border-red-200 bg-white p-1.5 text-red-600 transition-colors hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
