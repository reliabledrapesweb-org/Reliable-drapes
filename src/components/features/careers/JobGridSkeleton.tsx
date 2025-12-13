export function JobGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 border-white bg-[#fafafa] p-4 md:p-6 shadow-md animate-pulse"
        >
          {/* Title and Button Skeleton */}
          <div className="flex flex-col md:flex-row items-start md:items-start justify-between mb-3 md:mb-4 gap-3 md:gap-0">
            <div className="h-6 md:h-7 bg-gray-200 rounded w-3/4 md:w-2/3" />
            <div className="h-8 md:h-9 bg-gray-200 rounded-full w-full md:w-24" />
          </div>

          {/* Experience and Location Skeleton */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 mb-3 md:mb-4">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-48" />
          </div>

          {/* Description Skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
            <div className="h-3 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
