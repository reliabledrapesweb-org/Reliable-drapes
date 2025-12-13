import { motion } from "framer-motion";
import type { Job } from "@/lib/actions/jobs";

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
}

export function JobCard({ job, onApply }: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 border-white bg-[#fafafa] p-4 md:p-6 shadow-md transition-all hover:bg-[#f7f7f7] hover:shadow-lg hover:border-white"
    >
      {/* Job Title and Apply Button */}
      <div className="flex flex-col md:flex-row items-start md:items-start justify-between mb-3 md:mb-4 gap-3 md:gap-0">
        <h3 className="text-lg md:text-xl font-semibold text-[#2a2a2a] leading-tight flex-1 md:pr-4">
          {job.title}
        </h3>
        <button
          onClick={() => onApply(job)}
          className="w-full md:w-auto cursor-pointer rounded-full bg-[#2f2582] px-5 md:px-6 py-2 text-xs md:text-sm font-semibold tracking-[0.8px] md:tracking-[1px] text-white uppercase transition-all hover:bg-[#251e66] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20 flex-shrink-0"
        >
          Apply
        </button>
      </div>

      {/* Experience and Location */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 mb-3 md:mb-4">
        <span className="text-xs md:text-sm font-medium text-[#2a2a2a]">
          {job.experience}
        </span>
        <span className="text-xs md:text-sm font-medium text-[#2a2a2a]">
          {job.type} - {job.location}
        </span>
      </div>

      {/* Job Description */}
      <p className="text-xs md:text-sm text-[#6a6a6a] leading-relaxed">
        {job.description}
      </p>
    </motion.div>
  );
}