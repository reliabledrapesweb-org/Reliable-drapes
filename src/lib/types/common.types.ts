/**
 * Common type definitions used across the application
 */

/**
 * Brand type helper for creating distinct types from base types
 * Usage: type UserId = Brand<string, "UserId">;
 */
export type Brand<K, T> = K & { __brand: T };

export interface NavLink {
  name: string;
  link: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}
