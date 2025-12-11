import { motion } from "framer-motion";
import { JobCard } from "./JobCard";

interface Job {
  id: string;
  title: string;
  experience: string;
  location: string;
  description: string;
  type: string;
}

interface JobGridProps {
  jobs: Job[];
  onApply: (job: Job) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function JobGrid({ jobs, onApply }: JobGridProps) {
  if (jobs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 rounded-lg bg-gray-50 p-8 md:p-12"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-5xl md:text-6xl"
        >
          💼
        </motion.div>
        <h3 className="text-xl font-medium text-[#3a3a3a] md:text-2xl">
          No job openings found
        </h3>
        <p className="text-center text-sm text-[#898989] md:text-base">
          Try adjusting your search or check back later for new opportunities
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex w-full flex-col gap-6"
    >
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          onApply={onApply}
        />
      ))}
    </motion.div>
  );
}