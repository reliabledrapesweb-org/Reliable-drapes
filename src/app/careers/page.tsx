"use client";

import { useState, useMemo, useEffect } from "react";
import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import { JobGrid } from "@/components/features/careers";
import { JobGridSkeleton } from "@/components/features/careers/JobGridSkeleton";
import { JobApplicationModal } from "@/components/features/careers/JobApplicationModal";
import { getActiveJobs, type Job } from "@/lib/actions/jobs";

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
        console.error("Error fetching jobs:", error);
        setError(error instanceof Error ? error.message : "Failed to load jobs");
      } finally {
        setIsLoading(false);
      }
    }

    fetchJobs();
  }, []);

  // Filter jobs based on search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery) return jobs;
    
    return jobs.filter((job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, jobs]);

  const handleApply = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <main className="mt-14 min-h-screen bg-white md:mt-16 lg:mt-[72px]">
      <PageHero heading="Careers" />
      <Breadcrumb />
      <div className="w-full py-12 md:py-16 lg:py-20">
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
          <div className="mb-12 md:mb-16 lg:mb-20">
            <div className="flex flex-col gap-4">
              <p className="text-xs font-medium tracking-[6px] text-[#575757] uppercase md:text-sm md:tracking-[8px]">
                Open Positions
              </p>
              <h2 className="text-2xl leading-tight font-bold text-[#161616] md:text-[32px]">
                Join our team!
              </h2>
              <p className="mt-2 text-base text-[#898989] md:text-lg">
                Ready to work with us? Apply for open positions
              </p>
            </div>
          </div>

          {/* Jobs Section */}
          <div className="flex flex-col gap-8 md:gap-12">
            {isLoading ? (
              <JobGridSkeleton />
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[#6a6a6a] text-lg">No job openings found.</p>
              </div>
            ) : (
              <JobGrid
                jobs={filteredJobs}
                onApply={handleApply}
              />
            )}
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
    </main>
  );
}