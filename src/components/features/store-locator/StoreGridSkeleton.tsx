export function StoreGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          {/* Store Name Skeleton */}
          <div className="mb-4 h-7 w-3/4 rounded bg-gray-200" />
          
          {/* Address Skeleton */}
          <div className="mb-4 space-y-2">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
          </div>
          
          {/* Contact Info Skeleton */}
          <div className="mb-4 space-y-2">
            <div className="h-4 w-2/3 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
          
          {/* Hours Skeleton */}
          <div className="mb-6 space-y-2">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-4/5 rounded bg-gray-200" />
          </div>
          
          {/* Button Skeleton */}
          <div className="h-11 w-full rounded-lg bg-gray-200" />
        </div>
      ))}
    </div>
  );
}