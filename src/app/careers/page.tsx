"use client";

import { useState, useMemo } from "react";
import { Breadcrumb, PageHero, PageHeader } from "@/components/shared";
import { JobGrid } from "@/components/features/careers";

// Mock job data based on the Figma design
const mockJobs = [
  {
    id: "1",
    title: "Senior Sales Advisor/ Sales Advisor",
    experience: "2 - 4 yrs",
    location: "Mumbai(Andheri), Bangalore and Delhi",
    type: "Store",
    description: "Responsible for individual targets, to follow SOP's & VM standards in the store Customer service, Customer acquisition & retention Follow up with backend team and customers for timely execution of orders and receivables"
  },
  {
    id: "2",
    title: "Stylist (Freelance Stylists)",
    experience: "2 - 4 yrs",
    location: "Mumbai, Chennai, Bangalore, Delhi, Pune, Hyderabad",
    type: "Store",
    description: "Exceptional designer with strong conceptual skills"
  },
  {
    id: "3",
    title: "Senior Sales Advisor/ Sales Advisor",
    experience: "2 - 4 yrs",
    location: "Mumbai(Andheri), Bangalore and Delhi",
    type: "Store",
    description: "Responsible for individual targets, to follow SOP's & VM standards in the store Customer service, Customer acquisition & retention Follow up with backend team and customers for timely execution of orders and receivables"
  },
  {
    id: "4",
    title: "Stylist (Freelance Stylists)",
    experience: "2 - 4 yrs",
    location: "Mumbai, Chennai, Bangalore, Delhi, Pune, Hyderabad",
    type: "Store",
    description: "Exceptional designer with strong conceptual skills"
  },
  {
    id: "5",
    title: "Marketing Manager",
    experience: "3 - 6 yrs",
    location: "Mumbai, Delhi",
    type: "Corporate",
    description: "Lead marketing campaigns and brand strategy initiatives. Develop and execute comprehensive marketing plans to drive brand awareness and customer engagement."
  },
  {
    id: "6",
    title: "Interior Designer",
    experience: "2 - 5 yrs",
    location: "All Major Cities",
    type: "Design",
    description: "Create stunning interior designs for residential and commercial spaces. Work closely with clients to understand their vision and deliver exceptional design solutions."
  }
];

export default function CareersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter jobs based on search query
  const filteredJobs = useMemo(() => {
    if (!searchQuery) return mockJobs;
    
    return mockJobs.filter((job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleApply = (job: typeof mockJobs[0]) => {
    // Handle job application (e.g., open application form, redirect to application page)
    console.log("Applying for job:", job);
    // You can implement application form modal or redirect to application page
    alert(`Thank you for your interest in the ${job.title} position! We'll redirect you to the application form.`);
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
            searchPlaceholder="Search Your City"
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
            <JobGrid
              jobs={filteredJobs}
              onApply={handleApply}
            />
          </div>
        </div>
      </div>
    </main>
  );
}