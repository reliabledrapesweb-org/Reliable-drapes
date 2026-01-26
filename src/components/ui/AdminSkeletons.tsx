import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Re-export the original AdminPageSkeleton for backward compatibility
export { AdminPageSkeleton } from "./AdminPageSkeleton";

/**
 * Custom skeleton for pages with complex forms and modals
 * Features form sections, action buttons, and modal-like elements
 */
export function FormPageSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-48" />
          <div className="h-4 w-56 animate-pulse rounded bg-gray-200 sm:w-64" />
        </div>
        <div className="h-10 w-full animate-pulse rounded bg-gray-200 sm:w-32" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-2 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200 sm:h-4 sm:w-20" />
                  <div className="h-6 w-12 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-16" />
                </div>
                <div className="hidden h-8 w-8 animate-pulse items-center justify-center rounded-lg bg-gray-200 sm:flex sm:h-10 sm:w-10" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      {/* Form Modal/Card Skeleton */}
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>

          {/* Textarea */}
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <div className="h-10 flex-1 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </CardContent>
      </Card>

      {/* Table/List Skeleton */}
      <Card className="hidden sm:block">
        <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="h-5 w-28 animate-pulse rounded bg-gray-200 sm:h-6 sm:w-32" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableHead key={i}>
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200 sm:w-20" />
                  </TableHead>
                ))}
                <TableHead>
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 5 }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <div
                        className="h-4 animate-pulse rounded bg-gray-100"
                        style={{ width: `${60 + Math.random() * 40}%` }}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <div className="flex gap-2">
                      <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                      <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Mobile Cards */}
      <div className="space-y-3 sm:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
                </div>
                <div className="h-4 w-48 animate-pulse rounded bg-gray-100" />
                <div className="flex gap-2 pt-2">
                  <div className="h-9 flex-1 animate-pulse rounded bg-gray-200" />
                  <div className="h-9 flex-1 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Custom skeleton for the Admin Dashboard page
 * Features large stat cards and recent orders section
 */
export function AdminDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-gray-100 dark:bg-gray-800/50" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
          <div className="h-10 w-32 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-3xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
          />
        ))}
      </div>

      {/* Main Content Split Skeleton */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Orders Skeleton */}
        <div className="lg:col-span-2">
          <div className="h-[500px] animate-pulse rounded-[2.5rem] border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900" />
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-3xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900"
                />
              ))}
            </div>
          </div>
          <div className="h-80 animate-pulse rounded-[2rem] border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900" />
        </div>
      </div>
    </div>
  );
}

/**
 * Custom skeleton for the Media Library page
 * Features stats cards, search/filter, and grid layout
 */
export function MediaLibrarySkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-48" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-200 sm:w-64" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4"
          >
            <div className="h-3 w-16 animate-pulse rounded bg-gray-200 sm:h-4 sm:w-20" />
            <div className="mt-2 h-6 w-12 animate-pulse rounded bg-gray-200 sm:h-8 sm:w-16" />
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200 sm:w-40" />
      </div>

      {/* Media Grid */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {/* Grid Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Grid Content */}
        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:p-6 xl:grid-cols-5">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200 bg-gray-100"
            >
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Custom skeleton for the Settings page
 * Features form cards and settings sections
 */
export function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200 sm:h-10 sm:w-40" />
        <div className="h-5 w-64 animate-pulse rounded bg-gray-200 sm:w-80" />
      </div>

      {/* Profile Settings Card */}
      <Card>
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <div className="h-10 flex-1 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader>
          <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-56 animate-pulse rounded bg-gray-200" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Section */}
          <div className="space-y-4">
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
            <div className="flex gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 flex-1 animate-pulse rounded bg-gray-200"
                />
              ))}
            </div>
          </div>

          {/* Accent Color Section */}
          <div className="space-y-4">
            <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded bg-gray-200"
                />
              ))}
            </div>
          </div>

          {/* Toggle Settings */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-48 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-6 w-11 animate-pulse rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
