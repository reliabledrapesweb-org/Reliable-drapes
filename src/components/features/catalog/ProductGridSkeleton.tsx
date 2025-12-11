export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex w-full flex-col gap-4">
          {/* Image skeleton */}
          <div className="aspect-square w-full animate-pulse rounded-2xl bg-gray-200" />
          
          {/* Text skeleton */}
          <div className="flex flex-col gap-2">
            <div className="h-7 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}