/**
 * Get the correct base URL for different environments
 */
export function getBaseUrl(): string {
  // Always prioritize the environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Check for Vercel environment
  if (process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    return url;
  }

  // Fallback to localhost for development
  return "http://localhost:3000";
}
