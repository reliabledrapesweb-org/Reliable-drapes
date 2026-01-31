"use client";

import { useState, useMemo, useEffect } from "react";
import { Phone } from "lucide-react";
import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import { JobGrid } from "@/components/features/careers";
import { JobGridSkeleton } from "@/components/features/careers/JobGridSkeleton";
import { JobApplicationModal } from "@/components/features/careers/JobApplicationModal";
import { OpenHireModal } from "@/components/features/careers/OpenHireModal";
import { getActiveJobs, type Job } from "@/lib/actions/jobs";

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOpenHireModalOpen, setIsOpenHireModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs from database
  useEffect(() => {
    async function fetchJobs() {
      try {
        setIsLoading(true);
        const result = await getActiveJobs();

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to fetch jobs");
        }

        setJobs(result.data);
      } catch (error) {

        setError(
          error instanceof Error ? error.message : "Failed to load jobs",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobs();
  }, []);

  // Filter jobs based on search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery) return jobs;

    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, jobs]);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handlePhoneCall = () => {
    // Mock HR phone number for careers inquiries
    const hrPhone = "+234 803 456 7890";
    window.location.href = `tel:${hrPhone.replace(/[^0-9+]/g, "")}`;
  };

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero heading="Careers" />
      <Breadcrumb />
      <div className="w-full py-8 md:py-10 lg:py-12">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <PageHeader
            category="Careers"
            title="At Reliable"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search jobs by title, location, or type..."
          />

          {/* Open Positions Section */}
          <div className="mb-8 md:mb-10 lg:mb-12">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold tracking-[6px] text-[#575757] uppercase md:text-[16px] md:tracking-[8px]">
                Open Positions
              </p>
              <h2 className="text-2xl leading-tight font-bold text-[#161616] md:text-[32px]">
                Join our team!
              </h2>
              <p className="text-base text-[#898989] md:text-[24px]">
                Ready to work with us? Apply for open positions
              </p>
            </div>
          </div>

          {/* Jobs Section */}
          <div className="flex flex-col gap-6 md:gap-8">
            {isLoading ? (
              <JobGridSkeleton />
            ) : error ? (
              <div className="py-20 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-20 text-center">
                <p className="text-lg text-[#6a6a6a]">No job openings found.</p>
              </div>
            ) : (
              <JobGrid jobs={filteredJobs} onApply={handleApply} />
            )}
          </div>

          {/* Open Hire Section */}
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-[#2f2582]/5 to-[#2f2582]/10 p-6 md:mt-16 md:p-10">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#161616] md:text-2xl">
                  Don&apos;t see the right fit?
                </h3>
                <p className="mt-2 text-base text-[#6a6a6a] md:text-lg">
                  Submit your profile for future opportunities. We&apos;ll reach
                  out when a suitable position opens up.
                </p>
              </div>
              <button
                onClick={() => setIsOpenHireModalOpen(true)}
                className="shrink-0 rounded-full bg-[#2f2582] px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-[#251e66] md:px-10 md:py-4 md:text-base"
              >
                Submit Open Application
              </button>
            </div>
          </div>

          {/* Call Us Section */}
          <div className="mt-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white p-6 md:mt-8 md:p-10">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-center gap-2 md:justify-start">
                  <Phone className="h-5 w-5 text-[#2f2582]" />
                  <h3 className="text-lg font-bold text-[#161616] md:text-xl">
                    Prefer to speak with us?
                  </h3>
                </div>
                <p className="text-base text-[#6a6a6a] md:text-lg">
                  Call our HR team directly for any career-related inquiries.
                  Available Mon-Fri, 9 AM - 6 PM.
                </p>
              </div>
              <button
                onClick={handlePhoneCall}
                className="group flex shrink-0 items-center gap-3 rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#2f2582] shadow-md transition-all hover:bg-[#2f2582] hover:text-white hover:shadow-lg md:px-10 md:py-4 md:text-base"
              >
                <Phone className="h-4 w-4 transition-transform group-hover:scale-110 md:h-5 md:w-5" />
                <span>Call HR: +234 803 456 7890</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Job Application Modal */}
      <JobApplicationModal
        job={selectedJob}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
      />

      {/* Open Hire Modal */}
      <OpenHireModal
        isOpen={isOpenHireModalOpen}
        onClose={() => setIsOpenHireModalOpen(false)}
      />
    </main>
  );
}
