"use client";

import { useState, useEffect } from "react";
import {
  Pencil,
  Eye,
  EyeOff,
  Layout,
  X,
  Search,
  Image as ImageIcon,
  GripVertical,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  getAllAboutSections,
  updateAboutSection,
  toggleAboutSectionStatus,
  type AboutSection,
} from "@/lib/actions/about-sections";
import { getMediaItems, type MediaItem } from "@/lib/actions/media";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/shared";
import { useToast, ToastContainer } from "@/components/ui/Toast";

export default function AdminAboutSectionsPage() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutSection | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<
    "image_url" | "image_url_2"
  >("image_url");
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    content: "",
    image_url: "",
    image_url_2: "",
    is_active: true,
    // Leadership fields (stored in content_json)
    founder_role: "",
    founder_quote: "",
    content_heading: "",
    // Vision-mission fields (stored in content_json)
    mission_content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "toggle" | null;
    sectionId?: string;
    sectionTitle?: string;
    isActive?: boolean;
  }>({ type: null });
  const { toasts, addToast, removeToast } = useToast();

  useEffect(() => {
    fetchSections();
    fetchMediaItems();
  }, []);

  const fetchSections = async () => {
    try {
      setIsLoading(true);
      const result = await getAllAboutSections();
      if (result.success && result.data) {
        setSections(result.data);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMediaItems = async () => {
    try {
      const result = await getMediaItems();
      if (result.success && result.data) {
        setMediaItems(result.data);
      }
    } catch (error) {
      // Error handled silently
    }
  };

  const filteredSections = sections.filter((section) => {
    // Features section is not editable through this UI — skip it
    if (section.section_key === "features") return false;

    const searchLower = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(searchLower) ||
      section.section_key.toLowerCase().includes(searchLower) ||
      (section.subtitle?.toLowerCase().includes(searchLower) ?? false)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setIsSubmitting(true);

    try {
      // Build the update payload
      const updatePayload: Record<string, unknown> = {
        title: formData.title,
        subtitle: formData.subtitle,
        content: formData.content,
        image_url: formData.image_url,
        image_url_2: formData.image_url_2,
        is_active: formData.is_active,
      };

      // For founder/chairman sections, persist role/quote/content_heading into content_json
      if (
        editingSection.section_key === "founder" ||
        editingSection.section_key === "chairman"
      ) {
        updatePayload.content_json = {
          ...((editingSection.content_json as Record<string, unknown>) || {}),
          role: formData.founder_role,
          quote: formData.founder_quote,
          content_heading: formData.content_heading,
        };
      }

      // For vision-mission section, persist mission_content into content_json
      if (editingSection.section_key === "vision-mission") {
        updatePayload.content_json = {
          ...((editingSection.content_json as Record<string, unknown>) || {}),
          mission_content: formData.mission_content,
        };
      }

      const result = await updateAboutSection(editingSection.id, updatePayload);
      if (result.success) {
        addToast("Section updated successfully!", "success");
        handleCloseModal();
        fetchSections();
      } else {
        addToast(result.error || "Failed to update section", "error");
      }
    } catch (error) {
      addToast("Failed to save section", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (section: AboutSection) => {
    setEditingSection(section);
    const contentJson = (section.content_json as Record<string, string>) || {};
    setFormData({
      title: section.title,
      subtitle: section.subtitle || "",
      content: section.content || "",
      image_url: section.image_url || "",
      image_url_2: section.image_url_2 || "",
      is_active: section.is_active,
      founder_role: contentJson.role || "",
      founder_quote: contentJson.quote || "",
      content_heading: contentJson.content_heading || "",
      mission_content:
        contentJson.mission_content || contentJson.mission || "",
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = (section: AboutSection) => {
    setConfirmAction({
      type: "toggle",
      sectionId: section.id,
      sectionTitle: section.title,
      isActive: !section.is_active,
    });
  };

  const executeToggle = async () => {
    if (!confirmAction.sectionId || confirmAction.isActive === undefined)
      return;

    try {
      const result = await toggleAboutSectionStatus(
        confirmAction.sectionId,
        confirmAction.isActive,
      );
      if (result.success) {
        addToast(
          `Section ${confirmAction.isActive ? "activated" : "deactivated"} successfully!`,
          "success",
        );
        fetchSections();
        setConfirmAction({ type: null });
      } else {
        addToast(result.error || "Failed to update section status", "error");
        setConfirmAction({ type: null });
      }
    } catch (error) {
      addToast("Failed to update section status", "error");
      setConfirmAction({ type: null });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSection(null);
    setShowMediaPicker(false);
    setFormData({
      title: "",
      subtitle: "",
      content: "",
      image_url: "",
      image_url_2: "",
      is_active: true,
      founder_role: "",
      founder_quote: "",
      content_heading: "",
      mission_content: "",
    });
  };

  const openMediaPicker = (target: "image_url" | "image_url_2") => {
    setMediaPickerTarget(target);
    setShowMediaPicker(true);
  };

  const selectMedia = (media: MediaItem) => {
    setFormData((prev) => ({
      ...prev,
      [mediaPickerTarget]: media.file_url,
    }));
    setShowMediaPicker(false);
  };

  const getSectionPreview = (section: AboutSection) => {
    switch (section.section_key) {
      case "founder":
        return "Founder section with portrait and bio";
      case "why-choose":
        return "Why choose us with images";
      case "features":
        return "Three feature cards grid";
      case "vision-mission":
        return "Vision and mission statements";
      default:
        return "Custom section";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-48" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200 sm:w-96" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-lg bg-gray-200"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl lg:text-3xl">
            About Page Sections
          </h1>
          <p className="mt-1 text-xs text-gray-600 sm:text-sm">
            Manage content and images on the About Us page
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search sections..."
          className="w-full rounded-lg border border-gray-200 py-2.5 pr-4 pl-10 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none dark:border-gray-800 dark:bg-gray-900"
        />
      </div>

      {/* Sections Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredSections.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center px-4 py-12 text-center">
            <Layout className="mb-3 h-12 w-12 text-gray-300" />
            <p className="text-base font-medium text-gray-900 sm:text-lg">
              No sections found
            </p>
          </div>
        ) : (
          filteredSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              {/* Image Preview */}
              <div className="relative h-40 bg-gray-100">
                {section.image_url ? (
                  <Image
                    src={section.image_url}
                    alt={section.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      section.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {section.is_active ? (
                      <>
                        <Eye className="h-3 w-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        Hidden
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {getSectionPreview(section)}
                    </p>
                  </div>
                  <GripVertical className="h-4 w-4 text-gray-400" />
                </div>

                {section.subtitle && (
                  <p className="mb-2 text-sm text-gray-600">
                    {section.subtitle}
                  </p>
                )}

                {section.content && (
                  <p className="line-clamp-2 text-xs text-gray-500">
                    {section.content}
                  </p>
                )}

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleEdit(section)}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-gray-200 bg-white py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(section)}
                    className={`flex flex-1 items-center justify-center gap-1 rounded-lg border py-2 text-sm transition-colors ${
                      section.is_active
                        ? "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                        : "border-green-200 bg-white text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {section.is_active ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        Show
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingSection && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 sm:px-6 sm:py-4">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Edit {editingSection.title}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    placeholder="Optional subtitle or name"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {editingSection.section_key === "vision-mission"
                      ? "Vision Content"
                      : "Content"}
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                    placeholder="Main content text"
                  />
                </div>

                {/* Vision-mission: Mission Content */}
                {editingSection.section_key === "vision-mission" && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Mission Content
                    </label>
                    <textarea
                      value={formData.mission_content}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          mission_content: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                      placeholder="Mission statement text"
                    />
                  </div>
                )}

                {/* Founder/Chairman fields */}
                {["founder", "chairman"].includes(
                  editingSection.section_key,
                ) && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <input
                        type="text"
                        value={formData.founder_role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            founder_role: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                        placeholder="e.g. Founder & CEO"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Quote
                      </label>
                      <textarea
                        value={formData.founder_quote}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            founder_quote: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                        placeholder="Quote or vision statement (leave empty to hide)"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Content Heading
                      </label>
                      <input
                        type="text"
                        value={formData.content_heading}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            content_heading: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                        placeholder="e.g. Vision Behind Reliable Drapes"
                      />
                    </div>
                  </>
                )}

                {/* Image 1 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {["founder", "chairman", "director"].includes(
                      editingSection.section_key,
                    )
                      ? "Leadership Row Image"
                      : editingSection.section_key === "vision-mission"
                        ? "Vision Image"
                        : "Primary Image"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                      placeholder="Image URL or path"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openMediaPicker("image_url")}
                    >
                      <ImageIcon className="mr-1 h-4 w-4" />
                      Browse
                    </Button>
                  </div>
                  {formData.image_url && (
                    <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-lg border">
                      <Image
                        src={formData.image_url}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Image 2 */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {["founder", "chairman"].includes(
                      editingSection.section_key,
                    )
                      ? "Section Portrait Image"
                      : editingSection.section_key === "vision-mission"
                        ? "Mission Image"
                        : "Secondary Image (optional)"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.image_url_2}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          image_url_2: e.target.value,
                        })
                      }
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2F2582] focus:ring-2 focus:ring-[#2F2582]/20 focus:outline-none"
                      placeholder="Image URL or path"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openMediaPicker("image_url_2")}
                    >
                      <ImageIcon className="mr-1 h-4 w-4" />
                      Browse
                    </Button>
                  </div>
                  {formData.image_url_2 && (
                    <div className="relative mt-2 h-24 w-24 overflow-hidden rounded-lg border">
                      <Image
                        src={formData.image_url_2}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Active Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-[#2F2582] focus:ring-[#2F2582]"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Visible on About page
                  </label>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    className="w-full sm:flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cursor-pointer bg-[#2F2582] hover:bg-[#251e66] disabled:opacity-50 sm:flex-1"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving...
                      </div>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-h-[80vh] w-full overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
              <h3 className="text-lg font-semibold">Select Image</h3>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {mediaItems
                  .filter(
                    (item) =>
                      item.mime_type.startsWith("image/") ||
                      item.mime_type === "image",
                  )
                  .map((media) => (
                    <button
                      key={media.id}
                      onClick={() => selectMedia(media)}
                      className="group relative aspect-square overflow-hidden rounded-lg border hover:border-[#2F2582]"
                    >
                      <Image
                        src={media.file_url}
                        alt={media.file_name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </button>
                  ))}
              </div>
              {mediaItems.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No images in media library
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmAction.type === "toggle"}
        title={confirmAction.isActive ? "Show Section" : "Hide Section"}
        message={`${confirmAction.isActive ? "Show" : "Hide"} "${confirmAction.sectionTitle}"? ${confirmAction.isActive ? "It will be visible on the About page." : "It will be hidden from the About page."}`}
        confirmText={confirmAction.isActive ? "Show" : "Hide"}
        cancelText="Cancel"
        variant="warning"
        onConfirm={executeToggle}
        onCancel={() => setConfirmAction({ type: null })}
      />
    </div>
  );
}
