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
      className="rounded-2xl border border-gray-200 bg-linear-to-b from-white to-[#F3F3F3] p-6 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
    >
      {/* Job Title and Apply Button */}
      <div className="mb-3 flex flex-col items-start justify-between gap-3 md:mb-4 md:flex-row md:items-start md:gap-0">
        <h3 className="flex-1 text-xl leading-tight font-bold text-[#161616] md:pr-4 md:text-[24px]">
          {job.title}
        </h3>
        <button
          onClick={() => onApply(job)}
          className="w-full shrink-0 cursor-pointer rounded-full bg-[#2f2582] px-8 py-2.5 text-xs font-semibold tracking-[1px] text-white uppercase transition-all hover:bg-[#251e66] hover:shadow-lg focus:ring-2 focus:ring-[#2f2582]/20 focus:outline-none md:w-auto md:text-sm"
        >
          Apply
        </button>
      </div>

      {/* Experience and Location */}
      <div className="mb-4 flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-8">
        <span className="font-medium text-[#161616] md:text-[20px]">
          {job.experience}
        </span>
        <span className="font-medium text-[#161616] md:text-[20px]">
          <span className="font-bold">{job.type}</span> - {job.location}
        </span>
      </div>

      {/* Job Description */}
      <p className="text-[16px] leading-relaxed text-[#575757] md:text-[18px]">
        {job.description}
      </p>
    </motion.div>
  );
}
