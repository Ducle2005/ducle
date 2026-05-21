const DEFAULT_API_BASE_URL = "http://localhost:8082/api";
const configuredBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL && process.env.NEXT_PUBLIC_API_BASE_URL.trim().length > 0
    ? process.env.NEXT_PUBLIC_API_BASE_URL.trim()
    : DEFAULT_API_BASE_URL;

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, "");
// Robustly derive BASE_URL (the host without /api)
export const BASE_URL = API_BASE_URL.replace(/\/api$/, "").replace(/\/+$/, "");

/**
 * Ensures an image URL is absolute, prepending the backend BASE_URL if necessary.
 */
export function getFullImageUrl(url: string | null | undefined): string {
  if (!url) return "/onboarding/body-scan-demo.svg";
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  // Ensure we don't double slash
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${BASE_URL}${cleanUrl}`;
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("auth-token") : null;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (headers.get("Content-Type") === "null") {
    headers.delete("Content-Type");
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend đang chạy.");
  }

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
      localStorage.removeItem("auth-token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    const contentType = response.headers.get("content-type") || "";
    let parsedBody: any = null;
    let bodyMessage = "";

    if (contentType.includes("application/json")) {
      parsedBody = await response.json().catch(() => null);
      if (parsedBody && typeof parsedBody === "object") {
        bodyMessage = parsedBody.message || parsedBody.error || JSON.stringify(parsedBody);
      } else if (typeof parsedBody === "string") {
        bodyMessage = parsedBody;
      }
    } else {
      bodyMessage = await response.text().catch(() => "");
    }

    const statusText = response.statusText ? ` ${response.statusText}` : "";
    const message = (bodyMessage && String(bodyMessage).trim()) || `API error: ${response.status}${statusText}`;

    const error = new Error(message);
    // Attach extra metadata for callers/tests if needed
    (error as any).status = response.status;
    (error as any).statusText = response.statusText;
    (error as any).body = parsedBody ?? bodyMessage;

    throw error;
  }

  // Handle case where response might be empty or plain text (like register success)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  
  return response.text() as Promise<T>;
}
