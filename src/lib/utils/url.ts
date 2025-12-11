/**
 * Get the correct base URL for different environments
 */
export function getBaseUrl(): string {
  console.log("Environment variables:", {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    NODE_ENV: process.env.NODE_ENV
  });
  
  // Always prioritize the environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    console.log("Using NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL);
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Check for Vercel environment
  if (process.env.VERCEL_URL) {
    const url = `https://${process.env.VERCEL_URL}`;
    console.log("Using VERCEL_URL:", url);
    return url;
  }
  
  // Fallback to localhost for development
  console.log("Falling back to localhost");
  return "http://localhost:3000";
}