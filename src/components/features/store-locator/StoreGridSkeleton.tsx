export function StoreGridSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-[2.5rem] border-[6px] border-white bg-[#fafafa] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] md:p-8"
        >
          {/* Store Name Skeleton */}
          <div className="mb-6 h-8 w-3/4 rounded-lg bg-gray-200" />

          <div className="space-y-5">
            {/* Address Skeleton */}
            <div className="flex items-start gap-4">
              <div className="mt-1 h-6 w-6 shrink-0 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-5/6 rounded bg-gray-200" />
              </div>
            </div>

            {/* Phone Skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-6 w-6 shrink-0 rounded-full bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
            </div>
          </div>

          {/* Button Skeleton */}
          <div className="mt-8 h-12 w-32 rounded-3xl bg-gray-200" />
        </div>
      ))}
    </div>
  );
}
