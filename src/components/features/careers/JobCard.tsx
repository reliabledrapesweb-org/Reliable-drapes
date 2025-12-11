import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";

interface Job {
  id: string;
  title: string;
  experience: string;
  location: string;
  description: string;
  type: string;
}

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
      className="rounded-[2rem] border-4 border-white bg-[#fafafa] p-6 shadow-md transition-all hover:bg-[#f7f7f7] hover:shadow-lg hover:border-white"
    >
      {/* Job Title and Apply Button */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-[#2a2a2a] leading-tight flex-1 pr-4">
          {job.title}
        </h3>
        <button
          onClick={() => onApply(job)}
          className="cursor-pointer rounded-full bg-[#2f2582] px-6 py-2 text-sm font-semibold tracking-[1px] text-white uppercase transition-all hover:bg-[#251e66] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#2f2582]/20 flex-shrink-0"
        >
          Apply
        </button>
      </div>

      {/* Experience and Location */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#2a2a2a] flex-shrink-0" />
          <span className="text-sm font-medium text-[#2a2a2a]">
            {job.experience}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[#2a2a2a] flex-shrink-0" />
          <span className="text-sm font-medium text-[#2a2a2a]">
            {job.type} - {job.location}
          </span>
        </div>
      </div>

      {/* Job Description */}
      <p className="text-sm text-[#6a6a6a] leading-relaxed">
        {job.description}
      </p>
    </motion.div>
  );
}