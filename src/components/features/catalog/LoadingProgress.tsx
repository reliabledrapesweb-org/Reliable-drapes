import { motion } from "framer-motion";

type LoadingPhase = 'initializing' | 'fetching' | 'rendering' | 'finalizing';

interface LoadingProgressProps {
  progress: number;
  phase?: LoadingPhase;
}

const phaseLabels: Record<LoadingPhase, string> = {
  initializing: 'Initializing...',
  fetching: 'Fetching catalogue...',
  rendering: 'Rendering PDF...',
  finalizing: 'Almost ready...',
};

export function LoadingProgress({ progress, phase = 'initializing' }: LoadingProgressProps) {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full space-y-3">
      {/* Progress Bar */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <motion.div
          className="h-full rounded-full bg-[#2f2582]"
          initial={{ width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>

      {/* Phase Indicator and Percentage */}
      <div className="flex items-center justify-between text-sm">
        <motion.span
          key={phase}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-600"
        >
          {phaseLabels[phase]}
        </motion.span>
        <span className="font-medium text-gray-700">
          {Math.round(clampedProgress)}%
        </span>
      </div>
    </div>
  );
}
