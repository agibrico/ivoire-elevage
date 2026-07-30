/**
 * Utility to manage API URLs for different environments (Local Web, Mobile APK, Production)
 */
export function getApiUrl(path: string): string {
  // Base URL from environment variable (injected during build)
  const baseUrl = (import.meta as any).env.VITE_API_URL || "";

  // Clean up leading slash if baseUrl is provided
  const cleanPath = path.startsWith("/") && baseUrl ? path.substring(1) : path;

  // Return absolute URL for Mobile/Prod, or relative for Local Dev
  return baseUrl ? `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}${cleanPath}` : path;
}
