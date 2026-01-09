import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AdminPageSkeletonProps {
  rows?: number;
  columns?: number;
  statsCount?: number;
  hasFilter?: boolean;
}

export function AdminPageSkeleton({ 
  rows = 5, 
  columns = 6, 
  statsCount = 3,
  hasFilter = false 
}: AdminPageSkeletonProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-40 sm:h-8 sm:w-48" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-56 sm:w-64" />
        </div>
        <div className="h-10 bg-gray-200 rounded animate-pulse w-full sm:w-32" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className={`grid gap-2 sm:gap-4 ${statsCount === 2 ? 'grid-cols-2' : statsCount === 3 ? 'grid-cols-3' : statsCount === 5 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {Array.from({ length: statsCount }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1 sm:space-y-2 flex-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16 sm:h-4 sm:w-20" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-12 sm:h-8 sm:w-16" />
                </div>
                <div className="hidden sm:flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gray-200 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Skeleton (optional) */}
      {hasFilter && (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex-1 max-w-md">
                <div className="h-9 bg-gray-200 rounded-lg animate-pulse sm:h-10" />
              </div>
              <div className="h-9 bg-gray-200 rounded-lg animate-pulse w-full sm:h-10 sm:w-40" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Card View Skeleton */}
      <div className="sm:hidden space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" />
                </div>
                <div className="h-4 bg-gray-100 rounded animate-pulse w-48" />
                <div className="flex gap-2 pt-2">
                  <div className="h-9 bg-gray-200 rounded animate-pulse flex-1" />
                  <div className="h-9 bg-gray-200 rounded animate-pulse flex-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table Skeleton */}
      <Card className="hidden sm:block">
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-28 sm:h-6 sm:w-32" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: columns }).map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20 sm:w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <div 
                        className="h-4 bg-gray-100 rounded animate-pulse" 
                        style={{ width: `${60 + Math.random() * 40}%` }} 
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
