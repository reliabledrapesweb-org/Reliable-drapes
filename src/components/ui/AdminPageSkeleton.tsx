export function AdminPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="p-0">
          {/* Table Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
            <div className="flex">
              <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
          {/* Table Rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                  <div className="space-y-1">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                  <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}