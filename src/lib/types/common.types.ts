/**
 * Common type definitions used across the application
 */

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
