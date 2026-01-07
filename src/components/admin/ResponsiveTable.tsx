/**
 * Responsive Table Component
 * Shows table on desktop, card list on mobile
 */

"use client";

import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  hideOnMobile?: boolean;
  mobileLabel?: string;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  emptyState?: ReactNode;
  mobileCardRender?: (item: T, index: number) => ReactNode;
  isLoading?: boolean;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  emptyState,
  mobileCardRender,
  isLoading,
}: ResponsiveTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Mobile skeleton */}
        <div className="space-y-3 md:hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className="space-y-3 md:hidden">
        {data.map((item, index) =>
          mobileCardRender ? (
            <div key={keyExtractor(item)}>{mobileCardRender(item, index)}</div>
          ) : (
            <div
              key={keyExtractor(item)}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-xs font-medium text-gray-500 uppercase">
                      {col.mobileLabel || col.header}
                    </span>
                    <div className="text-sm text-gray-900 text-right">
                      {col.render(item)}
                    </div>
                  </div>
                ))}
            </div>
          )
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 ${
                    col.hideOnMobile ? "hidden lg:table-cell" : ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm ${
                      col.hideOnMobile ? "hidden lg:table-cell" : ""
                    }`}
                  >
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
