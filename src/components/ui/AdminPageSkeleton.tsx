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
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-48" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
        </div>
        <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className={`grid gap-4 sm:grid-cols-2 ${statsCount === 3 ? 'lg:grid-cols-3' : statsCount === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        {Array.from({ length: statsCount }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Skeleton (optional) */}
      {hasFilter && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 max-w-md">
                <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
              </div>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-40" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: columns }).map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
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
