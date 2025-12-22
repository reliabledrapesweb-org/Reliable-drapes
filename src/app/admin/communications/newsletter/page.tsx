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
  Send,
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Eye,
} from "lucide-react";
import {
  getNewsletterSubscribers,
  updateNewsletterSubscriber,
  deleteNewsletterSubscriber,
  type NewsletterSubscriber,
  getNewsletterCampaigns,
  createNewsletterCampaign,
  sendNewsletterCampaign,
  type NewsletterCampaign,
} from "@/lib/actions/communications";
import { Button } from "@/components/ui/button";
import { useToast, ToastContainer } from "@/components/ui/Toast";

type TabType = "subscribers" | "campaigns" | "compose";

export default function NewsletterPage() {
  const { toasts, addToast, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("subscribers");
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Compose state
  const [composeData, setComposeData] = useState({
    subject: "",
    content: "",
    sendTo: "all" as "all" | "selected",
    selectedEmails: [] as string[],
  });
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);


  const fetchSubscribers = async () => {
    const result = await getNewsletterSubscribers();
    if (result.success && result.data) {
      setSubscribers(result.data);
    }
  };

  const fetchCampaigns = async () => {
    const result = await getNewsletterCampaigns();
    if (result.success && result.data) {
      setCampaigns(result.data);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSubscribers(), fetchCampaigns()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handleStatusChange = async (
    id: string,
    status: NewsletterSubscriber["status"]
  ) => {
    const result = await updateNewsletterSubscriber(id, { status });
    if (result.success) {
      fetchSubscribers();
      addToast("Subscriber status updated", "success");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subscriber?")) {
      const result = await deleteNewsletterSubscriber(id);
      if (result.success) {
        fetchSubscribers();
        addToast("Subscriber deleted", "success");
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


  const handleSendCampaign = async () => {
    if (!composeData.subject.trim() || !composeData.content.trim()) {
      addToast("Please fill in subject and content", "error");
      return;
    }

    const recipientEmails = composeData.sendTo === "all"
      ? activeSubscribers.map(s => s.email)
      : composeData.selectedEmails;

    if (recipientEmails.length === 0) {
      addToast("No recipients selected", "error");
      return;
    }

    setIsSending(true);

    try {
      // First create the campaign
      const createResult = await createNewsletterCampaign({
        subject: composeData.subject,
        content: composeData.content,
        recipient_count: recipientEmails.length,
      });

      if (!createResult.success || !createResult.data) {
        addToast(createResult.error || "Failed to create campaign", "error");
        setIsSending(false);
        return;
      }

      // Then send it
      const sendResult = await sendNewsletterCampaign(
        createResult.data.id,
        recipientEmails
      );

      if (sendResult.success) {
        addToast(`Campaign sent to ${recipientEmails.length} subscribers!`, "success");
        setComposeData({
          subject: "",
          content: "",
          sendTo: "all",
          selectedEmails: [],
        });
        setActiveTab("campaigns");
        fetchCampaigns();
      } else {
        addToast(sendResult.error || "Failed to send campaign", "error");
      }
    } catch (error) {
      console.error("Error sending campaign:", error);
      addToast("An unexpected error occurred", "error");
    } finally {
      setIsSending(false);
    }
  };

  const toggleEmailSelection = (email: string) => {
    setComposeData(prev => ({
      ...prev,
      selectedEmails: prev.selectedEmails.includes(email)
        ? prev.selectedEmails.filter(e => e !== email)
        : [...prev.selectedEmails, email]
    }));
  };

  const selectAllEmails = () => {
    setComposeData(prev => ({
      ...prev,
      selectedEmails: activeSubscribers.map(s => s.email)
    }));
  };

  const clearEmailSelection = () => {
    setComposeData(prev => ({
      ...prev,
      selectedEmails: []
    }));
  };

  const filteredSubscribers = subscribers
    .filter((sub) => (filter === "all" ? true : sub.status === filter))
    .filter((sub) =>
      searchQuery
        ? sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.name?.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  const activeSubscribers = subscribers.filter(s => s.status === "active");

  const stats = {
    total: subscribers.length,
    active: activeSubscribers.length,
    unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
    campaignsSent: campaigns.filter(c => c.status === "sent").length,
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-96 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900 lg:text-3xl">
            Newsletter Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage subscribers and send email campaigns
          </p>
        </div>
        <Button
          onClick={() => setActiveTab("compose")}
          className="flex items-center gap-2 bg-[#2F2582] hover:bg-[#241c66]"
        >
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-red-100 p-2">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Unsubscribed</p>
              <p className="text-2xl font-bold text-red-600">{stats.unsubscribed}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2">
              <Send className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Campaigns Sent</p>
              <p className="text-2xl font-bold text-purple-600">{stats.campaignsSent}</p>
            </div>
          </div>
        </div>
      </div>


      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: "subscribers", label: "Subscribers", icon: Users },
            { id: "campaigns", label: "Campaigns", icon: FileText },
            { id: "compose", label: "Compose", icon: Send },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 border-b-2 pb-4 pt-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-[#2F2582] text-[#2F2582]"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "subscribers" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
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
              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            {filteredSubscribers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="mb-3 h-12 w-12 text-gray-300" />
                <p className="text-lg font-medium text-gray-900">No subscribers found</p>
                <p className="mt-1 text-sm text-gray-500">Newsletter subscribers will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Subscribed</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSubscribers.map((subscriber, index) => (
                      <motion.tr
                        key={subscriber.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{subscriber.email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{subscriber.name || "-"}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            subscriber.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {subscriber.status === "active" ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
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
                              onClick={() => handleStatusChange(subscriber.id, subscriber.status === "active" ? "unsubscribed" : "active")}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                subscriber.status === "active"
                                  ? "border-red-200 bg-white text-red-600 hover:bg-red-50"
                                  : "border-green-200 bg-white text-green-600 hover:bg-green-50"
                              }`}
                            >
                              {subscriber.status === "active" ? "Unsubscribe" : "Resubscribe"}
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
        </motion.div>
      )}


      {activeTab === "campaigns" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {campaigns.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900">No campaigns yet</h3>
              <p className="mt-1 text-sm text-gray-500">Create your first email campaign to engage with subscribers</p>
              <Button
                onClick={() => setActiveTab("compose")}
                className="mt-4 bg-[#2F2582] hover:bg-[#241c66]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Subject</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Recipients</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Sent At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {campaigns.map((campaign, index) => (
                      <motion.tr
                        key={campaign.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">{campaign.subject}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            campaign.status === "sent" 
                              ? "bg-green-100 text-green-700" 
                              : campaign.status === "draft"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {campaign.status === "sent" ? <CheckCircle className="h-3 w-3" /> : 
                             campaign.status === "draft" ? <Clock className="h-3 w-3" /> :
                             <AlertCircle className="h-3 w-3" />}
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-600">{campaign.recipient_count} subscribers</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {campaign.sent_at 
                              ? new Date(campaign.sent_at).toLocaleString() 
                              : "-"}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}


      {activeTab === "compose" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Compose Form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Compose Email</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Subject Line *</label>
                    <input
                      type="text"
                      value={composeData.subject}
                      onChange={(e) => setComposeData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Enter email subject..."
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Email Content *</label>
                    <textarea
                      value={composeData.content}
                      onChange={(e) => setComposeData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Write your email content here..."
                      rows={12}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-[#2F2582] focus:outline-none focus:ring-2 focus:ring-[#2F2582]/20"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Tip: Use line breaks for paragraphs. HTML is supported for formatting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-gray-600">
                  {composeData.sendTo === "all" 
                    ? `Sending to ${activeSubscribers.length} active subscribers`
                    : `Sending to ${composeData.selectedEmails.length} selected subscribers`}
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    disabled={!composeData.subject || !composeData.content}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button
                    onClick={handleSendCampaign}
                    disabled={isSending || !composeData.subject || !composeData.content}
                    className="bg-[#2F2582] hover:bg-[#241c66]"
                  >
                    {isSending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Campaign
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>


            {/* Recipients Selection */}
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Recipients</h3>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setComposeData(prev => ({ ...prev, sendTo: "all", selectedEmails: [] }))}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        composeData.sendTo === "all"
                          ? "bg-[#2F2582] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Active ({activeSubscribers.length})
                    </button>
                    <button
                      onClick={() => setComposeData(prev => ({ ...prev, sendTo: "selected" }))}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        composeData.sendTo === "selected"
                          ? "bg-[#2F2582] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Select ({composeData.selectedEmails.length})
                    </button>
                  </div>

                  {composeData.sendTo === "selected" && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <button
                          onClick={selectAllEmails}
                          className="text-xs text-[#2F2582] hover:underline"
                        >
                          Select All
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={clearEmailSelection}
                          className="text-xs text-gray-500 hover:underline"
                        >
                          Clear
                        </button>
                      </div>
                      
                      <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                        {activeSubscribers.map((subscriber) => (
                          <label
                            key={subscriber.id}
                            className="flex cursor-pointer items-center gap-2 rounded-lg p-2 hover:bg-gray-50"
                          >
                            <input
                              type="checkbox"
                              checked={composeData.selectedEmails.includes(subscriber.email)}
                              onChange={() => toggleEmailSelection(subscriber.email)}
                              className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                            />
                            <span className="text-sm text-gray-700 truncate">{subscriber.email}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-blue-900">Quick Tips</h4>
                <ul className="space-y-1 text-xs text-blue-700">
                  <li>• Keep subject lines under 50 characters</li>
                  <li>• Personalize content when possible</li>
                  <li>• Include a clear call-to-action</li>
                  <li>• Test with a small group first</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}


      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h3 className="text-lg font-semibold text-gray-900">Email Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4 rounded-lg bg-gray-100 p-4">
                <p className="text-xs text-gray-500">Subject:</p>
                <p className="font-medium text-gray-900">{composeData.subject || "(No subject)"}</p>
              </div>
              
              <div className="rounded-lg border border-gray-200 p-6">
                <div className="prose prose-sm max-w-none">
                  {composeData.content ? (
                    <div dangerouslySetInnerHTML={{ __html: composeData.content.replace(/\n/g, '<br/>') }} />
                  ) : (
                    <p className="text-gray-400">(No content)</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 border-t border-gray-200 p-4">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setShowPreview(false);
                  handleSendCampaign();
                }}
                disabled={isSending}
                className="bg-[#2F2582] hover:bg-[#241c66]"
              >
                <Send className="mr-2 h-4 w-4" />
                Send Now
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}